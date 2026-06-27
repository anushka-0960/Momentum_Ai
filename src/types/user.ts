export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  preferences: {
    theme: "light" | "dark";
    workHours: { start: string; end: string };
    aiTone: "encouraging" | "direct" | "neutral";
  };
}
