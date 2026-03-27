# ⚡ Velocity — Pursuit Sync

> Community infrastructure for Pursuit fellows. Build in public. Find your people. Ship together.

[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://vercel.com)
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20Base44-blueviolet)](./docs/phase-4/TRD.md)

---

## What Is Velocity?

Velocity is a mobile-first community platform for Pursuit fellows — giving every builder:

- **🔥 Campfire** — AI-powered matching. Find who you should collaborate with, ranked by skill overlap, shared interests, and project needs.
- **📘 Lookbook** — Your public portfolio. Projects, GitHub activity, AI analysis, social links.
- **👥 Builders** — Searchable directory of every community member by skill and availability.
- **📅 Connect** — Events, hackathons, workshops, and open office hours.
- **📚 Resources** — Tutorials and guides shared by builders.
- **🏗️ CoBuild** — Post your project. Find your team.
- **💬 Messages** — Direct 1:1 messaging.

---

## Quick Start

```bash
git clone https://github.com/Roamwell-Travel-Co/pursuit-build-in-public.git
cd pursuit-sync
npm install
cp .env.example .env.local   # Add Base44 credentials
npm run dev
# → http://localhost:5173
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | React Query + local state |
| Routing | React Router v6 |
| Backend | Base44 BaaS |
| AI | Anthropic Claude API |
| Mobile (Phase 3) | Expo (React Native) |
| Agents | LangGraph + GitHub Actions |

---

## Project Structure

```
src/
├── api/            Base44 client setup
├── components/     Reusable UI + shadcn/ui primitives
├── hooks/          Custom React hooks
├── lib/
│   ├── builder-directory.js   Matching engine + directory cache
│   ├── tutorial-posts.js      Tutorial parsing utilities
│   └── utils.js               Shared utilities
├── pages/          Route-level components
│   ├── Feed.jsx, CoBuild.jsx, Builders.jsx
│   ├── Campfire.jsx, Lookbook.jsx, Connect.jsx
│   ├── Resources.jsx, Messages.jsx, Profile.jsx
│   └── Onboarding.jsx, CreatePost.jsx, ...
└── App.jsx

docs/               Full product documentation (see below)
agents/             Python AI agents — Phase 2
mobile/             Expo React Native app — Phase 3
```

---

## Documentation

| Document | Link |
|----------|------|
| Master Index | [docs/README.md](./docs/README.md) |
| PRD | [docs/phase-3/PRD.md](./docs/phase-3/PRD.md) |
| User Flows | [docs/phase-3/user-flows.md](./docs/phase-3/user-flows.md) |
| Conditional Logic | [docs/phase-3/conditional-logic-trees.md](./docs/phase-3/conditional-logic-trees.md) |
| Wireframes | [docs/phase-3/wireframes.md](./docs/phase-3/wireframes.md) |
| TRD | [docs/phase-4/TRD.md](./docs/phase-4/TRD.md) |
| ERD | [docs/phase-4/ERD.md](./docs/phase-4/ERD.md) |
| Architecture | [docs/phase-4/system-architecture.md](./docs/phase-4/system-architecture.md) |
| Cross-Platform | [docs/phase-4/cross-platform-strategy.md](./docs/phase-4/cross-platform-strategy.md) |
| System Tools | [docs/phase-4/system-tools.md](./docs/phase-4/system-tools.md) |
| Roadmap | [docs/phase-5/implementation-roadmap.md](./docs/phase-5/implementation-roadmap.md) |
| Agent Architecture | [docs/phase-5/agent-architecture.md](./docs/phase-5/agent-architecture.md) |

---

## Autonomous Agents (Phase 2)

Self-improving AI agents that run nightly without human intervention:

| Agent | Action |
|-------|--------|
| Directory Crawler | GitHub scrape → auto-update skills |
| Match Improver | Learns from outcomes → tunes weights |
| Content Curator | Auto-tags and ranks tutorials |
| Re-Engagement Sentinel | Personalized nudges to inactive builders |
| Builder Insights | On-demand GitHub + project AI analysis |
| Velocity Coach | Proactive coaching when builders stall |

---

## Contributing

1. Read the [Implementation Roadmap](./docs/phase-5/implementation-roadmap.md)
2. Pick a task from the current sprint on the GitHub Project board
3. Branch from `main` → PR back to `main`
4. Requirements: lint pass + Lighthouse mobile ≥ 80

---

## Primary Color

`hsl(250, 84%, 54%)` — Pursuit Purple

---

*Built by Pursuit fellows, for Pursuit fellows.*
