import { createActor } from "@/backend";
import * as svc from "@/services/backendService";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { identity, loginStatus } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);
  const store = useAuthStore();
  const {
    setLoading,
    setUser,
    setAuthenticated,
    setProfile,
    setRole,
    setAdmin,
  } = store;
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    if (!actor || isFetching) return;
    if (loginStatus !== "success" || !identity) return;

    handled.current = true;

    const handleCallback = async () => {
      setLoading(true);
      try {
        const principal = identity.getPrincipal().toText();
        setUser({ principal });
        setAuthenticated(true);

        const profile = await svc.getMyProfile(actor);

        if (!profile) {
          navigate({ to: "/login" });
          return;
        }

        setProfile(profile);
        setRole(profile.role as Role);

        if (profile.role === "admin") {
          const admin = await svc.getAdminByProfile(actor);
          setAdmin(admin);
          navigate({ to: "/admin/dashboard" });
        } else {
          navigate({ to: "/student/dashboard" });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [
    actor,
    isFetching,
    loginStatus,
    identity,
    navigate,
    setLoading,
    setUser,
    setAuthenticated,
    setProfile,
    setRole,
    setAdmin,
  ]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="w-16 h-16 rounded-2xl gradient-accent shadow-elevated flex items-center justify-center">
          <GraduationCap className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1,
                  delay: i * 0.2,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Verifying your identity...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
