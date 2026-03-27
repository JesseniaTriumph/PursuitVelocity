# Wireframes — Pursuit Sync / Velocity

> ASCII wireframes for all primary screens. Mobile-first (390px width). Desktop layouts noted separately.

---

## Screen 1: Feed (Home)

```
┌─────────────────────────────────┐
│  ⚡ Velocity          [🔔] [👤] │  ← Header
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ [Avatar] What are you    │   │  ← Compose prompt
│  │         building today?  │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [👤] Alex Chen  · 2h ago │   │  ← Post card
│  │ Milestone 🎉              │   │
│  │                           │   │
│  │ Just shipped auth for my  │   │
│  │ first full-stack app!    │   │
│  │ #milestone #react         │   │
│  │                           │   │
│  │ [🖼 image]                │   │
│  │                           │   │
│  │ ❤️ 12  💬 3  [Share]     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [👤] Maya Torres · 5h   │   │
│  │ Question ❓               │   │
│  │                           │   │
│  │ Anyone know how to set up │   │
│  │ CI/CD with GitHub Actions?│   │
│  │ #devops #question         │   │
│  │                           │   │
│  │ ❤️ 2  💬 8  [Answer]     │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  🏠  📁  ＋  👥  💬          │  ← Bottom nav
└─────────────────────────────────┘
```

---

## Screen 2: Campfire (Smart Matching)

```
┌─────────────────────────────────┐
│  🔥 Camp Fire         [↻ Refresh]│
│  Builders you should meet       │
├─────────────────────────────────┤
│ ┌───────────────────────────┐  │
│ │ ✨ Suggestions come from  │  │  ← Info banner
│ │ your profile, projects    │  │
│ │ and shared interests.     │  │
│ └───────────────────────────┘  │
│                                 │
│  SUGGESTED CONNECTIONS          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [👤] Jordan Lee         │   │  ← Match card
│  │      Building: DevMatch  │   │
│  │                    ✨ 87%│   │
│  │                    match │   │
│  │ 🤝 Brings React Native   │   │
│  │    your project needs    │   │
│  │ 🔥 You both work with    │   │
│  │    TypeScript, Node.js   │   │
│  │ 📅 Has open availability │   │
│  │                          │   │
│  │ They bring to project:   │   │
│  │ [React Native] [GraphQL] │   │
│  │                          │   │
│  │ [View Profile →][Message]│   │
│  │ [Open Lookbook          ]│   │
│  │ [📅 Schedule Meeting    ]│   │  ← Only if calendly
│  └─────────────────────────┘   │
│                                 │
│  ──────────────────────────     │
│  AVAILABLE TO CONNECT           │
│  ┌─────────────────────────┐   │
│  │ [👤] Sam Rivera         │   │
│  │ Full-stack · 4 skills   │   │
│  │ [💬 Message] [📘 Lookbook]│  │
│  │ [📅 Book a Slot         ]│   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  🏠  📁  ＋  👥  💬          │
└─────────────────────────────────┘
```

---

## Screen 3: Builders Directory

```
┌─────────────────────────────────┐
│  Builders                       │
│  Find collaborators by skill    │
├─────────────────────────────────┤
│  🔍 [Search by name, skill...]  │
│                                 │
│  [All Skills ▼]  [All ▼]       │
├─────────────────────────────────┤
│  42 builders                    │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [👤] Alex Chen          │   │
│  │      🟢 Open to collab  │   │
│  │ Building AI tools for   │   │
│  │ accessibility           │   │
│  │                         │   │
│  │ [React][Python][AI/ML]  │   │
│  │ +2 more                 │   │
│  │ Frontend · AI/ML        │   │
│  │ Building: AccessAI      │   │
│  │                         │   │
│  │ [View Profile][💬 Message]│  │
│  │ [📘 Open Lookbook      ]│   │
│  │ [📅 Schedule Meeting   ]│   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [👤] Maya Torres        │   │
│  │      🟡 Selective       │   │
│  │ ...                     │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  🏠  📁  ＋  👥  💬          │
└─────────────────────────────────┘
```

---

## Screen 4: Lookbook Profile

```
┌─────────────────────────────────┐
│  ← Back to lookbook  [Share][📅]│
├─────────────────────────────────┤
│                                 │
│      [Large Avatar 80px]        │
│      Alex Chen  [Cohort 12]     │
│      Building AI tools          │
│      for accessibility          │
│                                 │
│  [LinkedIn][GitHub][Portfolio]  │
│  [Profile]                      │
│                                 │
├─────────────────────────────────┤
│  ✨ AI BUILDER ANALYSIS         │
│  ┌─────────────────────────┐   │
│  │ Alex is a versatile     │   │
│  │ full-stack developer... │   │
│  │                         │   │
│  │ [React][AI/ML][Node.js] │   │
│  │                         │   │
│  │ Great for teams needing │   │
│  │ frontend + ML bridging  │   │
│  └─────────────────────────┘   │
│                                 │
│  ────────────────────────       │
│  SKILLS                         │
│  [React][TypeScript][Python]    │
│  [TensorFlow][CSS][Node.js]     │
│                                 │
│  ────────────────────────       │
│  ACTIVE PROJECTS                │
│  ┌─────────────────────────┐   │
│  │ AccessAI     [Recruiting]│   │
│  │ AI accessibility tool   │   │
│  │ [React][Python][ML]     │   │
│  └─────────────────────────┘   │
│                                 │
│  RECENT UPDATES                 │
│  ┌─────────────────────────┐   │
│  │ Mar 24 · milestone      │   │
│  │ Shipped MVP of the      │   │
│  │ screen reader module... │   │
│  └─────────────────────────┘   │
│                                 │
│  ────────────────────────       │
│  [📅 Schedule Meeting]          │
│  [💬 Send a Message ]           │
│  [⚡ Find More Builders]        │
├─────────────────────────────────┤
│  🏠  📁  ＋  👥  💬          │
└─────────────────────────────────┘
```

---

## Screen 5: Resources

```
┌─────────────────────────────────┐
│  📚 Resources    [+ Share Tutorial]
│  Tutorials from community posts │
├─────────────────────────────────┤
│  🔍 [Search tutorials...]      │
│                                 │
│  [All][React][Python][AI/ML]   │
│  [Backend][DevOps][Product]    │
├─────────────────────────────────┤
│  24 resources                   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [React] · 3 min read    │   │
│  │ How I set up Supabase   │   │
│  │ auth in 15 minutes      │   │
│  │                         │   │
│  │ Walk-through of the     │   │
│  │ exact steps I used to   │   │
│  │ integrate Supabase...   │   │
│  │                         │   │
│  │ [supabase][auth][react] │   │
│  │                         │   │
│  │ [👤] Alex · 2d ago  👍14│   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  🏠  📁  ＋  👥  💬          │
└─────────────────────────────────┘
```

---

## Screen 6: Connect (Events)

```
┌─────────────────────────────────┐
│  Connect              [+ Add Event]
│  Live events and office hours   │
├─────────────────────────────────┤
│  [All][Hackathon][Meetup]       │
│  [Workshop][Talk][Demo Day]     │
├─────────────────────────────────┤
│  UPCOMING EVENTS                │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🟢 Hackathon            │   │
│  │ Pursuit Spring Hack     │   │
│  │                         │   │
│  │ 📅 Saturday, Apr 12     │   │
│  │    10:00 AM             │   │
│  │ 📍 Pursuit HQ, NYC      │   │
│  │ 👥 34 going · 100 max   │   │
│  │                         │   │
│  │ Build a project in 24h  │   │
│  │ with a team of 3-5...   │   │
│  │                         │   │
│  │ [✅ RSVP]  [Details →]  │   │
│  └─────────────────────────┘   │
│                                 │
│  OPEN OFFICE HOURS              │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [👤] Darius Wright      │   │
│  │ Backend · Senior        │   │
│  │ Building AI tools for   │   │
│  │ teams                   │   │
│  │ ⏰[Node] ⏰[Python]      │   │
│  │                         │   │
│  │ [💬 Message][📅 Book]   │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  🏠  📁  ＋  👥  💬          │
└─────────────────────────────────┘
```

---

## Screen 7: Profile Edit

```
┌─────────────────────────────────┐
│  ← Edit Profile                 │
├─────────────────────────────────┤
│                                 │
│         [Avatar 80px]           │
│         [Change Photo]          │
│                                 │
│  Full Name                      │
│  [Alex Chen               ]     │
│                                 │
│  Bio                            │
│  [Building AI tools for    ]    │
│  [accessibility. Full-stack]    │
│                                 │
│  Skills (comma-separated)       │
│  [React, TypeScript, Python]    │
│                                 │
│  Cohort                         │
│  [Cohort 12                ]    │
│                                 │
│  Availability                   │
│  ○ Open to collaborate          │
│  ● Selective                    │
│  ○ Not available                │
│                                 │
│  Calendly URL                   │
│  [https://calendly.com/...  ]   │
│                                 │
│  GitHub URL                     │
│  [https://github.com/...    ]   │
│                                 │
│  LinkedIn URL                   │
│  [https://linkedin.com/in/...]  │
│                                 │
│  [       Save Profile       ]   │
│                                 │
├─────────────────────────────────┤
│  🏠  📁  ＋  👥  💬          │
└─────────────────────────────────┘
```

---

## Desktop Layout (1280px+)

```
┌────────────────────────────────────────────────────────────────┐
│  ⚡ Velocity   [Feed][Builders][Campfire][Events][Resources]  👤│
├──────────┬─────────────────────────────────┬───────────────────┤
│          │                                 │                   │
│ Sidebar  │         Main Content            │   Right Sidebar   │
│          │                                 │                   │
│ [🏠 Feed]│  ┌─────────────────────────┐  │  Campfire Picks   │
│ [📁 Build]│ │ Post card               │  │  ┌─────────────┐  │
│ [🔥 Fire] │  │ ...                     │  │  │ [👤] Jordan │  │
│ [👥 Build]│  └─────────────────────────┘  │  │ ✨ 87% match│  │
│ [📅 Event]│  ┌─────────────────────────┐  │  └─────────────┘  │
│ [📚 Res.] │  │ Post card               │  │                   │
│ [💬 Msgs] │  │ ...                     │  │  Upcoming Events  │
│           │  └─────────────────────────┘  │  ┌─────────────┐  │
│           │                                 │  │ Apr 12 Hack │  │
│           │                                 │  │ 34 going    │  │
│           │                                 │  └─────────────┘  │
└──────────┴─────────────────────────────────┴───────────────────┘
```

---

*Phase 3 document — reviewed 2026-03-26*
