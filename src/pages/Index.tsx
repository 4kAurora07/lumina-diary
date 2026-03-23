import AppLayout from "@/components/AppLayout";
import EntryCard from "@/components/EntryCard";
import { ThemeToggle } from "@/components/ThemeToggle";
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
      <div className="px-4 pt-14 pb-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight capitalize">
              {displayName} ✨
            </h1>
          </div>
          <ThemeToggle />
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
          className="glass-card p-4 mb-6 flex items-center gap-3 rounded-2xl"
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
            className="glass-card p-8 text-center rounded-2xl"
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
                onClick={() => navigate(`/write/${entry.id}`)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
