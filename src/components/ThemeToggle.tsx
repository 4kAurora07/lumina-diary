import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary hover:bg-muted transition-colors border border-border/50"
    >
      {theme === "light" ? (
        <Moon size={16} strokeWidth={1.5} className="text-muted-foreground" />
      ) : (
        <Sun size={16} strokeWidth={1.5} className="text-muted-foreground" />
      )}
    </motion.button>
  );
}