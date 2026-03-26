import { createClientFromRequest } from "npm:@base44/sdk";

type BuilderPayload = {
  name?: string;
  bio?: string;
  skills?: string[];
  goals?: string[];
  interests?: string[];
  github_url?: string | null;
  projects?: Array<{
    title?: string;
    description?: string;
    skills_needed?: string[];
    status?: string;
  }>;
};

function parseGitHubUsername(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const [username] = parsed.pathname.split("/").filter(Boolean);
    return username || null;
  } catch {
    return null;
  }
}

async function fetchGitHubContext(username: string) {
  const headers = {
    "User-Agent": "velocity-lookbook",
    Accept: "application/vnd.github+json",
  };

  const [profileResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, { headers }),
  ]);

  if (!profileResponse.ok || !reposResponse.ok) {
    throw new Error("GitHub profile fetch failed");
  }

  const profile = await profileResponse.json();
  const repos = await reposResponse.json();

  return {
    username,
    profile: {
      bio: profile.bio || null,
      public_repos: profile.public_repos || 0,
      followers: profile.followers || 0,
      following: profile.following || 0,
    },
    repos: Array.isArray(repos)
      ? repos
          .filter((repo) => !repo.fork)
          .map((repo) => ({
            name: repo.name,
            description: repo.description || "",
            language: repo.language || null,
            stars: repo.stargazers_count || 0,
            url: repo.html_url,
            topics: Array.isArray(repo.topics) ? repo.topics : [],
            updated_at: repo.updated_at,
          }))
      : [],
  };
}

function buildFallbackAnalysis(builder: BuilderPayload, githubData: Awaited<ReturnType<typeof fetchGitHubContext>> | null) {
  const skills = Array.isArray(builder.skills) ? builder.skills : [];
  const projects = Array.isArray(builder.projects) ? builder.projects : [];
  const languages = [...new Set((githubData?.repos || []).map((repo) => repo.language).filter(Boolean))];

  return {
    summary:
      githubData?.repos?.length
        ? `${builder.name || "This builder"} is actively shipping code with ${languages.slice(0, 3).join(", ") || "multiple tools"} and has ${githubData.repos.length} recent public repositories.`
        : `${builder.name || "This builder"} is focused on ${skills.slice(0, 3).join(", ") || "building projects"} and has ${projects.length} listed project${projects.length === 1 ? "" : "s"}.`,
    strengths: [
      ...(skills.slice(0, 2)),
      ...(languages.slice(0, 2)),
    ].filter(Boolean).slice(0, 4),
    collaboration_pitch:
      projects[0]?.title
        ? `Strong fit for collaborators interested in ${projects[0].title} or adjacent product work.`
        : `Best for collaborators with complementary product and implementation skills.`,
    project_focus:
      githubData?.repos?.slice(0, 3).map((repo) => repo.name) ||
      projects.slice(0, 3).map((project) => project.title).filter(Boolean),
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const builder = (await req.json()) as BuilderPayload;

    const username = parseGitHubUsername(builder.github_url);
    const githubData = username ? await fetchGitHubContext(username).catch(() => null) : null;
    let analysis = buildFallbackAnalysis(builder, githubData);

    if (githubData) {
      try {
        const llmResult = await base44.integrations.Core.InvokeLLM({
          prompt: `You are analyzing a builder profile for a public lookbook.

Builder:
Name: ${builder.name || "Unknown"}
Bio: ${builder.bio || "None"}
Skills: ${(builder.skills || []).join(", ") || "None"}
Goals: ${(builder.goals || []).join(", ") || "None"}
Interests: ${(builder.interests || []).join(", ") || "None"}

Projects:
${(builder.projects || []).map((project) => `- ${project.title || "Untitled"}: ${project.description || "No description"} | skills needed: ${(project.skills_needed || []).join(", ") || "none"} | status: ${project.status || "unknown"}`).join("\n") || "None"}

GitHub profile:
Username: ${githubData.username}
Bio: ${githubData.profile.bio || "None"}
Public repos: ${githubData.profile.public_repos}
Followers: ${githubData.profile.followers}

Recent repos:
${githubData.repos.map((repo) => `- ${repo.name}: ${repo.description || "No description"} | language: ${repo.language || "unknown"} | topics: ${repo.topics.join(", ") || "none"} | stars: ${repo.stars}`).join("\n")}

Return concise JSON for a public profile.`,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              strengths: {
                type: "array",
                items: { type: "string" },
              },
              collaboration_pitch: { type: "string" },
              project_focus: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["summary", "strengths", "collaboration_pitch", "project_focus"],
          },
        });

        if (llmResult?.summary) {
          analysis = llmResult;
        }
      } catch {
        // Keep fallback analysis.
      }
    }

    return Response.json({
      github: githubData,
      analysis,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze builder";
    return Response.json({ error: message }, { status: 500 });
  }
});
