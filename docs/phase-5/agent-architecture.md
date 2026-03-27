# Autonomous AI Agent Architecture

---

## Design Philosophy

> Build agents that don't just think but **act**. Agents that are not reactive but **continuously learn and improve** as they operate. Solutions that feel alive, adaptive, relevant, and are built for real-world impact.

Every agent in this system follows the **OAEL loop**:
- **O**bserve — read real-world state
- **A**nalyze — make sense of what was found
- **E**xecute — take meaningful action
- **L**earn — update internal model based on outcome

---

## Agent Registry

| Agent | Trigger | Autonomy Level | Self-Improving? |
|-------|---------|---------------|-----------------|
| Directory Crawler | Nightly cron | Full | No (deterministic) |
| Match Quality Improver | On feedback event | Full | ✅ Yes |
| Content Curator | Hourly cron | Full | No |
| Re-Engagement Sentinel | Daily cron | Full | ✅ Yes |
| Builder Insight Generator | On-demand | Full | No |
| Velocity Coach (Phase 3) | On user stall | Full | ✅ Yes |

---

## Agent 1: Directory Crawler

**What it does:** Crawls each builder's GitHub profile nightly. Extracts languages, repos, and activity. Updates their skills array. Keeps the builder directory fresh without manual input.

**Real-time data source:** GitHub REST API v3
**Action taken without human intervention:** Updates `user.skills[]` in Base44

```python
# agents/directory_crawler.py

import asyncio
from github import Github  # PyGitHub
from anthropic import Anthropic
import base44_client  # custom wrapper

async def crawl_builder(user: dict) -> dict:
    if not user.get("github_url"):
        return user

    github_username = extract_username(user["github_url"])
    g = Github(GITHUB_TOKEN)
    github_user = g.get_user(github_username)

    # Fetch top repos + languages
    repos = list(github_user.get_repos())[:10]
    language_counts = {}
    for repo in repos:
        if repo.language:
            language_counts[repo.language] = language_counts.get(repo.language, 0) + 1

    top_languages = sorted(language_counts, key=language_counts.get, reverse=True)[:5]

    # Map languages → skill labels
    skill_map = {
        "JavaScript": "JavaScript", "TypeScript": "TypeScript",
        "Python": "Python", "Java": "Java", "Swift": "iOS/Swift",
        "Kotlin": "Android/Kotlin", "Go": "Go", "Rust": "Rust",
        "CSS": "CSS", "HTML": "HTML/CSS"
    }
    new_skills = [skill_map.get(lang, lang) for lang in top_languages]

    # Merge with existing skills (no duplicates)
    existing = set(user.get("skills", []))
    merged = list(existing.union(set(new_skills)))

    # Update in Base44
    await base44_client.update_user(user["id"], {"skills": merged})

    return {**user, "skills": merged}

async def run():
    users = await base44_client.list_users()
    tasks = [crawl_builder(u) for u in users if u.get("github_url")]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    print(f"Crawled {len(results)} builders")
```

---

## Agent 2: Match Quality Improver (Self-Improving)

**What it does:** Watches what happens after matches are shown. If users message their matches → reinforce those signals. If they ignore → reduce weight. The algorithm continuously tunes itself.

**Real-time data source:** `match_feedback` table in Base44
**Action taken:** Adjusts scoring weights in Redis state

```python
# agents/match_improver.py

import json
from upstash_redis import Redis
from anthropic import Anthropic

DEFAULT_WEIGHTS = {
    "shared_skill": 12,
    "shared_interest": 8,
    "shared_goal": 7,
    "complementary_skill": 15,
    "is_recruiting": 6,
    "has_calendly": 4,
    "wants_collaborate": 5,
    "base": 42,
}

async def analyze_and_improve():
    redis = Redis.from_env()
    client = Anthropic()

    # Load current weights
    raw = redis.get("match_weights")
    weights = json.loads(raw) if raw else DEFAULT_WEIGHTS

    # Fetch last 7 days of feedback
    feedback = await base44_client.list_match_feedback(days=7)
    if len(feedback) < 10:
        return  # Not enough data yet

    # Compute signal-to-outcome correlations
    messaged = [f for f in feedback if f["outcome"] == "messaged"]
    ignored = [f for f in feedback if f["outcome"] == "ignored"]

    # Ask Claude to suggest weight adjustments
    analysis = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""
You are tuning a developer matching algorithm.
Current weights: {json.dumps(weights)}
Successful matches (resulted in message): {len(messaged)} cases
Ignored matches: {len(ignored)} cases

Match reason breakdown for successful cases:
{summarize_reasons(messaged)}

Match reason breakdown for ignored cases:
{summarize_reasons(ignored)}

Suggest small weight adjustments (+/- 1-3 points) to improve success rate.
Return JSON only: {{"shared_skill": X, "shared_interest": Y, ...}}
"""
        }]
    )

    try:
        new_weights = json.loads(analysis.content[0].text)
        # Clamp changes to prevent wild swings
        for key in weights:
            if key in new_weights:
                delta = new_weights[key] - weights[key]
                weights[key] += max(-3, min(3, delta))

        redis.set("match_weights", json.dumps(weights))
        print(f"Updated weights: {weights}")
    except Exception as e:
        print(f"Weight update failed: {e}")
```

---

## Agent 3: Content Curator

**What it does:** Reads every new post every hour. Classifies them. Tags tutorials. Flags high-quality content for the Resources "featured" section. No human editor needed.

```python
# agents/content_curator.py

async def curate_new_posts():
    client = Anthropic()
    last_run = redis.get("curator_last_run") or "2026-01-01"
    posts = await base44_client.list_posts_since(last_run)

    for post in posts:
        if post["post_type"] != "tutorial":
            continue

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=200,
            messages=[{
                "role": "user",
                "content": f"""
Analyze this developer tutorial post and respond with JSON only:
{{
  "quality_score": 1-10,
  "suggested_tags": ["tag1", "tag2"],
  "category": "React|Python|AI/ML|Backend|DevOps|Product|Career|Design|Database",
  "is_featured": true/false
}}

Post title: {post.get("title", "")}
Post content: {post.get("content", "")[:500]}
"""
            }]
        )

        try:
            result = json.loads(response.content[0].text)
            await base44_client.update_post(post["id"], {
                "hashtags": list(set(post.get("hashtags", []) + result["suggested_tags"])),
                "quality_score": result["quality_score"],
                "is_featured": result["is_featured"],
            })
        except Exception:
            pass

    redis.set("curator_last_run", datetime.now().isoformat())
```

---

## Agent 4: Re-Engagement Sentinel (Self-Improving)

**What it does:** Identifies builders who've gone quiet. Generates a personalized, data-driven nudge. Sends it. Tracks whether they re-engage. Learns which nudge types work best.

```python
# agents/re_engagement.py

NUDGE_TEMPLATES = {
    "match": "Hey {name}! You have {count} new Campfire matches since you were last active. {top_match} looks like a strong fit — they're working on {project}.",
    "milestone": "Hey {name}! {cohort_activity} builders in your network shipped updates this week. Share what you've been building!",
    "event": "Hey {name}! There's a {event_type} coming up on {date} that matches your interests. RSVP before spots fill up.",
}

async def run_sentinel():
    users = await base44_client.list_users()
    inactive = [
        u for u in users
        if days_since_active(u) > 14 and u.get("onboarded")
    ]

    # Load nudge performance from Redis
    performance = json.loads(redis.get("nudge_performance") or "{}")

    for user in inactive:
        # Choose best-performing nudge type for this user's profile
        best_type = max(performance.get(user["email"], {"match": 0.5}),
                       key=performance.get(user["email"], {}).get)

        nudge_text = await generate_nudge(user, best_type)
        await base44_client.create_notification({
            "user_email": user["email"],
            "type": "re_engagement",
            "message": nudge_text,
            "nudge_type": best_type,
        })

async def record_nudge_outcome(user_email: str, nudge_type: str, re_engaged: bool):
    """Called when user activity is detected after a nudge."""
    performance = json.loads(redis.get("nudge_performance") or "{}")
    user_perf = performance.get(user_email, {})
    current = user_perf.get(nudge_type, 0.5)
    # Exponential moving average
    user_perf[nudge_type] = current * 0.7 + (1.0 if re_engaged else 0.0) * 0.3
    performance[user_email] = user_perf
    redis.set("nudge_performance", json.dumps(performance))
```

---

## Agent 5: Builder Insight Generator

**What it does:** On Lookbook page load, analyzes a builder's GitHub and projects. Returns a rich AI analysis including strengths, collaboration pitch, and top repos. Runs async — page doesn't wait.

(Already partially implemented in `builderInsights` serverless function — this agent enhances it with better prompts and caching.)

---

## Agent 6: Velocity Coach (Phase 3)

**What it does:** The most ambitious agent. Watches a builder's activity patterns. When it detects stagnation (no project updates, no connections made despite having matches), it proactively reaches out with specific, actionable coaching.

```python
# agents/velocity_coach.py

async def coach_builder(user: dict):
    context = {
        "profile_completeness": score_profile(user),
        "matches_seen": count_matches_viewed(user["email"]),
        "messages_sent": count_messages_sent(user["email"]),
        "project_last_updated": get_project_last_update(user["email"]),
        "days_since_post": days_since_last_post(user["email"]),
    }

    # Only coach if there's a clear action gap
    if context["matches_seen"] > 3 and context["messages_sent"] == 0:
        coaching_situation = "has_matches_but_hasnt_reached_out"
    elif context["project_last_updated"] > 21:
        coaching_situation = "project_stalled"
    elif context["profile_completeness"] < 0.5:
        coaching_situation = "incomplete_profile"
    else:
        return  # No coaching needed

    client = Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        system="""You are a supportive, direct coach for early-career developers.
Give one specific, actionable suggestion. Be encouraging but concrete.
Never generic. Always reference their actual situation.""",
        messages=[{
            "role": "user",
            "content": f"""
Builder profile: {user['name']}, skills: {user.get('skills', [])},
situation: {coaching_situation}, context: {json.dumps(context)}

Write a brief (2-3 sentence) coaching message for them.
"""
        }]
    )

    await base44_client.create_notification({
        "user_email": user["email"],
        "type": "coach",
        "message": response.content[0].text,
    })
```

---

## Agent Orchestration: Main Runner

```python
# agents/run_nightly.py

import asyncio
import logging
from langsmith import Client as LangsmithClient

ls = LangsmithClient()

async def main():
    with ls.trace("nightly_agent_run"):
        # Sequential steps (order matters)
        await run_directory_crawler()      # Must run before match improvement
        await run_content_curator()        # Independent

        # Parallel steps
        await asyncio.gather(
            run_match_improver(),          # Uses updated profiles
            run_re_engagement_sentinel(),  # Uses updated activity data
        )

    logging.info("Nightly agent run complete")

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Agent State Machine

```
              IDLE
               │
         [cron triggers]
               │
               ▼
            LOADING
         (fetch data)
               │
          [data ready]
               │
               ▼
           ANALYZING
         (Claude API)
               │
        [analysis done]
               │
               ▼
           EXECUTING
         (write to DB)
               │
         [writes done]
               │
               ▼
           LEARNING
        (update weights)
               │
      [weights updated]
               │
               ▼
            LOGGING
         (Langsmith)
               │
               ▼
              IDLE

[At any step]
       ERROR
         │
    retry 3x
         │
    [still failing]
         │
    alert team + halt
```

---

## What Makes These Agents Self-Improving

| Agent | Learning Mechanism | What Improves |
|-------|-------------------|--------------|
| Match Improver | EMA on match→message conversion rate | Score weights |
| Re-Engagement Sentinel | Nudge type → re-engagement rate | Which nudge to send |
| Content Curator | Quality score → engagement correlation | Featured threshold |
| Velocity Coach | Coaching type → action completion rate | Which advice to give |

**The key:** Every agent writes its performance observations back to Redis. The next run reads them. No human tuning needed after initial calibration.

---

*Phase 5 document — reviewed 2026-03-26*
