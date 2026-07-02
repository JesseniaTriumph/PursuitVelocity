import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Plus,
  Clock,
  ThumbsUp,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, timeAgo } from "@/lib/utils";
import UserAvatar from "../components/UserAvatar";
import useCurrentUser from "../hooks/useCurrentUser";
import {
  buildTutorialContent,
  buildTutorialHashtags,
  parseTutorialPost,
  TUTORIAL_CATEGORIES,
} from "@/lib/tutorial-posts";

export default function Resources() {
  const { user } = useCurrentUser();
  const [tutorials, setTutorials] = useState([]);
  const [likes, setLikes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState(null);

  useEffect(() => {
    loadResources();
  }, [user?.email]);

  async function loadResources() {
    setLoading(true);

    try {
      const requests = [base44.entities.Post.list("-created_date", 100)];

      if (user?.email) {
        requests.push(base44.entities.Like.filter({ user_email: user.email }));
      }

      const [posts, userLikes = []] = await Promise.all(requests);
      const tutorialPosts = posts
        .filter((post) => post.post_type === "tutorial")
        .map(parseTutorialPost);

      setTutorials(tutorialPosts);
      setLikes(userLikes);
    } catch {
      setTutorials([]);
      setLikes([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleLike(postId) {
    if (!user?.email || likingId === postId) return;

    const existing = likes.find((like) => like.post_id === postId);
    const currentTutorial = tutorials.find((tutorial) => tutorial.id === postId);
    const currentCount = currentTutorial?.likes_count || 0;

    // Optimistic update
    if (existing) {
      setLikes((prev) => prev.filter((like) => like.id !== existing.id));
      setTutorials((prev) =>
        prev.map((tutorial) =>
          tutorial.id === postId
            ? { ...tutorial, likes_count: Math.max(0, (tutorial.likes_count || 0) - 1) }
            : tutorial
        )
      );
    } else {
      const optimisticLike = { id: `optimistic-${postId}`, post_id: postId, user_email: user.email };
      setLikes((prev) => [...prev, optimisticLike]);
      setTutorials((prev) =>
        prev.map((tutorial) =>
          tutorial.id === postId
            ? { ...tutorial, likes_count: (tutorial.likes_count || 0) + 1 }
            : tutorial
        )
      );
    }

    setLikingId(postId);
    try {
      if (existing) {
        await base44.entities.Like.delete(existing.id);
        await base44.entities.Post.update(postId, { likes_count: Math.max(0, currentCount - 1) });
      } else {
        const newLike = await base44.entities.Like.create({ post_id: postId, user_email: user.email });
        await base44.entities.Post.update(postId, { likes_count: currentCount + 1 });
        setLikes((prev) =>
          prev.map((like) => (like.id === `optimistic-${postId}` ? newLike : like))
        );
      }
    } catch {
      // Rollback on failure
      if (existing) {
        setLikes((prev) => [...prev, existing]);
        setTutorials((prev) =>
          prev.map((tutorial) =>
            tutorial.id === postId ? { ...tutorial, likes_count: currentCount } : tutorial
          )
        );
      } else {
        setLikes((prev) => prev.filter((like) => like.id !== `optimistic-${postId}`));
        setTutorials((prev) =>
          prev.map((tutorial) =>
            tutorial.id === postId ? { ...tutorial, likes_count: currentCount } : tutorial
          )
        );
      }
    } finally {
      setLikingId(null);
    }
  }

  const filtered = tutorials.filter((tutorial) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      tutorial.title.toLowerCase().includes(query) ||
      tutorial.body.toLowerCase().includes(query) ||
      tutorial.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      tutorial.author_name?.toLowerCase().includes(query);
    const matchesCategory = category === "All" || tutorial.category === category;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-semibold">Resources</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Tutorials and guides shared directly from community posts.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Share Tutorial
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search tutorials..."
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {TUTORIAL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "shrink-0 px-3 py-2.5 min-h-[44px] flex items-center rounded-full text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">No resources match your search.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              isLiked={likes.some((like) => like.post_id === tutorial.id)}
              onLike={toggleLike}
              busy={likingId === tutorial.id}
            />
          ))}
        </div>
      )}

      <AddTutorialDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        user={user}
        onCreated={loadResources}
      />
    </div>
  );
}

function TutorialCard({ tutorial, isLiked, onLike, busy }) {
  return (
    <Card className="card-interactive flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {tutorial.category}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {tutorial.readTime}
          </span>
        </div>

        <h3 className="font-semibold text-sm leading-snug mb-2">{tutorial.title}</h3>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 flex-1 mb-3 whitespace-pre-wrap">
          {tutorial.body}
        </p>

        {tutorial.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tutorial.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <UserAvatar
              name={tutorial.author_name}
              src={tutorial.author_avatar}
              size={24}
              className="rounded-full"
            />
            <Link
              to={`/profile/${tutorial.author_email}`}
              className="text-xs font-medium hover:text-primary transition-colors"
            >
              {tutorial.author_name}
            </Link>
            <span className="text-xs text-muted-foreground">{timeAgo(tutorial.created_date)}</span>
          </div>

          <div className="flex items-center gap-1">
            {tutorial.externalLink && (
              <a
                href={tutorial.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open external link"
              >
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </a>
            )}
            <button
              onClick={() => onLike(tutorial.id)}
              aria-label={isLiked ? "Unlike" : "Like this tutorial"}
              aria-pressed={isLiked}
              disabled={busy}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50",
                isLiked
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
              {tutorial.likes_count || 0}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddTutorialDialog({ open, onOpenChange, user, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "React",
    tags: "",
    external_link: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user || saving) return;

    setSaving(true);

    await base44.entities.Post.create({
      content: buildTutorialContent({
        title: form.title,
        body: form.content,
        externalLink: form.external_link,
      }),
      image_url: null,
      hashtags: buildTutorialHashtags(form.category, form.tags.split(",")),
      author_name: user.full_name || "Anonymous",
      author_email: user.email,
      author_avatar: user.avatar || "",
      post_type: "tutorial",
      likes_count: 0,
      comments_count: 0,
    });

    setSaving(false);
    onOpenChange(false);
    setForm({
      title: "",
      content: "",
      category: "React",
      tags: "",
      external_link: "",
    });
    onCreated?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share a Tutorial</DialogTitle>
          <DialogDescription>
            Publish a tutorial as a community resource post.
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
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
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
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tut-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="tut-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TUTORIAL_CATEGORIES.filter((item) => item !== "All").map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
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
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tut-link">External Link (optional)</Label>
            <Input
              id="tut-link"
              placeholder="https://..."
              value={form.external_link}
              onChange={(event) => setForm((prev) => ({ ...prev, external_link: event.target.value }))}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!user || saving || !form.title.trim() || !form.content.trim()}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Tutorial"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
