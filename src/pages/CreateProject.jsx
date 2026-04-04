import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, X, Loader2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useCurrentUser from "../hooks/useCurrentUser";
import { useRef } from "react";
import { awardXP } from "@/lib/xp-system";

const suggestedSkills = ["React", "Node.js", "Python", "AI/ML", "Design", "Backend", "Frontend", "Mobile", "Data", "DevOps"];

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [maxTeamSize, setMaxTeamSize] = useState(5);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const addSkill = (skill) => {
    const clean = skill.trim();
    if (clean && !skills.includes(clean)) {
      setSkills((prev) => [...prev, clean]);
    }
    setSkillInput("");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !user) return;
    setSubmitting(true);
    try {
      let image_url = null;
      if (imageFile) {
        const result = await base44.integrations.Core.UploadFile({ file: imageFile });
        image_url = result.file_url;
      }

      await base44.entities.Project.create({
        title: title.trim(),
        description: description.trim(),
        owner_name: user.full_name || "Anonymous",
        owner_email: user.email,
        owner_avatar: user.avatar || "",
        skills_needed: skills,
        max_team_size: maxTeamSize,
        status: "looking_for_team",
        team_size: 1,
        image_url,
      });

      await awardXP(user.email, "project_created", {
        project_title: title.trim(),
        skills_needed: skills,
      });

      navigate("/co-build");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/co-build" className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-space font-bold text-lg">New Project</h1>
      </div>

      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project name"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your project and what you're looking for..."
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        {/* Image Upload */}
        <div>
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="" className="w-full rounded-xl object-cover max-h-40" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-sm"
            >
              <Image className="w-4 h-4" />
              Add Cover Image
            </button>
          )}
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Skills Needed</label>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }
              }}
              placeholder="Add a skill..."
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
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
          <div className="flex flex-wrap gap-1.5">
            {suggestedSkills.filter((s) => !skills.includes(s)).slice(0, 6).map((s) => (
              <button
                key={s}
                onClick={() => addSkill(s)}
                className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Team Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Max Team Size</label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 8, 10].map((n) => (
              <button
                key={n}
                onClick={() => setMaxTeamSize(n)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                  maxTeamSize === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim() || submitting}
          className="w-full rounded-xl"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Project"}
        </Button>
      </div>
    </div>
  );
}
