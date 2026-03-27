import { createClientFromRequest } from "npm:@base44/sdk";

type BuilderPayload = {
  id?: string;
  email?: string | null;
  name?: string;
  bio?: string;
  goal?: string;
  skills?: string[];
  goals?: string[];
  interests?: string[];
  looking_for?: string[];
  needs?: string[];
  work_types?: string[];
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  x_url?: string | null;
  projects?: Array<{
    title?: string;
    description?: string;
    skills_needed?: string[];
    status?: string;
  }>;
  posts?: Array<{
    content?: string;
    post_type?: string;
    hashtags?: string[];
    created_date?: string | null;
  }>;
  upcoming_events?: Array<{
    title?: string;
    description?: string;
    date?: string | null;
    location?: string;
    event_type?: string;
    relationship?: string;
  }>;
};

type PublicSource = {
  source: string;
  url: string | null;
  status: "ok" | "missing" | "unavailable" | "invalid";
  title?: string | null;
  description?: string | null;
  headings?: string[];
  snippet?: string | null;
  note?: string;
};

type GitHubContext = Awaited<ReturnType<typeof fetchGitHubContext>>;

const PUBLIC_PAGE_HEADERS = {
  "User-Agent": "velocity-persona-intelligence",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function asArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function truncateText(value: string | null | undefined, maxLength = 280) {
  if (!value) {
    return "";
  }

  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

function normalizeUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString();
    } catch {
      return null;
    }
  }
}

function parseGitHubUsername(url: string | null | undefined) {
  const normalized = normalizeUrl(url);
  if (!normalized) {
    return null;
  }

  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(normalized);
    const [username] = parsed.pathname.split("/").filter(Boolean);
    return username || null;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchGitHubJson(url: string) {
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "velocity-persona-intelligence",
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed with ${response.status}`);
  }

  return response.json();
}

async function fetchGitHubText(url: string) {
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "velocity-persona-intelligence",
      Accept: "application/vnd.github.raw+json",
    },
  });

  if (!response.ok) {
    return null;
  }

  return truncateText(await response.text(), 1200);
}

async function fetchGitHubContext(username: string) {
  const [profile, repos] = await Promise.all([
    fetchGitHubJson(`https://api.github.com/users/${username}`),
    fetchGitHubJson(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`),
  ]);

  const recentRepos = Array.isArray(repos) ? repos.filter((repo) => !repo.fork).slice(0, 4) : [];
  const enrichedRepos = await Promise.all(
    recentRepos.map(async (repo) => {
      const [languagesData, readmeExcerpt] = await Promise.all([
        repo.languages_url ? fetchGitHubJson(repo.languages_url).catch(() => ({})) : Promise.resolve({}),
        fetchGitHubText(`https://api.github.com/repos/${username}/${repo.name}/readme`).catch(() => null),
      ]);

      return {
        name: repo.name,
        description: repo.description || "",
        language: repo.language || null,
        languages: Object.keys((languagesData as Record<string, number>) || {}).slice(0, 5),
        stars: repo.stargazers_count || 0,
        url: repo.html_url,
        homepage: repo.homepage || null,
        topics: Array.isArray(repo.topics) ? repo.topics : [],
        updated_at: repo.updated_at,
        readme_excerpt: readmeExcerpt,
      };
    })
  );

  return {
    username,
    profile: {
      bio: profile.bio || null,
      public_repos: profile.public_repos || 0,
      followers: profile.followers || 0,
      following: profile.following || 0,
    },
    repos: enrichedRepos,
  };
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMatch(pattern: RegExp, value: string) {
  const match = value.match(pattern);
  return match?.[1]?.trim() || null;
}

function extractMeta(html: string, name: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const result = extractMatch(pattern, html);
    if (result) {
      return result;
    }
  }

  return null;
}

function extractHeadings(html: string) {
  const headings = Array.from(html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi))
    .map((match) => stripHtml(match[1] || ""))
    .filter(Boolean);

  return headings.slice(0, 4);
}

async function fetchPublicPageContext(source: string, url: string | null | undefined): Promise<PublicSource> {
  const normalizedUrl = normalizeUrl(url);
  if (!url) {
    return { source, url: null, status: "missing", note: `${source} not linked` };
  }

  if (!normalizedUrl) {
    return { source, url: url || null, status: "invalid", note: `${source} URL is invalid` };
  }

  try {
    const response = await fetchWithTimeout(normalizedUrl, {
      headers: PUBLIC_PAGE_HEADERS,
      redirect: "follow",
    });

    if (!response.ok) {
      return {
        source,
        url: normalizedUrl,
        status: "unavailable",
        note: `${source} returned HTTP ${response.status}`,
      };
    }

    const rawHtml = truncateText(await response.text(), 60000);
    const title = extractMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, rawHtml);
    const description =
      extractMeta(rawHtml, "og:description") ||
      extractMeta(rawHtml, "description") ||
      null;
    const headings = extractHeadings(rawHtml);
    const snippet = truncateText(stripHtml(rawHtml), 900);

    return {
      source,
      url: normalizedUrl,
      status: "ok",
      title,
      description,
      headings,
      snippet,
      note: `${source} page parsed successfully`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "request failed";
    return {
      source,
      url: normalizedUrl,
      status: "unavailable",
      note: `${source} could not be fetched: ${message}`,
    };
  }
}

function preferredChannels(builder: BuilderPayload) {
  const channels = ["Velocity post"];

  if (builder.linkedin_url) {
    channels.push("LinkedIn");
  }

  if (builder.x_url) {
    channels.push("X");
  }

  if (builder.portfolio_url) {
    channels.push("Portfolio / case study");
  }

  if (builder.github_url) {
    channels.push("GitHub README / repo update");
  }

  return channels;
}

function buildSourceNotes(
  builder: BuilderPayload,
  githubData: GitHubContext | null,
  publicSources: PublicSource[]
) {
  return [
    {
      source: "Velocity profile",
      status: builder.bio || asArray(builder.skills).length > 0 ? "ok" : "missing",
      note:
        builder.bio || asArray(builder.skills).length > 0
          ? "Used profile bio, skills, goals, and collaboration preferences"
          : "Profile copy is thin",
    },
    {
      source: "Velocity projects",
      status: (builder.projects || []).length > 0 ? "ok" : "missing",
      note:
        (builder.projects || []).length > 0
          ? `Used ${(builder.projects || []).length} project signal${(builder.projects || []).length === 1 ? "" : "s"}`
          : "No projects found",
    },
    {
      source: "Velocity posts",
      status: (builder.posts || []).length > 0 ? "ok" : "missing",
      note:
        (builder.posts || []).length > 0
          ? `Used ${(builder.posts || []).length} post signal${(builder.posts || []).length === 1 ? "" : "s"}`
          : "No public posts found",
    },
    {
      source: "Upcoming events",
      status: (builder.upcoming_events || []).length > 0 ? "ok" : "missing",
      note:
        (builder.upcoming_events || []).length > 0
          ? `Used ${(builder.upcoming_events || []).length} planned event signal${(builder.upcoming_events || []).length === 1 ? "" : "s"}`
          : "No upcoming events found",
    },
    {
      source: "GitHub",
      status: githubData ? "ok" : builder.github_url ? "unavailable" : "missing",
      note: githubData
        ? `Used ${githubData.repos.length} recent public repo signal${githubData.repos.length === 1 ? "" : "s"}`
        : builder.github_url
          ? "GitHub link was provided but could not be analyzed"
          : "GitHub not linked",
    },
    ...publicSources.map((source) => ({
      source: source.source,
      status: source.status,
      note: source.note || "",
    })),
  ];
}

function buildFallbackAnalysis(
  builder: BuilderPayload,
  githubData: GitHubContext | null,
  publicSources: PublicSource[]
) {
  const skills = asArray(builder.skills);
  const goals = asArray(builder.goals);
  const interests = asArray(builder.interests);
  const needs = asArray(builder.needs);
  const lookingFor = asArray(builder.looking_for);
  const projects = Array.isArray(builder.projects) ? builder.projects : [];
  const posts = Array.isArray(builder.posts) ? builder.posts : [];
  const upcomingEvents = Array.isArray(builder.upcoming_events) ? builder.upcoming_events : [];
  const repoLanguages = [
    ...new Set(
      (githubData?.repos || [])
        .flatMap((repo) => [repo.language, ...(Array.isArray(repo.languages) ? repo.languages : [])])
        .filter(Boolean)
    ),
  ] as string[];
  const projectTitles = projects
    .map((project) => project.title)
    .filter(Boolean)
    .slice(0, 4);
  const visibleSources = publicSources
    .filter((source) => source.status === "ok")
    .map((source) => source.source);
  const activeProject = projects.find((project) => project.status === "in_progress" || project.status === "looking_for_team") || projects[0];

  const strengths = [
    ...skills.slice(0, 3),
    ...repoLanguages.slice(0, 2),
    ...asArray(builder.work_types).slice(0, 2),
  ].filter(Boolean).slice(0, 6);

  const breadthSignals = [
    projectTitles.length > 0 ? `Public work includes ${projectTitles.join(", ")}` : "",
    repoLanguages.length > 0 ? `Code footprint spans ${repoLanguages.slice(0, 4).join(", ")}` : "",
    interests.length > 0 ? `Interests point toward ${interests.slice(0, 3).join(", ")}` : "",
    visibleSources.length > 0 ? `Public narrative signals are available from ${visibleSources.join(", ")}` : "",
  ].filter(Boolean);

  const experienceSignals = [
    projects.length > 0 ? `${projects.length} listed project${projects.length === 1 ? "" : "s"} show build execution` : "",
    posts.length > 0 ? `${posts.length} public update${posts.length === 1 ? "" : "s"} show shipping momentum` : "",
    githubData?.repos?.length ? `${githubData.repos.length} recent public repos show active coding work` : "",
    upcomingEvents.length > 0 ? `${upcomingEvents.length} upcoming event${upcomingEvents.length === 1 ? "" : "s"} suggest active community participation` : "",
  ].filter(Boolean);

  const supportOpportunities = [
    activeProject?.skills_needed?.length
      ? `Could use support around ${asArray(activeProject.skills_needed).slice(0, 3).join(", ")} for ${activeProject.title || "the current build"}`
      : "",
    needs.includes("teammates") ? "Looks open to teammates or execution partners" : "",
    needs.includes("guidance") ? "Could benefit from tactical feedback or mentorship on current work" : "",
    lookingFor.includes("collaborate") ? "Appears collaboration-ready for adjacent builders" : "",
  ].filter(Boolean);

  const optimizationRecommendations = [
    !builder.github_url && skills.some((skill) => /react|node|python|backend|frontend|ai/i.test(skill))
      ? {
          title: "Add public code evidence",
          detail: "Link a GitHub profile or featured repos so peers can evaluate implementation depth instead of guessing.",
        }
      : null,
    !builder.portfolio_url && projects.length > 0
      ? {
          title: "Publish a case-study surface",
          detail: "Add a portfolio or project page that explains what you shipped, your role, the stack, and outcomes.",
        }
      : null,
    posts.length < 2
      ? {
          title: "Share progress more often",
          detail: "A steady stream of build updates makes your momentum, taste, and communication style easier for peers to understand.",
        }
      : null,
    upcomingEvents.length > 0 && !builder.linkedin_url && !builder.x_url
      ? {
          title: "Create a public event narrative",
          detail: "Before upcoming events, post what you are building, what help you can offer, and who you want to meet.",
        }
      : null,
  ].filter(Boolean);

  const channels = preferredChannels(builder);
  const contentCalendar = [
    upcomingEvents[0]
      ? {
          timing: `3-5 days before ${upcomingEvents[0].title || "the next event"}`,
          channel: channels[0] || "Velocity post",
          format: "Preview post",
          topic: `What I am bringing to ${upcomingEvents[0].title || "this event"} and who I want to meet`,
          rationale: "Helps peers understand collaboration intent before the event.",
          call_to_action: "Invite builders with complementary skills to connect.",
        }
      : null,
    activeProject
      ? {
          timing: "This week",
          channel: channels[1] || channels[0] || "Velocity post",
          format: "Build update",
          topic: `Current progress on ${activeProject.title || "the main build"} plus the next milestone`,
          rationale: "Makes current execution visible and creates easy entry points for support.",
          call_to_action: "Ask for one concrete intro, feedback pass, or collaborator skill.",
        }
      : null,
    githubData?.repos?.[0]
      ? {
          timing: "After the next meaningful ship",
          channel: builder.github_url ? "GitHub README / repo update" : channels[0] || "Velocity post",
          format: "Technical breakdown",
          topic: `What changed in ${githubData.repos[0].name} and what you learned while building it`,
          rationale: "Shows implementation depth and thought process, not just outcomes.",
          call_to_action: "Point peers to the repo, demo, or issue list for feedback.",
        }
      : null,
  ].filter(Boolean);

  return {
    summary:
      goals[0]
        ? `${builder.name || "This builder"} is oriented around ${goals[0]} and shows public momentum through ${projects.length > 0 ? "active projects" : "profile signals"}${githubData?.repos?.length ? " plus recent GitHub work" : ""}.`
        : `${builder.name || "This builder"} shows a public builder profile shaped by ${skills.slice(0, 3).join(", ") || "current project work"}${projectTitles.length > 0 ? ` and projects like ${projectTitles.slice(0, 2).join(" and ")}` : ""}.`,
    career_positioning:
      builder.goal || activeProject?.title
        ? `${builder.name || "This builder"} reads as someone focused on ${builder.goal || activeProject?.title}, with visible signal across products, code, and community activity where available.`
        : `${builder.name || "This builder"} reads as a hands-on builder with emerging public proof of work.`,
    collaboration_pitch:
      supportOpportunities[0] ||
      (activeProject?.title
        ? `Strong fit for peers who can contribute to ${activeProject.title} or adjacent product execution.`
        : `Best matched with peers who value practical collaboration and visible building momentum.`),
    strengths,
    breadth_signals: breadthSignals,
    experience_signals: experienceSignals,
    support_opportunities: supportOpportunities,
    project_focus: projectTitles,
    optimization_recommendations: optimizationRecommendations,
    content_calendar: contentCalendar,
    profile_gaps: [
      !builder.linkedin_url ? "Add LinkedIn if you want stronger career context." : "",
      !builder.portfolio_url ? "Add a portfolio or case-study link to make outcomes and role clarity obvious." : "",
      !builder.github_url ? "Link GitHub so peers can inspect implementation depth." : "",
    ].filter(Boolean),
  };
}

function serializePublicSources(publicSources: PublicSource[]) {
  const successfulSources = publicSources.filter((source) => source.status === "ok");

  if (successfulSources.length === 0) {
    return "None";
  }

  return successfulSources
    .map((source) => {
      const headings = (source.headings || []).slice(0, 3).join(" | ") || "None";
      return `- ${source.source}: title=${source.title || "None"} | description=${source.description || "None"} | headings=${headings} | snippet=${truncateText(source.snippet, 320) || "None"}`;
    })
    .join("\n");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const builder = (await req.json()) as BuilderPayload;

    const username = parseGitHubUsername(builder.github_url);
    const githubData = username ? await fetchGitHubContext(username).catch(() => null) : null;
    const publicSources = await Promise.all([
      fetchPublicPageContext("Portfolio", builder.portfolio_url),
      fetchPublicPageContext("LinkedIn", builder.linkedin_url),
      fetchPublicPageContext("X", builder.x_url),
    ]);

    let analysis = buildFallbackAnalysis(builder, githubData, publicSources);
    const sources = buildSourceNotes(builder, githubData, publicSources);

    const shouldUseLlm =
      Boolean(builder.bio) ||
      asArray(builder.skills).length > 0 ||
      (builder.projects || []).length > 0 ||
      (builder.posts || []).length > 0 ||
      (builder.upcoming_events || []).length > 0 ||
      githubData !== null ||
      publicSources.some((source) => source.status === "ok");

    if (shouldUseLlm) {
      try {
        const llmResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are generating a public builder persona brief for a peer network.

Use only public, professional, build-related, and collaboration-related signals.
Do not infer or factor in age, race, ethnicity, nationality, religion, gender identity, sexuality, disability, health, family status, immigration status, socioeconomic status, attractiveness, or other protected or irrelevant personal attributes.
Do not do "culture fit" speculation or personality diagnosis.
Avoid vanity metrics unless they directly matter to collaboration, distribution, or partnerships.
If evidence is limited, stay conservative and say only what the public signals support.

Goals:
1. Help peers understand the breadth of this person's builds, skills, experience signals, and current momentum.
2. Help the builder understand how to improve their public profile and collaboration readiness.
3. Suggest a short content calendar tied to upcoming events, active builds, recent posts, and available public channels.

Builder profile:
Name: ${builder.name || "Unknown"}
Bio: ${builder.bio || "None"}
Current goal: ${builder.goal || "None"}
Skills: ${asArray(builder.skills).join(", ") || "None"}
Goals: ${asArray(builder.goals).join(", ") || "None"}
Interests: ${asArray(builder.interests).join(", ") || "None"}
Looking for: ${asArray(builder.looking_for).join(", ") || "None"}
Needs: ${asArray(builder.needs).join(", ") || "None"}
Work types: ${asArray(builder.work_types).join(", ") || "None"}

Velocity projects:
${(builder.projects || []).map((project) => `- ${project.title || "Untitled"}: ${project.description || "No description"} | skills needed: ${asArray(project.skills_needed).join(", ") || "none"} | status: ${project.status || "unknown"}`).join("\n") || "None"}

Velocity posts:
${(builder.posts || []).slice(0, 6).map((post) => `- ${post.post_type || "update"} (${post.created_date || "unknown date"}): ${truncateText(post.content, 220) || "No content"} | hashtags: ${asArray(post.hashtags).join(", ") || "none"}`).join("\n") || "None"}

Upcoming events:
${(builder.upcoming_events || []).slice(0, 6).map((event) => `- ${event.relationship || "attending"} ${event.title || "event"} on ${event.date || "unknown date"} | type: ${event.event_type || "unknown"} | location: ${event.location || "none"} | description: ${truncateText(event.description, 160) || "None"}`).join("\n") || "None"}

GitHub:
${githubData ? `Username: ${githubData.username}
Bio: ${githubData.profile.bio || "None"}
Public repos: ${githubData.profile.public_repos}
Followers: ${githubData.profile.followers}
Recent repos:
${githubData.repos.map((repo) => `- ${repo.name}: ${repo.description || "No description"} | primary language: ${repo.language || "unknown"} | languages: ${(repo.languages || []).join(", ") || "none"} | topics: ${repo.topics.join(", ") || "none"} | homepage: ${repo.homepage || "none"} | README signal: ${repo.readme_excerpt || "none"}`).join("\n")}` : "None"}

Other public links:
${serializePublicSources(publicSources)}

Return concise JSON for a public profile. Keep recommendations specific and actionable.`,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              career_positioning: { type: "string" },
              collaboration_pitch: { type: "string" },
              strengths: {
                type: "array",
                items: { type: "string" },
              },
              breadth_signals: {
                type: "array",
                items: { type: "string" },
              },
              experience_signals: {
                type: "array",
                items: { type: "string" },
              },
              support_opportunities: {
                type: "array",
                items: { type: "string" },
              },
              project_focus: {
                type: "array",
                items: { type: "string" },
              },
              optimization_recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    detail: { type: "string" },
                  },
                  required: ["title", "detail"],
                },
              },
              content_calendar: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    timing: { type: "string" },
                    channel: { type: "string" },
                    format: { type: "string" },
                    topic: { type: "string" },
                    rationale: { type: "string" },
                    call_to_action: { type: "string" },
                  },
                  required: ["timing", "channel", "format", "topic", "rationale", "call_to_action"],
                },
              },
              profile_gaps: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "summary",
              "career_positioning",
              "collaboration_pitch",
              "strengths",
              "breadth_signals",
              "experience_signals",
              "support_opportunities",
              "project_focus",
              "optimization_recommendations",
              "content_calendar",
              "profile_gaps",
            ],
          },
        });

        if (llmResult?.summary) {
          analysis = {
            ...analysis,
            ...llmResult,
          };
        }
      } catch {
        // Keep fallback analysis.
      }
    }

    return Response.json({
      github: githubData,
      public_sources: publicSources,
      sources,
      analysis,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze builder";
    return Response.json({ error: message }, { status: 500 });
  }
});
