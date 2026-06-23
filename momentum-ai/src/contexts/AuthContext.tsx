import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import type { AppUser } from "../types/user";
import { auth } from "../services/firebase";
import { 
  signInWithGoogle as apiSignInWithGoogle,
  loginWithEmail as apiLoginWithEmail,
  signUpWithEmail as apiSignUpWithEmail,
  resetPassword as apiResetPassword,
  logoutUser as apiLogoutUser,
  getOrCreateUserPrefs
} from "../services/authService";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        // Fetch or create user preferences from Firestore
        const preferences = await getOrCreateUserPrefs(firebaseUser);
        
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          preferences,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await apiSignInWithGoogle();
  };

  const loginWithEmail = async (email: string, password: string) => {
    await apiLoginWithEmail(email, password);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    await apiSignUpWithEmail(email, password, displayName);
  };

  const resetPassword = async (email: string) => {
    await apiResetPassword(email);
  };

  const logout = async () => {
    await apiLogoutUser();
  };

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
