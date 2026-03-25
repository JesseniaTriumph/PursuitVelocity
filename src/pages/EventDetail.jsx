import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "../hooks/useCurrentUser";
import moment from "moment";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useCurrentUser();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRSVP, setHasRSVP] = useState(false);
  const [rsvping, setRsvping] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [eventData, rsvps] = await Promise.all([
        base44.entities.Event.filter({ id }),
        user?.email ? base44.entities.RSVP.filter({ event_id: id, user_email: user.email }) : Promise.resolve([]),
      ]);
      setEvent(eventData[0] || null);
      setHasRSVP(rsvps.length > 0);
      setLoading(false);
    };
    load();
  }, [id, user?.email]);

  const handleRSVP = async () => {
    if (!user || rsvping) return;
    setRsvping(true);
    await base44.entities.RSVP.create({
      event_id: id,
      user_email: user.email,
      user_name: user.full_name || "Anonymous",
    });
    const newCount = (event.rsvp_count || 0) + 1;
    await base44.entities.Event.update(id, { rsvp_count: newCount });
    setEvent((prev) => ({ ...prev, rsvp_count: newCount }));
    setHasRSVP(true);
    setRsvping(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const eventDate = moment(event.date);
  const isPast = eventDate.isBefore(moment());

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/events" className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-space font-bold text-lg truncate">{event.title}</h1>
      </div>

      {event.image_url && (
        <img src={event.image_url} alt="" className="w-full rounded-2xl object-cover max-h-48" />
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{eventDate.format("dddd, MMMM D, YYYY")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span>{eventDate.format("h:mm A")}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{event.rsvp_count || 0} attending{event.max_attendees ? ` / ${event.max_attendees} max` : ""}</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Hosted by{" "}
          <Link to={`/profile/${event.host_email}`} className="font-medium text-foreground hover:underline">
            {event.host_name}
          </Link>
        </div>

        {!isPast && !hasRSVP && (
          <Button onClick={handleRSVP} disabled={rsvping} className="w-full rounded-xl">
            {rsvping ? <Loader2 className="w-4 h-4 animate-spin" /> : "RSVP"}
          </Button>
        )}

        {hasRSVP && (
          <div className="flex items-center gap-2 p-4 bg-accent/10 rounded-2xl">
            <CheckCircle className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium">You're attending!</span>
          </div>
        )}
      </div>
    </div>
  );
}