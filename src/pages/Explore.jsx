import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PostCard from "../components/PostCard";
import HashtagBadge from "../components/HashtagBadge";
import EmptyState from "../components/EmptyState";
import { Search, Hash, Loader2 } from "lucide-react";
import useCurrentUser from "../hooks/useCurrentUser";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag") || "";
  const { user } = useCurrentUser();
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [saved, setSaved] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const postData = await base44.entities.Post.list("-created_date", 100);
      setAllPosts(postData);

      // Extract trending tags
      const tagCounts = {};
      postData.forEach((p) => {
        p.hashtags?.forEach((t) => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });
      const sorted = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);
      setTrendingTags(sorted);

      if (user?.email) {
        const [userLikes, userSaved] = await Promise.all([
          base44.entities.Like.filter({ user_email: user.email }),
          base44.entities.SavedPost.filter({ user_email: user.email }),
        ]);
        setLikes(userLikes);
        setSaved(userSaved);
      }
      setLoading(false);
    };
    load();
  }, [user?.email]);

  useEffect(() => {
    let filtered = allPosts;
    if (activeTag) {
      filtered = filtered.filter((p) =>
        p.hashtags?.some((t) => t.toLowerCase() === activeTag.toLowerCase())
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.content?.toLowerCase().includes(q) ||
          p.author_name?.toLowerCase().includes(q) ||
          p.hashtags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    setPosts(filtered);
  }, [allPosts, activeTag, searchQuery]);

  const handleTagClick = (tag) => {
    if (activeTag === tag) {
      setSearchParams({});
    } else {
      setSearchParams({ tag });
    }
  };

  const handleLikeToggle = async (postId) => {
    if (!user?.email) return;
    const existing = likes.find((l) => l.post_id === postId);
    if (existing) {
      await base44.entities.Like.delete(existing.id);
      setLikes((prev) => prev.filter((l) => l.id !== existing.id));
      setAllPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1) } : p)
      );
    } else {
      const newLike = await base44.entities.Like.create({ post_id: postId, user_email: user.email });
      setLikes((prev) => [...prev, newLike]);
      setAllPosts((prev) =>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts, people, hashtags..."
          className="w-full bg-muted rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Active Filter */}
      {activeTag && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Showing:</span>
          <button
            onClick={() => handleTagClick(activeTag)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium"
          >
            #{activeTag}
            <span className="ml-1">×</span>
          </button>
        </div>
      )}

      {/* Trending Tags */}
      {!activeTag && !searchQuery && trendingTags.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-space font-semibold text-sm flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-primary" />
            Trending
          </h2>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map(([tag, count]) => (
              <button key={tag} onClick={() => handleTagClick(tag)}>
                <HashtagBadge tag={tag} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {posts.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results"
          description={activeTag ? `No posts tagged #${activeTag}` : "Try a different search"}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
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