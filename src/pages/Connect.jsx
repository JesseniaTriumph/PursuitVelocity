import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Users, Clock, MapPin, ExternalLink,
  Video, Coffee, BookOpen, Mic, Globe, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "../components/UserAvatar";
import { cn } from "@/lib/utils";

/*
 * Connect — community calendar + open meeting slots.
 *
 * Shows upcoming events (labeled by type) and builders who have
 * open Calendly / office-hours slots available.
 *
 * Replace MOCK_* with Base44 entity queries.
 */

const EVENT_TYPES = {
  conference: { label: "Conference", icon: Mic, color: "bg-violet-100 text-violet-700" },
  meetup: { label: "Informal Meetup", icon: Coffee, color: "bg-amber-100 text-amber-700" },
  lecture: { label: "Lecture / Workshop", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  virtual: { label: "Virtual Session", icon: Video, color: "bg-teal-100 text-teal-700" },
  hackathon: { label: "Hackathon", icon: Globe, color: "bg-green-100 text-green-700" },
};

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Pursuit Demo Day",
    type: "conference",
    date: "April 5, 2025",
    time: "2:00 PM – 6:00 PM",
    location: "47-10 Austell Place, Long Island City",
    virtual: false,
    description: "Fellows present their projects to industry guests, recruiters, and the Pursuit community. Bring your best build.",
    rsvp_count: 34,
    attendees: [
      { name: "Marcus Johnson" },
      { name: "Sofia Rivera" },
      { name: "Kai Thompson" },
      { name: "Priya Nair" },
    ],
    rsvped: true,
  },
  {
    id: "2",
    title: "NYC AI Builders Hackathon",
    type: "hackathon",
    date: "April 12–13, 2025",
    time: "9:00 AM – 9:00 PM",
    location: "TechHub NYC, 335 Madison Ave",
    virtual: false,
    description: "48-hour hackathon focused on AI tooling. Prizes for best EdTech and Social Impact projects. Teams of 2–4.",
    rsvp_count: 18,
    attendees: [
      { name: "Sofia Rivera" },
      { name: "Amara Osei" },
    ],
    rsvped: false,
  },
  {
    id: "3",
    title: "React Advanced Patterns — Live Workshop",
    type: "lecture",
    date: "April 18, 2025",
    time: "6:30 PM – 8:30 PM",
    location: null,
    virtual: true,
    link: "https://zoom.us",
    description: "Deep dive into compound components, render props, and custom hooks. Taught by a senior engineer from Vercel.",
    rsvp_count: 52,
    attendees: [
      { name: "Kai Thompson" },
      { name: "Devon Clarke" },
    ],
    rsvped: false,
  },
  {
    id: "4",
    title: "Friday Fellows Coffee Chat",
    type: "meetup",
    date: "Every Friday",
    time: "10:00 AM – 11:00 AM",
    location: null,
    virtual: true,
    link: "https://zoom.us",
    description: "A low-key weekly check-in. Share what you're building, get unblocked, swap feedback. No agenda, just builders talking.",
    rsvp_count: 12,
    attendees: [
      { name: "Priya Nair" },
      { name: "Marcus Johnson" },
      { name: "Amara Osei" },
    ],
    rsvped: true,
  },
];

const MOCK_OPEN_MEETINGS = [
  {
    id: "1",
    person: { name: "Marcus Johnson", role: "Full-Stack · AI/ML", email: "marcus@fellowship.app" },
    slots: ["Mon 3–4 PM", "Wed 12–1 PM", "Fri 2–3 PM"],
    topic: "Office hours — React, FastAPI, OpenAI integration",
    calendly_url: "https://calendly.com/marcusj",
  },
  {
    id: "2",
    person: { name: "Sofia Rivera", role: "ML Engineer · Backend", email: "sofia@fellowship.app" },
    slots: ["Tue 11 AM–12 PM", "Thu 4–5 PM"],
    topic: "Pair programming — RAG pipelines, vector DBs",
    calendly_url: "https://calendly.com/sofiar",
  },
  {
    id: "3",
    person: { name: "Amara Osei", role: "UI/UX · Frontend", email: "amara@fellowship.app" },
    slots: ["Mon 1–2 PM", "Thu 3–4 PM"],
    topic: "Design critiques — Figma to code, accessibility reviews",
    calendly_url: "https://calendly.com/amarao",
  },
];

const FILTER_TYPES = ["All", ...Object.keys(EVENT_TYPES)];

export default function Connect() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [events, setEvents] = useState(MOCK_EVENTS);

  const filtered = events.filter((e) =>
    activeFilter === "All" || e.type === activeFilter
  );

  function toggleRsvp(id) {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, rsvped: !e.rsvped, rsvp_count: e.rsvped ? e.rsvp_count - 1 : e.rsvp_count + 1 }
          : e
      )
    );
  }

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space font-bold text-xl">Connect</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Events, meetups & open office hours</p>
        </div>
        <Button size="sm" className="rounded-xl gap-1.5">
          <Plus className="w-4 h-4" /> Add Event
        </Button>
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {FILTER_TYPES.map((type) => {
          const config = EVENT_TYPES[type];
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                activeFilter === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {config ? config.label : "All"}
            </button>
          );
        })}
      </div>

      {/* Events */}
      <section className="space-y-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Upcoming Events
        </h2>
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} onRsvp={toggleRsvp} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No events of this type yet.</p>
        )}
      </section>

      {/* Open meeting slots */}
      <section className="space-y-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Open Office Hours
        </h2>
        {MOCK_OPEN_MEETINGS.map((slot) => (
          <OpenMeetingCard key={slot.id} slot={slot} />
        ))}
      </section>
    </div>
  );
}

function EventCard({ event, onRsvp }) {
  const type = EVENT_TYPES[event.type] || EVENT_TYPES.meetup;
  const TypeIcon = type.icon;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Type badge + title */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", type.color)}>
                <TypeIcon className="w-3 h-3" aria-hidden="true" />
                {type.label}
              </span>
              {event.virtual && (
                <span className="text-[10px] text-muted-foreground font-medium">Virtual</span>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-snug">{event.title}</h3>
          </div>
        </div>

        {/* Date / time / location */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {event.date}
            {event.time && <span className="text-muted-foreground/60">· {event.time}</span>}
          </div>
          {(event.location || event.virtual) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {event.virtual ? (
                <Video className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              {event.location || "Online"}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{event.description}</p>

        {/* Attendee avatars */}
        {event.attendees?.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex -space-x-1.5">
              {event.attendees.slice(0, 4).map((a, i) => (
                <UserAvatar key={i} name={a.name} size={24} className="border-2 border-background" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {event.rsvp_count} going
              {event.attendees.length > 4 && ` · +${event.attendees.length - 4} fellows`}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={event.rsvped ? "outline" : "default"}
            className="flex-1 rounded-xl gap-1.5"
            onClick={() => onRsvp(event.id)}
            aria-pressed={event.rsvped}
          >
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            {event.rsvped ? "Cancel RSVP" : "RSVP"}
          </Button>
          {event.virtual && event.link && (
            <a href={event.link} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="rounded-xl gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                Join
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OpenMeetingCard({ slot }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar name={slot.person.name} size={40} />
          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${slot.person.email}`}
              className="font-semibold text-sm hover:text-primary transition-colors"
            >
              {slot.person.name}
            </Link>
            <p className="text-xs text-muted-foreground">{slot.person.role}</p>
          </div>
        </div>

        <p className="text-xs text-foreground/80 leading-relaxed mb-3">{slot.topic}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {slot.slots.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
              <Clock className="w-3 h-3" aria-hidden="true" /> {s}
            </span>
          ))}
        </div>

        <Button
          size="sm"
          className="w-full rounded-xl gap-1.5"
          onClick={() => window.open(slot.calendly_url, "_blank", "noopener,noreferrer")}
        >
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          Book a Slot
        </Button>
      </CardContent>
    </Card>
  );
}
