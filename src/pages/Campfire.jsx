import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Sparkles,
  Calendar,
  BookOpen,
  ChevronRight,
  RefreshCw,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import UserAvatar from "../components/UserAvatar";
import useCurrentUser from "../hooks/useCurrentUser";
import {
  clearBuilderDirectoryCache,
  fetchBuilderDirectory,
  getAvailableBuilders,
  getBuilderLookbookPath,
  getBuilderProfilePath,
  rankBuilderMatches,
} from "@/lib/builder-directory";

export default function Campfire() {
  const { user, loading: userLoading } = useCurrentUser();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [availableBuilders, setAvailableBuilders] = useState([]);

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    loadSuggestions();
  }, [user?.email]);

  async function loadSuggestions({ force = false } = {}) {
    setLoading(true);

    try {
      if (force) {
        clearBuilderDirectoryCache();
      }

      const directory = await fetchBuilderDirectory({ force });
      const currentBuilder =
        directory.builders.find((builder) => builder.email === user?.email) ||
        {
          email: user?.email,
          name: user?.full_name || user?.email || "Builder",
          full_name: user?.full_name || user?.email || "Builder",
          avatar: user?.avatar || null,
          skills: user?.skills || [],
          interests: user?.interests || [],
          goals: user?.goals || [],
          looking_for: user?.looking_for || [],
          needs: user?.needs || [],
          activeProject: null,
        };

      setMatches(rankBuilderMatches(currentBuilder, directory.builders, { limit: 4 }));
      setAvailableBuilders(
        getAvailableBuilders(directory.builders, {
          limit: 4,
          excludeEmail: currentBuilder.email,
        })
      );
    } catch {
      setMatches([]);
      setAvailableBuilders([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadSuggestions({ force: true });
    setRefreshing(false);
  }

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-6 w-6 text-orange-500" aria-hidden="true" />
            <h1 className="text-2xl font-semibold">Camp Fire</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Builders you should meet, ranked from your public profile, project needs, and shared interests.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh suggestions"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-primary/20 mb-6 text-sm">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-accent-foreground">
          Suggestions come from the builder directory, active project skills, and what people say they want help with.
        </p>
      </div>

      <section className="space-y-4 mb-8">
        <h2 className="text-sm font-semibold text-caps text-muted-foreground">
          Suggested Connections
        </h2>
        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Add skills, interests, or a current project to improve your matches.
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => <MatchCard key={match.person.id} match={match} />)
        )}
      </section>

      <Separator className="mb-8" />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-caps text-muted-foreground">
          Available to Connect
        </h2>
        {availableBuilders.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              No builders with public meeting availability yet.
            </CardContent>
          </Card>
        ) : (
          availableBuilders.map((builder) => (
            <Card key={builder.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={builder.name}
                    src={builder.avatar}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={getBuilderProfilePath(builder)}
                      className="text-sm font-semibold hover:text-primary transition-colors"
                    >
                      {builder.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {builder.goal}
                    </p>
                  </div>
                  <Link to={`/messages?to=${builder.email}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      Message
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {builder.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Link to={getBuilderLookbookPath(builder)} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full gap-1.5">
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      Lookbook
                    </Button>
                  </Link>
                  {builder.calendly_url && (
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => window.open(builder.calendly_url, "_blank", "noopener,noreferrer")}
                    >
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      Book a Slot
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

function MatchCard({ match }) {
  const profilePath = getBuilderProfilePath(match.person);
  const lookbookPath = getBuilderLookbookPath(match.person);

  function handleSchedule() {
    if (match.calendly_url) {
      window.open(match.calendly_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Card className="card-interactive">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={match.person.name}
              src={match.person.avatar}
              size={40}
            />
            <div>
              <Link
                to={profilePath}
                className="text-sm font-semibold hover:text-primary transition-colors"
              >
                {match.person.name}
              </Link>
              <p className="text-xs text-muted-foreground">{match.person.goal}</p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent border border-primary/20">
            <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
            <span className="text-xs font-semibold text-accent-foreground">
              {match.matchScore}% match
            </span>
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          {match.matchReasons.map((reason, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span aria-hidden="true">{reason.icon}</span>
              <span>{reason.text}</span>
            </div>
          ))}
        </div>

        {match.uniqueSkills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1.5">They bring to your project:</p>
            <div className="flex flex-wrap gap-1.5">
              {match.uniqueSkills.map((skill) => (
                <Badge
                  key={skill}
                  className="text-xs bg-accent text-accent-foreground border-primary/20 hover:bg-accent"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-3 border-t">
          <div className="flex gap-2">
            <Link to={profilePath} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Profile <ChevronRight className="h-4 w-4 ml-auto" aria-hidden="true" />
              </Button>
            </Link>
            <Link to={`/messages?to=${match.person.email}`} className="flex-1">
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
          {match.calendly_url && (
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={handleSchedule}
              aria-label={`Schedule a meeting with ${match.person.name}`}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Schedule Meeting
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
