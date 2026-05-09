import { createActor } from "@/backend";
import * as svc from "@/services/backendService";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, createContext, useContext, useEffect } from "react";

interface AuthContextValue {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginStatus: string;
}

const AuthContext = createContext<AuthContextValue>({
  login: async () => {},
  logout: async () => {},
  loginStatus: "idle",
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    login: iiLogin,
    clear,
    loginStatus,
    identity,
  } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);
  const store = useAuthStore();
  const qc = useQueryClient();
  const {
    setUser,
    setAuthenticated,
    setLoading,
    setProfile,
    setRole,
    setAdmin,
  } = store;

  useEffect(() => {
    if (!actor || isFetching) return;
    if (loginStatus !== "success" || !identity) return;

    const principal = identity.getPrincipal().toText();
    setUser({ principal });
    setAuthenticated(true);

    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await svc.getMyProfile(actor);
        if (profile) {
          setProfile(profile);
          setRole(profile.role as Role);
          if (profile.role === "admin") {
            const admin = await svc.getAdminByProfile(actor);
            setAdmin(admin);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [
    actor,
    isFetching,
    loginStatus,
    identity,
    setUser,
    setAuthenticated,
    setLoading,
    setProfile,
    setRole,
    setAdmin,
  ]);

  useEffect(() => {
    if (loginStatus === "idle") {
      setLoading(false);
    }
  }, [loginStatus, setLoading]);

  const login = async () => {
    await iiLogin();
  };

  const logout = async () => {
    await clear();
    store.logout();
    qc.clear();
  };

  return (
    <AuthContext.Provider value={{ login, logout, loginStatus }}>
      {children}
    </AuthContext.Provider>
  );
}
