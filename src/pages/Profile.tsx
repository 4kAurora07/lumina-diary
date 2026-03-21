import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, BookOpen, Flame, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({ entries: 0, streak: 0, longest: 0 });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("entries").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("streaks").select("*").eq("user_id", user.id).single(),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]).then(([entriesRes, streakRes, profileRes]) => {
      setStats({
        entries: entriesRes.count || 0,
        streak: streakRes.data?.current_streak || 0,
        longest: streakRes.data?.longest_streak || 0,
      });
      setProfile(profileRes.data);
    });
  }, [user]);

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-lg font-bold">Profile</h1>
            <Settings className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Avatar + name */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 mx-auto mb-3 flex items-center justify-center text-3xl">
              {profile?.username ? profile.username[0].toUpperCase() : "✨"}
            </div>
            <h2 className="font-semibold">{profile?.username || user?.email?.split("@")[0]}</h2>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: BookOpen, label: "Entries", value: stats.entries },
              { icon: Flame, label: "Streak", value: `${stats.streak}🔥` },
              { icon: Flame, label: "Best", value: `${stats.longest}🏆` },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <Button
            onClick={signOut}
            variant="outline"
            className="w-full border-border/30 text-muted-foreground hover:text-destructive hover:border-destructive/30"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
