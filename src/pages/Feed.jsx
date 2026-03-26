import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import BuildUpdateCard from "../components/BuildUpdateCard";
import AIMatches from "../components/AIMatches";
import EmptyState from "../components/EmptyState";
import WelcomeTour from "../components/WelcomeTour";
import { Loader2, Plus, Zap, FolderOpen, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useCurrentUser from "../hooks/useCurrentUser";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [likes, setLikes] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.onboarded === false) navigate("/onboarding");
  }, [user, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [allPosts, allProjects] = await Promise.all([
      base44.entities.Post.list("-created_date", 20),
      user?.email
        ? base44.entities.Project.filter({ owner_email: user.email })
        : Promise.resolve([]),
    ]);
    setPosts(allPosts);
    setProjects(allProjects);
    if (user?.email) {
      const [userLikes, userSaved] = await Promise.all([
        base44.entities.Like.filter({ user_email: user.email }),
        base44.entities.SavedPost.filter({ user_email: user.email }),
      ]);
      setLikes(userLikes);
      setSaved(userSaved);
    }
    setLoading(false);
  }, [user?.email]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLikeToggle = async (postId) => {
    if (!user?.email) return;
    const existing = likes.find((l) => l.post_id === postId);
    if (existing) {
      await base44.entities.Like.delete(existing.id);
      setLikes((prev) => prev.filter((l) => l.id !== existing.id));
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1) } : p));
    } else {
      const newLike = await base44.entities.Like.create({ post_id: postId, user_email: user.email });
      setLikes((prev) => [...prev, newLike]);
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    }
  };

  const handleSaveToggle = async (postId) => {
    if (!user?.email) return;
    const existing = saved.find((s) => s.post_id === postId);
    if (existing) {
      await base44.entities.SavedPost.delete(existing.id);
      setSaved((prev) => prev.filter((s) => s.id !== existing.id));
    } else {
      const newSave = await base44.entities.SavedPost.create({ post_id: postId, user_email: user.email });
      setSaved((prev) => [...prev, newSave]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-8">

      {/* First-visit feature walkthrough */}
      <WelcomeTour />

      {/* Welcome */}
      {user && (
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Welcome back{user.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your builds.</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/create" className="flex items-center gap-3 p-4 bg-primary text-primary-foreground rounded-xl shadow-sm active:scale-[0.98] transition-transform">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Build Update</p>
            <p className="text-xs opacity-80">Share progress</p>
          </div>
        </Link>
        <Link to="/create-project" className="flex items-center gap-3 p-4 bg-card border border-border/60 rounded-xl shadow-xs active:scale-[0.98] transition-transform">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">New Project</p>
            <p className="text-xs text-muted-foreground">Start building</p>
          </div>
        </Link>
      </div>

      {/* Active Projects */}
      {projects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Active Builds</h2>
            <Link to="/co-build" className="text-xs text-primary font-medium flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {projects.slice(0, 3).map((project) => (
              <Link key={project.id} to={`/project/${project.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 bg-card border border-border/60 rounded-xl shadow-xs hover:shadow-sm transition-shadow"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                    project.status === "looking_for_team"
                      ? "bg-accent/10 text-primary"
                      : project.status === "in_progress"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {project.status === "looking_for_team" ? "Recruiting" : project.status === "in_progress" ? "Active" : "Done"}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Collaborator Matches */}
      {user && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Suggested Collaborators</h2>
            <Link to="/co-build" className="text-xs text-primary font-medium flex items-center gap-1">
              Browse <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <AIMatches currentUser={user} />
        </section>
      )}

      {/* Build Activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Build Activity</h2>
        </div>
        {posts.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No build updates yet"
            description="Share what you're working on to inspire others."
            action={
              <Link to="/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
                Post a build update
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <BuildUpdateCard
                key={post.id}
                post={post}
                currentUserEmail={user?.email}
                isLiked={likes.some((l) => l.post_id === post.id)}
                isSaved={saved.some((s) => s.post_id === post.id)}
                onLikeToggle={handleLikeToggle}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}