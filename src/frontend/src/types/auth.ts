export type Role = "admin" | "student";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: Role;
}
