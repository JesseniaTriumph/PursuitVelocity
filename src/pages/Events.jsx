import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import { Calendar, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import moment from "moment";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.Event.list("-date", 50);
      setEvents(data);
      setLoading(false);
    };
    load();
  }, []);

  const filters = [
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
    { id: "all", label: "All" },
  ];

  const now = moment();
  const filteredEvents = events.filter((e) => {
    if (filter === "upcoming") return moment(e.date).isAfter(now);
    if (filter === "past") return moment(e.date).isBefore(now);
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space font-bold text-xl">Events</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Hackathons, talks & more</p>
        </div>
        <Link to="/create-event">
          <Button size="sm" className="rounded-xl gap-1.5">
            <Plus className="w-4 h-4" />
            Host
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events"
          description={filter === "upcoming" ? "No upcoming events. Host one!" : "No events found."}
          action={
            <Link to="/create-event">
              <Button size="sm" className="rounded-xl">Host Event</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}