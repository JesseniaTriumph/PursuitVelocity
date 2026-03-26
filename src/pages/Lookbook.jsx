import { useParams, Link } from "react-router-dom";
import {
  Github, Linkedin, Globe, Calendar, Twitter,
  FileText, Download, ExternalLink, ArrowLeft,
  Share2, MessageSquare, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";

/*
 * Lookbook — public shareable portfolio page for each fellow.
 *
 * Designed to be shared with recruiters, potential collaborators,
 * and the Pursuit community. Clean, single-scroll layout.
 *
 * Replace MOCK_* with Base44 entity queries.
 */

const MOCK_PROFILES = {
  "1": {
    id: "1", name: "Marcus Johnson", initials: "MJ",
    bio: "Full-stack engineer building AI-powered learning tools. 2 years at Pursuit. Previously customer support engineer. Passionate about EdTech and accessible software.",
    skills: ["React", "Python", "OpenAI", "FastAPI", "PostgreSQL", "TypeScript"],
    interests: ["EdTech", "AI/ML", "Developer Tools"],
    workTypes: ["Frontend", "Backend", "AI/ML"],
    goal: "Build AI tools that help people learn more efficiently",
    cohort: "Pursuit Fellowship 2024",
    github_url: "https://github.com/marcusj",
    linkedin_url: "https://linkedin.com/in/marcusj",
    portfolio_url: "https://marcusjohnson.dev",
    x_url: "https://x.com/marcusbuilds",
    calendly_url: "https://calendly.com/marcusj",
    resume_url: null,
  },
  "2": {
    id: "2", name: "Sofia Rivera", initials: "SR",
    bio: "ML engineer passionate about making AI accessible. Exploring RAG pipelines and vector databases for production use.",
    skills: ["Python", "Machine Learning", "FastAPI", "Supabase", "TypeScript"],
    interests: ["AI/ML", "EdTech"], workTypes: ["Backend", "AI/ML", "Data Science"],
    goal: "Build AI infrastructure that non-engineers can use",
    cohort: "Pursuit Fellowship 2024",
    github_url: "https://github.com/sofiar", linkedin_url: "https://linkedin.com/in/sofiar",
    portfolio_url: null, x_url: null, calendly_url: "https://calendly.com/sofiar", resume_url: null,
  },
  "3": {
    id: "3", name: "Kai Thompson", initials: "KT",
    bio: "Frontend engineer who loves design systems and clean UX. TypeScript advocate.",
    skills: ["React", "TypeScript", "Node.js", "Figma", "CSS"],
    interests: ["Design Systems", "SaaS"], workTypes: ["Frontend", "UI/UX Design"],
    goal: "Ship polished SaaS products",
    cohort: "Pursuit Fellowship 2023",
    github_url: null, linkedin_url: "https://linkedin.com/in/kait",
    portfolio_url: null, x_url: null, calendly_url: null, resume_url: null,
  },
  "4": {
    id: "4", name: "Priya Nair", initials: "PN",
    bio: "Product-minded engineer. Obsessed with reducing friction for non-technical users.",
    skills: ["React", "Django", "Python", "Product Management"],
    interests: ["Community Tools", "Product"], workTypes: ["Frontend", "Product Management"],
    goal: "Build community tools that scale",
    cohort: "Pursuit Fellowship 2024",
    github_url: "https://github.com/priyan", linkedin_url: "https://linkedin.com/in/priyan",
    portfolio_url: null, x_url: null, calendly_url: "https://calendly.com/priyan", resume_url: null,
  },
  "6": {
    id: "6", name: "Amara Osei", initials: "AO",
    bio: "Designer-developer hybrid. Figma to code with zero friction. Accessibility advocate.",
    skills: ["UI/UX Design", "Figma", "React", "CSS", "Accessibility"],
    interests: ["Consumer Products", "Accessibility"], workTypes: ["UI/UX Design", "Frontend"],
    goal: "Design-first consumer products",
    cohort: "Pursuit Fellowship 2024",
    github_url: null, linkedin_url: "https://linkedin.com/in/amarao",
    portfolio_url: "https://amaraosei.design", x_url: null,
    calendly_url: "https://calendly.com/amarao", resume_url: null,
  },
};

const MOCK_PROJECTS = {
  "1": [
    {
      id: "1", title: "AI Study Buddy", status: "in_progress", role: "Owner",
      summary: "AI-powered study assistant that generates custom quizzes from any topic.",
      skills: ["React", "OpenAI", "FastAPI"],
    },
    {
      id: "2", title: "Community Events App", status: "idea", role: "Owner",
      summary: "Helping Pursuit fellows discover local tech events, hackathons, and meetups.",
      skills: ["React", "TypeScript"],
    },
  ],
  "2": [
    {
      id: "1", title: "AI Study Buddy", status: "in_progress", role: "ML Engineer",
      summary: "Built the RAG pipeline and FastAPI backend for quiz generation.",
      skills: ["Python", "FastAPI", "Machine Learning"],
    },
  ],
  "6": [
    {
      id: "3", title: "MoodTrack", status: "deployed", role: "Owner",
      summary: "Mental wellness journaling app with mood analytics and pattern insights.",
      skills: ["React", "Supabase", "Figma"],
      deploy_url: "https://moodtrack.app",
    },
  ],
};

const MOCK_UPDATES = {
  "1": [
    { id: "1", project: "AI Study Buddy", content: "Shipped the quiz generator. Users can now input any topic and get 10 custom questions instantly.", type: "update" },
    { id: "2", project: "AI Study Buddy", content: "Set up FastAPI backend with async endpoints and rate limiting to keep OpenAI costs reasonable.", type: "update" },
  ],
};

const SOCIAL_DISPLAY = [
  { key: "linkedin_url",  label: "LinkedIn",   icon: Linkedin, color: "text-[#0A66C2]" },
  { key: "github_url",    label: "GitHub",     icon: Github,   color: "text-foreground" },
  { key: "x_url",         label: "X",          icon: Twitter,  color: "text-foreground" },
  { key: "portfolio_url", label: "Portfolio",  icon: Globe,    color: "text-primary" },
];

const TYPE_COLORS = {
  update: "bg-blue-100 text-blue-800",
  milestone: "bg-green-100 text-green-800",
  tutorial: "bg-purple-100 text-purple-800",
};

export default function Lookbook() {
  const { id } = useParams();
  const profile  = MOCK_PROFILES[id] || MOCK_PROFILES["1"];
  const projects = MOCK_PROJECTS[id] || [];
  const updates  = MOCK_UPDATES[id] || [];

  const activeProjects   = projects.filter((p) => p.status === "in_progress" || p.status === "deployed");
  const upcomingProjects = projects.filter((p) => p.status === "idea");

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: `${profile.name} — Fellowship Lookbook`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top actions bar */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b px-4 md:px-8 flex items-center justify-between h-14">
        <Link to={`/profile/${id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to profile
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
              <Calendar className="h-4 w-4" aria-hidden="true" /> Schedule Meeting
            </Button>
          )}
          <Link to={`/messages/new?to=${id}`}>
            <Button size="sm" variant="outline" aria-label={`Message ${profile.name}`}>
              <MessageSquare className="h-4 w-4" aria-hidden="true" /> Message
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-10">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="flex items-start gap-5">
          <Avatar className="h-20 w-20 shrink-0">
            <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold">{profile.name}</h1>
              {profile.cohort && <Badge variant="outline" className="text-xs">{profile.cohort}</Badge>}
            </div>
            <p className="text-base text-primary font-medium mt-1">{profile.goal}</p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-lg">{profile.bio}</p>

            {/* Social links row */}
            <div className="flex flex-wrap gap-2 mt-4">
              {SOCIAL_DISPLAY.filter(({ key }) => profile[key]).map(({ key, label, icon: Icon, color }) => (
                <a key={key} href={profile[key]} target="_blank" rel="noopener noreferrer" aria-label={`${profile.name}'s ${label} — opens in new tab`}>
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
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Skills ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <Badge key={s} variant="secondary" className="text-sm px-3 py-1 rounded-full">{s}</Badge>
            ))}
          </div>
          {profile.workTypes?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.workTypes.map((t) => (
                <Badge key={t} variant="outline" className="text-xs rounded-full">{t}</Badge>
              ))}
            </div>
          )}
        </section>

        <Separator />

        {/* ── Active projects ───────────────────────────────────────────── */}
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

        {/* ── Upcoming projects ─────────────────────────────────────────── */}
        {upcomingProjects.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Upcoming Projects
            </h2>
            <div className="space-y-3">
              {upcomingProjects.map((project) => (
                <LookbookProjectCard key={project.id} project={project} upcoming />
              ))}
            </div>
          </section>
        )}

        {/* ── Recent updates ────────────────────────────────────────────── */}
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
                        <span className="text-xs font-medium text-muted-foreground">{update.project}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", TYPE_COLORS[update.type])}>
                          {update.type}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{update.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        <Separator />

        {/* ── Connect CTA ───────────────────────────────────────────────── */}
        <section className="text-center space-y-3 py-4">
          <p className="text-muted-foreground text-sm">Want to collaborate or connect with {profile.name}?</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {profile.calendly_url && (
              <Button
                onClick={() => window.open(profile.calendly_url, "_blank", "noopener,noreferrer")}
                aria-label={`Schedule meeting with ${profile.name}`}
              >
                <Calendar className="h-4 w-4" aria-hidden="true" /> Schedule Meeting
              </Button>
            )}
            <Link to={`/messages/new?to=${id}`}>
              <Button variant="outline" aria-label={`Send ${profile.name} a message`}>
                <MessageSquare className="h-4 w-4" aria-hidden="true" /> Send a Message
              </Button>
            </Link>
            <Link to={`/campfire`}>
              <Button variant="outline" aria-label="See who else you might connect with">
                <Zap className="h-4 w-4" aria-hidden="true" /> Find More Builders
              </Button>
            </Link>
          </div>
        </section>

        {/* Fellowship attribution */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Member of the <span className="font-medium text-primary">Fellowship</span> community
        </p>
      </div>
    </div>
  );
}

function LookbookProjectCard({ project, upcoming = false }) {
  return (
    <Card className={cn("card-interactive", upcoming && "opacity-80")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/projects/${project.id}`} className="text-sm font-semibold hover:text-primary transition-colors">
                {project.title}
              </Link>
              {upcoming && <Badge variant="outline" className="text-xs">Upcoming</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{project.role}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", STATUS_COLORS[project.status])}>
              {STATUS_LABELS[project.status]}
            </span>
            {project.deploy_url && (
              <a href={project.deploy_url} target="_blank" rel="noopener noreferrer" aria-label={`Open live demo of ${project.title}`}>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </a>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{project.summary}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.skills.map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
