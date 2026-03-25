import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ProjectCard from "../components/ProjectCard";
import EmptyState from "../components/EmptyState";
import { Users, Plus, Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CoBuild() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.Project.list("-created_date", 50);
      setProjects(data);
      setLoading(false);
    };
    load();
  }, []);

  const filters = [
    { id: "all", label: "All" },
    { id: "looking_for_team", label: "Looking for Team" },
    { id: "in_progress", label: "In Progress" },
  ];

  const filteredProjects = projects.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.skills_needed?.some((s) => s.toLowerCase().includes(q))
      );
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space font-bold text-xl">Co-Build</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Find teammates & join projects</p>
        </div>
        <Link to="/create-project">
          <Button size="sm" className="rounded-xl gap-1.5">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects or skills..."
          className="w-full bg-muted rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Projects */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No projects yet"
          description="Post your project and find teammates!"
          action={
            <Link to="/create-project">
              <Button size="sm" className="rounded-xl">Post Project</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}