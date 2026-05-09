import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap, Shield, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

type SelectedRole = "admin" | "student";

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<SelectedRole>("admin");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, loginStatus } = useAuth();
  const { role, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated && role) {
    navigate({
      to: role === "admin" ? "/admin/dashboard" : "/student/dashboard",
    });
    return null;
  }

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isLoading = isLoggingIn || loginStatus === "logging-in";

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
          <ThemeToggle />
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
              Sign in to your Akshay Classes account using Internet Identity
            </p>

            <div className="mb-8">
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
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedRole === "admin" ? "bg-primary/20" : "bg-muted"
                    }`}
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
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedRole === "student" ? "bg-primary/20" : "bg-muted"
                    }`}
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

            <Button
              size="lg"
              className="w-full gradient-accent text-primary-foreground shadow-soft font-semibold"
              onClick={handleLogin}
              disabled={isLoading}
              data-ocid="login.submit_button"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : (
                "Sign in with Internet Identity"
              )}
            </Button>

            <div className="mt-6 p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                <span className="font-medium text-foreground">
                  Internet Identity
                </span>{" "}
                provides secure, passwordless authentication built on the
                Internet Computer. No passwords, no data breaches.
              </p>
            </div>
          </motion.div>

          <div className="text-center mt-5">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-fast"
            >
              \u2190 Back to home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
