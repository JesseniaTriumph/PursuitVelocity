import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Calendar,
  BookOpen,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import UserAvatar from "../components/UserAvatar";
import BuilderNetworkLinks from "../components/BuilderNetworkLinks";
import MeetingRequestDialog from "../components/MeetingRequestDialog";
import useCurrentUser from "../hooks/useCurrentUser";
import {
  buildBuilderRole,
  fetchBuilderDirectory,
  getBuilderLookbookPath,
  getBuilderProfilePath,
} from "@/lib/builder-directory";

const AVAILABILITY_LABELS = {
  open: { label: "Open to collaborate", color: "bg-green-100 text-green-800" },
  selective: { label: "Selective", color: "bg-yellow-100 text-yellow-800" },
  closed: { label: "Not available", color: "bg-gray-100 text-gray-600" },
};

export default function Builders() {
  const { user } = useCurrentUser();
  const [builders, setBuilders] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [availFilter, setAvailFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;

    const loadBuilders = async () => {
      setLoading(true);

      try {
        const directory = await fetchBuilderDirectory();
        if (!isMounted) {
          return;
        }

        setCurrentUserEmail(directory.currentUserEmail);
        setBuilders(
          directory.builders.filter((builder) => builder.email !== directory.currentUserEmail)
        );
      } catch {
        if (isMounted) {
          setBuilders([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBuilders();

    return () => {
      isMounted = false;
    };
  }, []);

  const allSkills = [...new Set(builders.flatMap((builder) => builder.skills))].sort();

  const filtered = builders.filter((builder) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      builder.name.toLowerCase().includes(query) ||
      builder.bio.toLowerCase().includes(query) ||
      builder.skills.some((skill) => skill.toLowerCase().includes(query)) ||
      builder.goal.toLowerCase().includes(query);
    const matchesSkill = skillFilter === "all" || builder.skills.includes(skillFilter);
    const matchesAvail = availFilter === "all" || builder.availability === availFilter;
    return matchesSearch && matchesSkill && matchesAvail;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Builders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find collaborators by skill, interest, and availability.
        </p>
        {currentUserEmail && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing public builder profiles across the community.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Search by name, skill, or interest..."
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {allSkills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={availFilter} onValueChange={setAvailFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open to collaborate</SelectItem>
            <SelectItem value="selective">Selective</SelectItem>
            <SelectItem value="closed">Not available</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} builders</p>

      {filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground rounded-2xl border bg-card px-4 py-8 text-center">
          No builders matched those filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((builder) => (
            <BuilderCard key={builder.id} builder={builder} currentUser={user} />
          ))}
        </div>
      )}
    </div>
  );
}

function BuilderCard({ builder, currentUser }) {
  const avail = AVAILABILITY_LABELS[builder.availability] || AVAILABILITY_LABELS.selective;
  const profilePath = getBuilderProfilePath(builder);
  const lookbookPath = getBuilderLookbookPath(builder);
  const [meetingOpen, setMeetingOpen] = useState(false);

  function handleSchedule(event) {
    event.preventDefault();
    if (builder.calendly_url) {
      window.open(builder.calendly_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Card className="card-interactive">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <UserAvatar
            name={builder.name}
            src={builder.avatar}
            size={40}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={profilePath}
                className="text-sm font-semibold hover:text-primary transition-colors"
              >
                {builder.name}
              </Link>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", avail.color)}>
                {avail.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {builder.goal}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {builder.bio || `${builder.name} is open to connect and collaborate.`}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {builder.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {builder.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{builder.skills.length - 4}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          {buildBuilderRole(builder)}
        </p>

        {builder.projectTitles.length > 0 && (
          <p className="text-xs text-muted-foreground mb-4">
            Building:{" "}
            {builder.projectTitles.map((project, index) => (
              <span key={project}>
                <span className="text-foreground font-medium">{project}</span>
                {index < builder.projectTitles.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-3 border-t">
          <div className="flex gap-2">
            <Link to={profilePath} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Profile
              </Button>
            </Link>
            <Link to={`/messages?to=${builder.email}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <MessageSquare className="h-4 w-4" aria-hidden="true" /> Message
              </Button>
            </Link>
          </div>
          <Link to={lookbookPath}>
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Open Lookbook
            </Button>
          </Link>
          <BuilderNetworkLinks builder={builder} className="justify-end" />
          {currentUser?.email && (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5"
              onClick={() => setMeetingOpen(true)}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Request Meeting
            </Button>
          )}
          {builder.calendly_url && (
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={handleSchedule}
              aria-label={`Schedule a meeting with ${builder.name}`}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Schedule Meeting
            </Button>
          )}
        </div>
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
