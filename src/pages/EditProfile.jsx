import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "../hooks/useCurrentUser";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useCurrentUser();
  const fileInputRef = useRef(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setSkills(user.skills || []);
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const addSkill = (skill) => {
    const clean = skill.trim();
    if (clean && !skills.includes(clean)) {
      setSkills((prev) => [...prev, clean]);
    }
    setSkillInput("");
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    let avatarUrl = user.avatar || "";
    if (avatar) {
      const result = await base44.integrations.Core.UploadFile({ file: avatar });
      avatarUrl = result.file_url;
    }

    await base44.auth.updateMe({
      bio,
      skills,
      avatar: avatarUrl,
    });

    navigate("/profile");
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-space font-bold text-lg">Edit Profile</h1>
      </div>

      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-3xl font-space">
                  {user?.full_name?.[0] || "?"}
                </span>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarSelect} accept="image/*" className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell people about yourself..."
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Skills</label>
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }
            }}
            placeholder="Add a skill..."
            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {s}
                  <button onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full rounded-xl">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}