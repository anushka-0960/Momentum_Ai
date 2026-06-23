import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles
} from "lucide-react";
import { useTasks } from "../../hooks/useTasks";

export default function CalendarPage() {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    days.push({
      date: new Date(year, month - 1, d),
      isCurrentMonth: false,
      key: `prev-${d}`
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
      key: `curr-${i}`
    });
  }

  // Next month padding days to fill 6 rows (42 days)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      key: `next-${i}`
    });
  }

  // Filter tasks that have due dates in this range
  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6 h-full flex flex-col min-h-0">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-accent-600" /> Calendar Schedule
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Map out your upcoming due dates and manage focus blocks.
          </p>
        </div>
        
        {/* Navigation month button */}
        <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-855 rounded-2xl px-4 py-2 self-start shadow-sm">
          <button 
            onClick={handlePrevMonth} 
            className="p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-slate-850 dark:text-slate-100 min-w-[100px] text-center">
            {monthNames[month]} {year}
          </span>
          <button 
            onClick={handleNextMonth} 
            className="p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dynamic AI Scheduler Insight */}
      <div className="glass-card p-4 rounded-2xl border border-blue-50/50 dark:border-slate-850 flex items-start gap-3 bg-gradient-to-r from-accent-50/20 via-white/50 to-indigo-50/10 dark:from-slate-900/30 dark:to-slate-900/20 shrink-0">
        <span className="p-2 rounded-xl bg-accent-100 dark:bg-accent-950/60 text-accent-700 dark:text-accent-400 shrink-0">
          <Sparkles className="w-4.5 h-4.5" />
        </span>
        <div>
          <h3 className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
            Smart scheduling tip
          </h3>
          <p className="text-xs text-slate-650 dark:text-slate-400 mt-0.5">
            Select a task on the planner, set a due date, and it will align automatically inside your calendar schedule. Use <strong>AI Scheduling</strong> in Phase 5 to generate optimized blocks.
          </p>
        </div>
      </div>

      {/* Calendar Grid Box */}
      <div className="flex-1 min-h-[400px] glass-card border border-slate-200/50 dark:border-slate-850/50 rounded-3xl overflow-hidden flex flex-col">
        {/* Days of week titles */}
        <div className="grid grid-cols-7 border-b border-slate-200/40 dark:border-slate-850/40 bg-slate-50/50 dark:bg-slate-900/20 py-3 text-center shrink-0">
          {weekDays.map((day) => (
            <span key={day} className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {day}
            </span>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 flex-1 min-h-0 divide-x divide-y divide-slate-200/30 dark:divide-slate-850/30">
          {days.map((dayObj) => {
            const dayTasks = getTasksForDay(dayObj.date);
            const isToday = 
              new Date().getDate() === dayObj.date.getDate() &&
              new Date().getMonth() === dayObj.date.getMonth() &&
              new Date().getFullYear() === dayObj.date.getFullYear();
            
            return (
              <div 
                key={dayObj.key}
                className={`p-2 min-h-0 flex flex-col justify-between transition-colors overflow-hidden ${
                  dayObj.isCurrentMonth 
                    ? "bg-transparent" 
                    : "bg-slate-100/20 dark:bg-slate-900/10 opacity-40 pointer-events-none"
                } ${isToday ? "bg-accent-50/10 dark:bg-accent-950/5" : ""}`}
              >
                {/* Date Number Label */}
                <div className="flex justify-between items-center shrink-0">
                  <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday 
                      ? "bg-accent-600 text-white shadow-sm" 
                      : "text-slate-655 dark:text-slate-400"
                  }`}>
                    {dayObj.date.getDate()}
                  </span>
                </div>

                {/* Day Tasks Items */}
                <div className="flex-1 overflow-y-auto mt-1 space-y-1 scrollbar-none max-h-[70px]">
                  {dayTasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate leading-tight border ${
                        task.status === "done"
                          ? "bg-slate-100 text-slate-450 line-through dark:bg-slate-900/60 dark:text-slate-500 dark:border-slate-850"
                          : task.priority === "high"
                          ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                          : task.priority === "medium"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                          : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
