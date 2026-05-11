import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/auth";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap, Info, Moon, Shield, Sun, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Redirect if already logged in
  if (isAuthenticated && user) {
    navigate({
      to: user.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
    });
    return null;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      const result = login(email.trim(), password, selectedRole);
      if (result) {
        navigate({
          to:
            result.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillDemo() {
    if (selectedRole === "admin") {
      setEmail("admin@akshayclasses.com");
      setPassword("admin123");
    } else {
      setEmail("student@akshayclasses.com");
      setPassword("student123");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="glass-header">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-sm">Akshay Classes</p>
              <p className="text-[10px] text-muted-foreground">
                Fee Management Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-fast text-muted-foreground"
            data-ocid="login.theme_toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="glass-card rounded-3xl p-8 shadow-elevated"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-accent shadow-elevated flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold text-center text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Sign in to manage Akshay Classes fee portal
            </p>

            {/* Role Selector */}
            <div className="mb-6">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                Select your role
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  data-ocid="login.role.admin"
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-fast cursor-pointer ${
                    selectedRole === "admin"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === "admin" ? "bg-primary/20" : "bg-muted"}`}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">Admin</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Institute staff
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  data-ocid="login.role.student"
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-fast cursor-pointer ${
                    selectedRole === "student"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === "student" ? "bg-primary/20" : "bg-muted"}`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">Student</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Enrolled student
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/30"
                  data-ocid="login.email_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted/30"
                  data-ocid="login.password_input"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gradient-accent text-primary-foreground shadow-soft font-semibold"
                disabled={isSubmitting}
                data-ocid="login.submit_button"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo credentials helper */}
            <div className="mt-5 p-4 bg-muted/40 rounded-xl border border-border/30">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground mb-1">
                    Demo Credentials
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Admin:</strong> admin@akshayclasses.com / admin123
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Student:</strong> student@akshayclasses.com /
                    student123
                  </p>
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="text-xs text-primary hover:text-primary/80 transition-fast mt-1.5 font-medium"
                    data-ocid="login.fill_demo_button"
                  >
                    Fill demo credentials →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
