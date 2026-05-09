import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuthStore } from "@/store/authStore";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

interface AuthLayoutProps {
  requiredRole?: "admin" | "student";
}

export function AuthLayout({ requiredRole }: AuthLayoutProps) {
  const { isAuthenticated, isLoading, role } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (requiredRole && role && role !== requiredRole) {
      const redirect =
        role === "admin" ? "/admin/dashboard" : "/student/dashboard";
      navigate({ to: redirect });
    }
  }, [isAuthenticated, isLoading, role, requiredRole, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requiredRole && role && role !== requiredRole) return null;

  return <Outlet />;
}
