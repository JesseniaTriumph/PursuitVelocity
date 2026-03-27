import {
  Sparkles,
  Loader2,
  Briefcase,
  Users,
  Layers3,
  Lightbulb,
  CalendarDays,
  Code2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function InsightList({ title, icon: Icon, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="text-sm text-muted-foreground leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function PersonaInsightsPanel({
  insight,
  loading,
  showPlanning = false,
  className,
}) {
  const analysis = insight?.analysis;
  const sourceLabels = (insight?.sources || [])
    .filter((source) => source?.status === "ok")
    .map((source) => source.source);
  const repoHighlights = insight?.github?.repos || [];

  if (!loading && !analysis) {
    return null;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          AI Persona Intelligence
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing public builds, posts, projects, links, and upcoming activity...
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm leading-relaxed text-foreground/90">
                {analysis.summary}
              </p>

              {analysis.strengths?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.strengths.map((strength) => (
                    <Badge key={strength} variant="secondary" className="text-xs">
                      {strength}
                    </Badge>
                  ))}
                </div>
              )}

              {analysis.project_focus?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.project_focus.map((focus) => (
                    <Badge key={focus} variant="outline" className="text-xs">
                      {focus}
                    </Badge>
                  ))}
                </div>
              )}

              {sourceLabels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sourceLabels.map((label) => (
                    <Badge key={label} variant="outline" className="text-[11px]">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.career_positioning && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Career Read</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.career_positioning}
                  </p>
                </CardContent>
              </Card>
            )}

            {analysis.collaboration_pitch && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Co-Work Fit</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.collaboration_pitch}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InsightList
              title="Breadth Signals"
              icon={Layers3}
              items={analysis.breadth_signals}
            />
            <InsightList
              title="Experience Signals"
              icon={Briefcase}
              items={analysis.experience_signals}
            />
          </div>

          <InsightList
            title="How Peers Can Support"
            icon={Users}
            items={analysis.support_opportunities}
          />

          {repoHighlights.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {repoHighlights.slice(0, 4).map((repo) => (
                <Card key={repo.url} className="card-interactive">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-sm hover:text-primary transition-colors"
                        >
                          {repo.name}
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          {repo.description || "Public GitHub repository"}
                        </p>
                      </div>
                      {repo.language && (
                        <Badge variant="outline" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                    </div>
                    {repo.languages?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {repo.languages.slice(0, 4).map((language) => (
                          <Badge key={`${repo.name}-${language}`} variant="secondary" className="text-[11px]">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {repo.readme_excerpt && (
                      <div className="flex items-start gap-2 rounded-xl bg-muted/60 p-3">
                        <Code2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {repo.readme_excerpt}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {showPlanning && analysis.optimization_recommendations?.length > 0 && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Optimization Suggestions</h3>
                </div>
                <div className="space-y-3">
                  {analysis.optimization_recommendations.map((recommendation) => (
                    <div key={recommendation.title} className="rounded-2xl border bg-muted/30 p-4">
                      <p className="text-sm font-medium">{recommendation.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {recommendation.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {showPlanning && analysis.content_calendar?.length > 0 && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Suggested Content Calendar</h3>
                </div>
                <div className="space-y-3">
                  {analysis.content_calendar.map((item) => (
                    <div key={`${item.timing}-${item.topic}`} className="rounded-2xl border bg-muted/30 p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className="text-[11px]">
                          {item.timing}
                        </Badge>
                        <Badge variant="secondary" className="text-[11px]">
                          {item.channel}
                        </Badge>
                        <Badge variant="secondary" className="text-[11px]">
                          {item.format}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{item.topic}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {item.rationale}
                      </p>
                      <p className="text-xs text-primary mt-2">
                        CTA: {item.call_to_action}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {showPlanning && analysis.profile_gaps?.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-sm font-semibold">Profile Gaps To Close</h3>
                <ul className="space-y-2">
                  {analysis.profile_gaps.map((gap) => (
                    <li key={gap} className="text-sm text-muted-foreground leading-relaxed">
                      {gap}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </section>
  );
}
