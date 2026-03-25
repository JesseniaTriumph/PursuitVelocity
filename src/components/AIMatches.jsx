import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AIMatches({ currentUser }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) return;
    loadMatches();
  }, [currentUser?.email]);

  const loadMatches = async () => {
    setLoading(true);
    const allUsers = await base44.entities.User.list();
    const others = allUsers.filter((u) => u.email !== currentUser.email).slice(0, 20);

    if (others.length === 0) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a smart AI matchmaking system for a student builder platform called Pursuit.

Current user:
Name: ${currentUser.full_name}
Skills: ${(currentUser.skills || []).join(", ") || "none listed"}
Interests: ${(currentUser.interests || []).join(", ") || "none listed"}
Goals: ${(currentUser.goals || []).join(", ") || "none listed"}
Looking for: ${(currentUser.looking_for || []).join(", ") || "none specified"}

Other users:
${others.map((u, i) => `${i}: name="${u.full_name}" email="${u.email}" skills="${(u.skills || []).join(", ")}" interests="${(u.interests || []).join(", ")}" looking_for="${(u.looking_for || []).join(", ")}"`).join("\n")}

Pick the top 3 best matches. Return a JSON with their index and a SHORT 1-sentence reason why they match (e.g. "Both building AI projects and you need frontend help").`,
      response_json_schema: {
        type: "object",
        properties: {
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "number" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });

    const suggestions = (result.matches || [])
      .filter((m) => others[m.index])
      .map((m) => ({ ...others[m.index], reason: m.reason }))
      .slice(0, 3);

    setMatches(suggestions);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-space font-semibold text-sm">People You Should Build With</h2>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="font-space font-semibold text-sm">People You Should Build With</h2>
      </div>
      <div className="space-y-2">
        {matches.map((match, i) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {match.avatar ? (
                <img src={match.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-sm">{match.full_name?.[0] || "?"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${match.email}`} className="font-semibold text-sm hover:underline">
                {match.full_name}
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{match.reason}</p>
              {match.skills?.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {match.skills.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link to={`/profile/${match.email}`}>
              <button className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}