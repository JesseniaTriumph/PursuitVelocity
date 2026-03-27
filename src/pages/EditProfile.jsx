import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, Camera, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "../hooks/useCurrentUser";
import WelcomeTour from "../components/WelcomeTour";

const ALL_SKILLS = ["React", "Node.js", "Python", "AI/ML", "Design", "Backend", "Frontend", "Mobile", "Data", "DevOps", "Java", "Product"];
const ALL_INTERESTS = ["Startups", "AI", "Social Impact", "EdTech", "FinTech", "Games", "Web3", "Health", "Education", "Sustainability"];
const LOOKING_FOR_OPTIONS = [
  { id: "build_own_project", label: "🚀 Build my own project" },
  { id: "join_project", label: "🤝 Join a project" },
  { id: "collaborate", label: "🧩 Find collaborators" },
  { id: "learn", label: "📚 Learn & grow" },
];
const NEEDS_OPTIONS = [
  { id: "teammates", label: "👥 Teammates" },
  { id: "experience", label: "💼 Experience" },
  { id: "guidance", label: "🧠 Guidance" },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useCurrentUser();
  const fileInputRef = useRef(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [goals, setGoals] = useState([]);
  const [lookingFor, setLookingFor] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [birthday, setBirthday] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [customSkill, setCustomSkill] = useState("");
  const [tourOpen, setTourOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setSkills(user.skills || []);
      setInterests(user.interests || []);
      setGoals(user.goals || []);
      setLookingFor(user.looking_for || []);
      setNeeds(user.needs || []);
      setBirthday(user.birthday || "");
      setGithubUrl(user.github_url || "");
      setLinkedinUrl(user.linkedin_url || "");
      setPortfolioUrl(user.portfolio_url || "");
      setXUrl(user.x_url || "");
      setInstagramUrl(user.instagram_url || "");
      setTiktokUrl(user.tiktok_url || "");
      setCalendlyUrl(user.calendly_url || "");
      setResumeUrl(user.resume_url || "");
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const toggle = (arr, setArr, item) => {
    setArr((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) { setAvatar(file); setAvatarPreview(URL.createObjectURL(file)); }
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
      interests,
      goals,
      looking_for: lookingFor,
      needs,
      birthday,
      github_url: githubUrl.trim(),
      linkedin_url: linkedinUrl.trim(),
      portfolio_url: portfolioUrl.trim(),
      x_url: xUrl.trim(),
      instagram_url: instagramUrl.trim(),
      tiktok_url: tiktokUrl.trim(),
      calendly_url: calendlyUrl.trim(),
      resume_url: resumeUrl.trim(),
      avatar: avatarUrl,
      onboarded: true,
    });
    navigate("/profile");
  };

  if (userLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="px-4 py-4 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-space font-bold text-lg">Edit Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-3xl font-space">{user?.full_name?.[0] || "?"}</span>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleAvatarSelect} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself and what you're building..." className="w-full bg-muted rounded-xl px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {/* Birthday */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Birthday (optional) 🎂</label>
        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-semibold">Public Links</label>
          <p className="text-xs text-muted-foreground mt-1">
            These appear on your profile and lookbook. LinkedIn and X are the primary professional channels. Instagram and TikTok are optional if you want creator-style content suggestions too.
          </p>
        </div>
        <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="GitHub profile URL" className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="LinkedIn URL" className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <input value={xUrl} onChange={(e) => setXUrl(e.target.value)} placeholder="X / Twitter URL" className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="Instagram URL (optional)" className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="TikTok URL (optional)" className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="Portfolio URL" className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <input value={calendlyUrl} onChange={(e) => setCalendlyUrl(e.target.value)} placeholder="Calendly URL" className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <input value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="Resume URL" className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Skills</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SKILLS.map((s) => (
            <button key={s} onClick={() => toggle(skills, setSkills, s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${skills.includes(s) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {skills.includes(s) && <Check className="inline w-3 h-3 mr-1" />}{s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (customSkill.trim()) { toggle(skills, setSkills, customSkill.trim()); setCustomSkill(""); } } }} placeholder="Add custom skill..." className="flex-1 bg-muted rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      {/* Interests */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Interests</label>
        <div className="flex flex-wrap gap-2">
          {ALL_INTERESTS.map((s) => (
            <button key={s} onClick={() => toggle(interests, setInterests, s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${interests.includes(s) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Looking For */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">What are you here for?</label>
        <div className="space-y-2">
          {LOOKING_FOR_OPTIONS.map((opt) => (
            <button key={opt.id} onClick={() => toggle(lookingFor, setLookingFor, opt.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${lookingFor.includes(opt.id) ? "border-primary bg-primary/5 text-foreground" : "border-transparent bg-muted text-muted-foreground"}`}>
              {opt.label}
              {lookingFor.includes(opt.id) && <Check className="ml-auto w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Needs */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">What do you need?</label>
        <div className="space-y-2">
          {NEEDS_OPTIONS.map((opt) => (
            <button key={opt.id} onClick={() => toggle(needs, setNeeds, opt.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${needs.includes(opt.id) ? "border-primary bg-primary/5 text-foreground" : "border-transparent bg-muted text-muted-foreground"}`}>
              {opt.label}
              {needs.includes(opt.id) && <Check className="ml-auto w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={submitting} className="w-full rounded-xl">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
      </Button>

      <button
        onClick={() => setTourOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" /> Take the app tour again
      </button>

      {tourOpen && <WelcomeTour forceOpen onClose={() => setTourOpen(false)} />}
    </div>
  );
}
