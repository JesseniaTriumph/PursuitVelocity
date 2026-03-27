import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Github,
  Linkedin,
  Globe,
  Calendar,
  Twitter,
  Instagram,
  Video,
  FileText,
  Download,
  ExternalLink,
  ArrowLeft,
  Share2,
  MessageSquare,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, truncate } from "@/lib/utils";
import UserAvatar from "../components/UserAvatar";
import PersonaInsightsPanel from "../components/PersonaInsightsPanel";
import useCurrentUser from "../hooks/useCurrentUser";
import {
  fetchBuilderDirectory,
  findBuilderByIdentifier,
  getBuilderLookbookPath,
  getBuilderProfilePath,
} from "@/lib/builder-directory";
import {
  fetchBuilderInsight,
  loadBuilderActivity,
  shouldAnalyzeBuilder,
} from "@/lib/persona-intelligence";

const SOCIAL_DISPLAY = [
  { key: "linkedin_url", label: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]" },
  { key: "github_url", label: "GitHub", icon: Github, color: "text-foreground" },
  { key: "x_url", label: "X", icon: Twitter, color: "text-foreground" },
  { key: "instagram_url", label: "Instagram", icon: Instagram, color: "text-[#E4405F]" },
  { key: "tiktok_url", label: "TikTok", icon: Video, color: "text-foreground" },
  { key: "portfolio_url", label: "Portfolio", icon: Globe, color: "text-primary" },
];

const TYPE_COLORS = {
  update: "bg-blue-100 text-blue-800",
  progress: "bg-primary/10 text-primary",
  milestone: "bg-green-100 text-green-800",
  question: "bg-amber-100 text-amber-800",
  tutorial: "bg-purple-100 text-purple-800",
};

const STATUS_LABELS = {
  looking_for_team: "Recruiting",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_COLORS = {
  looking_for_team: "bg-primary/10 text-primary",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-muted text-muted-foreground",
};

export default function Lookbook() {
  const { id } = useParams();

  if (!id) {
    return <LookbookDirectory />;
  }

  return <LookbookProfile id={id} />;
}

function LookbookDirectory() {
  const [loading, setLoading] = useState(true);
  const [builders, setBuilders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const directory = await fetchBuilderDirectory();
        if (!isMounted) {
          return;
        }
        setBuilders(directory.builders);
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

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBuilders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return builders.filter((builder) => {
      if (!query) return true;
      return (
        builder.name.toLowerCase().includes(query) ||
        builder.bio.toLowerCase().includes(query) ||
        builder.skills.some((skill) => skill.toLowerCase().includes(query)) ||
        builder.goal.toLowerCase().includes(query)
      );
    });
  }, [builders, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <div className="space-y-3">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            Velocity Lookbook
          </Badge>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Explore the builders behind the work
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse public builder pages, current projects, social links, and multi-source AI persona insights.
          </p>
        </div>

        <div className="rounded-2xl border bg-card px-4 py-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, skill, or focus..."
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBuilders.map((builder) => (
            <Card key={builder.id} className="card-interactive">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <UserAvatar
                    name={builder.name}
                    src={builder.avatar}
                    size={56}
                    className="rounded-2xl"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={getBuilderLookbookPath(builder)}
                      className="text-lg font-semibold hover:text-primary transition-colors"
                    >
                      {builder.name}
                    </Link>
                    <p className="text-sm text-primary mt-1">{builder.goal}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {builder.bio || `${builder.name} is building in public with Velocity.`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {builder.skills.slice(0, 5).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Link to={getBuilderLookbookPath(builder)} className="flex-1">
                    <Button className="w-full">Open Lookbook</Button>
                  </Link>
                  <Link to={getBuilderProfilePath(builder)} className="flex-1">
                    <Button variant="outline" className="w-full">Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function LookbookProfile({ id }) {
  const { user: currentUser } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadLookbook = async () => {
      setLoading(true);

      try {
        const directory = await fetchBuilderDirectory();
        const builder = findBuilderByIdentifier(directory.builders, id);
        const targetEmail = builder?.email || (id?.includes("@") ? id : null);

        if (!targetEmail) {
          if (isMounted) {
            setProfile(null);
            setProjects([]);
            setUpdates([]);
            setInsight(null);
            setLoading(false);
          }
          return;
        }

        const activity = await loadBuilderActivity(targetEmail);

        if (!isMounted) {
          return;
        }

        const resolvedProfile =
          builder || {
            id: targetEmail,
            email: targetEmail,
            name: targetEmail,
            full_name: targetEmail,
            bio: "",
            skills: [],
            goal: "Builder",
            workTypes: [],
            cohort: null,
            github_url: null,
            linkedin_url: null,
            x_url: null,
            instagram_url: null,
            tiktok_url: null,
            portfolio_url: null,
            resume_url: null,
            calendly_url: null,
          };

        setProfile(resolvedProfile);
        setProjects(activity.projects);
        setUpdates(activity.posts.filter((post) => post.post_type !== "tutorial").slice(0, 5));
        setLoading(false);

        if (shouldAnalyzeBuilder(resolvedProfile, activity)) {
          setInsightLoading(true);
          try {
            const result = await fetchBuilderInsight(resolvedProfile, activity);
            if (isMounted) {
              setInsight(result);
            }
          } catch {
            if (isMounted) {
              setInsight(null);
            }
          } finally {
            if (isMounted) {
              setInsightLoading(false);
            }
          }
        } else {
          setInsight(null);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
          setProjects([]);
          setUpdates([]);
          setInsight(null);
          setLoading(false);
        }
      }
    };

    loadLookbook();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground">Lookbook not found</p>
      </div>
    );
  }

  const activeProjects = projects.filter(
    (project) => project.status === "looking_for_team" || project.status === "in_progress"
  );
  const completedProjects = projects.filter((project) => project.status === "completed");
  const isOwnLookbook = Boolean(currentUser?.email && currentUser.email === profile.email);

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: `${profile.name} — Builder Lookbook`, url: window.location.href });
      return;
    }

    navigator.clipboard.writeText(window.location.href);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b px-4 md:px-8 flex items-center justify-between h-14">
        <Link
          to="/lookbook"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to lookbook
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} aria-label="Share this lookbook">
            <Share2 className="h-4 w-4" aria-hidden="true" /> Share
          </Button>
          {profile.calendly_url && (
            <Button
              size="sm"
              onClick={() => window.open(profile.calendly_url, "_blank", "noopener,noreferrer")}
              aria-label={`Schedule a meeting with ${profile.name}`}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" /> Schedule
            </Button>
          )}
          <Link to={`/messages?to=${profile.email}`}>
            <Button size="sm" variant="outline" aria-label={`Message ${profile.name}`}>
              <MessageSquare className="h-4 w-4" aria-hidden="true" /> Message
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-10">
        <section className="flex items-start gap-5">
          <UserAvatar
            name={profile.name}
            src={profile.avatar}
            size={80}
            className="rounded-3xl"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold">{profile.name}</h1>
              {profile.cohort && (
                <Badge variant="outline" className="text-xs">
                  {profile.cohort}
                </Badge>
              )}
            </div>
            <p className="text-base text-primary font-medium mt-1">{profile.goal}</p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-lg">
              {profile.bio || `${profile.name} is part of the builder community.`}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {SOCIAL_DISPLAY.filter(({ key }) => profile[key]).map(({ key, label, icon: Icon, color }) => (
                <a
                  key={key}
                  href={profile[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${profile.name}'s ${label} — opens in new tab`}
                >
                  <Button variant="outline" size="sm" className="gap-2 h-9">
                    <Icon className={cn("h-4 w-4", color)} aria-hidden="true" />
                    {label}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                  </Button>
                </a>
              ))}
              {profile.resume_url && (
                <a href={profile.resume_url} download aria-label="Download resume">
                  <Button variant="outline" size="sm" className="gap-2 h-9">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Resume
                    <Download className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                  </Button>
                </a>
              )}
              <Link to={getBuilderProfilePath(profile)}>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {(insightLoading || insight?.analysis) && (
          <>
            <Separator />
            <PersonaInsightsPanel
              insight={insight}
              loading={insightLoading}
              showPlanning={isOwnLookbook}
            />
          </>
        )}

        <Separator />

        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-sm px-3 py-1 rounded-full">
                {skill}
              </Badge>
            ))}
          </div>
          {profile.workTypes?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.workTypes.map((type) => (
                <Badge key={type} variant="outline" className="text-xs rounded-full">
                  {type}
                </Badge>
              ))}
            </div>
          )}
        </section>

        <Separator />

        {activeProjects.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Active Projects
            </h2>
            <div className="space-y-3">
              {activeProjects.map((project) => (
                <LookbookProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {completedProjects.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Completed Projects
            </h2>
            <div className="space-y-3">
              {completedProjects.map((project) => (
                <LookbookProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {updates.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Recent Updates
              </h2>
              <div className="space-y-3">
                {updates.map((update) => (
                  <Card key={update.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          {update.created_date
                            ? new Date(update.created_date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })
                            : "Recent update"}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            TYPE_COLORS[update.post_type || "update"] || TYPE_COLORS.update
                          )}
                        >
                          {update.post_type || "update"}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {truncate(update.content, 260)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        <Separator />

        <section className="text-center space-y-3 py-4">
          <p className="text-muted-foreground text-sm">
            Want to collaborate or connect with {profile.name}?
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {profile.calendly_url && (
              <Button
                onClick={() => window.open(profile.calendly_url, "_blank", "noopener,noreferrer")}
                aria-label={`Schedule meeting with ${profile.name}`}
              >
                <Calendar className="h-4 w-4" aria-hidden="true" /> Schedule Meeting
              </Button>
            )}
            <Link to={`/messages?to=${profile.email}`}>
              <Button variant="outline" aria-label={`Send ${profile.name} a message`}>
                <MessageSquare className="h-4 w-4" aria-hidden="true" /> Send a Message
              </Button>
            </Link>
            <Link to="/campfire">
              <Button variant="outline" aria-label="See who else you might connect with">
                <Zap className="h-4 w-4" aria-hidden="true" /> Find More Builders
              </Button>
            </Link>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Member of the <span className="font-medium text-primary">Velocity</span> community
        </p>
      </div>
    </div>
  );
}

function LookbookProjectCard({ project }) {
  return (
    <Card className="card-interactive">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/project/${project.id}`} className="text-sm font-semibold hover:text-primary transition-colors">
                {project.title}
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Project owner</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium",
                STATUS_COLORS[project.status] || "bg-muted text-muted-foreground"
              )}
            >
              {STATUS_LABELS[project.status] || project.status}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {project.description}
        </p>
        {project.skills_needed?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.skills_needed.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
