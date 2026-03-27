# Entity Relationship Diagram (ERD)

---

## Core Entity Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VELOCITY DATA MODEL                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐        ┌──────────────────┐       ┌──────────────┐
│     USER     │        │     PROJECT      │       │     POST     │
├──────────────┤        ├──────────────────┤       ├──────────────┤
│ id (PK)      │        │ id (PK)          │       │ id (PK)      │
│ email (UK)   │1──────<│ owner_email (FK) │       │ author_email │
│ full_name    │        │ owner_name       │       │ author_name  │
│ bio          │        │ title            │       │ author_avatar│
│ avatar       │        │ description      │       │ content      │
│ skills[]     │        │ status           │       │ image_url    │
│ interests[]  │        │ skills_needed[]  │       │ hashtags[]   │
│ goals[]      │        │ team_size        │       │ post_type    │
│ looking_for[]│        │ max_team_size    │       │ likes_count  │
│ needs[]      │        │ image_url        │       │ comments_cnt │
│ cohort       │        │ created_date     │       │ created_date │
│ availability │        └──────────────────┘       └──────────────┘
│ calendly_url │                                          │
│ github_url   │                                          │ 1
│ linkedin_url │                                          │
│ x_url        │                                          ▼
│ portfolio_url│        ┌──────────────────┐       ┌──────────────┐
│ resume_url   │        │    COMMENT       │       │     LIKE     │
│ goal         │        ├──────────────────┤       ├──────────────┤
│ onboarded    │        │ id (PK)          │       │ id (PK)      │
│ created_date │        │ post_id (FK) ────│──────<│ post_id (FK) │
└──────────────┘        │ author_email(FK) │       │ user_email   │
        │               │ content          │       │ created_date │
        │               │ created_date     │       └──────────────┘
        │               └──────────────────┘
        │
        │ 1                    ┌──────────────────┐
        │                      │      EVENT       │
        ▼                      ├──────────────────┤
┌──────────────┐              │ id (PK)          │
│    MESSAGE   │              │ title            │
├──────────────┤              │ description      │
│ id (PK)      │              │ event_type       │
│ sender_email │              │ date             │
│ receiver_email│             │ location         │
│ content      │              │ max_attendees    │
│ read         │              │ rsvp_count       │
│ created_date │              │ created_date     │
└──────────────┘              └──────────────────┘
                                       │
                                       │ 1
                                       ▼
                              ┌──────────────────┐
                              │       RSVP       │
                              ├──────────────────┤
                              │ id (PK)          │
                              │ event_id (FK)    │
                              │ user_email       │
                              │ user_name        │
                              │ created_date     │
                              └──────────────────┘
```

---

## Relationship Summary

| Entity A | Relationship | Entity B | Cardinality |
|----------|-------------|----------|-------------|
| User | owns | Project | 1:many |
| User | writes | Post | 1:many |
| User | sends | Message | 1:many |
| User | receives | Message | 1:many |
| Post | has | Like | 1:many |
| Post | has | Comment | 1:many |
| Event | has | RSVP | 1:many |
| User | RSVPs to | Event | many:many (via RSVP) |
| User | likes | Post | many:many (via Like) |

---

## Field Type Definitions

```sql
-- USER
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  bio           TEXT,
  avatar        TEXT,              -- URL
  skills        TEXT[],            -- Array of strings
  interests     TEXT[],
  goals         TEXT[],
  looking_for   TEXT[],            -- Enum values: 'build_own_project'|'join_project'|'collaborate'|'learn'
  needs         TEXT[],
  cohort        TEXT,
  availability  TEXT DEFAULT 'selective',  -- 'open'|'selective'|'closed'
  calendly_url  TEXT,
  github_url    TEXT,
  linkedin_url  TEXT,
  x_url         TEXT,
  portfolio_url TEXT,
  resume_url    TEXT,
  goal          TEXT,              -- Derived display text
  onboarded     BOOLEAN DEFAULT false,
  created_date  TIMESTAMP DEFAULT NOW()
);

-- PROJECT
CREATE TABLE projects (
  id              TEXT PRIMARY KEY,
  owner_email     TEXT REFERENCES users(email),
  owner_name      TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'in_progress',  -- 'looking_for_team'|'in_progress'|'completed'
  skills_needed   TEXT[],
  team_size       INTEGER DEFAULT 1,
  max_team_size   INTEGER DEFAULT 1,
  image_url       TEXT,
  created_date    TIMESTAMP DEFAULT NOW()
);

-- POST
CREATE TABLE posts (
  id              TEXT PRIMARY KEY,
  author_email    TEXT,
  author_name     TEXT,
  author_avatar   TEXT,
  content         TEXT NOT NULL,
  image_url       TEXT,
  hashtags        TEXT[],
  post_type       TEXT DEFAULT 'update',   -- 'update'|'milestone'|'question'|'tutorial'|'progress'
  likes_count     INTEGER DEFAULT 0,
  comments_count  INTEGER DEFAULT 0,
  created_date    TIMESTAMP DEFAULT NOW()
);

-- EVENT
CREATE TABLE events (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  event_type      TEXT,   -- 'hackathon'|'meetup'|'workshop'|'talk'|'demo_day'|'study_session'
  date            TIMESTAMP,
  location        TEXT,   -- null = virtual
  max_attendees   INTEGER,
  rsvp_count      INTEGER DEFAULT 0,
  created_date    TIMESTAMP DEFAULT NOW()
);

-- RSVP
CREATE TABLE rsvps (
  id              TEXT PRIMARY KEY,
  event_id        TEXT REFERENCES events(id),
  user_email      TEXT,
  user_name       TEXT,
  created_date    TIMESTAMP DEFAULT NOW()
);

-- LIKE
CREATE TABLE likes (
  id              TEXT PRIMARY KEY,
  post_id         TEXT REFERENCES posts(id),
  user_email      TEXT,
  created_date    TIMESTAMP DEFAULT NOW()
);

-- MESSAGE
CREATE TABLE messages (
  id              TEXT PRIMARY KEY,
  sender_email    TEXT,
  receiver_email  TEXT,
  content         TEXT NOT NULL,
  read            BOOLEAN DEFAULT false,
  created_date    TIMESTAMP DEFAULT NOW()
);
```

---

## Phase 2 Extensions (Agent Layer)

```
┌─────────────────────┐     ┌──────────────────────┐
│    AGENT_INSIGHT    │     │   MATCH_FEEDBACK     │
├─────────────────────┤     ├──────────────────────┤
│ id (PK)             │     │ id (PK)              │
│ target_email        │     │ source_email         │
│ insight_type        │     │ target_email         │
│ data (JSON)         │     │ outcome              │ ← 'messaged'|'scheduled'|'ignored'
│ generated_at        │     │ match_score          │
│ expires_at          │     │ created_date         │
└─────────────────────┘     └──────────────────────┘

┌─────────────────────┐
│   VECTOR_EMBEDDING  │
├─────────────────────┤
│ id (PK)             │
│ entity_type         │ ← 'user'|'project'|'post'
│ entity_id           │
│ embedding (vector)  │ ← stored in Pinecone, not DB
│ updated_at          │
└─────────────────────┘
```

---

*Phase 4 document — reviewed 2026-03-26*
