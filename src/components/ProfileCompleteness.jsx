import { Link } from "react-router-dom";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const COMPLETENESS_CHECKS = [
  { key: "avatar", label: "Profile photo", test: (u) => !!u?.avatar },
  { key: "bio", label: "Bio / intro", test: (u) => !!u?.bio?.trim() },
  { key: "skills", label: "At least 1 skill", test: (u) => u?.skills?.length > 0 },
  { key: "goals", label: "Goals set", test: (u) => u?.goals?.length > 0 || u?.looking_for?.length > 0 },
  { key: "github", label: "GitHub link", test: (u) => !!u?.github_url },
  { key: "linkedin", label: "LinkedIn link", test: (u) => !!u?.linkedin_url },
];

export function getProfileScore(user) {
  const checks = COMPLETENESS_CHECKS.map((c) => ({ ...c, done: c.test(user) }));
  const done = checks.filter((c) => c.done).length;
  return { checks, score: done, total: checks.length, pct: Math.round((done / checks.length) * 100) };
}

/**
 * Inline compact version — use inside profile pages.
 */
export function ProfileCompletenessBar({ user, className }) {
  const { score, total, pct, checks } = getProfileScore(user);
  if (score === total) return null;

  const missing = checks.filter((c) => !c.done);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">Profile {pct}% complete</span>
        <Link to="/edit-profile" className="text-primary font-medium">Complete →</Link>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        Missing: {missing.map((c) => c.label).join(", ")}
      </p>
    </div>
  );
}

/**
 * Banner — use on Feed/Campfire for users with low completeness.
 * Only shown when score < threshold.
 */
export function ProfileCompletenessBanner({ user, threshold = 3 }) {
  const { score, total, pct, checks } = getProfileScore(user);
  if (score >= threshold) return null;

  const nextItem = checks.find((c) => !c.done);

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 text-sm">
      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-amber-900 dark:text-amber-200 text-xs">
          Your profile is {pct}% complete
        </p>
        <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
          {nextItem ? `Add your ${nextItem.label.toLowerCase()} to improve your matches.` : "Almost there!"}
        </p>
      </div>
      <Link
        to="/edit-profile"
        className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
      >
        Fix it
      </Link>
    </div>
  );
}

/**
 * Full checklist — use on Profile/Edit pages.
 */
export default function ProfileCompleteness({ user, className }) {
  const { checks, pct } = getProfileScore(user);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile Strength</span>
        <span className="text-xs font-bold text-foreground">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", pct === 100 ? "bg-green-500" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li key={c.key} className="flex items-center gap-2 text-xs">
            {c.done
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              : <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            }
            <span className={c.done ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
          </li>
        ))}
      </ul>
      {pct < 100 && (
        <Link to="/edit-profile" className="block text-xs text-primary font-medium hover:underline">
          Complete your profile →
        </Link>
      )}
    </div>
  );
}
