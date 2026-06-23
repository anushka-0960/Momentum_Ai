import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Music, 
  ShieldAlert, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Plus,
  Trash2,
  Check
} from "lucide-react";

type TimerMode = "focus" | "short_break" | "long_break";

export default function FocusModePage() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  
  // Sound controls
  const [isMuted, setIsMuted] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState("Lofi Beats");

  // Website Blocker Mock lists
  const [blockedSites, setBlockedSites] = useState([
    { domain: "facebook.com", active: true },
    { domain: "twitter.com", active: true },
    { domain: "youtube.com", active: false },
    { domain: "netflix.com", active: false }
  ]);
  const [newSiteInput, setNewSiteInput] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Focus Coach quotes list
  const focusQuotes = [
    "Deep focus is a superpower. Remove all distractions.",
    "One task at a time. The rest can wait.",
    "Drafting your goal is half the battle. Completing it is the victory.",
    "Stay in motion. 25 minutes of deep focus is all it takes.",
    "Your future self will thank you for focusing right now."
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Quotes cycler
  useEffect(() => {
    const qInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % focusQuotes.length);
    }, 15000);
    return () => clearInterval(qInterval);
  }, []);

  // Timer values setup
  const getModeDuration = (m: TimerMode) => {
    switch (m) {
      case "focus": return 25 * 60;
      case "short_break": return 5 * 60;
      case "long_break": return 15 * 60;
    }
  };

  useEffect(() => {
    setTimeLeft(getModeDuration(mode));
    setIsRunning(false);
  }, [mode]);

  // Timer Tick implementation
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // alert sound placeholder / alert
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getModeDuration(mode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Add mock blocked site
  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteInput.trim()) return;
    setBlockedSites([...blockedSites, { domain: newSiteInput.trim(), active: true }]);
    setNewSiteInput("");
  };

  const handleToggleSite = (index: number) => {
    const copy = [...blockedSites];
    copy[index].active = !copy[index].active;
    setBlockedSites(copy);
  };

  const handleDeleteSite = (index: number) => {
    setBlockedSites(blockedSites.filter((_, i) => i !== index));
  };

  // Calculate circular stroke values
  const totalDuration = getModeDuration(mode);
  const strokePercent = (timeLeft / totalDuration) * 282.6; // circle perimeter is approx 2 * pi * r (r=45, perimeter ~ 282.6)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6rem)] min-h-0 relative items-stretch">
      
      {/* Timer Display (Left Column) */}
      <div className="lg:col-span-8 flex flex-col justify-center items-center bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-850/50 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        
        {/* Particle circles background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent-500/5 dark:bg-accent-500/3 rounded-full blur-3xl pointer-events-none" />

        {/* Timer Mode Buttons */}
        <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl shrink-0 z-10 border border-slate-200/40 dark:border-slate-850/40">
          <button 
            onClick={() => setMode("focus")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === "focus" 
                ? "bg-accent-600 text-white shadow-md shadow-accent-600/10" 
                : "text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Focus Session
          </button>
          <button 
            onClick={() => setMode("short_break")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === "short_break" 
                ? "bg-accent-600 text-white shadow-md" 
                : "text-slate-550 dark:text-slate-400 hover:text-slate-800"
            }`}
          >
            Short Break
          </button>
          <button 
            onClick={() => setMode("long_break")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === "long_break" 
                ? "bg-accent-600 text-white shadow-md" 
                : "text-slate-550 dark:text-slate-400 hover:text-slate-800"
            }`}
          >
            Long Break
          </button>
        </div>

        {/* Circular Countdown Render */}
        <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
          <svg className="absolute w-full h-full rotate-[-90deg] p-2">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="stroke-slate-200 dark:stroke-slate-850 stroke-[5] fill-none"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="stroke-accent-600 stroke-[5] fill-none transition-all duration-300"
              strokeDasharray="282.6"
              strokeDashoffset={282.6 - strokePercent}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits */}
          <div className="text-center z-10">
            <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatTime(timeLeft)}
            </h2>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-2">
              {mode.replace("_", " ")} mode
            </span>
          </div>
        </div>

        {/* Timer Control Options */}
        <div className="flex items-center gap-4 mt-8 z-10">
          <button 
            onClick={handleResetTimer}
            className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all shadow-sm"
            title="Reset Session"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleToggleTimer}
            className="p-5 rounded-3xl bg-accent-600 hover:bg-accent-700 text-white shadow-xl shadow-accent-600/25 transition-all"
            title={isRunning ? "Pause Session" : "Start Session"}
          >
            {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>
          
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all shadow-sm"
            title={isMuted ? "Unmute Timer" : "Mute Timer"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Motivational quotes cycling */}
        <div className="mt-8 text-center max-w-sm px-6 z-10 shrink-0">
          <p className="text-xs text-slate-400 font-semibold tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" /> COACH INSIGHT
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 italic mt-2 leading-relaxed">
            "{focusQuotes[quoteIndex]}"
          </p>
        </div>

      </div>

      {/* Sidebar Controls: Music & Blocker (Right Column) */}
      <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
        
        {/* Lofi/Ambient Music Panel */}
        <div className="glass-card p-5 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm flex flex-col justify-between shrink-0 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Music className="w-4.5 h-4.5 text-accent-600" />
            <h3 className="text-sm font-bold">Focus Ambient Audio</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {["Lofi Beats", "Rainforest", "Ocean Waves", "Deep Space"].map((track) => (
              <button
                key={track}
                onClick={() => setSelectedMusic(track)}
                className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                  selectedMusic === track 
                    ? "bg-accent-600 border-accent-600 text-white shadow-sm" 
                    : "bg-white/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                {track}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-850/20">
            <div className="flex items-center gap-2">
              {/* Animated playing sound bar mock */}
              <div className="flex gap-0.5 items-end h-3 w-4">
                <span className={`w-0.5 bg-accent-600 rounded-full animate-bounce ${isRunning ? '' : 'h-1'}`} style={{ animationDuration: '0.6s' }} />
                <span className={`w-0.5 bg-accent-600 rounded-full animate-bounce ${isRunning ? '' : 'h-2'}`} style={{ animationDuration: '0.8s', animationDelay: '0.1s' }} />
                <span className={`w-0.5 bg-accent-600 rounded-full animate-bounce ${isRunning ? '' : 'h-1.5'}`} style={{ animationDuration: '0.5s', animationDelay: '0.2s' }} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate">{selectedMusic}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Mock Playing</span>
          </div>
        </div>

        {/* Website Blocker Panel */}
        <div className="glass-card p-5 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm flex-1 flex flex-col justify-between min-h-0 space-y-4">
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white shrink-0">
              <ShieldAlert className="w-4.5 h-4.5 text-accent-600" />
              <h3 className="text-sm font-bold">Site Distraction Blocker</h3>
            </div>

            {/* Block Site Form */}
            <form onSubmit={handleAddSite} className="flex gap-2 shrink-0">
              <input
                type="text"
                required
                placeholder="Block e.g. reddit.com"
                value={newSiteInput}
                onChange={(e) => setNewSiteInput(e.target.value)}
                className="flex-1 bg-white/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="bg-slate-850 text-white dark:bg-slate-800 dark:hover:bg-slate-750 p-2 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors shrink-0"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </form>

            {/* Scrollable Site blocking list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[100px]">
              {blockedSites.map((site, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-850/20">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSite(index)}
                      className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                        site.active 
                          ? "bg-red-500 border-red-500 text-white" 
                          : "border-slate-350 dark:border-slate-650 hover:border-red-500"
                      }`}
                    >
                      {site.active && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span className={`text-xs font-bold leading-none ${site.active ? "text-slate-800 dark:text-slate-200" : "text-slate-450 dark:text-slate-500"}`}>
                      {site.domain}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteSite(index)}
                    className="p-1 text-slate-405 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 leading-normal shrink-0">
            🚩 Blocker runs as a mockup Chrome extension wrapper.
          </div>
        </div>

      </div>

    </div>
  );
}
