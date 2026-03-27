# Conditional Logic Trees

Decision trees governing every major interaction in the system.

---

## 1. Authentication & Access Control

```
REQUEST ARRIVES
       │
       ▼
  Is user authenticated?
       │
  ┌────┴────┐
  NO       YES
  │         │
  ▼         ▼
[Redirect  Is user onboarded?
 to login]   │
        ┌────┴────┐
        NO       YES
        │         │
        ▼         ▼
  [Redirect    [Render
   to          requested
   /onboarding] page]
```

---

## 2. Campfire Match Display

```
CAMPFIRE PAGE LOADS
       │
       ▼
Does user have email?
       │
  ┌────┴────┐
  NO       YES
  │         │
  ▼         ▼
[Show     Fetch builder directory
 login    ────────────────────────
 prompt]  Does current user exist
          in directory?
               │
          ┌────┴────────┐
          NO            YES
          │              │
          ▼              ▼
    [Build fallback  Use directory
     profile from    profile
     auth user data]
               │
               ▼
    rankBuilderMatches(currentBuilder, builders)
               │
               ▼
    matches.length === 0?
               │
          ┌────┴────┐
          YES       NO
          │          │
          ▼          ▼
    [Show empty  Render match cards
     state with  (max 4, sorted by
     "improve    match score desc)
     profile CTA"]
                    │
               Each match card:
               has calendly_url?
               │
          ┌────┴────┐
          YES       NO
          │          │
          ▼          ▼
    [Show         [Hide "Schedule
     "Schedule     Meeting" button]
     Meeting"
     button]
```

---

## 3. Lookbook AI Insights Loading

```
LOOKBOOK PROFILE LOADS
       │
       ▼
Find builder by identifier
       │
  Not found? ──► [404 message]
       │
      YES (found)
       │
       ▼
Parallel fetch: Projects + Posts
       │
       ▼
builder.github_url exists OR projects.length > 0?
       │
  ┌────┴────┐
  NO       YES
  │         │
  ▼         ▼
[Skip AI  Set insightLoading = true
 section] Invoke base44.functions.invoke("builderInsights")
               │
          ┌────┴────┐
          SUCCESS   ERROR
          │          │
          ▼          ▼
    [Show AI     [Hide AI
     section:    section
     summary +   silently]
     strengths +
     GitHub repos]
```

---

## 4. RSVP Toggle Logic

```
USER CLICKS RSVP BUTTON
       │
       ▼
user?.email exists?
       │
  ┌────┴────┐
  NO       YES
  │         │
  ▼         │
[No-op]   busyEventId === event.id?
               │
          ┌────┴────┐
          YES       NO
          │          │
          ▼          ▼
    [No-op —     setBusyEventId(event.id)
     prevent      │
     double-tap]  Has existing RSVP for this event?
                       │
                  ┌────┴────┐
                  YES       NO
                  │          │
                  ▼          ▼
            [Delete RSVP] [Create RSVP]
            [Decrement    [Increment
             count]        count]
            (optimistic)  (optimistic)
                  │          │
                  └────┬─────┘
                       │
               setBusyEventId(null)
```

---

## 5. Tutorial Like Logic

```
USER CLICKS LIKE
       │
       ▼
user?.email exists?
       │
  ┌────┴────┐
  NO       YES
  │         │
  ▼         ▼
[No-op]   Find existing like for this post
               │
          ┌────┴────────┐
          EXISTS        NONE
          │              │
          ▼              ▼
    [Delete like]   [Create like]
    [Decrement       [Increment
     likes_count]     likes_count]
    (optimistic UI   (optimistic UI
     first, then      first, then
     API write)       API write)
```

---

## 6. Profile Completeness Gate

```
USER VISITS FEATURE
       │
       ▼
Feature requires profile data?
       │
  ┌────┴────┐
  NO       YES
  │         │
  ▼         ▼
[Proceed] Profile completeness score:
          skills.length > 0? (+1)
          bio.length > 20? (+1)
          goals.length > 0? (+1)
          looking_for.length > 0? (+1)
               │
               ▼
          Score >= 2?
               │
          ┌────┴────┐
          NO       YES
          │         │
          ▼         ▼
    [Show       [Show feature
     "Improve    with full
     Profile"    functionality]
     banner +
     reduced
     functionality]
```

---

## 7. Builder Directory Cache Logic

```
fetchBuilderDirectory({ force }) called
       │
       ▼
force === true?
       │
  ┌────┴────┐
  YES       NO
  │          │
  ▼          ▼
[Clear     directoryPromise exists?
 cache]         │
  │        ┌────┴────┐
  │        YES       NO
  │         │         │
  │    [Return     [Invoke
  │     cached     base44.functions
  │     promise]    .invoke("builderDirectory")]
  │                  │
  └──────────────────┘
                      │
               normalizeDirectory()
                      │
               [Return structured
                directory object]
                      │
                [Error?]
                │
           ┌────┴────┐
           YES       NO
           │          │
           ▼          ▼
     [Clear cache, [Cache promise,
      throw error]  return it]
```

---

## 8. Agent Decision Tree (Phase 2 — AI Agents)

```
AGENT TICK (every N minutes)
       │
       ▼
Which agent is this?
       │
  ┌────┼────────────┬────────────┐
  │    │            │            │
Match Profile    Content      Re-engagement
Agent  Agent     Curator      Agent
  │    │            │            │
  ▼    ▼            ▼            ▼
[Re-  [Scrape    [Scan new    [Check last
 rank  GitHub     posts for    activity
 matches         quality      per user]
 for             signals]         │
 all users]          │       14 days idle?
                 [Tag with    │
                  category]  ┌─┴──┐
                             YES   NO
                             │      │
                        [Send  [No
                         nudge  action]
                         email/
                         in-app]
```

---

## 9. Availability Logic for "Open Office Hours"

```
getAvailableBuilders(builders, { limit, excludeEmail })
       │
       ▼
Filter: builder.email exists AND email !== excludeEmail
       │
       ▼
Filter: builder.calendly_url OR builder.availability === "open"
       │
       ▼
Sort:
  has calendly_url + no calendly_url → calendly first
  then alphabetical by name
       │
       ▼
Slice to limit (default: 4)
       │
       ▼
Return array
```

---

## 10. Post Type Routing

```
CREATE POST
     │
     ▼
post_type selection:
     │
┌────┼──────────┬──────────┐
│    │          │          │
update milestone question tutorial
│    │          │          │
▼    ▼          ▼          ▼
[Feed][Feed +  [Feed +    [Feed +
      Lookbook  notify     Resources
      milestone  mentors?   page]
      badge]    Phase 2]
```

---

*Phase 3 document — reviewed 2026-03-26*
