import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { getUserXPStats, getEarnedBadges } from "@/lib/xp-system";

export default function XPProgressBar({ userEmail, stats: statsProp }) {
  const [stats, setStats] = useState(statsProp || null);

  useEffect(() => {
    if (statsProp) { setStats(statsProp); return; }
    if (!userEmail) return;
    getUserXPStats(userEmail).then(setStats).catch(() => {});
  }, [userEmail, statsProp]);

  if (!stats) return null;

  const { level } = stats;
  const badges = getEarnedBadges(stats);

  return (
    <div className="space-y-2">
      {/* Level + XP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span className="text-xs font-semibold text-foreground">
            Level {level.level} — {level.title}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {stats.total_xp} XP
          {level.nextLevel && ` / ${level.nextLevel.minXP}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${level.progress}%` }}
          role="progressbar"
          aria-valuenow={level.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Earned badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {badges.map((badge) => (
            <span
              key={badge.id}
              title={badge.description}
              className="text-base leading-none cursor-default"
              aria-label={badge.label}
            >
              {badge.icon}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
