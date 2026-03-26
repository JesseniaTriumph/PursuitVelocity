import { useState } from "react";
import { Heart, MessageCircle, Bookmark, CheckCircle2, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import moment from "moment";

const postTypeConfig = {
  progress: { label: "Progress", color: "bg-accent/10 text-primary" },
  milestone: { label: "Milestone 🎉", color: "bg-yellow-50 text-yellow-700" },
  question: { label: "Question", color: "bg-blue-50 text-blue-700" },
  update: { label: "Update", color: "bg-muted text-muted-foreground" },
};

export default function BuildUpdateCard({ post, currentUserEmail, onLikeToggle, onSaveToggle, isLiked, isSaved }) {
  const timeAgo = moment(post.created_date).fromNow();
  const typeConfig = postTypeConfig[post.post_type] || postTypeConfig.update;

  // Parse structured content (completed / needed)
  let completed = null;
  let needed = null;
  let mainContent = post.content;

  if (post.content?.includes("✅") || post.content?.includes("🔍")) {
    const lines = post.content.split("\n");
    lines.forEach((line) => {
      if (line.startsWith("✅")) completed = line.replace("✅", "").trim();
      else if (line.startsWith("🔍")) needed = line.replace("🔍", "").trim();
    });
    mainContent = lines.filter((l) => !l.startsWith("✅") && !l.startsWith("🔍")).join("\n").trim();
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/60 rounded-xl shadow-xs overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link to={`/profile/${post.author_email}`}>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-semibold text-sm">{post.author_name?.[0] || "?"}</span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${post.author_email}`} className="font-medium text-sm text-foreground hover:text-primary transition-colors">
            {post.author_name}
          </Link>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wide ${typeConfig.color}`}>
          {typeConfig.label}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 pb-3 space-y-2.5">
        {mainContent && (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{mainContent}</p>
        )}

        {/* Structured: Completed */}
        {completed && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/60">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Completed</p>
              <p className="text-sm text-foreground">{completed}</p>
            </div>
          </div>
        )}

        {/* Structured: Needed */}
        {needed && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/60">
            <HelpCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Looking For</p>
              <p className="text-sm text-foreground">{needed}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {post.hashtags.map((tag, i) => (
            <Link key={i} to={`/explore?tag=${encodeURIComponent(tag)}`}
              className="text-xs text-primary font-medium bg-accent/10 px-2.5 py-0.5 rounded-full hover:bg-accent/20 transition-colors">
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="px-4 pb-3">
          <img src={post.image_url} alt="" className="w-full rounded-lg object-cover max-h-64" />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-4 border-t border-border/40 pt-3">
        <button onClick={() => onLikeToggle?.(post.id)} className="flex items-center gap-1.5 transition-colors active:scale-95" aria-label={isLiked ? "Unlike" : "Like"}>
          <Heart className={`w-4 h-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} aria-hidden="true" />
          <span className="text-xs text-muted-foreground font-medium">{post.likes_count || 0}</span>
        </button>
        <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 text-muted-foreground">
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs font-medium">{post.comments_count || 0}</span>
        </Link>
        <button onClick={() => onSaveToggle?.(post.id)} className="ml-auto transition-colors active:scale-95" aria-label={isSaved ? "Unsave" : "Save"}>
          <Bookmark className={`w-4 h-4 transition-colors ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
        </button>
      </div>
    </motion.article>
  );
}