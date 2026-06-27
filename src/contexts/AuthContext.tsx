import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AppUser } from "../types/user";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<AppUser["preferences"]>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_USER: AppUser = {
  uid: "mock-user-123",
  displayName: "Momentum User",
  email: "user@momentum.ai",
  photoURL: null,
  preferences: {
    theme: "dark",
    workHours: { start: "09:00", end: "17:00" },
    aiTone: "encouraging"
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading, then set mock user
    const timer = setTimeout(() => {
      setUser(MOCK_USER);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const signInWithGoogle = async () => {};
  const loginWithEmail = async () => {};
  const signUpWithEmail = async () => {};
  const resetPassword = async () => {};
  const logout = async () => { setUser(null); };

  const updateUserPreferences = (newPrefs: Partial<AppUser["preferences"]>) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...newPrefs
        }
      };
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle, 
      loginWithEmail, 
      signUpWithEmail, 
      resetPassword, 
      logout,
      updateUserPreferences
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
