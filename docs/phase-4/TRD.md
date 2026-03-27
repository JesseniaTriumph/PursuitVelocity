# Technical Requirements Document (TRD)
## Pursuit Sync — Velocity v2.0

**Version:** 2.0
**Status:** Active
**Last Updated:** 2026-03-26

---

## 1. System Overview

Velocity is a mobile-first React web application backed by Base44 BaaS, with a serverless AI function layer and a forthcoming autonomous agent pipeline. The system is architected for progressive enhancement: Phase 1 ships on web (PWA-ready), Phase 3 ships native mobile via Expo.

---

## 2. Frontend Requirements

### 2.1 Core Stack
| Requirement | Technology | Version |
|-------------|-----------|---------|
| UI Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.x |
| Component Library | shadcn/ui | latest |
| Routing | React Router | v6 |
| State/Cache | React Query (@tanstack/react-query) | v5 |
| Icons | Lucide React | 0.475+ |
| Date formatting | moment.js | 2.30+ |
| Animation | Framer Motion | 11.x |

### 2.2 Path Aliases
```js
// vite.config.js
resolve: {
  alias: { "@": "/src" }
}
```

### 2.3 Performance Requirements
| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance | ≥ 85 | CI check |
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3.0s | Lighthouse |
| Bundle size (gzipped) | < 250kb | vite-bundle-analyzer |
| Image optimization | WebP format, lazy loaded | vite-plugin-imagemin |

### 2.4 Code Quality
- ESLint: `eslint-config-react-app` baseline
- Prettier: enforced in CI
- No TypeScript in Phase 1 (plain JSX) — TS migration in Phase 3

---

## 3. Backend Requirements (Base44 BaaS)

### 3.1 Entities Used
| Entity | Operations | Notes |
|--------|-----------|-------|
| User | read, update | Auth user = platform profile |
| Project | list, filter, create, update | CoBuild board |
| Post | list, filter, create, update | Feed + Resources |
| Event | list, create, update | Connect page |
| RSVP | filter, create, delete | Event attendance |
| Like | filter, create, delete | Post engagement |
| Message | filter, create, update | DMs |

### 3.2 Serverless Functions
| Function Name | Trigger | Purpose | SLA |
|---------------|---------|---------|-----|
| `builderDirectory` | On-demand (cached) | Returns all users + projects enriched | < 2s |
| `builderInsights` | On-demand (Lookbook) | GitHub analysis + AI summary | < 8s |
| `matchingScore` | Nightly batch (Phase 2) | Pre-compute all match scores | async |
| `reEngagement` | Cron: daily (Phase 2) | Flag inactive users for nudge | async |
| `contentCurator` | Cron: hourly (Phase 2) | Tag and rank tutorial posts | async |

### 3.3 Caching Strategy
```
Level 1: In-memory (builder-directory.js)
  - directoryPromise: module-level singleton
  - Lives until: page refresh OR explicit clearBuilderDirectoryCache()
  - TTL: session

Level 2: React Query (Phase 2)
  - staleTime: 5 minutes
  - cacheTime: 30 minutes

Level 3: Pinecone vector cache (Phase 2)
  - Embeddings for all builder profiles
  - Updated nightly by agent
```

---

## 4. AI/Agent System Requirements

### 4.1 LLM Requirements
| Use Case | Model | Provider | Est. Cost |
|----------|-------|---------|-----------|
| Builder insights (Lookbook) | claude-sonnet-4-6 | Anthropic | ~$0.01/profile |
| Match explanations (Campfire) | claude-haiku-4-5 | Anthropic | ~$0.001/match |
| Content tagging (Resources) | claude-haiku-4-5 | Anthropic | ~$0.0005/post |
| Re-engagement messages | claude-sonnet-4-6 | Anthropic | ~$0.005/message |

### 4.2 Vector Search
| Component | Technology | Plan |
|-----------|-----------|------|
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 (Hugging Face) | Free |
| Vector DB | Pinecone | Free tier (100k vectors) |
| Embedding model host | Hugging Face Inference API | Free tier |
| Nearest-neighbor query | Pinecone query API | Free tier |

### 4.3 Agent Framework
```
Framework: LangGraph (Python) OR CrewAI
Orchestration: GitHub Actions (cron) → AWS Lambda → Base44 API
State: Redis (Upstash free tier)
Observability: Langsmith (free tier)
```

### 4.4 Agent Specifications

**Agent 1: Directory Crawler**
```
Trigger: Nightly cron (2 AM UTC)
Input: All user profiles with github_url
Action:
  1. GitHub API: fetch repos, languages, activity
  2. Extract skills from repo languages + README
  3. Update user.skills[] in Base44
  4. Recompute vector embeddings in Pinecone
Output: Updated profiles + refresh cache
```

**Agent 2: Match Quality Improver**
```
Trigger: On user action (message sent, meeting booked)
Input: source_email, target_email, action_type
Action:
  1. Log outcome to match_feedback table
  2. Adjust match weights based on outcome history
  3. Flag patterns (e.g., "skill_overlap > 3 → 2x more likely to message")
Output: Updated weight config stored in agent state
```

**Agent 3: Content Curator**
```
Trigger: Hourly cron
Input: New posts since last run
Action:
  1. Read post content
  2. Claude API: classify post_type, extract tags, score quality
  3. Update hashtags[] in Post entity
  4. Flag high-quality tutorials for Resources featured section
Output: Updated post metadata
```

**Agent 4: Re-Engagement Sentinel**
```
Trigger: Daily cron (9 AM local time)
Input: All users with last_active < 14 days
Action:
  1. Generate personalized nudge (based on profile + missed matches)
  2. Send in-app notification via Base44
  3. Optional: email via SendGrid (Phase 3)
Output: Notification created
```

**Agent 5: Builder Insight Generator**
```
Trigger: On-demand (Lookbook page load)
Input: Builder profile + projects
Action:
  1. GitHub API: fetch repo data, commit activity, languages
  2. Claude API: generate analysis summary, strengths, collaboration pitch
  3. Cache result for 24 hours
Output: insight JSON { analysis, github }
```

---

## 5. Cross-Platform Requirements

### 5.1 Web (Phase 1 — Current)
- Mobile-first responsive layout (320px → 1440px)
- PWA manifest + service worker for offline support
- Bottom navigation on mobile; sidebar on desktop
- Touch targets ≥ 44x44px

### 5.2 iOS (Phase 3)
- Expo SDK 52+ (React Native)
- Targets iOS 16+
- Native bottom tab navigation (react-navigation)
- Push notifications: Expo Notifications + APNs
- Deep linking: `/profile/:email`, `/lookbook/:email`, `/messages?to=`
- App Store submission: TestFlight → Production

### 5.3 Android (Phase 3)
- Same Expo codebase as iOS
- Targets Android 11+ (API 30)
- Push notifications: Expo Notifications + FCM
- Material You color theming
- Play Store submission: Internal Testing → Production

### 5.4 Shared Mobile Requirements
- Offline-first for profile + cached builder directory
- Haptic feedback on key interactions (match card, RSVP)
- Biometric auth (Phase 4)
- Native share sheet for Lookbook
- Camera access for avatar upload

---

## 6. Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| Auth | Base44 OAuth (email/SSO) |
| API security | All entity ops require valid session |
| Data privacy | No scraped data without user opt-in |
| XSS prevention | React's default escaping; no dangerouslySetInnerHTML |
| CORS | Base44 enforced; no wildcard origins |
| Rate limiting | Base44 built-in; agent calls rate-limited |
| PII handling | No PII stored in logs; GDPR-aware |
| Agent permissions | Read-only GitHub API; write only to own user fields |

---

## 7. Infrastructure Requirements

| Service | Tool | Tier | Monthly Cost |
|---------|------|------|-------------|
| Frontend hosting | Vercel | Hobby (free) | $0 |
| BaaS | Base44 | Starter ($49) | $49 |
| Vector DB | Pinecone | Free | $0 |
| Agent hosting | GitHub Actions + AWS Lambda | Free tier | ~$0–$5 |
| Redis (agent state) | Upstash | Free | $0 |
| LLM API | Anthropic Claude | Pay-per-use | ~$20–$50/mo |
| Email | SendGrid | Free (100/day) | $0 |
| GitHub API | GitHub | Free | $0 |
| Monitoring | Sentry | Free | $0 |

---

## 8. API Integrations Required

| API | Purpose | Auth Method | Rate Limits |
|-----|---------|------------|-------------|
| GitHub REST API v3 | Profile data, repos, languages | OAuth token | 5000 req/hr |
| Anthropic Claude API | AI insights, agents | API key | Tier 1: 50k TPM |
| Calendly API | Scheduling verification | OAuth | 100 req/min |
| Pinecone API | Vector search | API key | Free: 1 pod |
| Hugging Face Inference | Embeddings | API key | Free tier |
| SendGrid | Email notifications | API key | 100/day free |
| Expo Push | Mobile push notifications | Token | Unlimited |

---

*Phase 4 document — reviewed 2026-03-26*
