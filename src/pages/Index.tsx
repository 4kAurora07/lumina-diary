import AppLayout from "@/components/AppLayout";
import EntryCard from "@/components/EntryCard";
import { motion } from "framer-motion";
import { Flame, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const PROMPTS = [
  "What made you smile today?",
  "Describe a moment that surprised you recently.",
  "What are you grateful for right now?",
  "If today had a color, what would it be and why?",
  "Write about someone who influenced you this week.",
  "What's a small victory you had today?",
  "Describe your ideal tomorrow.",
  "What song matches your current mood?",
  "Write a letter to your future self.",
  "What's something you learned recently?",
  "Describe the view from your window right now.",
  "What would you tell your younger self?",
  "What's weighing on your mind?",
  "Describe a place that feels like home.",
  "What's a dream you keep coming back to?",
];

function calculateStreak(entries: { created_at: string }[]): number {
  if (!entries.length) return 0;
  const dates = [...new Set(entries.map((e) => e.created_at.slice(0, 10)))]
    .sort()
    .reverse();
  let streak = 0;
  for (let i = 0; i < dates.length; i++) {
    const expected = format(
      new Date(new Date().setDate(new Date().getDate() - i)),
      "yyyy-MM-dd"
    );
    if (dates[i] === expected) streak++;
    else break;
  }
  return streak;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const todayPrompt = PROMPTS[new Date().getDate() % PROMPTS.length];

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const displayName =
    profile?.username || user?.email?.split("@")[0] || "there";

  const { data: entries = [] } = useQuery({
    queryKey: ["entries", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const streak = calculateStreak(entries);

  return (
    <AppLayout>
      <div className="px-4 pt-14 pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-sm text-muted-foreground">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight capitalize">
            {displayName} ✨
          </h1>
        </motion.div>

        {/* Today's Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate("/write")}
          className="relative rounded-2xl p-5 mb-4 overflow-hidden cursor-pointer group"
          style={{
            background:
              "linear-gradient(135deg, hsl(270,80%,35%) 0%, hsl(290,70%,30%) 50%, hsl(320,60%,30%) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, hsla(270,90%,45%,0.3), hsla(320,70%,40%,0.3))",
            }}
          />
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{ background: "hsl(300, 90%, 70%)" }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={15} strokeWidth={1.5} className="text-purple-200/80" />
              <span className="text-[11px] font-semibold text-purple-200/80 uppercase tracking-widest">
                Today's Prompt
              </span>
            </div>
            <p className="text-lg font-semibold text-white leading-snug">
              "{todayPrompt}"
            </p>
            <p className="text-xs text-purple-200/60 mt-2">Tap to write →</p>
          </div>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 mb-6 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Flame size={20} strokeWidth={1.5} className="text-orange-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground tabular-nums">
                {streak}
              </span>
              <span className="text-muted-foreground text-sm">day streak</span>
            </div>
            <p className="text-muted-foreground/60 text-xs">
              {streak > 0
                ? "Keep the momentum going!"
                : "Write today to start your streak!"}
            </p>
          </div>
        </motion.div>

        {/* Recent Entries */}
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Recent Entries
        </h2>

        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <p className="text-muted-foreground text-sm">
              No entries yet. Tap Write to begin your journey.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entries.map((entry, i) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={() => navigate(`/write?id=${entry.id}`)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}