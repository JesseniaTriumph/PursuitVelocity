import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Image, Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const suggestedTags = ["buildinpublic", "AI", "frontend", "backend", "startup", "design"];

export default function QuickPost({ user, onPostCreated }) {
  const [focused, setFocused] = useState(false);
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState(["buildinpublic"]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleTag = (tag) => {
    setHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user || submitting) return;
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
      post_type: "update",
      likes_count: 0,
      comments_count: 0,
    });
    setContent("");
    setHashtags(["buildinpublic"]);
    setImageFile(null);
    setImagePreview(null);
    setFocused(false);
    setSubmitting(false);
    onPostCreated?.();
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary font-bold text-sm">{user?.full_name?.[0] || "?"}</span>
          )}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="What are you building? 🚀"
          rows={focused ? 3 : 1}
          className="flex-1 bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/60 leading-relaxed transition-all"
        />
      </div>

      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50"
          >
            {imagePreview && (
              <div className="relative px-4 pt-2">
                <img src={imagePreview} alt="" className="w-full rounded-xl object-cover max-h-40" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-4 right-6 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="px-4 py-2 flex flex-wrap gap-1.5">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-[11px] px-2 py-1 rounded-full font-medium transition-all ${
                    hashtags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="px-4 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="file" ref={fileRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setFocused(false); setContent(""); }}
                  className="text-xs text-muted-foreground px-2 py-1"
                >
                  Cancel
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-40 transition-all active:scale-95"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Send className="w-3.5 h-3.5" /> Post</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}