import { useState, useEffect } from "react";
import { Sparkles, Loader2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import UserAvatar from "./UserAvatar";
import {
  fetchBuilderDirectory,
  getBuilderProfilePath,
  rankBuilderMatches,
} from "@/lib/builder-directory";

export default function AIMatches({ currentUser }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMatches = async () => {
      if (!currentUser?.email) {
        setMatches([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const directory = await fetchBuilderDirectory();
        const currentBuilder =
          directory.builders.find((builder) => builder.email === currentUser.email) ||
          {
            email: currentUser.email,
            name: currentUser.full_name || currentUser.email,
            full_name: currentUser.full_name || currentUser.email,
            avatar: currentUser.avatar || null,
            skills: currentUser.skills || [],
            interests: currentUser.interests || [],
            goals: currentUser.goals || [],
            looking_for: currentUser.looking_for || [],
            needs: currentUser.needs || [],
            activeProject: null,
          };

        if (!isMounted) {
          return;
        }

        setMatches(rankBuilderMatches(currentBuilder, directory.builders));
      } catch {
        if (isMounted) {
          setMatches([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMatches();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

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
            key={match.person.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl"
          >
            <UserAvatar
              name={match.person.name}
              src={match.person.avatar}
              size={40}
            />
            <div className="flex-1 min-w-0">
              <Link
                to={getBuilderProfilePath(match.person)}
                className="font-semibold text-sm hover:underline"
              >
                {match.person.name}
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {match.matchReasons[0]?.text}
              </p>
              {match.uniqueSkills.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {match.uniqueSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link to={getBuilderProfilePath(match.person)}>
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
