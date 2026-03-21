import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";
import EntryCard from "@/components/EntryCard";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim() || !user) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,mood.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20);
      setResults(data || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, user]);

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-lg font-bold mb-4">Search 🔍</h1>
          <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries, moods, tags..."
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-muted/50 border border-border/30 text-sm focus:outline-none focus:border-primary/50"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </motion.div>

        {searching && <p className="text-xs text-muted-foreground text-center">Searching...</p>}

        <div className="space-y-3">
          {results.map((entry, i) => (
            <EntryCard key={entry.id} entry={entry} index={i} onClick={() => navigate(`/write/${entry.id}`)} />
          ))}
          {query && !searching && results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No entries found 💫</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Search;
