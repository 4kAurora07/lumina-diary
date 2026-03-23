import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, PenLine, Search, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import logoFull from "@/assets/logo-full.png";

const navItems = [
  { icon: Home,      label: "Home",     path: "/"         },
  { icon: Search,    label: "Search",   path: "/search"   },
  { icon: PenLine,   label: "Write",    path: "/write"    },
  { icon: BarChart2, label: "Insights", path: "/insights" },
  { icon: User,      label: "Profile",  path: "/profile"  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />

      {/* Top header with logo */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center px-4 pt-4 pb-2 pointer-events-none">
        <img
          src={logoFull}
          alt="Luminary"
          className="h-7 object-contain drop-shadow-[0_0_10px_hsl(270,60%,55%,0.3)]"
        />
      </header>

      {/* Main content */}
      <main className="pt-16 pb-28 relative">{children}</main>

      {/* Bottom navigation — floating glass pill */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-16 rounded-2xl glass shadow-glass flex items-center justify-around px-4 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-250",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                size={22}
                strokeWidth={1.5}
                className={cn(
                  "transition-all duration-250",
                  isActive && "drop-shadow-[0_0_8px_hsl(270,95%,75%)]"
                )}
              />
              <span className="text-[10px] font-medium">{item.label}</span>

              {/* Active dot indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}