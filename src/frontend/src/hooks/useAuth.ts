import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/auth";
import { toast } from "sonner";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
  } = useAuthStore();

  function login(email: string, password: string, role: Role) {
    const result = storeLogin(email, password, role);
    if (!result) {
      toast.error("Invalid email or password. Please try again.");
    } else {
      toast.success(`Welcome back, ${result.name}!`);
    }
    return result;
  }

  function logout() {
    storeLogout();
    toast.success("Logged out successfully.");
  }

  return { user, isAuthenticated, isLoading, login, logout };
}
