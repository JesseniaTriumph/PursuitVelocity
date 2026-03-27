# API Cost Research

---

## Cost Breakdown by API

### Anthropic Claude API

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Best for |
|-------|----------------------|----------------------|---------|
| claude-opus-4-6 | $15 | $75 | Complex reasoning (not needed for this) |
| claude-sonnet-4-6 | $3 | $15 | Builder insights, coaching messages |
| claude-haiku-4-5 | $0.25 | $1.25 | Match reasons, content tagging |

**Estimated Monthly Usage (500 MAU):**
| Use Case | Model | Calls/mo | Avg tokens | Monthly Cost |
|----------|-------|---------|-----------|-------------|
| Builder insights (Lookbook) | Sonnet | 200 | 1,000 | ~$0.60 |
| Match reason generation | Haiku | 2,000 | 300 | ~$0.15 |
| Content tagging | Haiku | 500 | 200 | ~$0.03 |
| Re-engagement messages | Sonnet | 100 | 200 | ~$0.09 |
| **Total** | | | | **~$0.87/mo** |

At 5,000 MAU: ~$8.70/mo. Highly scalable.

---

### GitHub API

| Tier | Rate Limit | Cost |
|------|-----------|------|
| Unauthenticated | 60 req/hr | Free |
| OAuth token (per user) | 5,000 req/hr | Free |
| GitHub Apps | 15,000 req/hr | Free |

**Recommendation:** Use GitHub Apps for the agent crawler. Zero cost, high limits.

---

### Pinecone Vector DB

| Plan | Vectors | Dimensions | Queries/mo | Cost |
|------|---------|-----------|-----------|------|
| Free (Starter) | 100,000 | 1536 | 100,000 | $0 |
| Standard | Unlimited | Any | Unlimited | $0.096/hr per pod |

**500 builders × 1 embedding = 500 vectors. Free tier handles us through ~100k users.**

---

### Hugging Face Inference API

| Tier | Requests/mo | Cost |
|------|------------|------|
| Free | 30,000 | $0 |
| Pro | Unlimited | $9/mo |

**For embeddings (all-MiniLM-L6-v2):** Each profile = 1 API call. 500 calls nightly = well within free tier.

---

### Calendly API

| Feature | Availability | Cost |
|---------|-------------|------|
| Read scheduled events | OAuth | Free |
| Verify user's availability | OAuth | Free |
| Create booking links | N/A (user manages) | Free |

**We only read — verify that a user's Calendly URL is valid. Zero cost.**

---

### SendGrid (Email)

| Tier | Emails/day | Cost |
|------|-----------|------|
| Free | 100 | $0 |
| Essentials | 50,000/mo | $19.95/mo |

**At 500 MAU with daily nudges:** 500/day = need Essentials ($20/mo). But nudges only go to inactive users (~15%), so Free tier likely sufficient initially.

---

### Expo Push Notifications

**Free.** No cost for push notification delivery via Expo's push service.

---

## Total Infrastructure Cost Summary

| Phase | MAU | Monthly Cost |
|-------|-----|-------------|
| Phase 1 (MVP) | 0–200 | ~$49–$70 |
| Phase 2 (agents) | 200–1,000 | ~$100–$200 |
| Phase 3 (mobile) | 1,000–5,000 | ~$200–$500 |
| Phase 4 (scale) | 5,000+ | ~$500–$2,000 |

**Revenue crossover:** 2 employer partners at $199/mo = $398/mo → covers all Phase 2 costs.

---

*Phase 1 document — reviewed 2026-03-26*
