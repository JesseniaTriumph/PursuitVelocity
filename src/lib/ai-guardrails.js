/**
 * AI Guardrails — Content safety and responsible AI interaction layer.
 *
 * Design principles:
 * 1. Transparency — users always know when AI is involved
 * 2. Consent — opt-in for AI analysis; nothing runs without user trigger
 * 3. Minimal data — AI only receives what's needed for the task
 * 4. Graceful failure — AI errors never break the product
 * 5. User control — users can delete AI-generated content from their profile
 */

// ─── CLIENT-SIDE CONTENT FILTER ───────────────────────────────────────────────
// Fast pattern-based pre-screen before any content reaches AI or database.
// Does NOT replace server-side moderation — it's a first-line UX guard.

const BLOCKED_PATTERNS = [
  // Personal data fishing
  /\b(ssn|social security|passport number|bank account|credit card)\b/i,
  // Spam signals
  /\b(click here|buy now|limited offer|make \$\d+)\b/i,
  // Obvious slurs (keep list minimal and maintained separately in production)
];

const WARN_PATTERNS = [
  // Contact info in public posts (should be in profile, not posts)
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,         // phone number
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, // email in post body
];

export function screenContent(text = "") {
  const blocked = BLOCKED_PATTERNS.find((p) => p.test(text));
  if (blocked) {
    return {
      allowed: false,
      reason: "This content contains information that can't be posted publicly. Remove sensitive data and try again.",
    };
  }

  const warned = WARN_PATTERNS.find((p) => p.test(text));
  if (warned) {
    return {
      allowed: true,
      warning: "Heads up: your post may contain personal contact info. Consider removing it or messaging directly instead.",
    };
  }

  return { allowed: true };
}

// ─── AI INTERACTION LABELS ────────────────────────────────────────────────────
// Every AI-generated surface must include one of these labels.

export const AI_LABELS = {
  match: { text: "AI-suggested match", icon: "✨" },
  insight: { text: "AI Builder Analysis", icon: "✨" },
  coach: { text: "AI Coach", icon: "🤖" },
  tag: { text: "Auto-tagged by AI", icon: "🏷️" },
  suggestion: { text: "AI suggestion", icon: "💡" },
};

// ─── AI CONSENT CHECKS ────────────────────────────────────────────────────────
// Features that require explicit user consent before AI can process their data.

export const AI_CONSENT_FEATURES = {
  lookbook_insights: {
    label: "AI Builder Analysis",
    description: "Analyzes your GitHub and projects to generate a public AI summary on your Lookbook.",
    dataUsed: ["github_url", "projects", "bio", "skills"],
    canDisable: true,
  },
  campfire_matching: {
    label: "Smart Matching",
    description: "Uses your skills, interests, and projects to rank the best collaborators for you.",
    dataUsed: ["skills", "interests", "goals", "looking_for", "activeProject"],
    canDisable: false, // Core feature — but data is minimal
  },
  velocity_coach: {
    label: "Velocity Coach",
    description: "Sends you personalized tips based on your activity patterns.",
    dataUsed: ["activity_history", "profile_completeness"],
    canDisable: true,
  },
  content_tagging: {
    label: "Auto-tagging",
    description: "Automatically suggests hashtags and categories for your posts.",
    dataUsed: ["post_content"],
    canDisable: true,
  },
};

// ─── RATE LIMITS (CLIENT-SIDE GUARD) ─────────────────────────────────────────
// Prevent accidental loops or abuse of AI features.
// Production: enforce server-side. This is UX-level guard only.

const AI_RATE_LIMITS = {
  lookbook_insights: { max: 3, windowMinutes: 60 },  // 3 refreshes per hour
  campfire_refresh: { max: 10, windowMinutes: 60 },   // 10 refreshes per hour
  meeting_request: { max: 20, windowMinutes: 1440 },  // 20 requests per day
};

const _rateLimitStore = {};

export function checkRateLimit(feature) {
  const limit = AI_RATE_LIMITS[feature];
  if (!limit) return { allowed: true };

  const key = `rl_${feature}`;
  const now = Date.now();
  const window = limit.windowMinutes * 60 * 1000;

  if (!_rateLimitStore[key]) _rateLimitStore[key] = [];
  _rateLimitStore[key] = _rateLimitStore[key].filter((t) => now - t < window);

  if (_rateLimitStore[key].length >= limit.max) {
    return {
      allowed: false,
      reason: `You've used this feature ${limit.max} times in the last ${limit.windowMinutes} minutes. Try again later.`,
    };
  }

  _rateLimitStore[key].push(now);
  return { allowed: true };
}

// ─── SAFE AI WRAPPER ──────────────────────────────────────────────────────────
// Wraps any AI function call with: rate limiting, error handling, timeout.
// AI errors NEVER propagate to break the UI.

export async function safeAICall(feature, fn, fallback = null) {
  const rateCheck = checkRateLimit(feature);
  if (!rateCheck.allowed) {
    console.warn(`[AI Guardrails] Rate limit hit for ${feature}:`, rateCheck.reason);
    return fallback;
  }

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI timeout")), 15000)
    );
    return await Promise.race([fn(), timeoutPromise]);
  } catch (err) {
    console.warn(`[AI Guardrails] ${feature} failed silently:`, err.message);
    return fallback;
  }
}

// ─── USER DATA MINIMIZATION ───────────────────────────────────────────────────
// Before sending to AI, strip fields that aren't needed.

export function minimizeProfileForAI(profile, feature) {
  const allowed = AI_CONSENT_FEATURES[feature]?.dataUsed || [];
  const result = {};
  for (const field of allowed) {
    if (profile[field] !== undefined) result[field] = profile[field];
  }
  return result;
}

// ─── PRIVACY SETTINGS DEFAULTS ───────────────────────────────────────────────
export const DEFAULT_PRIVACY = {
  show_in_directory: true,
  allow_meeting_requests: true,
  allow_ai_insights: true,
  allow_coach_messages: true,
  profile_visible_to: "community",   // 'community' | 'connections_only' | 'private'
};
