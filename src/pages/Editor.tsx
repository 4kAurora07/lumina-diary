import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Globe, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MoodPicker from "@/components/MoodPicker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SUGGESTED_TAGS = [
  "reflection", "gratitude", "growth", "health", "work",
  "relationships", "goals", "travel", "mood", "creative",
  "family", "finance", "mindfulness", "learning", "rant",
];

const Editor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title,     setTitle    ] = useState("");
  const [content,   setContent  ] = useState("");
  const [mood,      setMood     ] = useState<string>("");
  const [isPublic,  setIsPublic ] = useState(false);
  const [tags,      setTags     ] = useState<string[]>([]);
  const [tagInput,  setTagInput ] = useState("");
  const [saving,    setSaving   ] = useState(false);
  const [loading,   setLoading  ] = useState(!!id);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

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

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/^#/, "");
      if (!tags.includes(newTag)) setTags((prev) => [...prev, newTag]);
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const updateStreak = async (userId: string) => {
    const { data: streakData } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    const today     = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (!streakData) {
      await supabase.from("streaks").insert({
        user_id: userId, current_streak: 1,
        longest_streak: 1, last_entry_date: today,
      });
    } else if (streakData.last_entry_date === today) {
      // already logged today
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
      if (mood) {
        await supabase.from("moods_log").insert({ user_id: user.id, mood });
      }
      await updateStreak(user.id);
      toast.success(id ? "Entry updated ✨" : "Entry saved ✨");
      navigate("/");
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-16 relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
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
              {isPublic
                ? <Globe className="w-3 h-3" />
                : <Lock className="w-3 h-3" />
              }
              {isPublic ? "Public" : "Private"}
            </button>

            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-1.5"
            >
              {saving
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Save className="w-3.5 h-3.5" />
              }
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
            className="w-full bg-transparent text-2xl font-bold placeholder:text-muted-foreground/30 focus:outline-none mb-6"
          />
        </motion.div>

        {/* Writing Area — clearly visible */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative rounded-2xl border border-white/8 bg-white/[0.03] focus-within:border-primary/30 focus-within:bg-white/[0.05] transition-all mb-6"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts... ✨"
            className="w-full min-h-[320px] bg-transparent text-foreground/90 font-serif text-base leading-relaxed placeholder:text-muted-foreground/25 focus:outline-none resize-none p-4"
          />
          <div className="px-4 pb-3 text-right border-t border-white/5">
            <span className="text-[11px] text-muted-foreground/40">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
          </div>
        </motion.div>

        {/* Mood */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-2">
            How are you feeling?
          </p>
          <MoodPicker selected={mood} onSelect={setMood} />
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-2">
            Tags
          </p>

          {/* Suggested tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SUGGESTED_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  tags.includes(tag)
                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(270,95%,75%,0.3)]"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/8"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Custom tag input with selected custom tags */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/8 px-3 py-2 focus-within:border-primary/30 transition-all">
            {tags
              .filter((t) => !SUGGESTED_TAGS.includes(t))
              .map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs"
                >
                  #{tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="hover:text-red-400 transition-colors ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder={tags.length === 0 ? "Add custom tag, press Enter..." : "Add more..."}
              className="flex-1 min-w-[140px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 outline-none"
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Editor;