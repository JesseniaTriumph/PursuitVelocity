import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Search, Plus, Clock, ThumbsUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, timeAgo } from "@/lib/utils";

const TUTORIAL_CATEGORIES = [
  "All", "React", "Python", "AI/ML", "Backend", "DevOps",
  "Product", "Career", "Design", "Database",
];

const MOCK_TUTORIALS = [
  {
    id: "1",
    title: "Setting up Supabase Auth in under 15 minutes",
    content: "Walk through email/password + magic link auth, plus how to set up Row Level Security policies so your data is safe from the start.",
    category: "Backend",
    tags: ["Supabase", "Auth", "PostgreSQL"],
    author: { id: "4", name: "Priya Nair", initials: "PN" },
    likes: 18,
    liked: false,
    time: new Date(Date.now() - 5 * 60 * 60 * 1000),
    readTime: "8 min read",
    external_link: null,
  },
  {
    id: "2",
    title: "Building a RAG pipeline with LangChain + Supabase pgvector",
    content: "Step-by-step: embed documents, store vectors in Supabase, and query them with LangChain. Includes a working Python example you can copy.",
    category: "AI/ML",
    tags: ["Python", "LangChain", "Supabase", "Vector DB"],
    author: { id: "2", name: "Sofia Rivera", initials: "SR" },
    likes: 31,
    liked: false,
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    readTime: "12 min read",
    external_link: null,
  },
  {
    id: "3",
    title: "React Query patterns I use in every project",
    content: "The 5 patterns that make React Query really click: optimistic updates, dependent queries, infinite scroll, background refetching, and error boundaries.",
    category: "React",
    tags: ["React", "TypeScript", "React Query"],
    author: { id: "3", name: "Kai Thompson", initials: "KT" },
    likes: 24,
    liked: true,
    time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    readTime: "10 min read",
    external_link: null,
  },
  {
    id: "4",
    title: "How to scope your MVP in 60 minutes (the 3-question framework)",
    content: "Most side projects die in scope creep. Here's the exact 3-question framework I use to lock in an MVP that can ship in a weekend.",
    category: "Product",
    tags: ["Product Management", "MVP", "Planning"],
    author: { id: "1", name: "Marcus Johnson", initials: "MJ" },
    likes: 42,
    liked: false,
    time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    readTime: "5 min read",
    external_link: null,
  },
  {
    id: "5",
    title: "Figma → React: my component handoff workflow",
    content: "How I design in Figma with engineers in mind, structure component props to match design variants, and use Storybook to close the gap.",
    category: "Design",
    tags: ["Figma", "React", "Design Systems", "Accessibility"],
    author: { id: "6", name: "Amara Osei", initials: "AO" },
    likes: 29,
    liked: false,
    time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    readTime: "9 min read",
    external_link: null,
  },
  {
    id: "6",
    title: "Deploying a Node + Postgres app on Render for free",
    content: "Full walkthrough: Dockerizing a Node.js app, connecting to a Render Postgres instance, setting env vars, and setting up auto-deploy from GitHub.",
    category: "DevOps",
    tags: ["Node.js", "Docker", "Render", "PostgreSQL"],
    author: { id: "5", name: "Devon Clarke", initials: "DC" },
    likes: 15,
    liked: false,
    time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    readTime: "7 min read",
    external_link: null,
  },
];

export default function Resources() {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState(MOCK_TUTORIALS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = tutorials.filter((t) => {
    const matchesSearch =
      search === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === "All" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  function toggleLike(id) {
    setTutorials((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, liked: !t.liked, likes: t.liked ? t.likes - 1 : t.likes + 1 } : t
      )
    );
    // Replace with: await TutorialLike.create / delete
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-semibold">Resources</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Tutorials, guides, and tips shared by the fellowship community.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Share Tutorial
        </Button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search tutorials..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {TUTORIAL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} resource{filtered.length !== 1 ? "s" : ""}</p>

      {/* Tutorial grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">No resources match your search.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setCategory("All"); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((tutorial) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} onLike={toggleLike} />
          ))}
        </div>
      )}

      {/* Add Tutorial Dialog */}
      <AddTutorialDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function TutorialCard({ tutorial, onLike }) {
  return (
    <Card className="card-interactive flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        {/* Category + read time */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">{tutorial.category}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {tutorial.readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug mb-2">{tutorial.title}</h3>

        {/* Content preview */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-3">
          {tutorial.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {tutorial.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">{tag}</Badge>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">{tutorial.author.initials}</AvatarFallback>
            </Avatar>
            <Link
              to={`/profile/${tutorial.author.id}`}
              className="text-xs font-medium hover:text-primary transition-colors"
            >
              {tutorial.author.name}
            </Link>
            <span className="text-xs text-muted-foreground">{timeAgo(tutorial.time)}</span>
          </div>

          <div className="flex items-center gap-1">
            {tutorial.external_link && (
              <a href={tutorial.external_link} target="_blank" rel="noopener noreferrer" aria-label="Open external link">
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </a>
            )}
            <button
              onClick={() => onLike(tutorial.id)}
              aria-label={tutorial.liked ? "Unlike" : "Like this tutorial"}
              aria-pressed={tutorial.liked}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
                tutorial.liked
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
              {tutorial.likes}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddTutorialDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({ title: "", content: "", category: "React", tags: "", external_link: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    // Replace with: await Update.create({ ...form, type: "tutorial" })
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    onOpenChange(false);
    setForm({ title: "", content: "", category: "React", tags: "", external_link: "" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share a Tutorial</DialogTitle>
          <DialogDescription>
            Teach something you've learned. This will be posted to the community feed and Resources page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tut-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tut-title"
              placeholder="e.g. How I set up Supabase auth in 15 minutes"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tut-content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="tut-content"
              placeholder="Walk through the concept, steps, or insight you want to share..."
              className="min-h-[120px]"
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tut-category">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger id="tut-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TUTORIAL_CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tut-tags">Tags (comma-separated)</Label>
              <Input
                id="tut-tags"
                placeholder="React, TypeScript..."
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tut-link">External Link (optional)</Label>
            <Input
              id="tut-link"
              placeholder="https://..."
              value={form.external_link}
              onChange={(e) => setForm((p) => ({ ...p, external_link: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Link to a blog post, GitHub gist, video, etc.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!form.title.trim() || !form.content.trim() || saving}>
              {saving ? "Posting..." : "Share Tutorial"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
