import { Link } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const statusLabels = {
  looking_for_team: "Looking for Team",
  in_progress: "In Progress",
  completed: "Completed",
};

const statusColors = {
  looking_for_team: "bg-accent/10 text-accent",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-muted text-muted-foreground",
};

export default function ProjectCard({ project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{project.title}</h3>
          <Link to={`/profile/${project.owner_email}`} className="text-xs text-muted-foreground hover:underline">
            by {project.owner_name}
          </Link>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statusColors[project.status] || ""}`}>
          {statusLabels[project.status] || project.status}
        </span>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>

      {project.skills_needed?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.skills_needed.map((skill, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs">{project.team_size || 1}/{project.max_team_size || 5}</span>
        </div>
        <Link
          to={`/project/${project.id}`}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          View <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}