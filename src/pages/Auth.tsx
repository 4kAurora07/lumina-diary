import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else if (isSignUp) {
      setConfirmSent(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">Luminary</h1>
          </motion.div>
          <p className="text-muted-foreground text-sm">Your dreamy digital diary ✨</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 shadow-lg">
          {confirmSent ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
              <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Check your email! 💌</h2>
              <p className="text-muted-foreground text-sm">We sent a confirmation link to {email}</p>
            </motion.div>
          ) : (
            <>
              <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted/50">
                {["Sign In", "Sign Up"].map((label, i) => (
                  <button
                    key={label}
                    onClick={() => { setIsSignUp(i === 1); setError(""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      (i === 1) === isSignUp
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted/50 border-border/50 focus:border-primary/50"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-muted/50 border-border/50 focus:border-primary/50"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-destructive text-sm"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {submitting ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : isSignUp ? (
                    "Create Account ✨"
                  ) : (
                    "Welcome Back 💜"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
