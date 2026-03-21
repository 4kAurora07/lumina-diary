import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Globe, Lock, Hash, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import MoodPicker from "@/components/MoodPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Editor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string>("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id && user) {
      supabase
        .from("entries")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setTitle(data.title);
            setContent(data.content || "");
            setMood(data.mood || "");
            setIsPublic(data.is_public);
            setTags(data.tags || []);
          }
          setLoading(false);
        });
    }
  }, [id, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const entryData = {
      title: title || "Untitled Entry",
      content,
      mood: mood || null,
      is_public: isPublic,
      tags,
      user_id: user.id,
    };

    let error;
    if (id) {
      ({ error } = await supabase.from("entries").update(entryData).eq("id", id));
    } else {
      const shareToken = isPublic ? undefined : crypto.randomUUID().slice(0, 12);
      ({ error } = await supabase.from("entries").insert({ ...entryData, share_token: shareToken }));
    }

    if (error) {
      toast.error("Failed to save entry");
    } else {
      // Log mood
      if (mood) {
        await supabase.from("moods_log").insert({ user_id: user.id, mood });
      }
      // Update streak
      await updateStreak(user.id);
      toast.success(id ? "Entry updated ✨" : "Entry saved ✨");
      navigate("/");
    }
    setSaving(false);
  };

  const updateStreak = async (userId: string) => {
    const { data: streakData } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (!streakData) {
      await supabase.from("streaks").insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_entry_date: today,
      });
    } else if (streakData.last_entry_date === today) {
      // Already logged today
    } else if (streakData.last_entry_date === yesterday) {
      const newStreak = streakData.current_streak + 1;
      await supabase.from("streaks").update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streakData.longest_streak),
        last_entry_date: today,
      }).eq("user_id", userId);
    } else {
      await supabase.from("streaks").update({
        current_streak: 1,
        longest_streak: Math.max(1, streakData.longest_streak),
        last_entry_date: today,
      }).eq("user_id", userId);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  if (loading) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
      
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${
                isPublic
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "bg-muted/30 border-border/30 text-muted-foreground"
              }`}
            >
              {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {isPublic ? "Public" : "Private"}
            </button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </Button>
          </div>
        </div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this entry a title..."
            className="w-full bg-transparent text-xl font-bold placeholder:text-muted-foreground/40 focus:outline-none mb-2"
          />
        </motion.div>

        {/* Mood */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4"
        >
          <p className="text-xs text-muted-foreground mb-2">How are you feeling?</p>
          <MoodPicker selected={mood} onSelect={setMood} />
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs cursor-pointer hover:bg-primary/20"
              >
                <Hash className="w-3 h-3" />
                {tag}
              </span>
            ))}
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="Add tag..."
              className="w-24 h-7 text-xs bg-transparent border-border/30 rounded-full px-3"
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts... ✨"
            className="w-full min-h-[400px] bg-transparent text-foreground/90 font-serif text-base leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none resize-none"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Editor;
