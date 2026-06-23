import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AppShell } from "./AppShell";

// Wraps protected routes (see router.tsx). Redirects to /signin if
// there's no authenticated user once the auth check has resolved.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Synchronizing session...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  return <AppShell>{children}</AppShell>;
}
