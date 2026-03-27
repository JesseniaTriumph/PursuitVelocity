import { createClientFromRequest } from "npm:@base44/sdk";

type RawRecord = Record<string, any>;

const DEFAULT_AVAILABILITY = "selective";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapProject(project: RawRecord) {
  return {
    id: project.id,
    title: project.title || "Untitled project",
    description: project.description || "",
    status: project.status || "in_progress",
    skills_needed: asStringArray(project.skills_needed),
    owner_email: project.owner_email || "",
    owner_name: project.owner_name || "",
    team_size: project.team_size || 1,
    max_team_size: project.max_team_size || 1,
    image_url: project.image_url || null,
    created_date: project.created_date || null,
  };
}

function deriveAvailability(user: RawRecord, projects: ReturnType<typeof mapProject>[]) {
  if (user.disabled) {
    return "closed";
  }

  if (typeof user.availability === "string") {
    return user.availability;
  }

  const lookingFor = new Set(asStringArray(user.looking_for));
  if (lookingFor.has("join_project") || lookingFor.has("collaborate")) {
    return "open";
  }

  if (projects.some((project) => project.status === "looking_for_team")) {
    return "open";
  }

  if (user.calendly_url) {
    return "open";
  }

  return DEFAULT_AVAILABILITY;
}

function deriveGoal(user: RawRecord, projects: ReturnType<typeof mapProject>[]) {
  const [firstGoal] = asStringArray(user.goals);
  if (firstGoal) {
    return firstGoal;
  }

  if (projects[0]?.title) {
    return `Building ${projects[0].title}`;
  }

  const [firstInterest] = asStringArray(user.interests);
  if (firstInterest) {
    return `Interested in ${firstInterest}`;
  }

  return "Open to connect";
}

function deriveWorkTypes(skills: string[]) {
  const workTypes = new Set<string>();

  for (const skill of skills) {
    const normalized = skill.toLowerCase();

    if (
      normalized.includes("react") ||
      normalized.includes("frontend") ||
      normalized.includes("css") ||
      normalized.includes("figma")
    ) {
      workTypes.add("Frontend");
    }

    if (
      normalized.includes("node") ||
      normalized.includes("python") ||
      normalized.includes("backend") ||
      normalized.includes("api") ||
      normalized.includes("database") ||
      normalized.includes("postgres")
    ) {
      workTypes.add("Backend");
    }

    if (
      normalized.includes("ai") ||
      normalized.includes("ml") ||
      normalized.includes("machine") ||
      normalized.includes("data")
    ) {
      workTypes.add("AI/ML");
    }

    if (
      normalized.includes("design") ||
      normalized.includes("ux") ||
      normalized.includes("ui")
    ) {
      workTypes.add("UI/UX Design");
    }

    if (normalized.includes("mobile")) {
      workTypes.add("Mobile");
    }

    if (normalized.includes("product")) {
      workTypes.add("Product");
    }
  }

  if (workTypes.size === 0) {
    workTypes.add("Builder");
  }

  return Array.from(workTypes).slice(0, 4);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let currentUserEmail: string | null = null;
    try {
      const currentUser = await base44.auth.me();
      currentUserEmail = currentUser?.email || null;
    } catch {
      currentUserEmail = null;
    }

    const [users, projects] = await Promise.all([
      base44.asServiceRole.entities.User.list("-created_date", 200),
      base44.asServiceRole.entities.Project.list("-created_date", 200).catch(() => []),
    ]);

    const projectsByOwner = new Map<string, ReturnType<typeof mapProject>[]>();
    for (const rawProject of projects as RawRecord[]) {
      const project = mapProject(rawProject);
      if (!project.owner_email) {
        continue;
      }

      const ownerProjects = projectsByOwner.get(project.owner_email) || [];
      ownerProjects.push(project);
      projectsByOwner.set(project.owner_email, ownerProjects);
    }

    const builders = (users as RawRecord[])
      .filter((user) => Boolean(user?.email) && !user?.is_service)
      .map((user) => {
        const ownedProjects = (projectsByOwner.get(user.email) || []).sort((a, b) => {
          const aDate = a.created_date ? Date.parse(a.created_date) : 0;
          const bDate = b.created_date ? Date.parse(b.created_date) : 0;
          return bDate - aDate;
        });

        const hasPublicProfileData =
          Boolean(user.bio) ||
          asStringArray(user.skills).length > 0 ||
          Boolean(user.instagram_url) ||
          Boolean(user.tiktok_url) ||
          Boolean(user.calendly_url) ||
          ownedProjects.length > 0;

        if (user.onboarded === false && !hasPublicProfileData) {
          return null;
        }

        const skills = asStringArray(user.skills);
        const activeProject =
          ownedProjects.find((project) =>
            project.status === "in_progress" || project.status === "looking_for_team"
          ) || ownedProjects[0] || null;

        return {
          id: user.id,
          email: user.email,
          name: user.full_name || user.email.split("@")[0],
          full_name: user.full_name || user.email.split("@")[0],
          avatar: user.avatar || null,
          bio: user.bio || "",
          skills,
          interests: asStringArray(user.interests),
          goals: asStringArray(user.goals),
          looking_for: asStringArray(user.looking_for),
          needs: asStringArray(user.needs),
          cohort: user.cohort || null,
          github_url: user.github_url || null,
          linkedin_url: user.linkedin_url || null,
          instagram_url: user.instagram_url || null,
          tiktok_url: user.tiktok_url || null,
          calendly_url: user.calendly_url || null,
          portfolio_url: user.portfolio_url || null,
          x_url: user.x_url || null,
          resume_url: user.resume_url || null,
          availability: deriveAvailability(user, ownedProjects),
          goal: deriveGoal(user, ownedProjects),
          workTypes: deriveWorkTypes(skills),
          projects: ownedProjects,
          projectTitles: ownedProjects.map((project) => project.title),
          activeProject,
          onboarded: user.onboarded !== false,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a?.email === currentUserEmail) {
          return -1;
        }
        if (b?.email === currentUserEmail) {
          return 1;
        }
        return (a?.name || "").localeCompare(b?.name || "");
      });

    return Response.json({ currentUserEmail, builders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load builder directory";
    return Response.json({ error: message }, { status: 500 });
  }
});
