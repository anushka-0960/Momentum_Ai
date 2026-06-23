import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Wraps protected routes (see router.tsx). Redirects to /signin if
// there's no authenticated user once the auth check has resolved.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null; // replaced with a real loading skeleton in the Auth step
  if (!user) return <Navigate to="/signin" replace />;

  return <>{children}</>;
}
