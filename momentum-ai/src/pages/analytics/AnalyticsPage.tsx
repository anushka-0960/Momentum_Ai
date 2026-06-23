import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  BarChart3, 
  Clock, 
  Flame, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle,
  Award
} from "lucide-react";
import { useTasks } from "../../hooks/useTasks";
import { aiApi } from "../../api/aiApi";
import { auth } from "../../services/firebase";

// Mock weekly trend data
const weeklyFocusData = [
  { day: "Mon", minutes: 25 },
  { day: "Tue", minutes: 50 },
  { day: "Wed", minutes: 45 },
  { day: "Thu", minutes: 75 },
  { day: "Fri", minutes: 50 },
  { day: "Sat", minutes: 20 },
  { day: "Sun", minutes: 0 },
];

const taskCompletionHistory = [
  { week: "W1", completed: 4, added: 6 },
  { week: "W2", completed: 8, added: 9 },
  { week: "W3", completed: 11, added: 12 },
  { week: "W4", completed: 15, added: 16 },
];

export default function AnalyticsPage() {
  const { tasks } = useTasks();
  const [activeTab, setActiveTab] = useState<"charts" | "weekly_review">("charts");
  const [weeklyReview, setWeeklyReview] = useState<any | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // Real stats based on actual tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const mockWeeklyReview = {
    achievements: [
      "🔥 Completed 85% of high-priority project tasks this week.",
      "⌛ Logged 265 focus minutes total, surpassing last week by 20%."
    ],
    missedGoals: [
      "⚠️ Missed due date for 'Finalize slides presentation' by 1 day.",
      "📝 Habit tracker: Missed 2 days of 'Morning Stretching'."
    ],
    strengths: [
      "🏆 High consistency in morning hours (09:00 - 11:30).",
      "🎯 Exceptional completion rate on tasks broken down by AI."
    ],
    weaknesses: [
      "📉 Noticeable drop in focus sessions on Thursday afternoon.",
      "🚧 Leaving difficult tasks to late evening hours."
    ],
    recommendations: [
      "💡 Schedule complex coding or writing tasks on Monday/Tuesday morning.",
      "🚶 Take a 15-minute screen-free walk on Thursday after lunch to recharge."
    ]
  };

  const fetchWeeklyReview = async () => {
    setLoadingReview(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const completedList = tasks.filter(t => t.status === "done").map(t => t.title).join(", ");
      const pendingList = tasks.filter(t => t.status !== "done").map(t => `${t.title} (${t.priority} priority)`).join(", ");
      const summaryText = `Completed tasks: ${completedList || "None"}. Pending tasks: ${pendingList || "None"}. Rate: ${completionRate}%.`;

      const response = await aiApi.weeklyReview(summaryText, token);
      if (response && response.achievements) {
        setWeeklyReview(response);
        setLoadingReview(false);
        return;
      }
    } catch (err) {
      console.warn("Weekly review API failed, using local mock fallback:", err);
    }
    setWeeklyReview(mockWeeklyReview);
    setLoadingReview(false);
  };

  useEffect(() => {
    if (activeTab === "weekly_review" && !weeklyReview) {
      fetchWeeklyReview();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6 h-full flex flex-col min-h-0">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent-600" /> Performance Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze your task history, focus intervals, and streaks.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-850/40 self-start">
          <button
            onClick={() => setActiveTab("charts")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "charts" 
                ? "bg-accent-600 text-white shadow-md shadow-accent-600/10" 
                : "text-slate-550 dark:text-slate-400 hover:text-slate-850"
            }`}
          >
            Insights & Charts
          </button>
          <button
            onClick={() => setActiveTab("weekly_review")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "weekly_review" 
                ? "bg-accent-600 text-white shadow-md shadow-accent-600/10" 
                : "text-slate-550 dark:text-slate-400 hover:text-slate-850"
            }`}
          >
            AI Weekly Review
          </button>
        </div>
      </div>

      {/* Main Panel Render */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-6">
        {activeTab === "charts" ? (
          <div className="space-y-6">
            
            {/* Real stats banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="glass-card p-5 rounded-2xl border border-white/40 dark:border-slate-850/60 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent-50 dark:bg-accent-950/60 text-accent-700 dark:text-accent-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completion Rate</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white block mt-0.5">{completionRate}%</span>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/40 dark:border-slate-850/60 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Workload</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white block mt-0.5">{inProgressTasks} Tasks</span>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/40 dark:border-slate-850/60 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-450">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Focus Streaks</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white block mt-0.5">4 Days</span>
                </div>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Daily Focus Time Bar Chart */}
              <div className="lg:col-span-6 glass-card p-5 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm flex flex-col justify-between h-[300px]">
                <h3 className="text-sm font-bold text-slate-905 dark:text-white mb-4">Focus Time (minutes/day)</h3>
                <div className="flex-1 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyFocusData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }} />
                      <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tasks Added vs Completed Area Chart */}
              <div className="lg:col-span-6 glass-card p-5 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm flex flex-col justify-between h-[300px]">
                <h3 className="text-sm font-bold text-slate-905 dark:text-white mb-4">Task Momentum (cumulative)</h3>
                <div className="flex-1 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={taskCompletionHistory} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <XAxis dataKey="week" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }} />
                      <Area type="monotone" dataKey="completed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2.5} />
                      <Area type="monotone" dataKey="added" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.05} strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        ) : loadingReview ? (
          /* Loading Review State */
          <div className="glass-card p-12 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-sm font-semibold text-slate-850 dark:text-white">AI Coach is reviewing your week...</p>
              <p className="text-xs text-slate-400 mt-1">Analyzing focus minutes, task completion frequencies, and habit patterns.</p>
            </div>
          </div>
        ) : weeklyReview ? (
          /* AI Weekly Review Content */
          <div className="glass-card p-6 rounded-3xl border border-white/40 dark:border-slate-850/60 shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-850 pb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5.5 h-5.5 text-accent-600" />
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white">Gemini Productivity Report</h3>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Synthesized just now</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-450 rounded-xl text-xs font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> High Momentum
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Achievements Column */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-4.5 h-4.5" /> Achievements & Wins
                </h4>
                <ul className="space-y-3">
                  {weeklyReview.achievements.map((item: string, i: number) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-normal bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missed Goals Column */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-4.5 h-4.5" /> Missed Goals
                </h4>
                <ul className="space-y-3">
                  {weeklyReview.missedGoals.map((item: string, i: number) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-normal bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strengths Column */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-4.5 h-4.5" /> Focus Strengths
                </h4>
                <ul className="space-y-3">
                  {weeklyReview.strengths.map((item: string, i: number) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-normal bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses Column */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-450 uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-4.5 h-4.5" /> Focus Leakages
                </h4>
                <ul className="space-y-3">
                  {weeklyReview.weaknesses.map((item: string, i: number) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-normal bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Recommendations Row */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-850 space-y-4">
              <h4 className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider flex items-center gap-1">
                <BrainCircuit className="w-4.5 h-4.5" /> Recommended adjustments for next week
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weeklyReview.recommendations.map((item: string, i: number) => (
                  <div key={i} className="p-3 bg-gradient-to-tr from-accent-500/10 via-transparent to-indigo-500/10 rounded-2xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 border border-accent-500/20 leading-normal font-medium">
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* Empty state */
          <div className="text-center text-slate-400 py-12">
            No report available yet. Start tracking tasks to see reviews.
          </div>
        )}
      </div>

    </div>
  );
}
