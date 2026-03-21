import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import EntryCard from "@/components/EntryCard";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const Memory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onThisDayEntries, setOnThisDayEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const filtered = (data || []).filter((e) => {
          const d = new Date(e.created_at);
          return d.getMonth() + 1 === month && d.getDate() === day && d.getFullYear() !== today.getFullYear();
        });
        setOnThisDayEntries(filtered);
        setLoading(false);
      });
  }, [user]);

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">On This Day</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {format(new Date(), "MMMM d")} — memories from past years ✨
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-muted/50 rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted/30 rounded w-full" />
              </div>
            ))}
          </div>
        ) : onThisDayEntries.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-sm text-muted-foreground">No memories on this day yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Keep writing — future you will love looking back!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {onThisDayEntries.map((entry, i) => (
              <div key={entry.id}>
                <p className="text-xs text-primary/60 mb-1 ml-1">
                  {format(new Date(entry.created_at), "yyyy")}
                </p>
                <EntryCard entry={entry} index={i} onClick={() => navigate(`/write/${entry.id}`)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Memory;
