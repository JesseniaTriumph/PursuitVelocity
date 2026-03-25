import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Loader2, Camera } from "lucide-react";
import { useRef } from "react";

const SKILLS = ["React", "Node.js", "Python", "AI/ML", "Design", "Backend", "Frontend", "Mobile", "Data", "DevOps", "Java", "Product"];
const INTERESTS = ["Startups", "AI", "Social Impact", "EdTech", "FinTech", "Games", "Web3", "Health", "Education", "Sustainability"];
const GOALS = ["Launch an MVP", "Get a job", "Build a portfolio", "Find collaborators", "Learn new skills", "Ship fast"];
const LOOKING_FOR_OPTIONS = [
  { id: "build_own_project", label: "Build my own project", emoji: "🚀" },
  { id: "join_project", label: "Join a project", emoji: "🤝" },
  { id: "collaborate", label: "Find collaborators", emoji: "🧩" },
  { id: "learn", label: "Learn & grow", emoji: "📚" },
];
const NEEDS_OPTIONS = [
  { id: "teammates", label: "Teammates", emoji: "👥" },
  { id: "experience", label: "Experience", emoji: "💼" },
  { id: "guidance", label: "Guidance / Mentorship", emoji: "🧠" },
];

const steps = ["identity", "skills", "interests", "why", "needs"];

export default function Onboarding() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [goals, setGoals] = useState([]);
  const [lookingFor, setLookingFor] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleItem = (arr, setArr, item) => {
    setArr((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    let avatarUrl = "";
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
      avatar: avatarUrl,
      onboarded: true,
    });
    navigate("/");
  };

  const canContinue = () => {
    if (step === 1) return skills.length > 0;
    if (step === 3) return lookingFor.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-space font-bold text-sm">P</span>
          </div>
          <span className="font-space font-bold text-lg">Pursuit</span>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 px-6"
        >
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-space font-bold text-2xl mb-1">Who are you? 👋</h1>
                <p className="text-muted-foreground text-sm">Set up your builder identity</p>
              </div>

              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => fileRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-primary/40" />
                    )}
                  </div>
                  <input type="file" ref={fileRef} onChange={handleAvatarSelect} accept="image/*" className="hidden" />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people what you're building... (optional)"
                className="w-full bg-muted rounded-2xl px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-space font-bold text-2xl mb-1">What do you do? 🛠️</h1>
                <p className="text-muted-foreground text-sm">Select your skills (pick all that apply)</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleItem(skills, setSkills, s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      skills.includes(s) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {skills.includes(s) && <Check className="inline w-3 h-3 mr-1" />}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-space font-bold text-2xl mb-1">What do you care about? 💡</h1>
                <p className="text-muted-foreground text-sm">Pick your interests & goals</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleItem(interests, setInterests, s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        interests.includes(s) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Goals</p>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleItem(goals, setGoals, s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        goals.includes(s) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-space font-bold text-2xl mb-1">Why are you here? 🎯</h1>
                <p className="text-muted-foreground text-sm">This helps us find your best matches</p>
              </div>
              <div className="space-y-2">
                {LOOKING_FOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleItem(lookingFor, setLookingFor, opt.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-medium transition-all border-2 ${
                      lookingFor.includes(opt.id)
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-transparent bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                    {lookingFor.includes(opt.id) && <Check className="ml-auto w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-space font-bold text-2xl mb-1">What do you need? ✨</h1>
                <p className="text-muted-foreground text-sm">We'll match you accordingly</p>
              </div>
              <div className="space-y-2">
                {NEEDS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleItem(needs, setNeeds, opt.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-medium transition-all border-2 ${
                      needs.includes(opt.id)
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-transparent bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                    {needs.includes(opt.id) && <Check className="ml-auto w-4 h-4 text-primary" />}
                  </button>
                ))}
            </div>
          </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Nav */}
      <div className="px-6 py-6 flex items-center justify-between">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-11 h-11 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        ) : (
          <div />
        )}

        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canContinue()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium text-sm disabled:opacity-40 transition-all active:scale-95"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium text-sm disabled:opacity-40 transition-all active:scale-95"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Let's Build! 🚀</>}
          </button>
        )}
      </div>
    </div>
  );
}