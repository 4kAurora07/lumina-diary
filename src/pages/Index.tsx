import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, BookOpen, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import StreakDisplay from "@/components/StreakDisplay";
import EntryCard from "@/components/EntryCard";

const greetings = ["Hey there", "Welcome back", "Good vibes only", "How are you feeling"];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<any[]>([]);
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [recentMoods, setRecentMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  const hour = new Date().getHours();
  const timeEmoji = hour < 12 ? "🌅" : hour < 18 ? "☀️" : "🌙";

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [entriesRes, streakRes, moodsRes] = await Promise.all([
        supabase
          .from("entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("streaks").select("*").eq("user_id", user.id).single(),
        supabase
          .from("moods_log")
          .select("mood")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(7),
      ]);

      setEntries(entriesRes.data || []);
      if (streakRes.data) setStreak(streakRes.data);
      setRecentMoods((moodsRes.data || []).map((m: any) => m.mood));
      setLoading(false);
    };
    load();
  }, [user]);

  const moodEmojis: Record<string, string> = {
    happy: "😊", sad: "😢", excited: "🤩", calm: "😌",
    anxious: "😰", angry: "😤", loved: "🥰", neutral: "😐",
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{greeting} {timeEmoji}</p>
              <h1 className="text-xl font-bold text-gradient flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Luminary
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/write")}
              className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary"
            >
              <Plus className="w-5 h-5 text-primary" />
            </motion.button>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <StreakDisplay currentStreak={streak.current_streak} longestStreak={streak.longest_streak} />
        </motion.div>

        {/* Recent moods */}
        {recentMoods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <p className="text-xs text-muted-foreground mb-2">Recent moods</p>
            <div className="flex gap-1.5">
              {recentMoods.map((m, i) => (
                <span key={i} className="text-xl">{moodEmojis[m] || "📝"}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Entries */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground/80">Your Entries</h2>
            <Sparkles className="w-3.5 h-3.5 text-primary/50" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-muted/50 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-muted/30 rounded w-full" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <p className="text-3xl mb-3">✨</p>
              <p className="text-sm text-muted-foreground mb-4">Your diary awaits its first entry</p>
              <button
                onClick={() => navigate("/write")}
                className="text-sm text-primary hover:underline"
              >
                Start writing →
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, i) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  index={i}
                  onClick={() => navigate(`/write/${entry.id}`)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
