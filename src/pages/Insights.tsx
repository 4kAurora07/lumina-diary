import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { BookOpen, Flame, Heart, Type } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";

const moodToNum: Record<string, number> = {
  happy: 5, excited: 5, loved: 5,
  calm: 4, neutral: 3,
  anxious: 2, sad: 2,
  angry: 1,
};

export default function InsightsPage() {
  const { user } = useAuth();

  const { data: entries = [] } = useQuery({
    queryKey: ["all-entries", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  // Pull real streak from streaks table
  const { data: streakData } = useQuery({
    queryKey: ["streak", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(new Date(), 29 - i), "yyyy-MM-dd");
    const dayEntries = entries.filter((e) => e.created_at.slice(0, 10) === date);
    const avgMood = dayEntries.length
      ? dayEntries.reduce((sum, e) => sum + (moodToNum[e.mood ?? "neutral"] ?? 3), 0) / dayEntries.length
      : null;
    return {
      day: format(subDays(new Date(), 29 - i), "d"),
      value: avgMood,
    };
  });

  const totalWords = entries.reduce((sum, e) => {
    const text = typeof e.content === "string" ? e.content : "";
    return sum + (text.trim() ? text.trim().split(/\s+/).length : 0);
  }, 0);

  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] ?? 0) + 1;
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const moodEmojis: Record<string, string> = {
    happy: "😊", excited: "🤩", loved: "🥰", calm: "😌",
    neutral: "😐", anxious: "😰", sad: "😢", angry: "😤",
  };

  const stats = [
    {
      icon: BookOpen,
      label: "Total Entries",
      value: String(entries.length),
      sub: "entries written",
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: streakData ? `${streakData.current_streak}d` : "—",
      sub: streakData ? `Best: ${streakData.longest_streak}d` : "Start writing!",
    },
    {
      icon: Heart,
      label: "Top Mood",
      value: topMood ? (moodEmojis[topMood] ?? "—") : "—",
      sub: topMood ?? "no data yet",
    },
    {
      icon: Type,
      label: "Total Words",
      value: totalWords > 999
        ? `${(totalWords / 1000).toFixed(1)}k`
        : totalWords.toLocaleString(),
      sub: "words written",
    },
  ];

  return (
    <AppLayout>
      <div className="px-4 pt-14 pb-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your journaling at a glance</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-4 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon size={16} strokeWidth={1.5} className="text-primary" />
                  <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums mb-0.5">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground/60">{stat.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Mood Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5 rounded-2xl mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Mood Trend</h2>
            <span className="text-[11px] text-muted-foreground/60 bg-white/5 px-2 py-1 rounded-lg">
              Last 30 days
            </span>
          </div>

          {entries.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2">
              <p className="text-3xl">📈</p>
              <p className="text-sm text-muted-foreground/50 text-center">
                Write your first entry to see your mood trend
              </p>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="hsl(270, 95%, 75%)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(270, 95%, 75%)" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "hsl(240, 10%, 50%)" }}
                    axisLine={false}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis hide domain={[0, 5]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(240, 20%, 7%)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "hsl(240, 10%, 90%)",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [value.toFixed(1), "Mood Score"]}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(270, 95%, 75%)"
                    strokeWidth={2}
                    fill="url(#moodGrad)"
                    connectNulls={false}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(270, 95%, 75%)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Memory Collections */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-base font-semibold text-foreground mb-3">Memory Collections</h2>
          <div className="glass-card p-6 rounded-2xl text-center">
            <p className="text-3xl mb-2">🗂️</p>
            <p className="text-sm font-medium text-foreground/60 mb-1">Coming Soon</p>
            <p className="text-muted-foreground/40 text-xs">
              Your memories will be grouped by month as you write more entries.
            </p>
          </div>
        </motion.div>

      </div>
    </AppLayout>
  );
}