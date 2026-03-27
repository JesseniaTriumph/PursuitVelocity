import {
  Linkedin,
  Twitter,
  Github,
  Globe,
  Instagram,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NETWORK_LINKS = [
  { key: "linkedin_url", label: "LinkedIn", icon: Linkedin, iconClassName: "text-[#0A66C2]" },
  { key: "x_url", label: "X", icon: Twitter, iconClassName: "text-foreground" },
  { key: "github_url", label: "GitHub", icon: Github, iconClassName: "text-foreground" },
  { key: "portfolio_url", label: "Portfolio", icon: Globe, iconClassName: "text-primary" },
  { key: "instagram_url", label: "Instagram", icon: Instagram, iconClassName: "text-[#E4405F]" },
  { key: "tiktok_url", label: "TikTok", icon: Video, iconClassName: "text-foreground" },
];

export default function BuilderNetworkLinks({
  builder,
  compact = true,
  className,
}) {
  const visibleLinks = NETWORK_LINKS.filter(({ key }) => builder?.[key]);

  if (visibleLinks.length === 0) {
    return null;
  }

  const builderName = builder?.name || builder?.full_name || builder?.email || "builder";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visibleLinks.map(({ key, label, icon: Icon, iconClassName }) => (
        <Button
          key={key}
          asChild
          variant="outline"
          size={compact ? "icon" : "sm"}
          className={cn(
            "rounded-xl",
            compact ? "h-8 w-8" : "h-8 gap-1.5 text-xs px-3"
          )}
        >
          <a
            href={builder[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${builderName}'s ${label}`}
          >
            <Icon className={cn(compact ? "h-4 w-4" : "h-3.5 w-3.5", iconClassName)} />
            {!compact && <span>{label}</span>}
          </a>
        </Button>
      ))}
    </div>
  );
}
