import type { Admin, AuthState, Profile, Role, User } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setAdmin: (admin: Admin | null) => void;
  setRole: (role: Role | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      admin: null,
      role: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setAdmin: (admin) => set({ admin }),
      setRole: (role) => set({ role }),
      setLoading: (isLoading) => set({ isLoading }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      logout: () =>
        set({
          user: null,
          profile: null,
          admin: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "akshay-auth-store",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        admin: state.admin,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
