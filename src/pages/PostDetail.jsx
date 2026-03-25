import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Heart, Send, Loader2 } from "lucide-react";
import useCurrentUser from "../hooks/useCurrentUser";
import moment from "moment";
import { motion } from "framer-motion";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useCurrentUser();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [postData, commentsData] = await Promise.all([
        base44.entities.Post.filter({ id }),
        base44.entities.Comment.filter({ post_id: id }, "-created_date"),
      ]);
      setPost(postData[0] || null);
      setComments(commentsData);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || submitting) return;
    setSubmitting(true);
    const comment = await base44.entities.Comment.create({
      post_id: id,
      content: newComment.trim(),
      author_name: user.full_name || "Anonymous",
      author_email: user.email,
      author_avatar: user.avatar || "",
    });
    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    setSubmitting(false);

    // Update comment count
    if (post) {
      const newCount = (post.comments_count || 0) + 1;
      await base44.entities.Post.update(id, { comments_count: newCount });
      setPost((prev) => ({ ...prev, comments_count: newCount }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-semibold text-sm">Post</span>
      </div>

      {/* Post Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {post.author_avatar ? (
                <img src={post.author_avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-sm">{post.author_name?.[0]}</span>
              )}
            </div>
            <div>
              <Link to={`/profile/${post.author_email}`} className="font-semibold text-sm hover:underline">
                {post.author_name}
              </Link>
              <p className="text-xs text-muted-foreground">{moment(post.created_date).format("MMM D, YYYY · h:mm A")}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag, i) => (
                <Link key={i} to={`/explore?tag=${encodeURIComponent(tag)}`} className="text-xs text-primary font-medium">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {post.image_url && (
            <img src={post.image_url} alt="" className="w-full rounded-xl object-cover max-h-96" />
          )}

          <div className="flex items-center gap-4 pt-2 text-muted-foreground">
            <div className="flex items-center gap-1.5 text-sm">
              <Heart className="w-4 h-4" />
              <span>{post.likes_count || 0} likes</span>
            </div>
            <span className="text-sm">{comments.length} comments</span>
          </div>
        </div>

        {/* Comments */}
        <div className="px-4 py-3 space-y-4">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                {comment.author_avatar ? (
                  <img src={comment.author_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-muted-foreground font-semibold text-xs">{comment.author_name?.[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs">{comment.author_name}</span>
                  <span className="text-[10px] text-muted-foreground">{moment(comment.created_date).fromNow()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{comment.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comment Input */}
      <div className="px-4 py-3 border-t border-border/50 bg-background">
        <div className="flex items-center gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
            placeholder="Add a comment..."
            className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}