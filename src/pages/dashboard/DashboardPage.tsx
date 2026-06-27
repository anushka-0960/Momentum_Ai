import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Clock, 
  Plus, 
  Trash2, 
  Flame, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Check, 
  Play, 
  PlusCircle, 
  BrainCircuit,
  Mic,
  MicOff,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { useTasks } from "../../hooks/useTasks";
import { useAuth } from "../../hooks/useAuth";
import { aiApi } from "../../api/aiApi";
import { 
  subscribeToHabits, 
  toggleHabitDate, 
  createHabit, 
  deleteHabit, 
  Habit 
} from "../../services/taskService";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, addTask, updateTaskStatus, deleteTaskById } = useTasks();
  
  // Local Habits state
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [showAddHabit, setShowAddHabit] = useState(false);
  
  // Quick Add Task state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [coachAdvice, setCoachAdvice] = useState("Analyzing your workload to provide coaching feedback...");

  // AI Coach Assistant state
  const [coachQuestion, setCoachQuestion] = useState("");
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [structuredAdvice, setStructuredAdvice] = useState<any>(null);
  const [coachError, setCoachError] = useState("");
  const [isListeningCoach, setIsListeningCoach] = useState(false);

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Strip any ending period that speech recognition automatically adds
      const cleanTranscript = transcript.endsWith(".") ? transcript.slice(0, -1) : transcript;
      setTaskTitle(cleanTranscript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const startVoiceInputCoach = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListeningCoach(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const cleanTranscript = transcript.endsWith(".") ? transcript.slice(0, -1) : transcript;
      setCoachQuestion(cleanTranscript);
      setIsListeningCoach(false);
      handleAskCoach(cleanTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      setIsListeningCoach(false);
    };

    recognition.onend = () => {
      setIsListeningCoach(false);
    };

    recognition.start();
  };

  // Subscribing to habits
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToHabits(user.uid, (fetchedHabits) => {
      setHabits(fetchedHabits);
    });
    return () => unsubscribe();
  }, [user]);

  const fetchCoachAdvice = async () => {
    if (!user) return;
    try {
      const pendingTasks = tasks.filter(t => t.status !== "done");
      const tasksSummary = pendingTasks.map(t => `${t.title} (${t.priority} priority)`).join(", ") || "No tasks scheduled.";
      const habitsSummary = habits.map(h => `${h.name} (${h.streak} day streak)`).join(", ") || "No habits logged.";

      const response = await aiApi.coach(tasksSummary, habitsSummary, undefined, undefined);
      if (response && response.message) {
        setCoachAdvice(response.message);
        return;
      }
    } catch (err) {
      console.warn("AI Coach advice request failed, calling local fallback: ", err);
    }

    // Fallback logic if API failed
    const pending = tasks.filter(t => t.status !== "done");
    if (pending.length === 0) {
      setCoachAdvice("Incredible! You have completed all scheduled tasks. Take a 15-minute screen break to rest your eyes.");
    } else {
      const highPriority = pending.find(t => t.priority === "high");
      if (highPriority) {
        setCoachAdvice(`Prioritize "${highPriority.title}". It's ranked High. Breaking this down now will save you stress later.`);
      } else {
        setCoachAdvice(`You have ${pending.length} tasks waiting. Select the quickest one, set a 25-minute Pomodoro, and cross it off.`);
      }
    }
  };

  const handleAskCoach = async (questionText: string) => {
    if (!questionText.trim() || !user) return;
    setIsCoachLoading(true);
    setCoachError("");
    try {
      const pendingTasks = tasks.filter(t => t.status !== "done");
      const tasksSummary = pendingTasks.map(t => `${t.title} (${t.priority} priority)`).join(", ") || "No tasks scheduled.";
      const habitsSummary = habits.map(h => `${h.name} (${h.streak} day streak)`).join(", ") || "No habits logged.";

      const response = await aiApi.coach(tasksSummary, habitsSummary, questionText, undefined);
      if (response && (response.summary || response.recommendedActions)) {
        setStructuredAdvice(response);
      } else {
        setStructuredAdvice({
          summary: response.message || "Advice processed successfully.",
          recommendedActions: ["Focus on your high-priority items first."],
          estimatedTime: "Varies",
          priority: "Medium",
          risks: "None detected.",
          aiRecommendation: "Keep taking active daily progress blocks to stay on track."
        });
      }
    } catch (err) {
      console.error(err);
      setCoachError("Could not retrieve coach recommendations. Please check connection.");
    } finally {
      setIsCoachLoading(false);
    }
  };

  useEffect(() => {
    if (user && (tasks.length > 0 || habits.length > 0)) {
      fetchCoachAdvice();
    }
  }, [user, tasks.length, habits.length]);

  // Handle Quick Add Task
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setIsAdding(true);
    setErrorMsg("");
    try {
      await addTask(taskTitle, taskPriority, taskDueDate);
      setTaskTitle("");
      setTaskDueDate("");
      setTaskPriority("medium");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to add task.");
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Habit Toggle
  const handleToggleHabit = async (habit: Habit) => {
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      await toggleHabitDate(habit, todayStr);
    } catch (err) {
      console.error("Error toggling habit:", err);
    }
  };

  // Handle Add Habit
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim() || !user) return;
    try {
      await createHabit(user.uid, newHabitName);
      setNewHabitName("");
      setShowAddHabit(false);
    } catch (err) {
      console.error("Error creating habit:", err);
    }
  };

  // Handle Delete Habit
  const handleDeleteHabit = async (id: string) => {
    try {
      await deleteHabit(id);
    } catch (err) {
      console.error("Error deleting habit:", err);
    }
  };

  // Stats calculation
  const completedTasksCount = tasks.filter(t => t.status === "done").length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  
  const chartData = [
    { name: "Completed", value: completedTasksCount || 0 },
    { name: "Remaining", value: (totalTasksCount - completedTasksCount) || 1 }
  ];
  const COLORS = ["#2563eb", "#e2e8f0"];

  return (
    <div className="space-y-6">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hello, {user?.displayName ? user.displayName.split(" ")[0] : "Productive User"} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what your AI productivity coach recommends today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/focus" 
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-semibold shadow-md shadow-accent-600/10 transition-all text-sm"
          >
            <Play className="w-4 h-4 fill-white" /> Focus Mode
          </Link>
        </div>
      </div>

      {/* AI Coach Suggestion Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 rounded-2xl border border-blue-100 dark:border-slate-850 flex items-start gap-3 bg-gradient-to-r from-accent-50/50 via-white/80 to-indigo-50/30 dark:from-slate-900/30 dark:via-slate-900/60 dark:to-slate-900/30"
      >
        <span className="p-2 rounded-xl bg-accent-100 dark:bg-accent-950/60 text-accent-700 dark:text-accent-400 shrink-0">
          <BrainCircuit className="w-5 h-5 animate-pulse" style={{ animationDuration: '3s' }} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
            Coach Insight <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-400 font-semibold uppercase tracking-wider">Gemini Active</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-400 mt-0.5 leading-normal">
            {coachAdvice}
          </p>
        </div>
      </motion.div>

      {/* Stats Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Completion Rate Card */}
        <div className="glass-card p-5 rounded-2xl border border-white/40 dark:border-slate-850/60 flex items-center gap-4">
          <div className="w-16 h-16 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={28}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill={COLORS[0]} />
                  <Cell fill={COLORS[1]} className="opacity-20" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-white">
              {completionRate}%
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tasks Completed</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block">
              {completedTasksCount} <span className="text-xs font-medium text-slate-400">/ {totalTasksCount}</span>
            </span>
          </div>
        </div>

        {/* Focus Time Card */}
        <div className="glass-card p-5 rounded-2xl border border-white/40 dark:border-slate-850/60 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Focus Time</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block">
              0 <span className="text-xs font-medium text-slate-400">mins today</span>
            </span>
          </div>
        </div>

        {/* Habits Streak Card */}
        <div className="glass-card p-5 rounded-2xl border border-white/40 dark:border-slate-850/60 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Streaks</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block">
              {habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0} <span className="text-xs font-medium text-slate-400">days max</span>
            </span>
          </div>
        </div>

        {/* Upcoming Deadline Card */}
        <div className="glass-card p-5 rounded-2xl border border-white/40 dark:border-slate-850/60 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Upcoming Deadlines</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block">
              {tasks.filter(t => t.dueDate && t.status !== "done").length} <span className="text-xs font-medium text-slate-400">pending</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Tasks and Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Tasks Column (Left) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Add Task Card */}
          <div className="glass-card p-5 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm">
            <h2 className="text-md font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-accent-600" /> Quick Add Task
            </h2>
            {errorMsg && (
              <div className="mb-3 p-2 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleQuickAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative flex items-center">
                <input 
                  type="text" 
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="What is your next focus goal?" 
                  className="w-full bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl pl-3.5 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                    isListening 
                      ? "text-red-500 bg-red-50 dark:bg-red-950/30 animate-pulse" 
                      : "text-slate-400 hover:text-slate-655 dark:hover:text-slate-200"
                  }`}
                  title="Speak Task"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <div className="sm:col-span-3">
                <select 
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-slate-900 dark:text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <button 
                  type="submit"
                  disabled={isAdding}
                  className="w-full bg-accent-600 hover:bg-accent-700 disabled:opacity-75 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-1"
                >
                  {isAdding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Add Task</>}
                </button>
              </div>
            </form>
          </div>

          {/* AI Coach Assistant Card */}
          <div className="glass-card p-5 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-accent-600" /> AI Coach Assistant
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-400 font-semibold uppercase tracking-wider">
                Productivity Advisor
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get structured prioritization, actions, and deadline risk warnings from your time-management coach.
            </p>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2">
              {[
                "What should I do now?",
                "Can I finish everything today?",
                "How can I complete this project faster?",
                "What is blocking my progress?"
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={isCoachLoading}
                  onClick={() => {
                    setCoachQuestion(chip);
                    handleAskCoach(chip);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-850 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-350 hover:bg-accent-50 dark:hover:bg-slate-900 hover:border-accent-500 hover:text-accent-700 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Coach Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskCoach(coachQuestion);
              }}
              className="flex gap-2 items-center"
            >
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={coachQuestion}
                  onChange={(e) => setCoachQuestion(e.target.value)}
                  placeholder="Ask your coach anything about your study goals or workload..."
                  className="w-full bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl pl-3.5 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={startVoiceInputCoach}
                  className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                    isListeningCoach
                      ? "text-red-500 bg-red-50 dark:bg-red-950/30 animate-pulse"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                  title="Speak Question"
                >
                  {isListeningCoach ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isCoachLoading || !coachQuestion.trim()}
                className="bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
              >
                {isCoachLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Ask
                  </>
                )}
              </button>
            </form>

            {coachError && (
              <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-500/20 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {coachError}
              </div>
            )}

            {/* Coach Loading Skeleton */}
            {isCoachLoading && (
              <div className="space-y-3 p-4 bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/20 dark:border-slate-850/20 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="flex gap-2 pt-2">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                </div>
              </div>
            )}

            {/* Coach Response Structured Box */}
            {structuredAdvice && !isCoachLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/20 dark:border-slate-850/20 space-y-4"
              >
                {/* Header: Priority & Time */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/30 dark:border-slate-850/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority:</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        structuredAdvice.priority === "High"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : structuredAdvice.priority === "Medium"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {structuredAdvice.priority || "Medium"}
                    </span>
                  </div>
                  {structuredAdvice.estimatedTime && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-semibold">{structuredAdvice.estimatedTime}</span>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Summary</h4>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {structuredAdvice.summary}
                  </p>
                </div>

                {/* Actions */}
                {structuredAdvice.recommendedActions && structuredAdvice.recommendedActions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommended Actions</h4>
                    <div className="space-y-1.5">
                      {structuredAdvice.recommendedActions.map((action: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                          <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-350">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risks banner */}
                {structuredAdvice.risks && (
                  <div className="p-3 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-450 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Potential Risks
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-450 leading-normal">
                      {structuredAdvice.risks}
                    </p>
                  </div>
                )}

                {/* Coach strategy recommendation bubble */}
                {structuredAdvice.aiRecommendation && (
                  <div className="flex items-start gap-3 bg-gradient-to-r from-accent-500/10 to-indigo-500/5 dark:from-accent-950/20 dark:to-slate-900/10 p-3.5 rounded-xl border border-accent-500/10 dark:border-accent-950/30">
                    <span className="p-1.5 rounded-lg bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-400 shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 fill-accent-600" />
                    </span>
                    <div>
                      <h5 className="text-[10px] font-bold text-accent-700 dark:text-accent-400 uppercase tracking-wider">Coach Recommendation</h5>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 italic font-medium leading-relaxed">
                        "{structuredAdvice.aiRecommendation}"
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Task list container */}
          <div className="glass-card p-5 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-bold text-slate-900 dark:text-white">Today's Focus Checklist</h2>
              <Link to="/tasks" className="text-xs text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-0.5">
                View All Tasks <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                  No tasks available. Add some goals to kickstart your day!
                </div>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="py-3.5 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => updateTaskStatus(task.id, task.status === "done" ? "todo" : "done")}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          task.status === "done"
                            ? "bg-accent-600 border-accent-600 text-white"
                            : "border-slate-300 dark:border-slate-700 hover:border-accent-500"
                        }`}
                      >
                        {task.status === "done" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div>
                        <p className={`text-sm font-semibold leading-normal ${task.status === "done" ? "line-through text-slate-450 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            task.priority === "high" 
                              ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                              : task.priority === "medium"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                          }`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" /> Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTaskById(task.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
                      aria-label="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Widgets: Habit tracker (Right) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Habit Tracker card */}
          <div className="glass-card p-5 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-bold text-slate-900 dark:text-white">Habit Tracker</h2>
              <button 
                onClick={() => setShowAddHabit(!showAddHabit)}
                className="text-xs text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" /> Habit
              </button>
            </div>

            {showAddHabit && (
              <form onSubmit={handleAddHabit} className="flex gap-2">
                <input 
                  type="text" 
                  required
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Read, Exercise" 
                  className="flex-1 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-slate-900 dark:text-white"
                />
                <button 
                  type="submit"
                  className="bg-accent-600 text-white text-xs px-3 py-1.5 rounded-xl font-semibold hover:bg-accent-700 transition-colors"
                >
                  Save
                </button>
              </form>
            )}

            <div className="space-y-3">
              {habits.length === 0 ? (
                <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-4">
                  No habits set up yet.
                </div>
              ) : (
                habits.map((habit) => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const isDoneToday = habit.history.includes(todayStr);
                  return (
                    <div key={habit.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-850/20">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{habit.name}</p>
                        <p className="text-[10px] text-amber-500 flex items-center gap-0.5 mt-0.5">
                          <Flame className="w-3 h-3 fill-amber-500" /> {habit.streak} day streak
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleHabit(habit)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isDoneToday 
                              ? "bg-emerald-600 text-white" 
                              : "bg-white/60 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-400 hover:border-emerald-500"
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3.5]" />
                        </button>
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Focus Pomodoro Widget */}
          <div className="glass-card p-5 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> Pomodoro Timer
            </h2>
            <div className="text-center py-4 bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/20 dark:border-slate-850/20">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">25:00</div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider block mt-1 uppercase">Standard session</span>
            </div>
            <Link 
              to="/focus"
              className="w-full py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold text-xs transition-all flex items-center justify-center gap-1"
            >
              Start Focus Block <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
