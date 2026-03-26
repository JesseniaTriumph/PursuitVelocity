import { useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Sparkles, Calendar, ChevronRight, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/*
 * Camp Fire — Smart connection suggestions.
 * Shows builders you should meet based on:
 *  - Complementary skills to your projects
 *  - Shared interests / goals
 *  - Similar project stage
 *  - Attending the same events
 *
 * Replace mock data with Base44 entity queries + matching logic.
 */

const MOCK_SUGGESTIONS = [
  {
    id: "1",
    person: { id: "2", name: "Sofia Rivera", initials: "SR", goal: "Build AI infrastructure" },
    matchReasons: [
      { icon: "🤝", text: "Complementary skills — you need ML, she builds ML" },
      { icon: "🔥", text: "Both working on AI tools" },
      { icon: "🎯", text: "Both at similar project stage (in progress)" },
    ],
    sharedSkills: ["Python", "FastAPI"],
    uniqueSkills: ["Machine Learning", "RAG pipelines"],
    matchScore: 94,
    project: "AI Study Buddy",
    calendly_url: "https://calendly.com/sofiar",
  },
  {
    id: "2",
    person: { id: "6", name: "Amara Osei", initials: "AO", goal: "Design-first consumer products" },
    matchReasons: [
      { icon: "🎨", text: "You're building without a designer — she designs and codes" },
      { icon: "🚀", text: "She's shipped a deployed product, you're in progress" },
      { icon: "💡", text: "Shared interest in EdTech UX" },
    ],
    sharedSkills: ["React"],
    uniqueSkills: ["Figma", "UI/UX Design", "Accessibility"],
    matchScore: 88,
    project: "AI Study Buddy",
    calendly_url: "https://calendly.com/amarao",
  },
  {
    id: "3",
    person: { id: "4", name: "Priya Nair", initials: "PN", goal: "Build community tools" },
    matchReasons: [
      { icon: "👥", text: "Both building tools for communities" },
      { icon: "📅", text: "Both attending the Pursuit Demo Day on April 5" },
      { icon: "🧠", text: "Shared interest in low-friction UX" },
    ],
    sharedSkills: ["React", "Python"],
    uniqueSkills: ["Product Management", "Django"],
    matchScore: 79,
    project: "Community Events App",
    calendly_url: "https://calendly.com/priyan",
  },
];

const MOCK_EVENT_MATCHES = [
  {
    event: "Pursuit Demo Day — April 5",
    people: [
      { id: "3", name: "Kai Thompson", initials: "KT" },
      { id: "4", name: "Priya Nair", initials: "PN" },
      { id: "5", name: "Devon Clarke", initials: "DC" },
    ],
  },
  {
    event: "NYC Hackathon — April 12",
    people: [
      { id: "2", name: "Sofia Rivera", initials: "SR" },
      { id: "6", name: "Amara Osei", initials: "AO" },
    ],
  },
];

export default function Campfire() {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    // Replace with re-running the matching algorithm via Base44 edge function
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-6 w-6 text-orange-500" aria-hidden="true" />
            <h1 className="text-2xl font-semibold">Camp Fire</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Builders you should meet — matched by skills, projects, and shared goals.
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

      {/* AI disclaimer */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-primary/20 mb-6 text-sm">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-accent-foreground">
          Suggestions are based on your project needs, shared interests, and activity — not an opaque score. You can always override or dismiss any match.
        </p>
      </div>

      {/* Top suggestions */}
      <section className="space-y-4 mb-8">
        <h2 className="text-sm font-semibold text-caps text-muted-foreground">
          Suggested Connections
        </h2>
        {MOCK_SUGGESTIONS.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </section>

      <Separator className="mb-8" />

      {/* Same-event matches */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-caps text-muted-foreground">
          Attending the Same Events
        </h2>
        {MOCK_EVENT_MATCHES.map((group) => (
          <Card key={group.event}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                <p className="text-sm font-medium">{group.event}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {group.people.map((person) => (
                  <Link
                    key={person.id}
                    to={`/profile/${person.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card hover:border-primary/40 transition-colors text-sm"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px]">{person.initials}</AvatarFallback>
                    </Avatar>
                    {person.name}
                  </Link>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Connect before the event — turn attendance into collaboration.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function MatchCard({ match }) {
  function handleSchedule() {
    if (match.calendly_url) {
      window.open(match.calendly_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Card className="card-interactive">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-sm font-medium">{match.person.initials}</AvatarFallback>
            </Avatar>
            <div>
              <Link
                to={`/profile/${match.person.id}`}
                className="text-sm font-semibold hover:text-primary transition-colors"
              >
                {match.person.name}
              </Link>
              <p className="text-xs text-muted-foreground">{match.person.goal}</p>
            </div>
          </div>
          {/* Match score chip */}
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent border border-primary/20">
            <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
            <span className="text-xs font-semibold text-accent-foreground">{match.matchScore}% match</span>
          </div>
        </div>

        {/* Match reasons */}
        <div className="space-y-1.5 mb-4">
          {match.matchReasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span aria-hidden="true">{reason.icon}</span>
              <span>{reason.text}</span>
            </div>
          ))}
        </div>

        {/* Skills they bring */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1.5">They bring to your project:</p>
          <div className="flex flex-wrap gap-1.5">
            {match.uniqueSkills.map((s) => (
              <Badge key={s} className="text-xs bg-accent text-accent-foreground border-primary/20 hover:bg-accent">
                {s}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-3 border-t">
          <div className="flex gap-2">
            <Link to={`/profile/${match.person.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Profile <ChevronRight className="h-4 w-4 ml-auto" aria-hidden="true" />
              </Button>
            </Link>
            <Link to={`/messages?to=${match.person.email || match.person.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <MessageSquare className="h-4 w-4" aria-hidden="true" /> Message
              </Button>
            </Link>
          </div>
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
