import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PostCard from "../components/PostCard";
import EmptyState from "../components/EmptyState";
import { Settings, Newspaper, Users, Loader2, LogOut, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "../hooks/useCurrentUser";
import { motion } from "framer-motion";

export default function Profile() {
  const { email } = useParams();
  const { user: currentUser } = useCurrentUser();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [saved, setSaved] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  const isOwnProfile = !email || email === currentUser?.email;
  const targetEmail = isOwnProfile ? currentUser?.email : email;

  useEffect(() => {
    if (!targetEmail) return;
    const load = async () => {
      setLoading(true);
      const [userPosts, followersData, followingData] = await Promise.all([
        base44.entities.Post.filter({ author_email: targetEmail }, "-created_date"),
        base44.entities.Follow.filter({ following_email: targetEmail }),
        base44.entities.Follow.filter({ follower_email: targetEmail }),
      ]);

      setPosts(userPosts);
      setFollowers(followersData);
      setFollowing(followingData);

      if (!isOwnProfile) {
        const users = await base44.entities.User.filter({ email: targetEmail });
        setProfileUser(users[0] || { email: targetEmail, full_name: targetEmail });
        if (currentUser?.email) {
          setIsFollowing(followersData.some((f) => f.follower_email === currentUser.email));
        }
      } else {
        setProfileUser(currentUser);
      }

      if (currentUser?.email) {
        const [userLikes, userSaved] = await Promise.all([
          base44.entities.Like.filter({ user_email: currentUser.email }),
          base44.entities.SavedPost.filter({ user_email: currentUser.email }),
        ]);
        setLikes(userLikes);
        setSaved(userSaved);
      }

      setLoading(false);
    };
    load();
  }, [targetEmail, currentUser?.email, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser?.email) return;
    if (isFollowing) {
      const existing = followers.find((f) => f.follower_email === currentUser.email);
      if (existing) {
        await base44.entities.Follow.delete(existing.id);
        setFollowers((prev) => prev.filter((f) => f.id !== existing.id));
        setIsFollowing(false);
      }
    } else {
      const newFollow = await base44.entities.Follow.create({
        follower_email: currentUser.email,
        following_email: targetEmail,
      });
      setFollowers((prev) => [...prev, newFollow]);
      setIsFollowing(true);
    }
  };

  const handleLikeToggle = async (postId) => {
    if (!currentUser?.email) return;
    const existing = likes.find((l) => l.post_id === postId);
    if (existing) {
      await base44.entities.Like.delete(existing.id);
      setLikes((prev) => prev.filter((l) => l.id !== existing.id));
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1) } : p));
    } else {
      const newLike = await base44.entities.Like.create({ post_id: postId, user_email: currentUser.email });
      setLikes((prev) => [...prev, newLike]);
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    }
  };

  const handleSaveToggle = async (postId) => {
    if (!currentUser?.email) return;
    const existing = saved.find((s) => s.post_id === postId);
    if (existing) {
      await base44.entities.SavedPost.delete(existing.id);
      setSaved((prev) => prev.filter((s) => s.id !== existing.id));
    } else {
      const newSave = await base44.entities.SavedPost.create({ post_id: postId, user_email: currentUser.email });
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
    <div className="pb-4">
      {/* Profile Header */}
      <div className="px-4 py-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
            {profileUser?.avatar ? (
              <img src={profileUser.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-2xl font-space">
                {profileUser?.full_name?.[0] || "?"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-space font-bold text-lg">{profileUser?.full_name || "User"}</h1>
            <p className="text-xs text-muted-foreground">{profileUser?.email}</p>
            {profileUser?.bio && (
              <p className="text-sm mt-1 text-muted-foreground">{profileUser.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="font-bold text-sm">{posts.length}</span>
            <span className="text-xs text-muted-foreground ml-1">posts</span>
          </div>
          <div className="text-center">
            <span className="font-bold text-sm">{followers.length}</span>
            <span className="text-xs text-muted-foreground ml-1">followers</span>
          </div>
          <div className="text-center">
            <span className="font-bold text-sm">{following.length}</span>
            <span className="text-xs text-muted-foreground ml-1">following</span>
          </div>
        </div>

        {/* Actions */}
        {isOwnProfile ? (
          <div className="flex gap-2">
            <Link to="/edit-profile" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl gap-1.5" size="sm">
                <Settings className="w-4 h-4" /> Edit Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => base44.auth.logout()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleFollow}
            variant={isFollowing ? "outline" : "default"}
            className="w-full rounded-xl gap-1.5"
            size="sm"
          >
            {isFollowing ? <><UserMinus className="w-4 h-4" /> Unfollow</> : <><UserPlus className="w-4 h-4" /> Follow</>}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 px-4">
        {["posts", "saved"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
              activeTab === tab ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {tab === "posts" ? "Posts" : "Saved"}
            {activeTab === tab && (
              <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {activeTab === "posts" && (
          posts.length === 0 ? (
            <EmptyState icon={Newspaper} title="No posts yet" description="Start sharing what you're building!" />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserEmail={currentUser?.email}
                isLiked={likes.some((l) => l.post_id === post.id)}
                isSaved={saved.some((s) => s.post_id === post.id)}
                onLikeToggle={handleLikeToggle}
                onSaveToggle={handleSaveToggle}
              />
            ))
          )
        )}
        {activeTab === "saved" && isOwnProfile && (
          <SavedPosts
            saved={saved}
            currentUserEmail={currentUser?.email}
            likes={likes}
            onLikeToggle={handleLikeToggle}
            onSaveToggle={handleSaveToggle}
          />
        )}
      </div>
    </div>
  );
}

function SavedPosts({ saved, currentUserEmail, likes, onLikeToggle, onSaveToggle }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (saved.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }
      const allPosts = await base44.entities.Post.list("-created_date", 100);
      const savedIds = new Set(saved.map((s) => s.post_id));
      setPosts(allPosts.filter((p) => savedIds.has(p.id)));
      setLoading(false);
    };
    load();
  }, [saved]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return <EmptyState icon={Newspaper} title="No saved posts" description="Save posts to find them here later" />;
  }

  return posts.map((post) => (
    <PostCard
      key={post.id}
      post={post}
      currentUserEmail={currentUserEmail}
      isLiked={likes.some((l) => l.post_id === post.id)}
      isSaved={true}
      onLikeToggle={onLikeToggle}
      onSaveToggle={onSaveToggle}
    />
  ));
}