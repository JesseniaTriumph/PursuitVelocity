/*
 * UserAvatar — generates a consistent colorful avatar for any user.
 *
 * No letters. Uses a person/object icon on a gradient background.
 * Color and icon are deterministic from the seed (name or email),
 * so the same person always gets the same avatar across the app.
 *
 * Usage:
 *   <UserAvatar name="Marcus Johnson" size={40} />
 *   <UserAvatar name="Sofia Rivera" src={user.avatar_url} size={32} />
 */

const GRADIENTS = [
  "from-teal-400 to-cyan-500",
  "from-violet-400 to-purple-500",
  "from-orange-400 to-amber-500",
  "from-rose-400 to-pink-500",
  "from-blue-400 to-indigo-500",
  "from-green-400 to-emerald-500",
  "from-fuchsia-400 to-pink-400",
  "from-sky-400 to-blue-500",
  "from-lime-400 to-green-500",
  "from-red-400 to-rose-500",
  "from-amber-400 to-yellow-500",
  "from-indigo-400 to-violet-500",
];

// Simple icons as inline SVG paths — person silhouette, tools, bolt, book, flame, star
const ICONS = [
  // Person (default)
  ({ size }) => (
    <svg viewBox="0 0 24 24" width={size * 0.48} height={size * 0.48} fill="white" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  // Bolt / lightning
  ({ size }) => (
    <svg viewBox="0 0 24 24" width={size * 0.44} height={size * 0.44} fill="white" aria-hidden="true">
      <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" />
    </svg>
  ),
  // Wrench / tools
  ({ size }) => (
    <svg viewBox="0 0 24 24" width={size * 0.44} height={size * 0.44} fill="white" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  // Star
  ({ size }) => (
    <svg viewBox="0 0 24 24" width={size * 0.46} height={size * 0.46} fill="white" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  // Flame
  ({ size }) => (
    <svg viewBox="0 0 24 24" width={size * 0.44} height={size * 0.44} fill="white" aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  // Book
  ({ size }) => (
    <svg viewBox="0 0 24 24" width={size * 0.44} height={size * 0.44} fill="white" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
];

function hashSeed(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export default function UserAvatar({ name = "", src, size = 40, className = "" }) {
  const seed = hashSeed(name);
  const gradient = GRADIENTS[seed % GRADIENTS.length];
  const IconComponent = ICONS[seed % ICONS.length];
  const rounded = size >= 48 ? "rounded-2xl" : "rounded-xl";

  return (
    <div
      className={`relative shrink-0 bg-gradient-to-br ${gradient} ${rounded} flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-hidden="true"
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <IconComponent size={size} />
      )}
    </div>
  );
}
