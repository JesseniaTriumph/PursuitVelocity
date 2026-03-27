# Pursuit Sync — Master Documentation Index

> **Velocity** — Community infrastructure for Pursuit fellows building in public, connecting with collaborators, and shipping real products.

---

## What Is This?

Pursuit Sync (codename **Velocity**) is a mobile-first community platform for Pursuit fellows and alumni. It gives every builder a public identity, a project portfolio, a smart matching system, and a live events feed — all in one place.

---

## Documentation Map

| Phase | Document | Purpose |
|-------|----------|---------|
| 1 | [API Cost Research](./phase-1/api-cost-research.md) | Cost modeling for all external APIs |
| 1 | [Competitor Analysis](./phase-1/competitor-analysis.md) | Market landscape and positioning |
| 1 | [SWOT Analysis](./phase-1/swot-analysis.md) | Strategic strengths, weaknesses, opportunities, threats |
| 1 | [Market Gap Analysis](./phase-1/market-gap-analysis.md) | Where the opportunity lives |
| 1 | [Financial Viability](./phase-1/financial-viability.md) | Unit economics, burn rate, break-even |
| 2 | [Business Plan](./phase-2/business-plan.md) | CEO/CFO/CMO perspectives |
| 2 | [Market Research](./phase-2/market-research.md) | Competitive landscape and GTM strategy |
| 2 | [Financial Model](./phase-2/financial-model.md) | Pricing strategy and projections |
| 3 | [PRD](./phase-3/PRD.md) | Product Requirements Document |
| 3 | [User Flows](./phase-3/user-flows.md) | Journey maps for all user types |
| 3 | [Conditional Logic Trees](./phase-3/conditional-logic-trees.md) | Decision trees for every feature |
| 3 | [Wireframes](./phase-3/wireframes.md) | Screen-by-screen descriptions and ASCII layouts |
| 4 | [TRD](./phase-4/TRD.md) | Technical Requirements Document |
| 4 | [System Architecture](./phase-4/system-architecture.md) | Architecture diagram and service map |
| 4 | [ERD](./phase-4/ERD.md) | Entity Relationship Diagram |
| 4 | [Cross-Platform Strategy](./phase-4/cross-platform-strategy.md) | iOS, Android, Web approach |
| 4 | [System Tools](./phase-4/system-tools.md) | Infrastructure, APIs, toolchain |
| 5 | [Implementation Roadmap](./phase-5/implementation-roadmap.md) | Phased build plan with sprint assignments |
| 5 | [Agent Architecture](./phase-5/agent-architecture.md) | Autonomous AI agent design |

---

## North Star Metric

> **Monthly Active Builders (MAB)** — a Pursuit fellow who has posted, messaged, matched, or RSVPd in the last 30 days.

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, shadcn/ui |
| Backend/BaaS | Base44 (entities, functions, auth) |
| State | React Query + local state |
| Routing | React Router v6 |
| Mobile | React Native (Expo) — Phase 3 |
| AI Layer | Claude API + LangGraph agents |
| Vector Search | Pinecone (free tier → paid) |
| Real-time | Base44 subscriptions → Supabase Realtime (Phase 2) |

---

*Last updated: 2026-03-26*
