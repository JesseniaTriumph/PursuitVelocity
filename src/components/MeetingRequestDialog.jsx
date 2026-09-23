import { useState } from "react";
import { Calendar, Clock, Video, MapPin, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { awardXP } from "@/lib/xp-system";

const MEETING_TYPES = [
  { value: "collab_chat", label: "Collaboration Chat", icon: "🤝" },
  { value: "code_review", label: "Code Review", icon: "💻" },
  { value: "mentorship", label: "Mentorship / Advice", icon: "🌟" },
  { value: "project_sync", label: "Project Sync", icon: "📋" },
  { value: "coffee_chat", label: "Coffee Chat", icon: "☕" },
  { value: "demo", label: "Demo / Feedback", icon: "🚀" },
];

const DURATIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
];

export default function MeetingRequestDialog({ open, onOpenChange, fromUser, toBuilder }) {
  const [form, setForm] = useState({
    meeting_type: "collab_chat",
    proposed_date: "",
    proposed_time: "",
    duration_minutes: "30",
    format: "video",
    agenda: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fromUser?.email || saving) return;

    setSaving(true);
    try {
      await base44.entities.MeetingRequest.create({
        from_email: fromUser.email,
        from_name: fromUser.full_name || fromUser.email,
        from_avatar: fromUser.avatar || "",
        to_email: toBuilder.email,
        to_name: toBuilder.name,
        meeting_type: form.meeting_type,
        proposed_date: form.proposed_date,
        proposed_time: form.proposed_time,
        duration_minutes: parseInt(form.duration_minutes),
        format: form.format,
        agenda: form.agenda,
        location: form.location,
        status: "pending",
        created_date: new Date().toISOString(),
      });

      // Award XP for sending a meeting request
      await awardXP(fromUser.email, "meeting_requested", { to: toBuilder.email });

      // Send a pre-filled message to notify them
      await base44.entities.Message.create({
        sender_email: fromUser.email,
        receiver_email: toBuilder.email,
        content: `📅 Meeting request from ${fromUser.full_name || fromUser.email}:\n\n` +
          `Type: ${MEETING_TYPES.find((t) => t.value === form.meeting_type)?.label}\n` +
          `When: ${form.proposed_date} at ${form.proposed_time}\n` +
          `Duration: ${form.duration_minutes} min\n` +
          `Format: ${form.format === "video" ? "Video call" : form.format === "in_person" ? "In person" : "Flexible"}\n` +
          (form.agenda ? `\nAgenda: ${form.agenda}` : ""),
      });

      setSent(true);
    } catch (err) {
      console.error("Meeting request failed:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => { setSent(false); setForm({ meeting_type: "collab_chat", proposed_date: "", proposed_time: "", duration_minutes: "30", format: "video", agenda: "", location: "" }); }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Request a Meeting
          </DialogTitle>
          <DialogDescription>
            Send a meeting request to {toBuilder?.name}. They'll receive a message with the details.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-2xl">📨</p>
            <p className="font-semibold text-sm">Request sent!</p>
            <p className="text-xs text-muted-foreground">
              {toBuilder?.name} will see your request in their messages.
            </p>
            {toBuilder?.calendly_url && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">
                  They also have open availability — book a confirmed slot:
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(toBuilder.calendly_url, "_blank", "noopener,noreferrer")}
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> Open Calendly
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" className="mt-2" onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="meeting-type">Meeting type</Label>
              <Select value={form.meeting_type} onValueChange={(v) => setForm((p) => ({ ...p, meeting_type: v }))}>
                <SelectTrigger id="meeting-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="proposed-date">
                  <Calendar className="w-3 h-3 inline mr-1" />Proposed date
                </Label>
                <Input
                  id="proposed-date"
                  type="date"
                  value={form.proposed_date}
                  onChange={(e) => setForm((p) => ({ ...p, proposed_date: e.target.value }))}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proposed-time">
                  <Clock className="w-3 h-3 inline mr-1" />Time
                </Label>
                <Input
                  id="proposed-time"
                  type="time"
                  value={form.proposed_time}
                  onChange={(e) => setForm((p) => ({ ...p, proposed_time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Select value={form.duration_minutes} onValueChange={(v) => setForm((p) => ({ ...p, duration_minutes: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Format</Label>
                <Select value={form.format} onValueChange={(v) => setForm((p) => ({ ...p, format: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video"><Video className="w-3 h-3 inline mr-1" />Video call</SelectItem>
                    <SelectItem value="in_person"><MapPin className="w-3 h-3 inline mr-1" />In person</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="agenda">Agenda / what you want to discuss</Label>
              <Textarea
                id="agenda"
                placeholder="What would you like to cover? Be specific — it improves response rate."
                className="min-h-[80px] resize-none"
                value={form.agenda}
                onChange={(e) => setForm((p) => ({ ...p, agenda: e.target.value }))}
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={saving || !form.proposed_date || !form.proposed_time}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Request
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
