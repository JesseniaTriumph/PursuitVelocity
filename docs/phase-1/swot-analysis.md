# SWOT Analysis — Pursuit Sync / Velocity

---

## Strengths

| # | Strength | Strategic Implication |
|---|----------|-----------------------|
| S1 | Captive, high-trust user base (Pursuit fellows) | No cold-start problem; staff can onboard 100% of cohort |
| S2 | AI-powered smart matching (Campfire) | Unique differentiation vs. all competitors |
| S3 | Builder Lookbook as portfolio layer | Replaces Notion/Linktree for devs entering job market |
| S4 | Real-time community feed + events | Replaces Slack for structured discovery |
| S5 | Autonomous agent layer (Phase 2) | Self-improving recommendations without manual curation |
| S6 | Cross-platform design (mobile-first) | Meets fellows where they are — phones, not desktops |
| S7 | Open-source stack (React, Vite, Base44) | Fast iteration, low vendor lock-in on UI layer |
| S8 | Pursuit brand trust | Fellows are pre-vetted; quality signal is built in |

---

## Weaknesses

| # | Weakness | Mitigation Strategy |
|---|----------|---------------------|
| W1 | Small initial user base (~200 active fellows) | Seed with alumni; partner with staff for content |
| W2 | Base44 as BaaS dependency | Abstract data layer; migrate to Supabase in Phase 2 |
| W3 | No native mobile app yet (Phase 1 = web only) | PWA wrapper; Expo shell in Phase 3 |
| W4 | No dedicated engineering team (fellows building it) | Sequential sprint plan; agent-assisted scaffolding |
| W5 | No revenue model yet | Launch free; pursue grants + employer partnerships |
| W6 | Matching quality depends on profile completeness | Onboarding flow forces minimum viable profile |
| W7 | Limited real-time capabilities on Base44 | Use polling + optimistic UI; migrate to Supabase Realtime |

---

## Opportunities

| # | Opportunity | Timeline | Potential Impact |
|---|-------------|----------|-----------------|
| O1 | Expand to other coding bootcamps (CodePath, CUNY, Per Scholas) | 12–18 months | 10x user base |
| O2 | Employer partner portal (post jobs, find talent) | 6–9 months | Revenue stream |
| O3 | Grant funding (Luminate, Mozilla, Knight Foundation) | 3–6 months | Runway extension |
| O4 | Integration with GitHub for automatic skill extraction | 3 months | Profile quality boost |
| O5 | Agent marketplace (builders share custom agents) | 18+ months | Platform lock-in |
| O6 | Cohort analytics for Pursuit staff (retention, activity) | 6 months | B2B product angle |
| O7 | Alumni mentorship marketplace | 9 months | High-value engagement |
| O8 | Hackathon hosting infrastructure built into Connect | 4 months | Activation events |

---

## Threats

| # | Threat | Probability | Mitigation |
|---|--------|------------|------------|
| T1 | Pursuit adopts an existing tool (LinkedIn, Discord) | Medium | Demonstrate what off-the-shelf tools can't do (matching, lookbook) |
| T2 | Base44 pricing changes or service degradation | Low-Medium | Abstract the data layer; prepare Supabase migration path |
| T3 | Competitor ships Pursuit-specific product | Low | Speed and community ownership are our moat |
| T4 | Low engagement after launch (ghost platform problem) | High | Staff-seeded content; mandatory onboarding; gamification |
| T5 | AI matching quality disappoints early users | Medium | Set expectations; show reasoning behind matches; allow feedback |
| T6 | Privacy concerns around profile data crawling | Medium | Explicit consent flows; no scraping without opt-in |
| T7 | Mobile app review process delays (App Store) | Medium | Launch PWA first; submit to stores in parallel |

---

## Strategic Priority Matrix

```
                    HIGH IMPACT
                         │
              O1 (expand)│ S2 (AI matching)
              O2 (employers)   S5 (agents)
                         │
LOW EFFORT ──────────────┼──────────────── HIGH EFFORT
              S1 (network)│ O3 (grants)
              S3 (lookbook)│ O7 (mentorship)
                         │
                    LOW IMPACT
```

**Top 3 strategic bets:**
1. **AI matching quality** — this is the moat. No competitor has it.
2. **Mandatory onboarding** — solve the ghost platform problem on day 1.
3. **Employer partnerships** — where the money is.

---

*Phase 1 document — reviewed 2026-03-26*
