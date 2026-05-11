import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types/auth";
import { type ReactNode, createContext, useContext } from "react";

interface AuthContextValue {
  login: (email: string, password: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { login, logout } = useAuth();
  return (
    <AuthContext.Provider value={{ login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth2() {
  return useContext(AuthContext);
}
