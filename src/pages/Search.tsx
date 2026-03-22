import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
    if (!query.trim() || !user) {
      setResults([]);
      return;
    }
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
      <div className="px-4 pt-14 pb-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Search</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Find your past entries</p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <SearchIcon
            size={18}
            strokeWidth={1.5}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries, moods, tags..."
            className="w-full glass rounded-2xl pl-11 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
        </motion.div>

        {/* Searching indicator */}
        {searching && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs text-muted-foreground">Searching...</p>
          </div>
        )}

        {/* Empty state — nothing typed */}
        {!query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <SearchIcon size={36} strokeWidth={1} className="text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground/50 text-sm">
              Start typing to search your entries
            </p>
          </motion.div>
        )}

        {/* No results */}
        {query && !searching && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground/50 text-sm">
              No entries found for "{query}" 💫
            </p>
          </motion.div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {results.map((entry, i) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              index={i}
              onClick={() => navigate(`/write/${entry.id}`)}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Search;