# System Tools & Infrastructure Requirements

---

## Complete Toolchain

### Development Tools
| Tool | Purpose | Cost | Priority |
|------|---------|------|----------|
| VS Code + Cursor | IDE | Free | P0 |
| Vite | Build tool | Free | P0 |
| ESLint + Prettier | Code quality | Free | P0 |
| GitHub | Version control + CI | Free | P0 |
| GitHub Actions | CI/CD automation | Free (public) | P0 |
| Vercel | Frontend hosting + preview deploys | Free | P0 |
| Base44 | BaaS (DB, Auth, Functions) | $49/mo | P0 |
| Postman / Hoppscotch | API testing | Free | P1 |
| React DevTools | Debugging | Free | P1 |
| Tanstack Query Devtools | State debugging | Free | P1 |
| Storybook | Component development (Phase 3) | Free | P2 |

### AI & Agent Tools
| Tool | Purpose | Cost | Priority |
|------|---------|------|----------|
| Anthropic Claude API | LLM for insights + agents | Pay-per-use | P0 |
| LangGraph (Python) | Agent orchestration | Free (OSS) | P1 |
| Langsmith | Agent observability + tracing | Free tier | P1 |
| Pinecone | Vector DB for semantic search | Free (1 index) | P1 |
| Hugging Face Inference API | Embeddings (all-MiniLM-L6-v2) | Free tier | P1 |
| CrewAI | Alternative agent framework | Free (OSS) | P2 |

### Open Source Libraries to Adopt
| Library | GitHub Stars | Purpose | Integration Point |
|---------|-------------|---------|-------------------|
| `sentence-transformers` | 15k+ | Semantic embeddings for matching | Agent layer |
| `LangGraph` | 8k+ | Stateful agent orchestration | Agent runner |
| `shadcn/ui` | 75k+ | UI components | Already integrated |
| `Octokit.js` | 5k+ | GitHub API client | Builder insights agent |
| `react-hook-form` | 40k+ | Form management (profiles, posts) | Phase 2 refactor |
| `zod` | 30k+ | Schema validation for forms | Phase 2 |
| `react-native-reanimated` | 8k+ | Smooth mobile animations | Phase 3 |
| `expo-notifications` | Built-in | Push notifications | Phase 3 |
| `nativewind` | 7k+ | Tailwind for React Native | Phase 3 |

### Monitoring & Analytics
| Tool | Purpose | Cost |
|------|---------|------|
| Sentry | Error tracking | Free (5k errors/mo) |
| Vercel Analytics | Web vitals | Free |
| Langsmith | Agent traces | Free tier |
| Base44 dashboard | API usage + errors | Included |
| PostHog | Product analytics (Phase 2) | Free (1M events) |

### External APIs Required
| API | Endpoint Base | Auth | Free Tier | Priority |
|-----|--------------|------|-----------|----------|
| GitHub REST API v3 | `api.github.com` | OAuth token | 5k req/hr | P0 |
| Anthropic Claude | `api.anthropic.com` | API key | $5 credit (new) | P0 |
| Pinecone | `*.pinecone.io` | API key | 1 index, 100k vectors | P1 |
| Hugging Face | `api-inference.huggingface.co` | API key | 30k chars/mo | P1 |
| Calendly v2 | `api.calendly.com` | OAuth | 100 req/min | P1 |
| SendGrid | `api.sendgrid.com` | API key | 100 emails/day | P2 |
| Expo Push | `exp.host/--/api/v2` | Token | Unlimited | P3 |
| APNs (Apple Push) | `api.push.apple.com` | Certificate | Unlimited | P3 |
| FCM (Firebase) | `fcm.googleapis.com` | API key | Unlimited | P3 |

---

## MCP Servers (Model Context Protocol)

For Claude Code integration and AI assistant capabilities:

| MCP Server | Purpose | Source |
|------------|---------|--------|
| `@anthropic-ai/mcp-server-filesystem` | File system access | Anthropic official |
| `@anthropic-ai/mcp-server-github` | GitHub repo operations | Anthropic official |
| `mcp-server-brave-search` | Web search for agents | Community |
| `mcp-server-postgres` | Direct DB queries (Phase 2) | Community |
| `mcp-server-slack` | Slack integration | Community |
| `mcp-server-notion` | Notion docs sync | Community |

---

## Hugging Face Models

| Model | Size | Use Case | HF ID |
|-------|------|---------|-------|
| all-MiniLM-L6-v2 | 80MB | Fast semantic embeddings for matching | `sentence-transformers/all-MiniLM-L6-v2` |
| all-mpnet-base-v2 | 420MB | High-quality embeddings (Phase 2) | `sentence-transformers/all-mpnet-base-v2` |
| SkillBERT | 110MB | Skill extraction from job descriptions | `jjzha/jobbert-base-cased` |
| distilbert-base-uncased | 265MB | Fast text classification (content tagging) | `distilbert-base-uncased` |

---

## GitHub Projects Worth Studying

| Project | Stars | Why Relevant |
|---------|-------|-------------|
| `lobehub/lobe-chat` | 47k+ | AI agent + tool-use architecture patterns |
| `joaomdmoura/crewAI` | 22k+ | Multi-agent collaboration framework |
| `langchain-ai/langgraph` | 8k+ | Stateful agent orchestration |
| `BuilderIO/gpt-crawler` | 18k+ | Site crawling for AI context |
| `run-llama/llama_index` | 35k+ | RAG + knowledge base construction |
| `peerlist-app/peerlist` | N/A (closed) | Closest competitor, study their UX |
| `nicholasgillespie/craftwork` | Community | Developer portfolio inspiration |
| `calcom/cal.com` | 32k+ | Scheduling integration reference |
| `expo/expo` | 31k+ | React Native cross-platform reference |

---

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Velocity

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint

  build:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - run: npx lighthouse-ci autorun  # Performance check

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  agent-cron:
    # Separate workflow for nightly agent runs
    schedule: '0 2 * * *'  # 2 AM UTC
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r agents/requirements.txt
      - run: python agents/run_nightly.py
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
          PINECONE_API_KEY: ${{ secrets.PINECONE_API_KEY }}
          BASE44_API_KEY: ${{ secrets.BASE44_API_KEY }}
```

---

## Environment Variables

```env
# .env.local (web)
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_TOKEN=your_token

# agents/.env (Python agents)
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1-aws
BASE44_API_KEY=...
BASE44_APP_ID=...
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=...
SENDGRID_API_KEY=...
LANGSMITH_API_KEY=...
```

---

*Phase 4 document — reviewed 2026-03-26*
