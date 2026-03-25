import { Link } from "react-router-dom";

export default function HashtagBadge({ tag, size = "sm" }) {
  const sizeClasses = {
    sm: "text-xs px-2.5 py-1",
    md: "text-sm px-3 py-1.5",
  };

  return (
    <Link
      to={`/explore?tag=${encodeURIComponent(tag)}`}
      className={`inline-block rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors ${sizeClasses[size]}`}
    >
      #{tag}
    </Link>
  );
}