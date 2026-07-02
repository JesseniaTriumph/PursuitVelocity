import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2, ChevronDown, ChevronUp, CalendarDays, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { awardXP } from "@/lib/xp-system";

const MILESTONE_TYPES = {
  feature: { label: "Feature", color: "bg-primary/10 text-primary" },
  bug: { label: "Fix", color: "bg-red-100 text-red-700" },
  design: { label: "Design", color: "bg-purple-100 text-purple-700" },
  launch: { label: "Launch", color: "bg-green-100 text-green-700" },
  research: { label: "Research", color: "bg-amber-100 text-amber-700" },
};

export default function BuildPlanner({ project, currentUserEmail, milestones: initialMilestones = [], onUpdate }) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("feature");
  const [newDue, setNewDue] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const isOwner = project?.owner_email === currentUserEmail;

  const completed = milestones.filter((m) => m.completed);
  const pending = milestones.filter((m) => !m.completed);
  const progress = milestones.length > 0
    ? Math.round((completed.length / milestones.length) * 100)
    : 0;

  useEffect(() => {
    setMilestones(initialMilestones);
  }, [initialMilestones]);

  async function addMilestone(e) {
    e.preventDefault();
    if (!newTitle.trim() || adding) return;
    setAdding(true);
    try {
      const created = await base44.entities.Milestone.create({
        project_id: project.id,
        owner_email: currentUserEmail,
        title: newTitle.trim(),
        type: newType,
        due_date: newDue || null,
        completed: false,
        created_date: new Date().toISOString(),
      });
      setMilestones((prev) => [...prev, created]);
      setNewTitle("");
      setNewDue("");
      setShowAdd(false);
      onUpdate?.();
    } catch (err) {
      console.error("Failed to add milestone:", err);
    } finally {
      setAdding(false);
    }
  }

  async function toggleComplete(milestone) {
    const updated = { ...milestone, completed: !milestone.completed };
    setMilestones((prev) => prev.map((m) => m.id === milestone.id ? updated : m));
    await base44.entities.Milestone.update(milestone.id, { completed: updated.completed });

    if (updated.completed) {
      await awardXP(currentUserEmail, "milestone_posted", { milestone_id: milestone.id });
    }
    onUpdate?.();
  }

  async function deleteMilestone(milestoneId) {
    setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    await base44.entities.Milestone.delete(milestoneId);
    onUpdate?.();
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {milestones.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Build progress</span>
            <span className="font-semibold text-foreground">{progress}% — {completed.length}/{milestones.length} done</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress === 100 ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Pending milestones */}
      {pending.length > 0 && (
        <div className="space-y-1.5">
          {pending.map((m) => (
            <MilestoneRow
              key={m.id}
              milestone={m}
              isOwner={isOwner}
              onToggle={toggleComplete}
              onDelete={deleteMilestone}
            />
          ))}
        </div>
      )}

      {/* Completed milestones (collapsed) */}
      {completed.length > 0 && (
        <details className="group">
          <summary className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1 select-none py-1">
            <span className="group-open:hidden"><ChevronDown className="w-3 h-3 inline" /></span>
            <span className="hidden group-open:inline"><ChevronUp className="w-3 h-3 inline" /></span>
            {completed.length} completed
          </summary>
          <div className="space-y-1.5 mt-1.5">
            {completed.map((m) => (
              <MilestoneRow
                key={m.id}
                milestone={m}
                isOwner={isOwner}
                onToggle={toggleComplete}
                onDelete={deleteMilestone}
              />
            ))}
          </div>
        </details>
      )}

      {/* Empty */}
      {milestones.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3">
          No milestones yet. Break your build into steps.
        </p>
      )}

      {/* Add milestone */}
      {isOwner && (
        <div>
          {!showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add milestone
            </button>
          ) : (
            <form onSubmit={addMilestone} className="space-y-2 pt-1">
              <Input
                placeholder="Milestone title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-8 text-sm"
                autoFocus
                required
              />
              <div className="flex gap-2">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="flex-1 h-8 text-xs border border-border rounded-md px-2 bg-background"
                >
                  {Object.entries(MILESTONE_TYPES).map(([v, { label }]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
                <Input
                  type="date"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="flex-1 h-8 text-xs"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="h-7 text-xs" disabled={adding || !newTitle.trim()}>
                  {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function MilestoneRow({ milestone, isOwner, onToggle, onDelete }) {
  const typeConfig = MILESTONE_TYPES[milestone.type] || MILESTONE_TYPES.feature;
  const isOverdue = milestone.due_date && !milestone.completed && new Date(milestone.due_date) < new Date();

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg group",
      milestone.completed ? "opacity-60" : "bg-muted/40"
    )}>
      <button
        onClick={() => onToggle(milestone)}
        className="flex-shrink-0 transition-colors"
        aria-label={milestone.completed ? "Mark incomplete" : "Mark complete"}
      >
        {milestone.completed
          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
          : <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
        }
      </button>

      <span className={cn("flex-1 text-xs", milestone.completed && "line-through text-muted-foreground")}>
        {milestone.title}
      </span>

      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", typeConfig.color)}>
        {typeConfig.label}
      </Badge>

      {milestone.due_date && (
        <span className={cn(
          "text-[10px] flex items-center gap-0.5",
          isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
        )}>
          <CalendarDays className="w-3 h-3" />
          {new Date(milestone.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      )}

      {isOwner && (
        <button
          onClick={() => onDelete(milestone.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-destructive"
          aria-label="Delete milestone"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
