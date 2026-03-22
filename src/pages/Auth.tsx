import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const { user, loading } = useAuth();
  const [email,         setEmail        ] = useState("");
  const [magicSending,  setMagicSending ] = useState(false);
  const [magicSent,     setMagicSent    ] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (loading) return <div className="min-h-screen bg-background" />;
  if (user)    return <Navigate to="/" replace />;

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setMagicSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/" },
    });
    setMagicSending(false);
    if (error) {
      toast.error(error.message);
    } else {
      setMagicSent(true);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-sm z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_hsl(270,95%,75%,0.3)]"
          >
            <Sparkles size={24} strokeWidth={1.5} className="text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">
            Luminary
          </h1>
          <p className="text-muted-foreground text-sm">Your life, beautifully remembered.</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6">
          {magicSent ? (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="text-4xl mb-4">💌</div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Check your inbox!
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                We sent a magic link to
              </p>
              <p className="text-primary text-sm font-medium mb-6">{email}</p>
              <button
                onClick={() => { setMagicSent(false); setEmail(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <>
              {/* Email input */}
              <div className="mb-4">
                <label className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                />
              </div>

              {/* Magic link button */}
              <Button
                onClick={handleMagicLink}
                disabled={magicSending || googleLoading || !email.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl mb-4 gap-2"
              >
                {magicSending ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail size={16} strokeWidth={1.5} />
                )}
                {magicSending ? "Sending..." : "Send Magic Link"}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-xs text-muted-foreground/50">or</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              {/* Google button */}
              <button
                onClick={handleGoogle}
                disabled={magicSending || googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                {googleLoading ? "Redirecting..." : "Continue with Google"}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          No password needed — we'll send you a magic link ✨
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;