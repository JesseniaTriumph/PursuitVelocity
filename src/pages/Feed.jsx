import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import PostCard from "../components/PostCard";
import QuickPost from "../components/QuickPost";
import AIMatches from "../components/AIMatches";
import EmptyState from "../components/EmptyState";
import { Newspaper, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useCurrentUser from "../hooks/useCurrentUser";

export default function Feed() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("latest");

  useEffect(() => {
    if (user && user.onboarded === false) {
      navigate("/onboarding");
    }
  }, [user, navigate]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const allPosts = await base44.entities.Post.list("-created_date", 50);
    setPosts(allPosts);
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

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLikeToggle = async (postId) => {
    if (!user?.email) return;
    const existing = likes.find((l) => l.post_id === postId);
    if (existing) {
      await base44.entities.Like.delete(existing.id);
      setLikes((prev) => prev.filter((l) => l.id !== existing.id));
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1) } : p)
      );
    } else {
      const newLike = await base44.entities.Like.create({ post_id: postId, user_email: user.email });
      setLikes((prev) => [...prev, newLike]);
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p)
      );
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

  const displayPosts = activeTab === "trending"
    ? [...posts].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    : posts;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Quick Post */}
      {user && <QuickPost user={user} onPostCreated={loadPosts} />}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {["latest", "trending"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-sm font-medium py-2 rounded-lg capitalize transition-all ${
              activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* AI Matches Widget */}
      {user && <AIMatches currentUser={user} />}

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : displayPosts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No posts yet"
          description="Be the first to share what you're building!"
          action={
            <button
              onClick={() => document.querySelector("textarea")?.focus()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
            >
              Write your first post
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {displayPosts.map((post) => (
            <PostCard
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
    </div>
  );
}