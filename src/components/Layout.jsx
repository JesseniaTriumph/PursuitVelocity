import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, MessageSquare, FolderOpen, Plus, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import WelcomeTour from "./WelcomeTour";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/co-build", icon: FolderOpen, label: "Projects" },
  { path: "/create", icon: Plus, label: "Post", isAction: true },
  { path: "/builders", icon: Users, label: "Builders" },
  { path: "/messages", icon: MessageSquare, label: "Messages" },
];

export default function Layout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-dm-sans font-semibold text-sm">V</span>
            </div>
            <span className="font-dm-sans font-semibold text-lg tracking-tight">Velocity</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTourOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Open the Velocity walkthrough"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Tour
            </button>
            <Link to="/profile">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-semibold text-xs">
                    {user?.full_name?.[0] || "?"}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <div className="max-w-lg mx-auto px-2 h-16 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 -mt-4 transition-transform active:scale-95"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {tourOpen && <WelcomeTour forceOpen onClose={() => setTourOpen(false)} />}
    </div>
  );
}
