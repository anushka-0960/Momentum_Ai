import { createContext, useContext, useState, ReactNode } from "react";
import type { AppUser } from "../types/user";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  // Placeholder state — Step 3 (Auth) replaces this with a real
  // Firebase onAuthStateChanged listener.
  const [user] = useState<AppUser | null>(null);
  const [loading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
