import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Users, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUser from "../hooks/useCurrentUser";
import moment from "moment";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useCurrentUser();
  const [project, setProject] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [projectData, requestData] = await Promise.all([
        base44.entities.Project.filter({ id }),
        base44.entities.TeamRequest.filter({ project_id: id }),
      ]);
      setProject(projectData[0] || null);
      setRequests(requestData);
      if (user?.email) {
        setHasRequested(requestData.some((r) => r.user_email === user.email));
      }
      setLoading(false);
    };
    load();
  }, [id, user?.email]);

  const handleJoinRequest = async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    await base44.entities.TeamRequest.create({
      project_id: id,
      user_email: user.email,
      user_name: user.full_name || "Anonymous",
      message: message.trim(),
      status: "pending",
    });
    setHasRequested(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const isOwner = user?.email === project.owner_email;

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/co-build" className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-space font-bold text-lg truncate">{project.title}</h1>
      </div>

      {project.image_url && (
        <img src={project.image_url} alt="" className="w-full rounded-2xl object-cover max-h-48" />
      )}

      {/* Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${project.owner_email}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-xs">{project.owner_name?.[0]}</span>
            </div>
            <span className="text-sm font-medium hover:underline">{project.owner_name}</span>
          </Link>
          <span className="text-xs text-muted-foreground">{moment(project.created_date).fromNow()}</span>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>

        {project.skills_needed?.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills Needed</h3>
            <div className="flex flex-wrap gap-1.5">
              {project.skills_needed.map((skill, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{project.team_size || 1} / {project.max_team_size || 5} members</span>
        </div>
      </div>

      {/* Join / Requests */}
      {!isOwner && !hasRequested && project.status === "looking_for_team" && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-2xl">
          <h3 className="font-semibold text-sm">Want to join?</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself and your skills..."
            className="w-full bg-background rounded-xl px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button onClick={handleJoinRequest} disabled={submitting} className="w-full rounded-xl gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Request to Join</>}
          </Button>
        </div>
      )}

      {hasRequested && (
        <div className="flex items-center gap-2 p-4 bg-accent/10 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium">Request sent!</span>
        </div>
      )}

      {/* Owner view: team requests */}
      {isOwner && requests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Team Requests ({requests.length})</h3>
          {requests.map((req) => (
            <div key={req.id} className="p-3 bg-muted/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{req.user_name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  req.status === "pending" ? "bg-chart-4/10 text-chart-4" :
                  req.status === "accepted" ? "bg-accent/10 text-accent" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  {req.status}
                </span>
              </div>
              {req.message && <p className="text-xs text-muted-foreground">{req.message}</p>}
              {req.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="rounded-lg text-xs"
                    onClick={async () => {
                      await base44.entities.TeamRequest.update(req.id, { status: "accepted" });
                      await base44.entities.Project.update(id, { team_size: (project.team_size || 1) + 1 });
                      setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: "accepted" } : r));
                      setProject((prev) => ({ ...prev, team_size: (prev.team_size || 1) + 1 }));
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg text-xs"
                    onClick={async () => {
                      await base44.entities.TeamRequest.update(req.id, { status: "rejected" });
                      setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: "rejected" } : r));
                    }}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}