import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PostCard from "../components/PostCard";
import EmptyState from "../components/EmptyState";
import UserAvatar from "../components/UserAvatar";
import {
  Settings, Newspaper, Loader2, LogOut,
  Linkedin, Mail, ExternalLink, Users, Plus, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "../hooks/useCurrentUser";
import { motion } from "framer-motion";

export default function Profile() {
  const { email } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useCurrentUser();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [saved, setSaved] = useState([]);
  const [projects, setProjects] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  const isOwnProfile = !email || email === currentUser?.email;
  const targetEmail = isOwnProfile ? currentUser?.email : email;

  useEffect(() => {
    if (!targetEmail) return;
    const load = async () => {
      setLoading(true);
      const [userPosts] = await Promise.all([
        base44.entities.Post.filter({ author_email: targetEmail }, "-created_date"),
      ]);
      setPosts(userPosts);

      if (!isOwnProfile) {
        const users = await base44.entities.User.filter({ email: targetEmail });
        setProfileUser(users[0] || { email: targetEmail, full_name: targetEmail });
      } else {
        setProfileUser(currentUser);
      }

      // Load projects this person owns or is on
      try {
        const allProjects = await base44.entities.Project.filter({ owner_email: targetEmail });
        setProjects(allProjects);
      } catch {}

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

  const activeProject = projects.find((p) => p.status === "in_progress" || p.status === "looking_for_team") || projects[0];

  return (
    <div className="pb-6">
      {/* ── Header card ─────────────────────────────────────────────── */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar */}
          <UserAvatar
            name={profileUser?.full_name || profileUser?.email || ""}
            src={profileUser?.avatar}
            size={80}
          />

          {/* Action buttons top-right */}
          <div className="flex items-center gap-2 mt-1">
            {isOwnProfile ? (
              <>
                <Link to="/edit-profile">
                  <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 h-8 text-xs">
                    <Settings className="w-3.5 h-3.5" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  onClick={() => base44.auth.logout()}
                  aria-label="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Link to={`/messages?to=${targetEmail}`}>
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs">
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </Button>
                </Link>
                <Button size="sm" className="rounded-xl h-8 text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Connect
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Name + identity */}
        <div className="mt-3">
          <h1 className="font-space font-bold text-xl leading-tight">
            {profileUser?.full_name || "Builder"}
          </h1>
          {(profileUser?.cohort || profileUser?.email) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {profileUser?.cohort ? `Pursuit Fellow · ` : ""}{profileUser?.email}
            </p>
          )}

          {/* LinkedIn link */}
          {profileUser?.linkedin_url && (
            <a
              href={profileUser.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-xs text-muted-foreground hover:text-[#0A66C2] transition-colors"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}
        </div>
      </div>

      {/* ── Skills ──────────────────────────────────────────────────── */}
      {profileUser?.skills?.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              My Skills
            </p>
            {isOwnProfile && (
              <Link to="/edit-profile" className="text-[10px] text-primary font-medium">Edit</Link>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profileUser.skills.map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Current build ───────────────────────────────────────────── */}
      {activeProject && (
        <div className="px-4 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            What I'm Building
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link to={`/project/${activeProject.id}`} className="font-semibold text-sm hover:text-primary transition-colors leading-snug">
                {activeProject.title}
              </Link>
              <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                activeProject.status === "looking_for_team"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {activeProject.status === "looking_for_team" ? "Recruiting" : "Active"}
              </span>
            </div>
            {activeProject.description && (
              <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                {activeProject.description}
              </p>
            )}
            {activeProject.skills_needed?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {activeProject.skills_needed.map((s) => {
                  const isMatch = !isOwnProfile && currentUser?.skills?.includes(s);
                  return (
                    <span
                      key={s}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isMatch
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s}
                    </span>
                  );
                })}
              </div>
            )}
            {!isOwnProfile && activeProject.status === "looking_for_team" && (
              <div>
                <Button size="sm" className="w-full rounded-xl gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Join this project
                </Button>
                {activeProject.members_count > 0 && (
                  <p className="text-center text-[10px] text-muted-foreground mt-1.5">
                    {activeProject.members_count} people have already joined
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Direct contact (other person's profile only) ────────────── */}
      {!isOwnProfile && profileUser?.email && (
        <div className="px-4 mb-4">
          <a
            href={`mailto:${profileUser.email}`}
            className="flex items-center gap-2 py-2.5 px-3 rounded-xl bg-muted/60 hover:bg-muted transition-colors"
          >
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">
              Reach out directly · <span className="text-foreground font-medium">{profileUser.email}</span>
            </span>
          </a>
        </div>
      )}

      {/* ── Posts / Saved tabs ──────────────────────────────────────── */}
      <div className="border-t border-border/50 mt-2">
        <div className="flex px-4 border-b border-border/50">
          {["posts", ...(isOwnProfile ? ["saved"] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize text-center transition-colors relative ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="profile-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>

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
    </div>
  );
}

function SavedPosts({ saved, currentUserEmail, likes, onLikeToggle, onSaveToggle }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (saved.length === 0) { setPosts([]); setLoading(false); return; }
      const allPosts = await base44.entities.Post.list("-created_date", 100);
      const savedIds = new Set(saved.map((s) => s.post_id));
      setPosts(allPosts.filter((p) => savedIds.has(p.id)));
      setLoading(false);
    };
    load();
  }, [saved]);

  if (loading) return <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  if (posts.length === 0) return <EmptyState icon={Newspaper} title="No saved posts" description="Save posts to find them here later" />;

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
