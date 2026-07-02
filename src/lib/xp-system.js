import { base44 } from "@/api/base44Client";

// ─── XP VALUES ────────────────────────────────────────────────────────────────
export const XP_EVENTS = {
  // Content
  post_created: 10,
  milestone_posted: 25,
  tutorial_shared: 20,
  post_liked_received: 2,
  comment_received: 3,

  // Networking
  message_sent: 5,
  meeting_requested: 10,
  meeting_completed: 30,
  rsvp_event: 8,
  event_attended: 20,           // manually awarded or via check-in

  // Profile
  profile_completed: 50,
  github_connected: 15,
  calendly_connected: 15,
  lookbook_viewed: 1,           // per unique view (capped at 5/day)

  // Collaboration
  project_created: 20,
  project_completed: 50,
  collaborator_added: 15,
  campfire_match_messaged: 12,  // acted on a Campfire suggestion

  // Streaks (bonus)
  streak_3day: 15,
  streak_7day: 40,
  streak_30day: 100,
};

// ─── LEVEL THRESHOLDS ─────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, title: "Spark",        minXP: 0 },
  { level: 2, title: "Builder",      minXP: 50 },
  { level: 3, title: "Maker",        minXP: 150 },
  { level: 4, title: "Contributor",  minXP: 300 },
  { level: 5, title: "Collaborator", minXP: 500 },
  { level: 6, title: "Catalyst",     minXP: 800 },
  { level: 7, title: "Architect",    minXP: 1200 },
  { level: 8, title: "Mentor",       minXP: 1800 },
  { level: 9, title: "Velocity",     minXP: 2500 },
  { level: 10, title: "Legend",      minXP: 4000 },
];

// ─── BADGES ───────────────────────────────────────────────────────────────────
export const BADGES = [
  {
    id: "first_post",
    label: "First Post",
    description: "Shared your first build update",
    icon: "🚀",
    trigger: "post_created",
    condition: (stats) => stats.posts_count >= 1,
  },
  {
    id: "milestone_hunter",
    label: "Milestone Hunter",
    description: "Posted 5 milestones",
    icon: "🎯",
    condition: (stats) => stats.milestones_count >= 5,
  },
  {
    id: "connector",
    label: "Connector",
    description: "Messaged 10 different builders",
    icon: "🤝",
    condition: (stats) => stats.unique_messages_sent >= 10,
  },
  {
    id: "open_source",
    label: "Open Source",
    description: "Connected your GitHub",
    icon: "💻",
    condition: (stats) => stats.github_connected === true,
  },
  {
    id: "ship_it",
    label: "Ship It",
    description: "Completed your first project",
    icon: "🛸",
    condition: (stats) => stats.projects_completed >= 1,
  },
  {
    id: "fire_streak",
    label: "On Fire",
    description: "7-day posting streak",
    icon: "🔥",
    condition: (stats) => stats.longest_streak >= 7,
  },
  {
    id: "mentor_mode",
    label: "Mentor Mode",
    description: "Held 5+ office hours meetings",
    icon: "🌟",
    condition: (stats) => stats.meetings_completed >= 5,
  },
  {
    id: "event_goer",
    label: "Community First",
    description: "Attended 3 community events",
    icon: "📅",
    condition: (stats) => stats.events_attended >= 3,
  },
  {
    id: "tutorial_master",
    label: "Knowledge Sharer",
    description: "Shared 3 tutorials",
    icon: "📚",
    condition: (stats) => stats.tutorials_count >= 3,
  },
  {
    id: "velocity",
    label: "Velocity",
    description: "Reached Level 9",
    icon: "⚡",
    condition: (stats) => getLevelFromXP(stats.total_xp).level >= 9,
  },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
export function getLevelFromXP(xp = 0) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) current = level;
    else break;
  }
  const nextLevel = LEVELS.find((l) => l.minXP > xp) || null;
  const progress = nextLevel
    ? Math.round(((xp - current.minXP) / (nextLevel.minXP - current.minXP)) * 100)
    : 100;
  return { ...current, nextLevel, progress, xp };
}

export function getEarnedBadges(stats = {}) {
  return BADGES.filter((badge) => {
    try { return badge.condition(stats); }
    catch { return false; }
  });
}

export function xpLabel(event) {
  const val = XP_EVENTS[event];
  return val ? `+${val} XP` : null;
}

// ─── API HELPERS ──────────────────────────────────────────────────────────────
export async function awardXP(userEmail, event, metadata = {}) {
  const amount = XP_EVENTS[event];
  if (!amount || !userEmail) return null;

  try {
    const record = await base44.entities.XPEvent.create({
      user_email: userEmail,
      event_type: event,
      xp_amount: amount,
      metadata: JSON.stringify(metadata),
      created_date: new Date().toISOString(),
    });
    return record;
  } catch {
    // XPEvent entity may not exist yet — fail silently, don't block UX
    return null;
  }
}

export async function getUserXPStats(userEmail) {
  if (!userEmail) return { total_xp: 0, level: LEVELS[0], badges: [] };

  try {
    const events = await base44.entities.XPEvent.filter({ user_email: userEmail });
    const total_xp = events.reduce((sum, e) => sum + (e.xp_amount || 0), 0);
    const level = getLevelFromXP(total_xp);
    return { total_xp, level, events };
  } catch {
    return { total_xp: 0, level: LEVELS[0], events: [] };
  }
}
