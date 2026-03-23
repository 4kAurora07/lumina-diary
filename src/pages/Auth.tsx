import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, BookOpen, Heart, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Browser } from "@capacitor/browser";
import { toast } from "sonner";

// Reliable native detection — capacitor: protocol only exists in APK
const getRedirectURL = () => {
  if (
    window.location.protocol === "capacitor:" ||
    window.location.protocol === "ionic:"
  ) {
    return "com.luminary.app://callback";
  }
  return `${window.location.origin}/`;
};

const features = [
  { icon: BookOpen, text: "Daily journaling prompts" },
  { icon: Flame,    text: "Streak tracking"          },
  { icon: Heart,    text: "Mood insights"             },
];

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  if (loading) return <div className="min-h-screen bg-background" />;
  if (user) return <Navigate to="/" replace />;

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setMagicSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getRedirectURL() },
    });
    setMagicSending(false);
    if (error) toast.error(error.message);
    else setMagicSent(true);
  };

 const handleGoogle = async () => {
  setGoogleLoading(true);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "com.luminary.app://callback", // ← always use deep link
      skipBrowserRedirect: true,
    },
  });
  if (error) {
    toast.error(error.message);
    setGoogleLoading(false);
    return;
  }
  if (data?.url) {
    await Browser.open({ url: data.url });
  }
  setGoogleLoading(false);
};
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Ambient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-sm z-10 flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="relative mb-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center shadow-[0_0_40px_hsl(270,60%,55%,0.4)] border border-primary/20">
            <Sparkles size={32} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl -z-10" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-3"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="text-gradient">Luminary</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Your life, beautifully remembered.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-8 flex-wrap justify-center"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.text}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary/80"
              >
                <Icon size={11} strokeWidth={1.5} />
                {f.text}
              </div>
            );
          })}
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full glass-card rounded-3xl p-6"
        >
          {magicSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="text-5xl mb-4"
              >
                💌
              </motion.div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Magic link sent!
              </h2>
              <p className="text-muted-foreground text-sm mb-1">
                We sent a link to
              </p>
              <p className="text-primary text-sm font-semibold mb-6">
                {email}
              </p>
              <p className="text-xs text-muted-foreground/60 mb-4">
                Check your inbox and click the link to sign in.
              </p>
              <button
                onClick={() => { setMagicSent(false); setEmail(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-foreground mb-1">
                Get started free
              </h2>
              <p className="text-xs text-muted-foreground mb-5">
                No password needed — just your email.
              </p>

              {/* Email input */}
              <div className="relative mb-3">
                <Mail
                  size={15}
                  strokeWidth={1.5}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:bg-secondary/80 transition-all"
                />
              </div>

              {/* Magic link button */}
              <Button
                onClick={handleMagicLink}
                disabled={magicSending || googleLoading || !email.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl mb-4 h-11 gap-2 shadow-[0_0_20px_hsl(270,60%,55%,0.3)]"
              >
                {magicSending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Sparkles size={15} strokeWidth={1.5} />
                )}
                {magicSending ? "Sending..." : "Send Magic Link"}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Google button */}
              <button
                onClick={handleGoogle}
                disabled={magicSending || googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm font-medium text-foreground hover:bg-secondary hover:border-border transition-all disabled:opacity-50 h-11"
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
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground/30 mt-6"
        >
          By continuing you agree to our Terms & Privacy Policy
        </motion.p>

      </motion.div>
    </div>
  );
};

export default Auth;
