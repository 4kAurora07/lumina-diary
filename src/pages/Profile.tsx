import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, BookOpen, Flame, Trophy, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats]     = useState({ entries: 0, streak: 0, longest: 0 });
  const [profile, setProfile] = useState<any>(null);
  const [editing,     setEditing    ] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [saving,      setSaving     ] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("entries").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("streaks").select("*").eq("user_id", user.id).single(),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]).then(([entriesRes, streakRes, profileRes]) => {
      setStats({
        entries: entriesRes.count || 0,
        streak:  streakRes.data?.current_streak  || 0,
        longest: streakRes.data?.longest_streak  || 0,
      });
      const p = profileRes.data;
      setProfile(p);
      setNewUsername(p?.username || "");
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername.trim() || null })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      setProfile((prev: any) => ({ ...prev, username: newUsername }));
      toast.success("Profile updated ✨");
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setNewUsername(profile?.username || "");
    setEditing(false);
  };

  const displayName = profile?.username || user?.email?.split("@")[0] || "Writer";
  const avatarLetter = displayName[0].toUpperCase();

  return (
    <AppLayout>
      <div className="px-4 pt-14 pb-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your writing identity</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all text-xs"
            >
              <Pencil size={12} strokeWidth={1.5} />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground transition-all disabled:opacity-50"
              >
                <Check size={14} strokeWidth={2} />
              </button>
            </div>
          )}
        </motion.div>

        {/* Avatar + Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            {/* Avatar letter */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-3xl font-bold text-primary-foreground flex-shrink-0 shadow-[0_0_20px_hsl(270,95%,75%,0.2)]">
              {avatarLetter}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username..."
                      maxLength={24}
                      autoFocus
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-all"
                    />
                    <p className="text-[11px] text-muted-foreground/40 mt-1.5 px-1">
                      {newUsername.length}/24 characters
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h2 className="font-bold text-lg text-foreground truncate">{displayName}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { icon: BookOpen, label: "Entries",     value: stats.entries,      color: "text-blue-400"   },
            { icon: Flame,    label: "Streak",       value: `${stats.streak}d`, color: "text-orange-400" },
            { icon: Trophy,   label: "Best",         value: `${stats.longest}d`,color: "text-yellow-400" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="glass-card p-4 rounded-2xl text-center"
              >
                <Icon size={16} strokeWidth={1.5} className={`${stat.color} mx-auto mb-2`} />
                <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={signOut}
            variant="outline"
            className="w-full border-white/8 text-muted-foreground hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all rounded-2xl"
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