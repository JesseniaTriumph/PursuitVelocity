# User Flows & Journey Maps

---

## Flow 1: New Fellow Onboarding

```
[App Load]
     │
     ▼
[Auth Check]
     │
     ├── Not authenticated ──► [Login / SSO via Base44]
     │                              │
     │                              ▼
     │                         [Auth Success]
     │                              │
     └── Authenticated ─────────────┘
                                    │
                                    ▼
                          [Profile Completeness Check]
                                    │
                    ┌───────────────┴──────────────────┐
                    │                                  │
               onboarded=false                   onboarded=true
                    │                                  │
                    ▼                                  ▼
            [Onboarding Flow]                   [Feed / Home]
                    │
            ┌───────┼────────────────┐
            │       │                │
         Step 1  Step 2           Step 3            Step 4
        (Bio)  (Skills)        (Projects)         (Connect)
            │       │                │                │
            └───────┴────────────────┘                │
                    │                                  │
                    ▼                                  │
           [Mark onboarded=true]                      │
                    │                                  │
                    └──────────────────────────────────┘
                                    │
                                    ▼
                          [Feed / Home — Welcome Banner]
```

---

## Flow 2: Finding a Collaborator (Campfire Path)

```
[Feed or Nav]
     │
     ▼
[Campfire Page]
     │
     ▼
[Load: fetchBuilderDirectory() → rankBuilderMatches()]
     │
     ├── Profile incomplete ──► [Banner: "Add skills to improve matches"]
     │
     └── Profile complete
               │
               ▼
         [Show 4 Suggested Matches]
               │
         [Each match card shows:]
         - Name + Avatar
         - Match % score
         - 2–3 match reasons (emoji + text)
         - Unique skills they bring
               │
         [User actions:]
         ┌─────┴──────────────┬───────────────┐
         │                    │               │
    [View Profile]      [Message]       [Open Lookbook]
         │                    │               │
         ▼                    ▼               ▼
   [Profile page]    [Messages page      [Lookbook page]
                      pre-filled ?to=]
               │
         [Schedule Meeting]  (if calendly_url exists)
               │
               ▼
         [Opens Calendly in new tab]
```

---

## Flow 3: Project Discovery & Team Formation

```
[CoBuild Page]
     │
     ▼
[Browse projects — filter by skills_needed, status]
     │
     ▼
[Project Card]
     │
     ├── status: looking_for_team ──► [Join Request button (future: Phase 2)]
     │                                 Current: [Message owner button]
     │
     └── status: in_progress ──► [View only, no join CTA]
               │
               ▼
     [Project Detail Page]
               │
     [Owner profile link + Message CTA]
               │
               ▼
     [Message conversation]
               │
               ▼
     [Offline: agree to collaborate]
               │
               ▼
     [Owner adds collaborator to project (Phase 2)]
               │
               ▼
     [Both post updates to Feed]
```

---

## Flow 4: Event Discovery & RSVP

```
[Connect Page]
     │
     ▼
[Load events + open builders]
     │
     ├── Filter by type (hackathon, meetup, workshop...)
     │
     ▼
[Event Card]
     │
     ├── [RSVP button]
     │       │
     │       ├── Not authenticated ──► [Prompt login]
     │       │
     │       └── Authenticated
     │               │
     │       ┌───────┴──────────┐
     │    hasRsvp=false    hasRsvp=true
     │       │                  │
     │  [Create RSVP]    [Delete RSVP]
     │  [+1 count]       [-1 count]
     │  (optimistic)     (optimistic)
     │
     └── [Details button] ──► [Event Detail Page]
               │
         [Full description, location, attendee count]
               │
         [RSVP from detail page too]
```

---

## Flow 5: Sharing a Resource (Tutorial)

```
[Resources Page]
     │
     ▼
[Click "Share Tutorial"]
     │
     ▼
[AddTutorialDialog opens]
     │
     ├── Fill: Title (required)
     ├── Fill: Content (required)
     ├── Select: Category
     ├── Fill: Tags (comma-separated)
     └── Fill: External Link (optional)
               │
               ▼
     [Submit → base44.entities.Post.create()]
               │
     [post_type: "tutorial", hashtags include category slug]
               │
               ▼
     [Dialog closes → loadResources() re-runs]
               │
               ▼
     [New tutorial appears in feed]
               │
     [Other users can Like → toggleLike()]
```

---

## Flow 6: Builder Lookbook View (External / Shareable)

```
[URL: /lookbook/:email]
     │
     ▼
[fetchBuilderDirectory()]
     │
     ├── builder found by email/id
     │
     └── builder not found ──► [Fallback with email as profile]
               │
               ▼
     [Parallel fetch:]
     ├── base44.entities.Project.filter({ owner_email })
     └── base44.entities.Post.filter({ author_email })
               │
               ▼
     [Render profile hero section]
               │
               ▼
     [Check: has github_url OR projects?]
     │
     ├── YES ──► [async: base44.functions.invoke("builderInsights")]
     │               │
     │           [Shows loading state while fetching]
     │               │
     │           ├── Success: Show AI summary + strengths + GitHub repos
     │           └── Fail: Gracefully hide the section
     │
     └── NO ──► [Skip AI section]
               │
               ▼
     [Show Skills, Projects, Recent Updates, CTAs]
               │
     [Share button]
     ├── navigator.share() available ──► [Native share sheet]
     └── Not available ──► [Copy URL to clipboard]
```

---

## Flow 7: Messaging (Direct Message)

```
[Any page with "Message" button]
     │
     ▼
[Link to: /messages?to={email}]
     │
     ▼
[Messages page loads]
     │
     ├── ?to param present ──► [Auto-open or create conversation]
     │
     └── No param ──► [Show conversation list]
               │
               ▼
     [Type message → send]
               │
     [Message saved to base44.entities.Message]
               │
     [Recipient sees notification (Phase 2: push notifications)]
```

---

## Emotional State Journey Map

```
FELLOW LIFECYCLE:

DAY 1        WEEK 1        MONTH 1       MONTH 3        MONTH 6+
  │              │              │              │              │
  ▼              ▼              ▼              ▼              ▼
[New]      [Exploring]    [Active]      [Shipping]     [Mentor]
  │              │              │              │              │
Feeling:   Feeling:       Feeling:      Feeling:       Feeling:
"Who is    "I can see     "I found      "My Lookbook   "I want to
everyone?" everyone"      my team"      is impressive" give back"
  │              │              │              │              │
Platform   Platform       Platform      Platform       Platform
shows:     shows:         shows:        shows:         shows:
Onboarding Campfire       Project       Completed      Office Hours
  tour     matches        board         project        visibility
                          access        badge
```

---

*Phase 3 document — reviewed 2026-03-26*
