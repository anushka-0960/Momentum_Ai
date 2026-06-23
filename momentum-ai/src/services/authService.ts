import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { AppUser } from "../types/user";

const googleProvider = new GoogleAuthProvider();

// Standard default preferences for new users
const DEFAULT_PREFERENCES = {
  theme: "light" as const,
  workHours: { start: "09:00", end: "17:00" },
  aiTone: "encouraging" as const,
};

// Fetch or create user document in Firestore
export async function getOrCreateUserPrefs(user: FirebaseUser): Promise<AppUser["preferences"]> {
  const userRef = doc(db, "users", user.uid);
  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        theme: data.preferences?.theme || DEFAULT_PREFERENCES.theme,
        workHours: data.preferences?.workHours || DEFAULT_PREFERENCES.workHours,
        aiTone: data.preferences?.aiTone || DEFAULT_PREFERENCES.aiTone,
      };
    } else {
      // Initialize Firestore document with default preferences
      const initialPrefs = DEFAULT_PREFERENCES;
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        preferences: initialPrefs
      });
      return initialPrefs;
    }
  } catch (error) {
    console.error("Error checking/creating user preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

// Google Authentication
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  await getOrCreateUserPrefs(result.user);
  return result.user;
}

// Email Sign In
export async function loginWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Email Registration
export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create user in Firestore with display name immediately
  const userRef = doc(db, "users", result.user.uid);
  await setDoc(userRef, {
    displayName,
    email,
    photoURL: null,
    createdAt: new Date().toISOString(),
    preferences: DEFAULT_PREFERENCES
  });
  
  return result.user;
}

// Password Reset Email
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Sign Out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
