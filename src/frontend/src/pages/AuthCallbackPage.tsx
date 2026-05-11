// AuthCallbackPage is no longer used in the localStorage-based architecture.
// Redirects to login for safety.
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/login" });
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
