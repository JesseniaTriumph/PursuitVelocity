# Financial Viability Assessment

---

## Unit Economics

### Cost Per User (CPU) — Phase 1

| Cost Center | Monthly Cost | Notes |
|-------------|-------------|-------|
| Base44 BaaS | $49–$299/mo | Scales with usage; $49 covers ~500 MAU |
| Claude API (AI matching + insights) | ~$0.02/user/mo | Cached; batch runs nightly |
| Pinecone vector DB (free tier) | $0 | Up to 100k vectors |
| Vercel hosting | $0–$20/mo | Free tier covers MVP |
| Domain + SSL | $15/yr | Negligible |
| GitHub Actions CI | $0 | Free for public repos |
| **Total Phase 1** | **~$70–$340/mo** | For 0–500 MAU |

### Break-Even Analysis (Phase 2 — Employer Portal)

| Metric | Value |
|--------|-------|
| Employer subscription price | $199/mo per seat |
| Cost to serve 1 employer | ~$15/mo |
| Gross margin per employer | ~92% |
| Break-even employer count | 2 employers covers infrastructure |
| Target: 10 employer partners | $1,990/mo ARR |

### Burn Rate Projection

| Phase | Timeline | Monthly Burn | Cumulative |
|-------|----------|-------------|-----------|
| Phase 1 (MVP launch) | Months 1–3 | ~$100/mo | $300 |
| Phase 2 (AI agents + mobile) | Months 4–8 | ~$500/mo | $2,800 |
| Phase 3 (scale + employer portal) | Months 9–12 | ~$2,000/mo | $11,800 |

### Revenue Streams (Prioritized)

| Stream | Stage | ARR Potential | Effort |
|--------|-------|--------------|--------|
| Employer partner subscriptions | Phase 2 | $24k–$120k | Medium |
| Pursuit institutional license | Phase 2 | $12k/yr | Low |
| Grant funding (tech equity grants) | Phase 1 | $25k–$100k | High |
| Premium builder profiles | Phase 3 | $5–$15/mo/user | Low |
| Hackathon/event sponsorships | Phase 3 | $500–$5k/event | Medium |
| API access for recruiters | Phase 4 | $99–$499/mo | High |

---

## Grant Opportunities

| Funder | Program | Amount | Deadline |
|--------|---------|--------|----------|
| Mozilla Foundation | Responsible AI | $50k–$300k | Rolling |
| Knight Foundation | Community & Tech | $25k–$150k | Quarterly |
| Luminate | Civic Tech | $100k+ | Rolling |
| Schmidt Futures | Tech for social good | Varies | Invitation |
| NYC Economic Dev. | Workforce tech | $50k | Annual |

---

## Key Financial Risks

1. **Base44 cost escalation**: If Base44 changes pricing, infra costs jump. Mitigation: abstract the data layer by Month 6.
2. **Low employer conversion**: If employers won't pay, the SaaS model fails. Mitigation: validate with 3 LOIs before building the portal.
3. **Grant dependency**: Grants are competitive and slow. Mitigation: run grant applications in parallel with product, not instead of it.

---

*Phase 1 document — reviewed 2026-03-26*
