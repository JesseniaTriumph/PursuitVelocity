import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Github, Linkedin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MOCK_BUILDERS = [
  {
    id: "1",
    name: "Marcus Johnson",
    initials: "MJ",
    bio: "Full-stack engineer building AI-powered learning tools. 2 years at Pursuit.",
    skills: ["React", "Python", "OpenAI", "FastAPI", "PostgreSQL"],
    goal: "Build EdTech products",
    workTypes: ["Frontend", "Backend", "AI/ML"],
    projects: ["AI Study Buddy"],
    email: "marcus@fellowship.app",
    github_url: "https://github.com/marcusj",
    linkedin_url: "https://linkedin.com/in/marcusj",
    calendly_url: "https://calendly.com/marcusj",
    availability: "open",
  },
  {
    id: "2",
    name: "Sofia Rivera",
    initials: "SR",
    bio: "ML engineer passionate about making AI accessible. Currently exploring RAG pipelines.",
    skills: ["Python", "Machine Learning", "FastAPI", "Supabase", "TypeScript"],
    goal: "Build AI infrastructure",
    workTypes: ["Backend", "AI/ML", "Data Science"],
    projects: ["AI Study Buddy"],
    email: "sofia@fellowship.app",
    github_url: "https://github.com/sofiar",
    linkedin_url: null,
    calendly_url: "https://calendly.com/sofiar",
    availability: "open",
  },
  {
    id: "3",
    name: "Kai Thompson",
    initials: "KT",
    bio: "Frontend-focused engineer who loves design systems and clean UX. TypeScript advocate.",
    skills: ["React", "TypeScript", "Node.js", "Figma", "CSS"],
    goal: "Ship polished SaaS products",
    workTypes: ["Frontend", "UI/UX Design"],
    projects: ["AI Study Buddy", "CodeReview Buddy"],
    email: "kai@fellowship.app",
    github_url: null,
    linkedin_url: "https://linkedin.com/in/kait",
    calendly_url: null,
    availability: "selective",
  },
  {
    id: "4",
    name: "Priya Nair",
    initials: "PN",
    bio: "Product-minded engineer. Obsessed with reducing friction for non-technical users.",
    skills: ["React", "Django", "Python", "Product Management"],
    goal: "Build community tools",
    workTypes: ["Frontend", "Product Management"],
    projects: ["Community Events App"],
    email: "priya@fellowship.app",
    github_url: "https://github.com/priyan",
    linkedin_url: "https://linkedin.com/in/priyan",
    calendly_url: "https://calendly.com/priyan",
    availability: "open",
  },
  {
    id: "5",
    name: "Devon Clarke",
    initials: "DC",
    bio: "Mobile dev with a focus on consumer apps. React Native + Node.js stack.",
    skills: ["React Native", "Node.js", "PostgreSQL", "AWS"],
    goal: "Build mobile-first apps",
    workTypes: ["Mobile", "Backend"],
    projects: ["NeighborShare", "CodeReview Buddy"],
    email: "devon@fellowship.app",
    github_url: "https://github.com/devonc",
    linkedin_url: null,
    calendly_url: null,
    availability: "closed",
  },
  {
    id: "6",
    name: "Amara Osei",
    initials: "AO",
    bio: "Designer-developer hybrid. Figma to code with zero friction. Accessibility advocate.",
    skills: ["UI/UX Design", "Figma", "React", "CSS", "Accessibility"],
    goal: "Design-first consumer products",
    workTypes: ["UI/UX Design", "Frontend"],
    projects: ["MoodTrack"],
    email: "amara@fellowship.app",
    github_url: null,
    linkedin_url: "https://linkedin.com/in/amarao",
    calendly_url: "https://calendly.com/amarao",
    availability: "selective",
  },
];

const AVAILABILITY_LABELS = {
  open: { label: "Open to collaborate", color: "bg-green-100 text-green-800" },
  selective: { label: "Selective", color: "bg-yellow-100 text-yellow-800" },
  closed: { label: "Not available", color: "bg-gray-100 text-gray-600" },
};

export default function Builders() {
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [availFilter, setAvailFilter] = useState("all");

  const allSkills = [...new Set(MOCK_BUILDERS.flatMap((b) => b.skills))].sort();

  const filtered = MOCK_BUILDERS.filter((b) => {
    const matchesSearch =
      search === "" ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.bio.toLowerCase().includes(search.toLowerCase()) ||
      b.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      b.goal.toLowerCase().includes(search.toLowerCase());
    const matchesSkill = skillFilter === "all" || b.skills.includes(skillFilter);
    const matchesAvail = availFilter === "all" || b.availability === availFilter;
    return matchesSearch && matchesSkill && matchesAvail;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Builders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find collaborators by skill, interest, and availability.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by name, skill, or interest..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {allSkills.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
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
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} builders</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((builder) => (
          <BuilderCard key={builder.id} builder={builder} />
        ))}
      </div>
    </div>
  );
}

function BuilderCard({ builder }) {
  const avail = AVAILABILITY_LABELS[builder.availability];

  function handleSchedule(e) {
    e.preventDefault();
    if (builder.calendly_url) {
      window.open(builder.calendly_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Card className="card-interactive">
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="text-sm font-medium">{builder.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/profile/${builder.id}`}
                className="text-sm font-semibold hover:text-primary transition-colors"
              >
                {builder.name}
              </Link>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", avail.color)}>
                {avail.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{builder.goal}</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {builder.bio}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {builder.skills.slice(0, 4).map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
          ))}
          {builder.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">+{builder.skills.length - 4}</Badge>
          )}
        </div>

        {/* Projects */}
        {builder.projects.length > 0 && (
          <p className="text-xs text-muted-foreground mb-4">
            Building:{" "}
            {builder.projects.map((p, i) => (
              <span key={p}>
                <span className="text-foreground font-medium">{p}</span>
                {i < builder.projects.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-3 border-t">
          <div className="flex gap-2">
            <Link to={`/profile/${builder.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">View Profile</Button>
            </Link>
            <Link to={`/messages?to=${builder.email}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <MessageSquare className="h-4 w-4" aria-hidden="true" /> Message
              </Button>
            </Link>
          </div>
          {builder.calendly_url ? (
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={handleSchedule}
              aria-label={`Schedule a meeting with ${builder.name}`}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Schedule Meeting
            </Button>
          ) : (
            <div className="flex gap-1">
              {builder.github_url && (
                <a href={builder.github_url} target="_blank" rel="noopener noreferrer" aria-label={`${builder.name}'s GitHub`}>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Github className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </a>
              )}
              {builder.linkedin_url && (
                <a href={builder.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label={`${builder.name}'s LinkedIn`}>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
