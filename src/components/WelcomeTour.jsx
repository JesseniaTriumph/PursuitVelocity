import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Users, MessageSquare, Flame, BookOpen,
  FolderOpen, LayoutDashboard, ArrowRight, X, Check,
} from "lucide-react";

/*
 * WelcomeTour — step-by-step feature walkthrough for new users.
 *
 * Shows automatically on first visit after onboarding (localStorage flag).
 * Can also be triggered manually via forceOpen prop.
 *
 * Usage:
 *   <WelcomeTour />            auto-shows once after onboarding
 *   <WelcomeTour forceOpen />  always open (e.g. from a "Take the tour" button)
 */

const TOUR_KEY = "velocity_tour_v1_seen";

const STEPS = [
  {
    icon: LayoutDashboard,
    color: "bg-primary/10 text-primary",
    title: "Welcome to Velocity",
    body: "Your home for building in public. Share progress, find teammates, and connect with like-minded builders — all in one place.",
    cta: "Let's walk through it",
  },
  {
    icon: Zap,
    color: "bg-yellow-100 text-yellow-700",
    title: "Build in Public",
    body: "Tap the + button at the bottom to post a build update, milestone, or question. Tag your project, add hashtags, and let the community follow your progress.",
    cta: "Got it",
  },
  {
    icon: FolderOpen,
    color: "bg-blue-100 text-blue-700",
    title: "Co-Build Projects",
    body: "Post your project and mark it as \"Looking for Team.\" Browse open projects, request to join, or invite collaborators directly.",
    cta: "Got it",
  },
  {
    icon: Users,
    color: "bg-green-100 text-green-700",
    title: "Find Builders",
    body: "Browse the Builders directory to find people by skill and availability. Schedule a meeting or send a message directly from their card.",
    cta: "Got it",
  },
  {
    icon: Flame,
    color: "bg-orange-100 text-orange-700",
    title: "Camp Fire — Smart Matching",
    body: "Camp Fire uses your skills and projects to suggest builders you should meet. It also shows who else is attending the same events so you can connect before you're in the same room.",
    cta: "Got it",
  },
  {
    icon: MessageSquare,
    color: "bg-violet-100 text-violet-700",
    title: "Direct Messages",
    body: "Message any builder directly. Tap Message on any profile, builder card, or Camp Fire suggestion. All conversations live in the Messages tab at the bottom.",
    cta: "Got it",
  },
  {
    icon: BookOpen,
    color: "bg-teal-100 text-teal-700",
    title: "Resources & Tutorials",
    body: "Builders share what they've learned — auth setups, RAG pipelines, MVP frameworks, and more. Read, like, and contribute your own tutorials.",
    cta: "Got it",
  },
  {
    icon: Check,
    color: "bg-primary/10 text-primary",
    title: "You're all set 🚀",
    body: "Start by sharing your first build update or exploring projects to join. The community is here to build alongside you.",
    cta: "Start building",
    isLast: true,
  },
];

export default function WelcomeTour({ forceOpen = false, onClose }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) setOpen(true);
  }, [forceOpen]);

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  }

  function handleClose() {
    setOpen(false);
    if (!forceOpen) localStorage.setItem(TOUR_KEY, "1");
    onClose?.();
  }

  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Card */}
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-muted">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="p-5">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground font-medium">
                    {step + 1} / {STEPS.length}
                  </span>
                  <button
                    onClick={handleClose}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    aria-label="Close tour"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Animated content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${current.color}`}>
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <h2 className="font-semibold text-base mb-2">{current.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
                  </motion.div>
                </AnimatePresence>

                {/* Step dots */}
                <div className="flex items-center gap-1.5 mt-5 mb-4">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === step
                          ? "w-5 bg-primary"
                          : i < step
                          ? "w-1.5 bg-primary/40"
                          : "w-1.5 bg-muted-foreground/20"
                      }`}
                      aria-label={`Go to step ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Primary CTA */}
                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-opacity active:opacity-80"
                >
                  {current.cta}
                  {!current.isLast && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                </button>

                {/* Skip */}
                {!current.isLast && (
                  <button
                    onClick={handleClose}
                    className="w-full text-center text-xs text-muted-foreground mt-2 py-1 hover:text-foreground transition-colors"
                  >
                    Skip tour
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}