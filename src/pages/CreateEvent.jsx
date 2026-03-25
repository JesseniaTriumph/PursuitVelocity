import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "../hooks/useCurrentUser";

const eventTypes = [
  { id: "hackathon", label: "Hackathon" },
  { id: "study_session", label: "Study Session" },
  { id: "talk", label: "Talk" },
  { id: "demo_day", label: "Demo Day" },
  { id: "meetup", label: "Meetup" },
  { id: "workshop", label: "Workshop" },
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("meetup");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !date || !user) return;
    setSubmitting(true);

    let image_url = null;
    if (imageFile) {
      const result = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = result.file_url;
    }

    await base44.entities.Event.create({
      title: title.trim(),
      description: description.trim(),
      date: new Date(date).toISOString(),
      location: location.trim(),
      event_type: eventType,
      host_name: user.full_name || "Anonymous",
      host_email: user.email,
      image_url,
      max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
      rsvp_count: 0,
    });

    navigate("/events");
  };

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/events" className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-space font-bold text-lg">Host Event</h1>
      </div>

      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event name"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your event..."
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        {/* Image */}
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

        {/* Event Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Event Type</label>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setEventType(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  eventType === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional)"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="number"
          value={maxAttendees}
          onChange={(e) => setMaxAttendees(e.target.value)}
          placeholder="Max attendees (optional)"
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim() || !date || submitting}
          className="w-full rounded-xl"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Event"}
        </Button>
      </div>
    </div>
  );
}