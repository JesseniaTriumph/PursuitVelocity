import { useState, useEffect } from "react";
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import moment from "moment";

export default function PostCard({ post, currentUserEmail, onLikeToggle, onSaveToggle, isLiked, isSaved }) {
  const timeAgo = moment(post.created_date).fromNow();

  const postTypeColors = {
    update: "bg-primary/10 text-primary",
    progress: "bg-accent/10 text-accent",
    milestone: "bg-chart-4/10 text-chart-4",
    question: "bg-chart-3/10 text-chart-3",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden"
    >
      {/* Author Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link to={`/profile/${post.author_email}`}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-sm">
                {post.author_name?.[0] || "?"}
              </span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${post.author_email}`} className="font-semibold text-sm hover:underline">
            {post.author_name}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {post.post_type && post.post_type !== "update" && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${postTypeColors[post.post_type] || ""}`}>
                {post.post_type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {post.hashtags.map((tag, i) => (
            <Link
              key={i}
              to={`/explore?tag=${encodeURIComponent(tag)}`}
              className="text-xs text-primary font-medium hover:underline"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="px-4 pb-3">
          <img
            src={post.image_url}
            alt=""
            className="w-full rounded-xl object-cover max-h-80"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLikeToggle?.(post.id)}
            className="flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
            <span className="text-xs text-muted-foreground font-medium">
              {post.likes_count || 0}
            </span>
          </button>
          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-1.5 text-muted-foreground"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">{post.comments_count || 0}</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSaveToggle?.(post.id)}
            className="transition-colors active:scale-95"
          >
            <Bookmark
              className={`w-5 h-5 transition-colors ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
}