import { base44 } from "@/api/base44Client";

const LOOKING_FOR_LABELS = {
  build_own_project: "Build my own project",
  join_project: "Join projects",
  collaborate: "Collaborate",
  learn: "Learn and grow",
};

let directoryPromise = null;

function asArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatList(items) {
  if (items.length <= 1) {
    return items[0] || "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function deriveWorkTypes(skills) {
  const labels = new Set();

  skills.forEach((skill) => {
    const normalized = skill.toLowerCase();

    if (
      normalized.includes("react") ||
      normalized.includes("frontend") ||
      normalized.includes("css") ||
      normalized.includes("figma")
    ) {
      labels.add("Frontend");
    }

    if (
      normalized.includes("node") ||
      normalized.includes("python") ||
      normalized.includes("backend") ||
      normalized.includes("api") ||
      normalized.includes("database") ||
      normalized.includes("postgres")
    ) {
      labels.add("Backend");
    }

    if (
      normalized.includes("ai") ||
      normalized.includes("ml") ||
      normalized.includes("machine") ||
      normalized.includes("data")
    ) {
      labels.add("AI/ML");
    }

    if (
      normalized.includes("design") ||
      normalized.includes("ux") ||
      normalized.includes("ui")
    ) {
      labels.add("UI/UX Design");
    }

    if (normalized.includes("mobile")) {
      labels.add("Mobile");
    }

    if (normalized.includes("product")) {
      labels.add("Product");
    }
  });

  if (labels.size === 0) {
    labels.add("Builder");
  }

  return Array.from(labels).slice(0, 4);
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
    team_size: project?.team_size || 1,
    max_team_size: project?.max_team_size || 1,
    image_url: project?.image_url || null,
    created_date: project?.created_date || null,
  };
}

function normalizeBuilder(builder) {
  const skills = asArray(builder?.skills);
  const projects = Array.isArray(builder?.projects) ? builder.projects.map(normalizeProject) : [];
  const activeProject =
    builder?.activeProject
      ? normalizeProject(builder.activeProject)
      : projects.find((project) =>
          project.status === "in_progress" || project.status === "looking_for_team"
        ) || projects[0] || null;

  const goals = asArray(builder?.goals);
  const interests = asArray(builder?.interests);
  const lookingFor = asArray(builder?.looking_for);

  return {
    id: builder?.id || builder?.email || "",
    email: builder?.email || "",
    name: builder?.name || builder?.full_name || builder?.email || "Builder",
    full_name: builder?.full_name || builder?.name || builder?.email || "Builder",
    avatar: builder?.avatar || null,
    bio: builder?.bio || "",
    skills,
    interests,
    goals,
    looking_for: lookingFor,
    needs: asArray(builder?.needs),
    cohort: builder?.cohort || null,
    github_url: builder?.github_url || null,
    linkedin_url: builder?.linkedin_url || null,
    calendly_url: builder?.calendly_url || null,
    portfolio_url: builder?.portfolio_url || null,
    x_url: builder?.x_url || null,
    resume_url: builder?.resume_url || null,
    availability: builder?.availability || "selective",
    goal:
      builder?.goal ||
      goals[0] ||
      activeProject?.title ||
      (lookingFor[0] ? LOOKING_FOR_LABELS[lookingFor[0]] || lookingFor[0] : "Open to connect"),
    workTypes:
      Array.isArray(builder?.workTypes) && builder.workTypes.length > 0
        ? builder.workTypes
        : deriveWorkTypes(skills),
    projects,
    projectTitles:
      Array.isArray(builder?.projectTitles) && builder.projectTitles.length > 0
        ? builder.projectTitles
        : projects.map((project) => project.title),
    activeProject,
    onboarded: builder?.onboarded !== false,
  };
}

function normalizeDirectory(payload) {
  return {
    currentUserEmail: payload?.currentUserEmail || null,
    builders: Array.isArray(payload?.builders)
      ? payload.builders.map(normalizeBuilder)
      : [],
  };
}

function createSet(items) {
  return new Set(asArray(items).map((item) => item.toLowerCase()));
}

function intersect(lowercaseSet, items) {
  return asArray(items).filter((item) => lowercaseSet.has(item.toLowerCase()));
}

export function clearBuilderDirectoryCache() {
  directoryPromise = null;
}

export async function fetchBuilderDirectory({ force = false } = {}) {
  if (!force && directoryPromise) {
    return directoryPromise;
  }

  directoryPromise = base44.functions
    .invoke("builderDirectory")
    .then((response) => normalizeDirectory(response?.data ?? response))
    .catch((error) => {
      directoryPromise = null;
      throw error;
    });

  return directoryPromise;
}

export function findBuilderByIdentifier(builders, identifier) {
  if (!identifier) {
    return null;
  }

  const normalizedIdentifier = String(identifier).toLowerCase();

  return (
    builders.find((builder) => builder.email.toLowerCase() === normalizedIdentifier) ||
    builders.find((builder) => String(builder.id) === String(identifier)) ||
    null
  );
}

export function getBuilderProfilePath(builder) {
  return `/profile/${builder.email || builder.id}`;
}

export function buildBuilderRole(builder) {
  const labels = Array.isArray(builder?.workTypes) && builder.workTypes.length > 0
    ? builder.workTypes
    : deriveWorkTypes(asArray(builder?.skills));

  return labels.slice(0, 2).join(" · ");
}

export function getAvailableBuilders(builders, { limit = 4, excludeEmail } = {}) {
  return builders
    .filter((builder) => builder.email && builder.email !== excludeEmail)
    .filter((builder) => builder.calendly_url || builder.availability === "open")
    .sort((a, b) => {
      if (a.calendly_url && !b.calendly_url) {
        return -1;
      }
      if (!a.calendly_url && b.calendly_url) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function rankBuilderMatches(currentBuilder, builders, { limit = 3 } = {}) {
  if (!currentBuilder?.email) {
    return [];
  }

  const currentSkills = createSet(currentBuilder.skills);
  const currentInterests = createSet(currentBuilder.interests);
  const currentGoals = createSet(currentBuilder.goals);
  const projectNeeds = createSet(currentBuilder.activeProject?.skills_needed);

  return builders
    .filter((builder) => builder.email && builder.email !== currentBuilder.email)
    .map((builder) => {
      const sharedSkills = intersect(currentSkills, builder.skills);
      const sharedInterests = intersect(currentInterests, builder.interests);
      const sharedGoals = intersect(currentGoals, builder.goals);
      const complementarySkills = asArray(builder.skills).filter(
        (skill) =>
          projectNeeds.has(skill.toLowerCase()) && !currentSkills.has(skill.toLowerCase())
      );
      const uniqueSkills = asArray(builder.skills).filter(
        (skill) => !currentSkills.has(skill.toLowerCase())
      );

      let score = 42;
      score += sharedSkills.length * 12;
      score += sharedInterests.length * 8;
      score += sharedGoals.length * 7;
      score += complementarySkills.length * 15;

      if (builder.activeProject?.status === "looking_for_team") {
        score += 6;
      }

      if (builder.calendly_url) {
        score += 4;
      }

      if (builder.looking_for.includes("join_project") || builder.looking_for.includes("collaborate")) {
        score += 5;
      }

      const reasons = [];

      if (complementarySkills.length > 0) {
        reasons.push({
          icon: "🤝",
          text: `Brings ${formatList(complementarySkills.slice(0, 2))} that your current build needs.`,
        });
      }

      if (sharedSkills.length > 0) {
        reasons.push({
          icon: "🔥",
          text: `You both work with ${formatList(sharedSkills.slice(0, 2))}.`,
        });
      }

      if (sharedInterests.length > 0) {
        reasons.push({
          icon: "💡",
          text: `Shared interest in ${formatList(sharedInterests.slice(0, 2))}.`,
        });
      }

      if (sharedGoals.length > 0) {
        reasons.push({
          icon: "🎯",
          text: `Aligned around ${formatList(sharedGoals.slice(0, 2))}.`,
        });
      }

      if (builder.activeProject?.status === "looking_for_team") {
        reasons.push({
          icon: "🚀",
          text: `${builder.name} is actively recruiting on ${builder.activeProject.title}.`,
        });
      }

      if (builder.calendly_url) {
        reasons.push({
          icon: "📅",
          text: "Has public meeting availability, so connecting is low-friction.",
        });
      }

      if (reasons.length === 0) {
        reasons.push({
          icon: "🧩",
          text: `${builder.name} brings adjacent skills that could expand your project.`,
        });
      }

      return {
        person: builder,
        matchReasons: reasons.slice(0, 3),
        sharedSkills,
        uniqueSkills: [...new Set([...complementarySkills, ...uniqueSkills])].slice(0, 4),
        matchScore: clamp(score, 58, 98),
        project: builder.activeProject?.title || builder.projectTitles[0] || null,
        calendly_url: builder.calendly_url || null,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore || a.person.name.localeCompare(b.person.name))
    .slice(0, limit);
}
