import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import logo from "@/assets/logo.png";

type AuthMode = "login" | "signup" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { contact_name: name },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a confirmation link." });
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "Password reset link sent." });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-xl border border-border/50 bg-gradient-card p-8 shadow-card"
      >
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-2">
            <img src={logo} alt="Trades USA" className="h-8 w-8" />
            <span className="font-display text-xl font-bold">
              TRADES<span className="text-gradient-primary">USA</span>
            </span>
          </a>
          <h1 className="mt-4 font-display text-2xl font-bold">
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Create Your Account"}
            {mode === "forgot" && "Reset Password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" && "Log in to your Command Center"}
            {mode === "signup" && "Start getting leads in minutes"}
            {mode === "forgot" && "We'll send you a reset link"}
          </p>
        </div>

        <form onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-border/50 bg-background/50 pl-10"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border/50 bg-background/50 pl-10"
              required
            />
          </div>
          {mode !== "forgot" && (
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border/50 bg-background/50 pl-10"
                required
                minLength={6}
              />
            </div>
          )}

          <Button variant="hero" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          {mode === "login" && (
            <>
              <button onClick={() => setMode("forgot")} className="text-primary hover:underline">
                Forgot password?
              </button>
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline">
                  Sign up
                </button>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-primary hover:underline">
                Log in
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} className="flex items-center gap-1 mx-auto text-primary hover:underline">
              <ArrowLeft size={14} /> Back to login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
