import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, PenLine, Search, Calendar, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: PenLine, label: "Write", path: "/write" },
  { icon: Calendar, label: "Memory", path: "/memory" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
      
      {/* Main content */}
      <main className="pb-20 relative">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30">
        <div className="flex items-center justify-around max-w-lg mx-auto py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const isWrite = item.label === "Write";

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isWrite
                    ? "bg-primary/20 -mt-4 px-5 py-3 rounded-2xl"
                    : isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && !isWrite && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 w-6 h-0.5 rounded-full bg-primary"
                  />
                )}
                <Icon className={`w-5 h-5 ${isWrite ? "text-primary" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
