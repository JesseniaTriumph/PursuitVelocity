# System Architecture

---

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                    │
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐ │
│  │  Web (React) │    │  iOS (Expo)  │    │   Android (Expo)         │ │
│  │  Vercel CDN  │    │  App Store   │    │   Play Store             │ │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────────┘ │
│         └──────────────────┬┴──────────────────────┘                  │
└──────────────────────────┬─┘──────────────────────────────────────────┘
                           │ HTTPS / Base44 SDK
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         PLATFORM LAYER (Base44)                         │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────────┐ │
│  │  Entity CRUD API│  │  Auth / Session  │  │  Serverless Functions │ │
│  │  User, Project, │  │  OAuth + SSO     │  │  builderDirectory     │ │
│  │  Post, Event,   │  │                  │  │  builderInsights      │ │
│  │  RSVP, Like,    │  │                  │  │  matchingScore        │ │
│  │  Message        │  │                  │  │  reEngagement         │ │
│  └────────┬────────┘  └─────────────────┘  └──────────┬────────────┘ │
│           │                                             │              │
│  ┌────────▼────────────────────────────────────────────▼────────────┐ │
│  │                    Base44 Data Store (managed)                    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┬──┘
                                                                       │
                           ┌───────────────────────────────────────────┘
                           │ Internal API calls
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       INTELLIGENCE LAYER                                │
│                                                                         │
│  ┌──────────────────────┐     ┌──────────────────────────────────────┐│
│  │   Agent Orchestrator  │     │         External APIs                ││
│  │   (LangGraph/CrewAI)  │     │                                      ││
│  │                       │     │  ┌────────────┐  ┌────────────────┐ ││
│  │  Agent 1: Directory   │────▶│  │ GitHub API │  │ Anthropic API  │ ││
│  │  Agent 2: Matcher     │     │  │ (profiles) │  │ (Claude models)│ ││
│  │  Agent 3: Curator     │     │  └────────────┘  └────────────────┘ ││
│  │  Agent 4: Sentinel    │     │                                      ││
│  │  Agent 5: Insights    │     │  ┌────────────┐  ┌────────────────┐ ││
│  │                       │     │  │ Pinecone   │  │ HuggingFace    │ ││
│  └───────────┬───────────┘     │  │ (vectors)  │  │ (embeddings)   │ ││
│              │                 │  └────────────┘  └────────────────┘ ││
│  ┌───────────▼───────────┐     └──────────────────────────────────────┘│
│  │   Upstash Redis       │                                              │
│  │   (agent state)       │                                              │
│  └───────────────────────┘                                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow: Campfire Page Load

```
Browser/App
    │
    │ GET /campfire
    ▼
React Router → Campfire.jsx
    │
    │ useCurrentUser() → base44.auth.me()
    ▼
[user.email available?]
    │ YES
    ▼
fetchBuilderDirectory()
    │
    ├── cache hit? → return cached promise (< 1ms)
    │
    └── cache miss:
            │
            ▼
        base44.functions.invoke("builderDirectory")
            │
            ▼ (serverless function executes)
        Fetch all Users from Base44 DB
        Fetch all Projects from Base44 DB
        Join: user.projects = projects.filter(p => p.owner_email === user.email)
        Return { currentUserEmail, builders[] }
            │
            ▼
        normalizeDirectory()
        → normalizeBuilder() for each builder
        → cache as directoryPromise
            │
            ▼
rankBuilderMatches(currentBuilder, builders, { limit: 4 })
    │
    ▼
Render 4 MatchCard components (< 16ms React render)
    │
    ▼
User sees matches
```

---

## Request Flow: Lookbook AI Insights

```
Browser/App
    │
    │ GET /lookbook/:email
    ▼
LookbookProfile component
    │
    ▼
[Step 1: Fetch profile + posts + projects — parallel]
base44.entities.Project.filter({ owner_email })
base44.entities.Post.filter({ author_email })
    │
    ▼
[Step 2: Render profile immediately — no wait for AI]
    │
    ▼
[Step 3: Check — has GitHub URL or projects?]
    │ YES
    ▼
[Step 4: Show loading spinner in AI section]
    │
    ▼
base44.functions.invoke("builderInsights", { ...profile, projects })
    │
    ▼ (serverless function — up to 8s)
GitHub API:
  → fetch user repos
  → fetch languages
  → fetch recent commits
Claude API (claude-sonnet-4-6):
  → system: "You are analyzing a developer's public portfolio..."
  → user: JSON profile + repos
  → response: { analysis: { summary, strengths, collaboration_pitch }, github: { repos[] } }
    │
    ▼
setInsight(result)
→ Render AI Analysis section
```

---

## Agent Execution Architecture

```
GitHub Actions (Cron) → triggers every 2h
         │
         ▼
    AWS Lambda function (or Vercel Edge)
         │
         ▼
    LangGraph Agent Loop:
    ┌────────────────────────────────────┐
    │                                    │
    │  [START]                           │
    │     │                              │
    │     ▼                              │
    │  Load state from Upstash Redis     │
    │     │                              │
    │  [PLAN] — decide which tasks       │
    │  to run based on last_run time     │
    │     │                              │
    │  [EXECUTE] — run each task:        │
    │  ├── Directory crawl               │
    │  ├── Match rescoring               │
    │  ├── Content tagging               │
    │  └── Re-engagement check           │
    │     │                              │
    │  [OBSERVE] — check results,        │
    │  log outcomes to Langsmith         │
    │     │                              │
    │  [LEARN] — update weight config    │
    │  if match feedback data available  │
    │     │                              │
    │  [END] — save state to Redis       │
    │                                    │
    └────────────────────────────────────┘
         │
         ▼
    Update Base44 entities via API
    Update Pinecone vectors
    Send notifications via Base44
```

---

## Data Flow Diagram

```
USER PROFILE UPDATE
       │
       ▼
  Base44 entity update
       │
       ├──► Clears directoryPromise cache (next request)
       │
       ├──► Agent: re-embed user vector in Pinecone (async)
       │
       └──► Agent: re-rank all matches for affected users (async)

GITHUB URL ADDED TO PROFILE
       │
       ▼
  Agent 1 (Directory Crawler) picks up on next cron tick
       │
       ▼
  GitHub API: fetch repos, languages
       │
       ▼
  Claude API: extract additional skills
       │
       ▼
  Merge new skills into user.skills[]
       │
       ▼
  Re-embed and re-rank
```

---

## CDN & Static Asset Strategy

```
Vercel CDN:
  ├── /assets/* — immutable, 1-year cache
  ├── /index.html — no-cache, revalidate
  └── /sw.js — service worker for PWA

Service Worker (Phase 1.5):
  ├── Cache: builder directory (stale-while-revalidate)
  ├── Cache: user profile
  └── Queue: offline post drafts → sync on reconnect
```

---

*Phase 4 document — reviewed 2026-03-26*
