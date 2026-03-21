import { motion } from "framer-motion";
import { Lock, Globe, Clock } from "lucide-react";
import { format } from "date-fns";

const moodEmojis: Record<string, string> = {
  happy: "😊", sad: "😢", excited: "🤩", calm: "😌",
  anxious: "😰", angry: "😤", loved: "🥰", neutral: "😐",
};

interface EntryCardProps {
  entry: {
    id: string;
    title: string;
    content: string;
    mood?: string | null;
    is_public: boolean;
    created_at: string;
    tags?: string[];
  };
  onClick?: () => void;
  index?: number;
}

export default function EntryCard({ entry, onClick, index = 0 }: EntryCardProps) {
  const preview = entry.content?.replace(/<[^>]*>/g, "").slice(0, 120) || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="glass rounded-2xl p-4 cursor-pointer hover:bg-card/80 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {entry.mood && (
            <span className="text-lg">{moodEmojis[entry.mood] || "📝"}</span>
          )}
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
            {entry.title || "Untitled"}
          </h3>
        </div>
        {entry.is_public ? (
          <Globe className="w-3.5 h-3.5 text-primary/60" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
        )}
      </div>

      {preview && (
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-3 font-serif">
          {preview}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Clock className="w-3 h-3 text-muted-foreground/50" />
        <span className="text-[10px] text-muted-foreground/60">
          {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
        </span>
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex gap-1 ml-auto">
            {entry.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/70">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
