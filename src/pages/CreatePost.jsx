import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image, X, Hash, Loader2, Sparkles, Zap, Target, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "../hooks/useCurrentUser";
import { motion, AnimatePresence } from "framer-motion";

const postTypes = [
  { id: "update", label: "Update", icon: Zap },
  { id: "progress", label: "Progress", icon: Sparkles },
  { id: "milestone", label: "Milestone", icon: Target },
  { id: "question", label: "Question", icon: HelpCircle },
];

const suggestedTags = ["buildinpublic", "AI", "frontend", "backend", "startup", "design", "demoDay", "help"];

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const fileInputRef = useRef(null);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [postType, setPostType] = useState("update");
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const addTag = (tag) => {
    const clean = tag.replace(/^#/, "").trim().toLowerCase();
    if (clean && !hashtags.includes(clean)) {
      setHashtags((prev) => [...prev, clean]);
    }
    setTagInput("");
  };

  const removeTag = (tag) => {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput.trim()) addTag(tagInput);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    setSubmitting(true);

    let image_url = null;
    if (imageFile) {
      const result = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = result.file_url;
    }

    await base44.entities.Post.create({
      content: content.trim(),
      image_url,
      hashtags,
      author_name: user.full_name || "Anonymous",
      author_email: user.email,
      author_avatar: user.avatar || "",
      post_type: postType,
      likes_count: 0,
      comments_count: 0,
    });

    navigate("/");
  };

  const canSubmit = content.trim().length > 0;

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-space font-bold text-lg">New Post</h1>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="rounded-xl px-5"
          size="sm"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
        </Button>
      </div>

      {/* Post Type */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {postTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setPostType(type.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                postType === type.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What are you building? Share your progress..."
        className="w-full min-h-[120px] bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/60 leading-relaxed"
      />

      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <img src={imagePreview} alt="" className="w-full rounded-xl object-cover max-h-60" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hashtags */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-muted-foreground" />
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add hashtags..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                #{tag}
                <button onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {suggestedTags
            .filter((t) => !hashtags.includes(t))
            .slice(0, 5)
            .map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
              >
                #{tag}
              </button>
            ))}
        </div>
      </div>

      {/* Image Upload */}
      <div className="pt-2 border-t border-border/50">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
        >
          <Image className="w-4 h-4" />
          Add Image
        </button>
      </div>
    </div>
  );
}