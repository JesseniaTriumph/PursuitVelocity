# Product Requirements Document (PRD)
## Pursuit Sync — Velocity v2.0

**Version:** 2.0
**Status:** Active Development
**Owner:** Pursuit Product Team
**Last Updated:** 2026-03-26

---

## 1. Executive Summary

Velocity is community infrastructure for Pursuit fellows. It is the operating system for a builder's post-cohort life: a place to be discovered, to collaborate, to learn, and to grow. The product runs on three pillars:

1. **Identity** — Every builder has a public Lookbook and profile that signals their skills and projects.
2. **Discovery** — AI-powered matching (Campfire) surfaces the right collaborators, not just a list.
3. **Action** — Events, messaging, project boards, and resources move builders from "connected" to "shipping."

---

## 2. Goals & Non-Goals

### Goals
- G1: Every active Pursuit fellow has a complete public profile within their first cohort week
- G2: ≥60% of monthly active users make at least one meaningful connection (message, RSVP, match) per month
- G3: Match quality (measured by conversation rate after match) ≥ 35% within 90 days
- G4: Load time < 2s on 4G mobile networks
- G5: Zero-downtime deployments with automated rollback

### Non-Goals (Phase 1)
- Not a job board (employer-facing portal is Phase 2)
- Not a code review tool
- Not a replacement for Slack (complements it)
- Not a learning management system

---

## 3. User Personas

### Persona 1: Alex — Active Fellow (Primary)
- **Age:** 24, NYC
- **Context:** 6 months into Pursuit cohort, building first React project
- **Goal:** Find a co-founder for a side project; get feedback on their portfolio
- **Pain:** Can't see who else in their cohort is building what
- **Device usage:** iPhone 13, uses phone 80% of the time

### Persona 2: Maya — Recent Grad (Core)
- **Age:** 27, Queens
- **Context:** Graduated 3 months ago, applying for jobs
- **Goal:** Show potential employers her projects; stay connected to cohort energy
- **Pain:** LinkedIn doesn't communicate her story; GitHub alone isn't enough
- **Device usage:** Laptop at work, phone evenings

### Persona 3: Darius — Alumni (Senior)
- **Age:** 31, Brooklyn
- **Context:** Full-stack engineer at a startup, 2 years post-Pursuit
- **Goal:** Give back; find talented juniors for his team
- **Pain:** No easy way to stay connected to the community; mentoring is ad-hoc
- **Device usage:** Mac + iPhone

### Persona 4: Staff/Coordinator (B2B)
- **Age:** 35, Pursuit HQ
- **Context:** Manages 2 active cohorts, tracks fellow progress
- **Goal:** See which fellows are engaged, who needs outreach, what events are happening
- **Pain:** Community health is invisible; no dashboard
- **Device usage:** Laptop primarily

---

## 4. Feature Specifications

### 4.1 Feed (Build in Public)
**Priority:** P0
**Status:** Shipped

The feed is the social layer. Fellows post updates, milestones, questions, and tutorials.

| Field | Requirement |
|-------|-------------|
| Post types | `update`, `milestone`, `question`, `tutorial` |
| Media | Image upload (1 image per post, max 5MB) |
| Hashtags | Auto-suggested from content; filterable |
| Likes | Optimistic update; debounced API write |
| Comments | Threaded; max 500 chars |
| Feed algorithm | Chronological (Phase 1) → Ranked (Phase 2) |

**Acceptance Criteria:**
- [ ] User can create a post in < 30 seconds
- [ ] Post appears in feed within 1 second (optimistic)
- [ ] Feed loads first 20 posts in < 1.5s on mobile

---

### 4.2 CoBuild — Project Board
**Priority:** P0
**Status:** Shipped

Builders post projects seeking collaborators.

| Field | Requirement |
|-------|-------------|
| Project fields | title, description, status, skills_needed, team_size |
| Status values | `looking_for_team`, `in_progress`, `completed` |
| Discovery | Listed on CoBuild page; surfaced in Campfire matching |
| Join flow | DM to project owner; no formal join mechanism yet |

**Acceptance Criteria:**
- [ ] Project creation < 2 minutes
- [ ] Skills needed field drives Campfire match score

---

### 4.3 Builders Directory
**Priority:** P0
**Status:** Shipped

Searchable directory of all community members.

| Field | Requirement |
|-------|-------------|
| Search | Name, bio, skills, goal (client-side fuzzy) |
| Filters | Skill (dropdown), Availability (open/selective/closed) |
| Card data | Name, avatar, skills, bio, availability badge, role |
| Actions | View Profile, Message, Open Lookbook, Schedule Meeting |

---

### 4.4 Campfire — Smart Matching
**Priority:** P0
**Status:** Shipped

AI-ranked connection suggestions based on skill overlap, shared interests, project needs.

**Matching Algorithm:**
```
Base score: 42
+ 12 per shared skill
+ 8 per shared interest
+ 7 per shared goal
+ 15 per complementary skill (fills project need)
+ 6 if target is actively recruiting
+ 4 if target has Calendly
+ 5 if target wants to collaborate
Clamped: 58–98%
```

**Refresh:** On-demand (Refresh button); auto-refreshes when profile is updated.

**Acceptance Criteria:**
- [ ] At least 4 matches shown (or empty state with CTA to improve profile)
- [ ] Match reasons are specific, not generic
- [ ] Refresh clears cache and re-fetches

---

### 4.5 Lookbook — Builder Portfolio
**Priority:** P1
**Status:** Shipped

A public-facing portfolio page for every builder.

| Section | Content |
|---------|---------|
| Hero | Avatar, name, cohort, goal, bio, social links |
| AI Analysis | GitHub-backed insight summary (async loaded) |
| Skills | Skill badges + work type classification |
| Active Projects | Live projects with status and skills needed |
| Completed Projects | Past work |
| Recent Updates | Last 5 posts (non-tutorial) |
| CTA | Schedule, Message, Find More Builders |

**AI Insights (via `builderInsights` function):**
- Triggered when: builder has GitHub URL or projects
- Returns: `analysis.summary`, `analysis.strengths`, `analysis.collaboration_pitch`, `github.repos[]`
- Loads async post-profile render; fails gracefully

---

### 4.6 Resources — Tutorial Feed
**Priority:** P1
**Status:** Shipped

Community-submitted tutorials and guides.

| Field | Requirement |
|-------|-------------|
| Categories | React, Python, AI/ML, Backend, DevOps, Product, Career, Design, Database |
| Filtering | Category pills + text search |
| Submission | Dialog form: title, content, category, tags, external link |
| Engagement | Like button (optimistic); like count |
| Author attribution | Avatar + name + timeAgo |

---

### 4.7 Connect — Events
**Priority:** P1
**Status:** Shipped

Community events with RSVP.

| Field | Requirement |
|-------|-------------|
| Event types | hackathon, meetup, workshop, talk, demo_day, study_session |
| RSVP | Optimistic toggle; count shown |
| Virtual/in-person | Location field; empty = virtual |
| Creation | Any authenticated user can create events |
| Office Hours | `getAvailableBuilders()` shows builders with Calendly |

---

### 4.8 Profile & Onboarding
**Priority:** P0
**Status:** Shipped (profile); Onboarding = needs validation

**Profile fields:**
- avatar, full_name, bio, skills[], interests[], goals[], looking_for[], needs[]
- availability (open/selective/closed)
- calendly_url, github_url, linkedin_url, x_url, portfolio_url, resume_url
- cohort

**Onboarding flow:** 4 steps — Bio → Skills → Projects → Connect (Calendly/GitHub)

**Completeness gate:** Campfire and Lookbook AI insights are degraded for incomplete profiles. Banner shown.

---

### 4.9 Messages
**Priority:** P1
**Status:** Shipped

1:1 direct messaging. Pre-filled from Builder, Campfire, Connect, and Lookbook CTAs.

---

## 5. Emotional Intelligence Engine

A critical advancement in v2 is building **emotional context** into the product. The platform should feel like it understands where you are in your journey.

### States We Detect
| State | Signal | Product Response |
|-------|--------|-----------------|
| New fellow | First login, incomplete profile | Warm welcome banner; guided onboarding |
| Active builder | Regular posts, project activity | Feature unlock; featured in Campfire |
| Stuck / disengaged | No activity 14+ days | Re-engagement nudge from agent |
| Job searching | Profile says "looking_for: job" or adds resume | Employer visibility badge; LinkedIn tip |
| Building alone | Has project but no team | Auto-suggest Campfire matches to project page |
| Mentoring | Alumni with calendly + availability=open | Featured in "Office Hours" section |

---

## 6. Multimodal User Flow Summary

See [user-flows.md](./user-flows.md) for full journey maps.

**Critical paths:**
1. Onboarding → Profile complete → First Campfire match → First message → First collaboration
2. Project post → CoBuild discovery → Team formation → Project update post → Lookbook showcase
3. Event creation → RSVP → Event day → Post about it → Resource share

---

## 7. Accessibility Requirements

- WCAG 2.1 AA compliance
- All interactive elements have `aria-label`
- Color contrast ratio ≥ 4.5:1
- Keyboard navigable
- Screen reader tested (VoiceOver iOS, TalkBack Android)

---

## 8. Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Mobile Lighthouse score | ≥ 85 | Automated CI |
| API response time (p95) | < 800ms | Base44 logs |

---

*PRD v2.0 — Pursuit Sync / Velocity*
