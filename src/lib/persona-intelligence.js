import { base44 } from "@/api/base44Client";

function asArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(Boolean);
}

function toTime(value) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeProject(project) {
  return {
    id: project?.id || "",
    title: project?.title || "Untitled project",
    description: project?.description || "",
    status: project?.status || "in_progress",
    skills_needed: asArray(project?.skills_needed),
    owner_email: project?.owner_email || "",
    owner_name: project?.owner_name || "",
    image_url: project?.image_url || null,
    created_date: project?.created_date || null,
  };
}

function normalizePost(post) {
  return {
    id: post?.id || "",
    content: post?.content || "",
    post_type: post?.post_type || "update",
    hashtags: asArray(post?.hashtags),
    image_url: post?.image_url || null,
    created_date: post?.created_date || null,
  };
}

function normalizeEvent(event, relationship) {
  return {
    id: event?.id || "",
    title: event?.title || "Community event",
    description: event?.description || "",
    date: event?.date || null,
    location: event?.location || "",
    event_type: event?.event_type || "meetup",
    relationship,
    host_email: event?.host_email || "",
    host_name: event?.host_name || "",
  };
}

function buildUpcomingEvents(events, rsvps, email) {
  const trackedIds = new Set(
    asArray(rsvps)
      .map((rsvp) => rsvp?.event_id)
      .filter(Boolean)
  );

  return asArray(events)
    .filter((event) => {
      const hosted = event?.host_email === email;
      const attending = trackedIds.has(event?.id);
      if (!hosted && !attending) {
        return false;
      }

      const eventTime = toTime(event?.date);
      return eventTime === null || eventTime >= Date.now() - 60 * 60 * 1000;
    })
    .map((event) =>
      normalizeEvent(event, event?.host_email === email ? "hosting" : "attending")
    )
    .sort((a, b) => {
      const aTime = toTime(a.date) ?? Number.MAX_SAFE_INTEGER;
      const bTime = toTime(b.date) ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .slice(0, 6);
}

export async function loadBuilderActivity(email) {
  if (!email) {
    return {
      projects: [],
      posts: [],
      upcomingEvents: [],
    };
  }

  const [projects, posts, rsvps, events] = await Promise.all([
    base44.entities.Project.filter({ owner_email: email }).catch(() => []),
    base44.entities.Post.filter({ author_email: email }, "-created_date").catch(() => []),
    base44.entities.RSVP.filter({ user_email: email }).catch(() => []),
    base44.entities.Event.list("-date", 150).catch(() => []),
  ]);

  return {
    projects: asArray(projects).map(normalizeProject),
    posts: asArray(posts).map(normalizePost).slice(0, 12),
    upcomingEvents: buildUpcomingEvents(events, rsvps, email),
  };
}

export function shouldAnalyzeBuilder(builder, context = {}) {
  return Boolean(
    builder?.bio ||
      asArray(builder?.skills).length > 0 ||
      asArray(builder?.goals).length > 0 ||
      builder?.github_url ||
      builder?.linkedin_url ||
      builder?.portfolio_url ||
      builder?.x_url ||
      asArray(context.projects).length > 0 ||
      asArray(context.posts).length > 0 ||
      asArray(context.upcomingEvents).length > 0
  );
}

export function createBuilderInsightPayload(builder, context = {}) {
  return {
    id: builder?.id || builder?.email || "",
    email: builder?.email || null,
    name: builder?.full_name || builder?.name || builder?.email || "Builder",
    bio: builder?.bio || "",
    goal: builder?.goal || "",
    skills: asArray(builder?.skills),
    interests: asArray(builder?.interests),
    goals: asArray(builder?.goals),
    looking_for: asArray(builder?.looking_for),
    needs: asArray(builder?.needs),
    work_types: asArray(builder?.workTypes),
    github_url: builder?.github_url || null,
    linkedin_url: builder?.linkedin_url || null,
    portfolio_url: builder?.portfolio_url || null,
    x_url: builder?.x_url || null,
    projects: asArray(context.projects).map(normalizeProject),
    posts: asArray(context.posts).map(normalizePost),
    upcoming_events: asArray(context.upcomingEvents).map((event) =>
      normalizeEvent(event, event?.relationship || "attending")
    ),
  };
}

export async function fetchBuilderInsight(builder, context = {}) {
  const payload = createBuilderInsightPayload(builder, context);
  const result = await base44.functions.invoke("builderInsights", payload);
  return result?.data ?? result;
}
