import { motion } from "framer-motion";

const moods = [
  { emoji: "😊", label: "happy", color: "mood-happy" },
  { emoji: "😢", label: "sad", color: "mood-sad" },
  { emoji: "🤩", label: "excited", color: "mood-excited" },
  { emoji: "😌", label: "calm", color: "mood-calm" },
  { emoji: "😰", label: "anxious", color: "mood-anxious" },
  { emoji: "😤", label: "angry", color: "mood-angry" },
  { emoji: "🥰", label: "loved", color: "mood-loved" },
  { emoji: "😐", label: "neutral", color: "mood-neutral" },
];

interface MoodPickerProps {
  selected?: string;
  onSelect: (mood: string) => void;
}

export default function MoodPicker({ selected, onSelect }: MoodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <motion.button
          key={mood.label}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(mood.label)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all border ${
            selected === mood.label
              ? `bg-${mood.color}/20 border-${mood.color}/40 text-foreground`
              : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <span className="text-base">{mood.emoji}</span>
          <span className="capitalize">{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
