import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Clock, 
  BrainCircuit, 
  Sun, 
  Moon, 
  Save, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function SettingsPage() {
  const { user, updateUserPreferences } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile forms
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [aiTone, setAiTone] = useState(user?.preferences?.aiTone || "encouraging");
  const [startTime, setStartTime] = useState(user?.preferences?.workHours?.start || "09:00");
  const [endTime, setEndTime] = useState(user?.preferences?.workHours?.end || "17:00");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync profile details if user session finishes loading
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      if (user.preferences) {
        setAiTone(user.preferences.aiTone || "encouraging");
        setStartTime(user.preferences.workHours?.start || "09:00");
        setEndTime(user.preferences.workHours?.end || "17:00");
      }
    }
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const userRef = doc(db, "users", user.uid);
      const updatedPrefs = {
        theme,
        workHours: { start: startTime, end: endTime },
        aiTone
      };

      // Save to firestore
      await updateDoc(userRef, {
        displayName,
        preferences: updatedPrefs
      });

      // Update local AuthContext state
      updateUserPreferences(updatedPrefs);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to save configuration settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-accent-600" /> Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure your user profile, daily work calendar, and AI coaching preferences.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm">
        
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> All changes have been synchronized successfully.
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs sm:text-sm">
          
          {/* Profile Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-850/50">
              <UserIcon className="w-4.5 h-4.5 text-accent-600" /> Personal Identity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Account Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850/50 rounded-xl px-3 py-2.5 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* AI preferences section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-850/50">
              <BrainCircuit className="w-4.5 h-4.5 text-accent-600" /> AI Coach Configurations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Coach Personality Tone
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value as any)}
                  className="w-full bg-white/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none text-slate-900 dark:text-white font-medium"
                >
                  <option value="encouraging">Encouraging & Warm (Recommended)</option>
                  <option value="direct">Direct & Accountability Focused</option>
                  <option value="neutral">Analytical & Objective</option>
                </select>
              </div>
              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Coach Model Target</span>
                <p className="text-xs text-slate-400 leading-normal">
                  Our service connects to Google Gemini (<code>gemini-2.0-flash</code>) for real-time task breakdowns and schedules.
                </p>
              </div>
            </div>
          </div>

          {/* Working hours section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-850/50">
              <Clock className="w-4.5 h-4.5 text-accent-600" /> Daily Work Schedule
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Work Hours Start
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Work Hours End
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Interface Appearance settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-850/50">
              <Sun className="w-4.5 h-4.5 text-accent-600" /> Theme Appearance
            </h3>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { if(theme !== "light") toggleTheme(); }}
                className={`flex-1 py-3.5 px-4 rounded-2xl border text-center font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === "light" 
                    ? "bg-accent-600 border-accent-600 text-white shadow-md shadow-accent-600/10" 
                    : "bg-white/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                }`}
              >
                <Sun className="w-4 h-4" /> Light Appearance
              </button>
              
              <button
                type="button"
                onClick={() => { if(theme !== "dark") toggleTheme(); }}
                className={`flex-1 py-3.5 px-4 rounded-2xl border text-center font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === "dark" 
                    ? "bg-accent-600 border-accent-600 text-white shadow-md shadow-accent-600/10" 
                    : "bg-white/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Appearance
              </button>
            </div>
          </div>

          {/* Submit action */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 disabled:opacity-75 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Save className="w-4 h-4" /> Save Preferences</>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
