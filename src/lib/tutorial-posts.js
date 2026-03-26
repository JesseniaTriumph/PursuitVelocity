const CATEGORY_SLUGS = {
  React: "react",
  Python: "python",
  "AI/ML": "ai-ml",
  Backend: "backend",
  DevOps: "devops",
  Product: "product",
  Career: "career",
  Design: "design",
  Database: "database",
};

const CATEGORY_LABELS = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([label, slug]) => [slug, label])
);

const EXCLUDED_TAGS = new Set(["tutorial", ...Object.values(CATEGORY_SLUGS)]);

export const TUTORIAL_CATEGORIES = [
  "All",
  ...Object.keys(CATEGORY_SLUGS),
];

export function getTutorialCategorySlug(category) {
  return CATEGORY_SLUGS[category] || "react";
}

export function getTutorialCategoryLabel(slug) {
  return CATEGORY_LABELS[slug] || "React";
}

export function buildTutorialContent({ title, body, externalLink }) {
  const sections = [title.trim(), body.trim()];

  if (externalLink?.trim()) {
    sections.push(`External link: ${externalLink.trim()}`);
  }

  return sections.filter(Boolean).join("\n\n");
}

export function parseTutorialPost(post) {
  const lines = String(post?.content || "")
    .split("\n")
    .map((line) => line.trimEnd());

  const title = lines[0]?.trim() || "Untitled tutorial";
  const nonTitleLines = lines.slice(1);
  const linkLineIndex = nonTitleLines.findIndex((line) =>
    /^External link:\s+/i.test(line.trim())
  );

  const externalLink =
    linkLineIndex >= 0
      ? nonTitleLines[linkLineIndex].replace(/^External link:\s+/i, "").trim()
      : null;

  const bodyLines =
    linkLineIndex >= 0
      ? nonTitleLines.filter((_, index) => index !== linkLineIndex)
      : nonTitleLines;

  const body = bodyLines.join("\n").trim();
  const categorySlug =
    (post?.hashtags || []).find((tag) => Object.values(CATEGORY_SLUGS).includes(tag)) ||
    "react";

  return {
    ...post,
    title,
    body,
    category: getTutorialCategoryLabel(categorySlug),
    categorySlug,
    externalLink,
    tags: (post?.hashtags || []).filter((tag) => !EXCLUDED_TAGS.has(tag)),
    readTime: getTutorialReadTime(body),
  };
}

export function buildTutorialHashtags(category, tags) {
  const normalizedTags = Array.isArray(tags)
    ? tags
        .map((tag) => tag.replace(/^#/, "").trim().toLowerCase())
        .filter(Boolean)
    : [];

  return [...new Set([getTutorialCategorySlug(category), "tutorial", ...normalizedTags])];
}

export function getTutorialReadTime(content) {
  const words = String(content || "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} min read`;
}
