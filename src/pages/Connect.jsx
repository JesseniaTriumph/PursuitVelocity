import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Video,
  Coffee,
  BookOpen,
  Mic,
  Globe,
  Plus,
  Loader2,
  MessageSquare,
  Users,
} from "lucide-react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "../components/UserAvatar";
import BuilderNetworkLinks from "../components/BuilderNetworkLinks";
import MeetingRequestDialog from "../components/MeetingRequestDialog";
import { cn } from "@/lib/utils";
import useCurrentUser from "../hooks/useCurrentUser";
import {
  buildBuilderRole,
  fetchBuilderDirectory,
  getAvailableBuilders,
  getBuilderProfilePath,
} from "@/lib/builder-directory";

const EVENT_TYPES = {
  hackathon: { label: "Hackathon", icon: Globe, color: "bg-green-100 text-green-700" },
  meetup: { label: "Informal Meetup", icon: Coffee, color: "bg-amber-100 text-amber-700" },
  workshop: { label: "Lecture / Workshop", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  talk: { label: "Talk", icon: Mic, color: "bg-violet-100 text-violet-700" },
  demo_day: { label: "Demo Day", icon: Calendar, color: "bg-fuchsia-100 text-fuchsia-700" },
  study_session: { label: "Study Session", icon: Video, color: "bg-teal-100 text-teal-700" },
};

const FILTER_TYPES = ["All", ...Object.keys(EVENT_TYPES)];

export default function Connect() {
  const { user } = useCurrentUser();
  const [activeFilter, setActiveFilter] = useState("All");
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [openMeetings, setOpenMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyEventId, setBusyEventId] = useState(null);

  useEffect(() => {
    loadData();
  }, [user?.email]);

  async function loadData() {
    setLoading(true);

    try {
      const requests = [
        base44.entities.Event.list("-date", 100),
        fetchBuilderDirectory(),
      ];

      if (user?.email) {
        requests.push(base44.entities.RSVP.filter({ user_email: user.email }));
      }

      const [eventRows, directory, userRsvps = []] = await Promise.all(requests);
      const sortedEvents = [...eventRows].sort((a, b) => {
        const aTime = a.date ? Date.parse(a.date) : 0;
        const bTime = b.date ? Date.parse(b.date) : 0;
        return aTime - bTime;
      });

      setEvents(sortedEvents);
      setRsvps(userRsvps);
      setOpenMeetings(
        getAvailableBuilders(directory.builders, {
          limit: 6,
          excludeEmail: user?.email,
        })
      );
    } catch {
      setEvents([]);
      setRsvps([]);
      setOpenMeetings([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRsvp(eventId) {
    if (!user?.email || busyEventId) return;

    const existing = rsvps.find((rsvp) => rsvp.event_id === eventId);
    const currentEvent = events.find((event) => event.id === eventId);
    const currentCount = currentEvent?.rsvp_count || 0;

    // Optimistic update — reflect change immediately in UI
    if (existing) {
      setRsvps((prev) => prev.filter((rsvp) => rsvp.id !== existing.id));
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, rsvp_count: Math.max(0, (event.rsvp_count || 0) - 1) }
            : event
        )
      );
    } else {
      const optimisticRsvp = { id: `optimistic-${eventId}`, event_id: eventId, user_email: user.email };
      setRsvps((prev) => [...prev, optimisticRsvp]);
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, rsvp_count: (event.rsvp_count || 0) + 1 }
            : event
        )
      );
    }

    setBusyEventId(eventId);
    try {
      if (existing) {
        await base44.entities.RSVP.delete(existing.id);
        await base44.entities.Event.update(eventId, { rsvp_count: Math.max(0, currentCount - 1) });
      } else {
        const created = await base44.entities.RSVP.create({
          event_id: eventId,
          user_email: user.email,
          user_name: user.full_name || "Anonymous",
        });
        await base44.entities.Event.update(eventId, { rsvp_count: currentCount + 1 });
        // Replace optimistic record with real one
        setRsvps((prev) =>
          prev.map((rsvp) => (rsvp.id === `optimistic-${eventId}` ? created : rsvp))
        );
      }
    } catch {
      // Rollback on failure
      if (existing) {
        setRsvps((prev) => [...prev, existing]);
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId
              ? { ...event, rsvp_count: currentCount }
              : event
          )
        );
      } else {
        setRsvps((prev) => prev.filter((rsvp) => rsvp.id !== `optimistic-${eventId}`));
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId
              ? { ...event, rsvp_count: currentCount }
              : event
          )
        );
      }
    } finally {
      setBusyEventId(null);
    }
  }

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => activeFilter === "All" || event.event_type === activeFilter),
    [events, activeFilter]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space font-bold text-xl">Connect</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live events, meetups, and public office hours from the community
          </p>
        </div>
        <Link to="/create-event">
          <Button size="sm" className="rounded-xl gap-1.5">
            <Plus className="w-4 h-4" /> Add Event
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {FILTER_TYPES.map((type) => {
          const config = EVENT_TYPES[type];
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={cn(
                "shrink-0 px-3 py-2.5 min-h-[44px] flex items-center rounded-full text-xs font-medium transition-colors",
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

      <section className="space-y-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Upcoming Events
        </h2>
        {filteredEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No events of this type yet.
          </p>
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              hasRsvp={rsvps.some((rsvp) => rsvp.event_id === event.id)}
              onRsvp={toggleRsvp}
              busy={busyEventId === event.id}
            />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Open Office Hours
        </h2>
        {openMeetings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No public meeting slots yet.
          </p>
        ) : (
          openMeetings.map((builder) => (
            <OpenMeetingCard key={builder.id} builder={builder} currentUser={user} />
          ))
        )}
      </section>
    </div>
  );
}

function EventCard({ event, hasRsvp, onRsvp, busy }) {
  const type = EVENT_TYPES[event.event_type] || EVENT_TYPES.meetup;
  const TypeIcon = type.icon;
  const eventDate = moment(event.date);
  const isVirtual = !event.location;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  type.color
                )}
              >
                <TypeIcon className="w-3 h-3" aria-hidden="true" />
                {type.label}
              </span>
              {isVirtual && (
                <span className="text-[10px] text-muted-foreground font-medium">Virtual</span>
              )}
            </div>
            <Link to={`/event/${event.id}`} className="font-semibold text-sm leading-snug hover:text-primary transition-colors">
              {event.title}
            </Link>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {eventDate.isValid() ? eventDate.format("dddd, MMM D") : "Date TBD"}
            {eventDate.isValid() && (
              <span className="text-muted-foreground/60">· {eventDate.format("h:mm A")}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isVirtual ? (
              <Video className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            )}
            {event.location || "Online / location TBD"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {event.rsvp_count || 0} going
            {event.max_attendees ? ` · ${event.max_attendees} max` : ""}
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {event.description}
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={hasRsvp ? "outline" : "default"}
            className="flex-1 rounded-xl gap-1.5"
            onClick={() => onRsvp(event.id)}
            aria-pressed={hasRsvp}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {hasRsvp ? "Cancel RSVP" : "RSVP"}
          </Button>
          <Link to={`/event/${event.id}`}>
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function OpenMeetingCard({ builder, currentUser }) {
  const profilePath = getBuilderProfilePath(builder);
  const [meetingOpen, setMeetingOpen] = useState(false);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar
            name={builder.name}
            src={builder.avatar}
            size={40}
          />
          <div className="flex-1 min-w-0">
            <Link
              to={profilePath}
              className="font-semibold text-sm hover:text-primary transition-colors"
            >
              {builder.name}
            </Link>
            <p className="text-xs text-muted-foreground">{buildBuilderRole(builder)}</p>
          </div>
        </div>

        <p className="text-xs text-foreground/80 leading-relaxed mb-3">
          {builder.goal}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {builder.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium"
            >
              <Clock className="w-3 h-3" aria-hidden="true" /> {skill}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Link to={`/messages?to=${builder.email}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full rounded-xl gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              Message
            </Button>
          </Link>
          {builder.calendly_url && (
            <Button
              size="sm"
              className="flex-1 rounded-xl gap-1.5"
              onClick={() => window.open(builder.calendly_url, "_blank", "noopener,noreferrer")}
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              Book a Slot
            </Button>
          )}
        </div>
        <BuilderNetworkLinks builder={builder} className="mt-3" />
        {currentUser?.email && (
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-xl gap-1.5 mt-3"
            onClick={() => setMeetingOpen(true)}
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            Request Meeting
          </Button>
        )}
      </CardContent>
      <MeetingRequestDialog
        open={meetingOpen}
        onOpenChange={setMeetingOpen}
        fromUser={currentUser}
        toBuilder={builder}
      />
    </Card>
  );
}
