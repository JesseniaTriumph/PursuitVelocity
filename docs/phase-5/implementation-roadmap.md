# Sequential Implementation Roadmap

---

## Overview

This roadmap uses **2-week sprints** with clearly assigned roles. Each sprint has a primary deliverable, defined acceptance criteria, and a "definition of done" before the next sprint starts.

**Team Structure:**
- 1–2 Frontend Fellows (React/JS)
- 1 Backend Fellow (Node/Python for agents)
- 1 Product Lead (coordination, QA)
- 1 Design Fellow (optional; can use wireframes in this doc)

---

## Phase 0: Foundation (Pre-Sprint — Week 0)

**Goal:** Ensure everyone can run the app locally, understand the codebase, and contribute.

| Task | Owner | Time |
|------|-------|------|
| All team members fork + clone repo | Everyone | 1hr |
| Run `npm install && npm run dev` successfully | Everyone | 30min |
| Read all docs in `/docs` directory | Everyone | 2hrs |
| Review existing pages: Feed, CoBuild, Builders, Campfire | Frontend | 2hrs |
| Set up `.env.local` with Base44 credentials | Everyone | 30min |
| Create GitHub Project board with all sprints | Product Lead | 1hr |

**Done when:** Every team member can run the app and has read the PRD.

---

## Sprint 1: Polish & Stability (Weeks 1–2)

**Goal:** Ship what's built reliably. Fix all known bugs. Mobile UX pass.

| # | Task | Owner | Story Points |
|---|------|-------|-------------|
| 1.1 | Audit all pages on iPhone (Safari) + Android Chrome | Frontend | 3 |
| 1.2 | Fix touch target sizes (< 44px) everywhere | Frontend | 2 |
| 1.3 | Add loading states to all data-fetching pages | Frontend | 2 |
| 1.4 | Empty states: all pages need a meaningful empty state | Frontend | 2 |
| 1.5 | Verify Campfire works when profile has no skills | Frontend | 1 |
| 1.6 | Verify Lookbook loads for emails with no projects | Frontend | 1 |
| 1.7 | Connect page: confirm RSVP flow is optimistic + correct | Frontend | 2 |
| 1.8 | Resources: confirm Like flow works without race conditions | Frontend | 2 |
| 1.9 | Profile completeness banner implementation | Frontend | 3 |
| 1.10 | Lighthouse CI setup in GitHub Actions | Backend | 3 |

**Acceptance Criteria:**
- [ ] All pages score ≥ 80 on Lighthouse mobile
- [ ] No broken states for new users with empty profiles
- [ ] No JS console errors on any page

---

## Sprint 2: Onboarding Flow (Weeks 3–4)

**Goal:** First-time user experience is complete, guided, and results in a fully populated profile.

| # | Task | Owner | Story Points |
|---|------|-------|-------------|
| 2.1 | Audit existing Onboarding.jsx — identify gaps | Product Lead | 2 |
| 2.2 | Step 1: Bio + avatar upload | Frontend | 3 |
| 2.3 | Step 2: Skills multi-select (with suggestions) | Frontend | 4 |
| 2.4 | Step 3: Goals + looking_for selection | Frontend | 3 |
| 2.5 | Step 4: Links (GitHub, LinkedIn, Calendly) | Frontend | 3 |
| 2.6 | Progress indicator (4 steps visible) | Frontend | 1 |
| 2.7 | "Skip for now" on each step (but not Bio) | Frontend | 1 |
| 2.8 | On complete: redirect to Campfire with welcome banner | Frontend | 2 |
| 2.9 | Profile completeness score component (reusable) | Frontend | 3 |
| 2.10 | Gate Campfire: show banner if score < 2/4 | Frontend | 2 |

**Acceptance Criteria:**
- [ ] New user completes onboarding in < 3 minutes
- [ ] Profile has skills, goal, and bio after onboarding
- [ ] Campfire shows at least 1 match immediately after onboarding

---

## Sprint 3: AI Matching Quality (Weeks 5–6)

**Goal:** Campfire matches are genuinely useful. Match reasons are specific and compelling.

| # | Task | Owner | Story Points |
|---|------|-------|-------------|
| 3.1 | Review `rankBuilderMatches()` with real user data | Backend | 3 |
| 3.2 | Tune score weights based on early feedback | Backend | 2 |
| 3.3 | Add match reason: "Works at similar company stage" | Backend | 2 |
| 3.4 | Add match reason: "Same cohort year" | Backend | 2 |
| 3.5 | Test with 20+ real Pursuit users | Product Lead | 3 |
| 3.6 | Match feedback: "Not interested" button (logs outcome) | Frontend | 3 |
| 3.7 | Match feedback stored in `match_feedback` entity | Backend | 2 |
| 3.8 | Campfire: "Available to Connect" section polished | Frontend | 2 |
| 3.9 | Builder Directory: sort by "best match to you" option | Frontend | 3 |

**Acceptance Criteria:**
- [ ] Match rate: ≥ 30% of Campfire users message their top match within 7 days
- [ ] Zero matches shown for users with completely empty profiles (with CTA)

---

## Sprint 4: GitHub Integration (Weeks 7–8)

**Goal:** GitHub URL → auto-populate skills → better Lookbook AI insights.

| # | Task | Owner | Story Points |
|---|------|-------|-------------|
| 4.1 | GitHub OAuth flow in profile settings | Frontend | 4 |
| 4.2 | Octokit.js: fetch user repos + languages | Backend | 3 |
| 4.3 | Map GitHub languages → skills array | Backend | 2 |
| 4.4 | Auto-suggest skills from GitHub on profile edit | Frontend | 3 |
| 4.5 | Lookbook: GitHub repos section polished | Frontend | 2 |
| 4.6 | `builderInsights` function: improve Claude prompt | Backend | 3 |
| 4.7 | Cache insights per user (24hr TTL) | Backend | 2 |
| 4.8 | Show "Updated from GitHub" badge on skills | Frontend | 1 |

**Acceptance Criteria:**
- [ ] User with GitHub URL sees their repos in Lookbook
- [ ] Skills auto-populated from top 5 GitHub languages
- [ ] AI analysis section loads within 8 seconds

---

## Sprint 5: PWA + Mobile Web Polish (Weeks 9–10)

**Goal:** Install-to-homescreen. Offline graceful degradation. Near-native mobile feel.

| # | Task | Owner | Story Points |
|---|------|-------|-------------|
| 5.1 | Create manifest.json with icons | Frontend | 2 |
| 5.2 | Service worker: app shell cache | Frontend | 4 |
| 5.3 | Service worker: API response cache (stale-while-revalidate) | Frontend | 3 |
| 5.4 | Install prompt: "Add to Home Screen" banner | Frontend | 2 |
| 5.5 | Offline indicator UI | Frontend | 1 |
| 5.6 | Optimize images: WebP conversion + lazy loading | Frontend | 3 |
| 5.7 | Touch gesture: swipe to go back (iOS Safari) | Frontend | 2 |
| 5.8 | Test on real devices: iPhone 13, Pixel 6, Samsung S21 | QA | 3 |

---

## Sprint 6: Autonomous Agent Layer — Phase 1 (Weeks 11–12)

**Goal:** First agent running in production: nightly GitHub profile enrichment.

| # | Task | Owner | Story Points |
|---|------|-------|-------------|
| 6.1 | Set up Python `agents/` directory | Backend | 2 |
| 6.2 | Install LangGraph + Anthropic SDK | Backend | 1 |
| 6.3 | Agent 1: Directory Crawler — fetch GitHub repos | Backend | 5 |
| 6.4 | Agent 1: Merge skills from GitHub into Base44 | Backend | 3 |
| 6.5 | GitHub Actions cron job: 2 AM UTC daily | Backend | 2 |
| 6.6 | Upstash Redis: agent state persistence | Backend | 2 |
| 6.7 | Langsmith tracing: log all agent runs | Backend | 2 |
| 6.8 | Error handling: failed API calls don't crash loop | Backend | 2 |
| 6.9 | Alert: Slack/email if agent fails 3x in a row | Backend | 2 |

**Acceptance Criteria:**
- [ ] Agent runs daily without manual intervention
- [ ] Skills enriched for ≥ 80% of users with GitHub URL
- [ ] All agent runs visible in Langsmith

---

## Sprint 7: Re-Engagement Agent (Weeks 13–14)

**Goal:** Platform feels alive. Users who go quiet get a smart, personalized nudge.

| # | Task | Owner | Story Points |
|---|------|-------|-------------|
| 7.1 | Agent 4: identify users inactive > 14 days | Backend | 3 |
| 7.2 | Agent 4: generate personalized nudge via Claude | Backend | 4 |
| 7.3 | Base44 notification entity: create in-app notification | Backend | 3 |
| 7.4 | Notification bell in app header (web) | Frontend | 3 |
| 7.5 | Mark notification as read | Frontend | 2 |
| 7.6 | SendGrid: email nudge (optional, user setting) | Backend | 3 |
| 7.7 | A/B test: nudge with match suggestion vs generic | Backend | 3 |

---

## Sprint 8: Expo Mobile App — Scaffold (Weeks 15–16)

**Goal:** iOS and Android app shells running in TestFlight and internal testing.

| # | Task | Owner | Story Points |
|---|------|-------|-------------|
| 8.1 | Initialize Expo project in `/mobile` directory | Frontend | 3 |
| 8.2 | Expo Router: tab navigation (Feed, Builders, +, Campfire, Messages) | Frontend | 4 |
| 8.3 | Auth: Base44 SDK in React Native | Frontend | 4 |
| 8.4 | Feed screen: mirror web Feed in RN | Frontend | 5 |
| 8.5 | Profile screen: view + edit | Frontend | 4 |
| 8.6 | EAS Build: iOS simulator + Android emulator builds | Backend | 3 |
| 8.7 | TestFlight submission | Backend | 2 |
| 8.8 | Internal testing (team only) | Everyone | 2 |

---

## Sprint 9: Expo Mobile — Core Screens (Weeks 17–18)

| # | Task | Story Points |
|---|------|-------------|
| 9.1 | Campfire screen (mobile) | 5 |
| 9.2 | Builders directory (mobile) | 4 |
| 9.3 | Lookbook profile (mobile) | 4 |
| 9.4 | Resources (mobile) | 3 |
| 9.5 | Connect + Events (mobile) | 4 |
| 9.6 | Push notification setup (Expo Notifications + APNs + FCM) | 5 |
| 9.7 | Deep linking: all routes | 3 |
| 9.8 | Haptic feedback on key interactions | 2 |

---

## Sprint 10: Employer Portal Scaffold (Weeks 19–20)

**Goal:** First paid revenue stream. 3 pilot employers before building full portal.

| # | Task | Owner | Story Points |
|---|------|-------|-------------|
| 10.1 | Validate with 3 employer LOIs (Letters of Intent) | Product Lead | — |
| 10.2 | Employer-facing landing page (separate from app) | Frontend | 4 |
| 10.3 | Employer entity in Base44 | Backend | 2 |
| 10.4 | Employer can search builder directory (filtered view) | Frontend | 4 |
| 10.5 | Employer can "save" builder profiles | Frontend | 3 |
| 10.6 | Stripe integration: $199/mo subscription | Backend | 5 |
| 10.7 | Builder opt-in: "Open to job opportunities" flag | Frontend | 2 |
| 10.8 | Analytics dashboard for employers | Frontend | 5 |

---

## Loop Agent Design

For tasks that require continuous iteration (not one-shot execution):

```
LOOP AGENT: Match Quality Improvement

INIT: Load current match weights from Redis
      Load match_feedback events from last 7 days

LOOP (runs every 24 hours):
  ┌─────────────────────────────────────────────────────┐
  │ OBSERVE: Query match_feedback table                 │
  │   - Count: (source, target) pairs where action='messaged'
  │   - Count: (source, target) pairs where action='ignored'
  │                                                     │
  │ ANALYZE: Identify which match_reason types         │
  │   correlate most with 'messaged' outcome            │
  │                                                     │
  │ ADJUST: Update weights proportionally               │
  │   sharedSkillWeight += 0.1 if correlation > 0.6    │
  │   sharedInterestWeight -= 0.05 if correlation < 0.2│
  │                                                     │
  │ SAVE: Write new weights to Redis                    │
  │                                                     │
  │ LOG: Record iteration to Langsmith                  │
  │                                                     │
  │ HALT: If weights haven't changed > 2% in 7 days,   │
  │   alert team — model may be saturated               │
  └─────────────────────────────────────────────────────┘

  Wait 24 hours → repeat
```

---

## Sequential Agent Design

For tasks that require multiple steps in strict order:

```
SEQUENTIAL AGENT: New User Profile Enrichment

STEP 1: Trigger (user.onboarded = true, first time)
         │
STEP 2: Fetch GitHub repos via Octokit.js
         │ (wait for response)
STEP 3: Extract languages → map to skills
         │ (wait)
STEP 4: Claude API: "Given these repos, what is this developer's
         strongest area and how would you describe them?"
         │ (wait)
STEP 5: Update user.bio if bio is empty (suggest text)
         Update user.skills with GitHub-derived skills
         │ (wait)
STEP 6: Generate Pinecone embedding for updated profile
         │ (wait)
STEP 7: Upsert embedding to Pinecone index
         │ (wait)
STEP 8: Trigger: re-rank matches for this user
         │ (wait)
STEP 9: Send in-app notification:
         "Your profile was enriched with GitHub insights!"
         │
       [DONE]

Each step has: retry (3x), timeout (30s), error logging
```

---

## McKinsey Framework: Implementation Priority Matrix

```
                    HIGH VALUE TO USER
                           │
      Sprint 2             │  Sprint 1
      (Onboarding)         │  (Polish)
      Sprint 3             │  Sprint 6
      (AI Matching)        │  (Agents)
                           │
QUICK ─────────────────────┼───────────────────── SLOW
TO     Sprint 5            │  Sprint 8–9          TO
BUILD  (PWA)               │  (Native App)       BUILD
       Sprint 4            │  Sprint 10
       (GitHub)            │  (Employer Portal)
                           │
                    LOW VALUE TO USER
```

**Start here → Sprint 1 → 2 → 3 → 4 → 6 → 5 → 7 → 8–9 → 10**

---

*Phase 5 document — reviewed 2026-03-26*
