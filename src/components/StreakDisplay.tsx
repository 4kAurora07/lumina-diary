import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ scale: currentStreak > 0 ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            currentStreak > 0
              ? "bg-gradient-to-br from-orange-500/20 to-red-500/20"
              : "bg-muted/50"
          }`}
        >
          <Flame className={`w-7 h-7 ${currentStreak > 0 ? "text-orange-400 streak-glow" : "text-muted-foreground"}`} />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{currentStreak}</span>
            <span className="text-muted-foreground text-sm">day streak</span>
          </div>
          <p className="text-xs text-muted-foreground">Best: {longestStreak} days 🏆</p>
        </div>
      </div>
    </div>
  );
}
