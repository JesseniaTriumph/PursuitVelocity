import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";

const typeLabels = {
  hackathon: "Hackathon",
  study_session: "Study Session",
  talk: "Talk",
  demo_day: "Demo Day",
  meetup: "Meetup",
  workshop: "Workshop",
};

const typeColors = {
  hackathon: "bg-chart-3/10 text-chart-3",
  study_session: "bg-chart-2/10 text-chart-2",
  talk: "bg-primary/10 text-primary",
  demo_day: "bg-chart-4/10 text-chart-4",
  meetup: "bg-accent/10 text-accent",
  workshop: "bg-chart-5/10 text-chart-5",
};

export default function EventCard({ event }) {
  const eventDate = moment(event.date);
  const isPast = eventDate.isBefore(moment());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        to={`/event/${event.id}`}
        className={`block bg-card border border-border/50 rounded-2xl overflow-hidden transition-shadow hover:shadow-md ${isPast ? "opacity-60" : ""}`}
      >
        {event.image_url && (
          <img src={event.image_url} alt="" className="w-full h-32 object-cover" />
        )}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm flex-1">{event.title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${typeColors[event.event_type] || "bg-muted text-muted-foreground"}`}>
              {typeLabels[event.event_type] || event.event_type}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{eventDate.format("MMM D, YYYY")}</span>
              <Clock className="w-3.5 h-3.5 ml-1" />
              <span>{eventDate.format("h:mm A")}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{event.rsvp_count || 0} attending</span>
            </div>
            <span className="text-xs text-primary font-medium">
              {isPast ? "Past Event" : "RSVP →"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}