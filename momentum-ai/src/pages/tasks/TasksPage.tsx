import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Check, 
  BrainCircuit, 
  ChevronRight, 
  ListTodo, 
  CheckCircle2
} from "lucide-react";
import { useTasks } from "../../hooks/useTasks";
import type { Task, Priority, TaskStatus, Difficulty } from "../../types/task";
import { aiApi } from "../../api/aiApi";
import { auth } from "../../services/firebase";

export default function TasksPage() {
  const { 
    tasks, 
    addTask, 
    updateTaskStatus, 
    updateTaskDetails, 
    deleteTaskById, 
    toggleSubtask,
    addSubtask 
  } = useTasks();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Filters & sorting
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Task form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  // New subtask state
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskDuration, setSubtaskDuration] = useState(15);
  const [subtaskDiff, setSubtaskDiff] = useState<Difficulty>("easy");

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const newId = await addTask(title, priority, dueDate, estimatedMinutes, description);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setEstimatedMinutes(0);
      setShowAddForm(false);
      setSelectedTaskId(newId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubtaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !subtaskTitle.trim()) return;
    try {
      await addSubtask(selectedTaskId, subtaskTitle, subtaskDuration, subtaskDiff);
      setSubtaskTitle("");
      setSubtaskDuration(15);
      setSubtaskDiff("easy");
    } catch (err) {
      console.error(err);
    }
  };

  const [aiLoading, setAiLoading] = useState(false);

  const handleAiBreakdown = async (task: Task) => {
    if (!task) return;
    setAiLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await aiApi.breakdown(task.title, token);
      
      if (response && response.phases && response.phases.length > 0) {
        let roadmapMarkdown = `Project: ${response.projectName}\n\n`;
        roadmapMarkdown += `### Breakdown\n\n`;

        const mappedSubtasks: any[] = [];

        response.phases.forEach((phase) => {
          roadmapMarkdown += `**${phase.phaseName}**\n\n`;
          phase.tasks.forEach((sub) => {
            const timeStr = sub.estimatedMinutes >= 60 
              ? `${(sub.estimatedMinutes / 60).toFixed(1)} hours` 
              : `${sub.estimatedMinutes} minutes`;
            
            roadmapMarkdown += `* ${sub.title}\n`;
            roadmapMarkdown += `* Estimated Time: ${timeStr}\n\n`;
            
            mappedSubtasks.push({
              id: Math.random().toString(36).substring(2, 9),
              title: `[${phase.phaseName}] ${sub.title}`,
              estimatedMinutes: sub.estimatedMinutes || 30,
              difficulty: "medium" as const,
              done: false
            });
          });
        });

        await updateTaskDetails(task.id, {
          subtasks: [...task.subtasks, ...mappedSubtasks],
          description: task.description 
            ? `${task.description}\n\n${roadmapMarkdown}` 
            : roadmapMarkdown
        });
        setAiLoading(false);
        return;
      }
    } catch (err) {
      console.warn("AI breakdown failed, running local fallback: ", err);
    }

    // Fallback Mock Breakdown
    const mockResponse = {
      projectName: task.title,
      phases: [
        {
          phaseName: "Research",
          tasks: [
            { title: "Research specifications and frameworks requirements", estimatedMinutes: 45 },
            { title: "Define layout design mockups structures", estimatedMinutes: 60 }
          ]
        },
        {
          phaseName: "Frontend",
          tasks: [
            { title: "Build responsive pages shells layout", estimatedMinutes: 180 },
            { title: "Integrate routes validation and logic", estimatedMinutes: 120 }
          ]
        }
      ]
    };

    let roadmapMarkdown = `Project: ${mockResponse.projectName}\n\n`;
    roadmapMarkdown += `### Breakdown\n\n`;

    const generated: any[] = [];
    mockResponse.phases.forEach((phase) => {
      roadmapMarkdown += `**${phase.phaseName}**\n\n`;
      phase.tasks.forEach((sub) => {
        const timeStr = sub.estimatedMinutes >= 60 
          ? `${(sub.estimatedMinutes / 60).toFixed(1)} hours` 
          : `${sub.estimatedMinutes} minutes`;
        
        roadmapMarkdown += `* ${sub.title}\n`;
        roadmapMarkdown += `* Estimated Time: ${timeStr}\n\n`;
        
        generated.push({
          id: Math.random().toString(36).substring(2, 9),
          title: `[${phase.phaseName}] ${sub.title}`,
          estimatedMinutes: sub.estimatedMinutes,
          difficulty: "medium" as const,
          done: false
        });
      });
    });

    await updateTaskDetails(task.id, {
      subtasks: [...task.subtasks, ...generated],
      description: task.description ? `${task.description}\n\n${roadmapMarkdown}` : roadmapMarkdown
    });
    setAiLoading(false);
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6rem)] relative items-stretch">
      
      {/* Task List Section (Left Column) */}
      <div className="lg:col-span-7 flex flex-col min-h-0 bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-850/50 rounded-3xl p-5 shadow-sm">
        
        {/* Toolbar */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Task Planner</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 bg-accent-600 hover:bg-accent-700 text-white font-semibold px-4.5 py-2 rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-3">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 text-slate-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500 text-slate-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Form Drawer */}
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850/50 rounded-2xl p-4 space-y-3 shrink-0"
          >
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input 
                type="text" 
                required
                placeholder="Task Title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-900 dark:text-white"
              />
              <textarea 
                placeholder="Description/Context details..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-900 dark:text-white resize-none"
              />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-xs focus:outline-none text-slate-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-xs focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Est. Minutes</label>
                  <input 
                    type="number" 
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-xs focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-250 dark:border-slate-750 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4.5 py-1.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Task List Scroll Box */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm font-medium">
              No tasks match your filters. Add some goals!
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => setSelectedTaskId(task.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedTaskId === task.id
                    ? "bg-accent-50/50 border-accent-300 dark:bg-slate-900/60 dark:border-accent-850"
                    : "bg-white/40 border-slate-200/50 dark:bg-slate-900/20 dark:border-slate-850/50 hover:bg-slate-50 dark:hover:bg-slate-900/20"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTaskStatus(task.id, task.status === "done" ? "todo" : "done");
                    }}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      task.status === "done"
                        ? "bg-accent-600 border-accent-600 text-white"
                        : "border-slate-300 dark:border-slate-700 hover:border-accent-500"
                    }`}
                  >
                    {task.status === "done" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate leading-snug ${task.status === "done" ? "line-through text-slate-450 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        task.priority === "high" 
                          ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                          : task.priority === "medium"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-slate-500/10 text-slate-600"
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        task.status === "done" 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450" 
                          : task.status === "in_progress"
                          ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}>
                        {task.status.replace("_", " ")}
                      </span>
                      {task.subtasks.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-accent-500" /> {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {task.dueDate && (
                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Task Details Panel (Right Column) */}
      <div className="lg:col-span-5 flex flex-col min-h-0 bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-850/50 rounded-3xl p-5 shadow-sm">
        <AnimatePresence mode="wait">
          {selectedTask ? (
            <motion.div 
              key={selectedTask.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full min-h-0 justify-between space-y-4"
            >
              {/* Task Header & CRUD Action Bar */}
              <div className="space-y-3 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    selectedTask.priority === "high" 
                      ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {selectedTask.priority} Priority
                  </span>
                  
                  <button 
                    onClick={() => {
                      deleteTaskById(selectedTask.id);
                      setSelectedTaskId(null);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white leading-normal">
                  {selectedTask.title}
                </h2>

                <div className="flex gap-2">
                  <select
                    value={selectedTask.status}
                    onChange={(e) => updateTaskStatus(selectedTask.id, e.target.value as TaskStatus)}
                    className="bg-white/60 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>

                  {/* AI Breakdown Magic Button */}
                  <button
                    onClick={() => handleAiBreakdown(selectedTask)}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 disabled:opacity-70 text-white font-semibold rounded-xl text-xs shadow-md transition-all"
                  >
                    {aiLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <BrainCircuit className="w-4 h-4 fill-white/10" />
                    )}
                    {aiLoading ? "Structuring..." : "AI Breakdown"}
                  </button>
                </div>
              </div>

              {/* Task Details Content scroll box */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Description Textarea */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                  <textarea 
                    value={selectedTask.description || ""}
                    onChange={(e) => updateTaskDetails(selectedTask.id, { description: e.target.value })}
                    placeholder="Describe this project, include links, resources, or notes here..." 
                    rows={4}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none text-slate-950 dark:text-white leading-relaxed resize-none"
                  />
                </div>

                {/* Subtasks checklist */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Subtasks & Actions</label>
                  
                  {selectedTask.subtasks.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                      No subtasks listed. Click AI Breakdown above to instantly schedule subtasks.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedTask.subtasks.map((sub) => (
                        <div 
                          key={sub.id} 
                          onClick={() => toggleSubtask(selectedTask.id, sub.id)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                            sub.done 
                              ? "bg-slate-100/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850/50 text-slate-400" 
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-250"
                          }`}
                        >
                          <span className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 ${
                            sub.done ? "bg-accent-600 border-accent-600 text-white" : "border-slate-350 dark:border-slate-650"
                          }`}>
                            {sub.done && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span className={sub.done ? "line-through" : ""}>{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Subtask Add Form Footer */}
              <form onSubmit={handleAddSubtaskSubmit} className="pt-3 border-t border-slate-200/50 dark:border-slate-850/50 space-y-2 shrink-0">
                <input 
                  type="text" 
                  required
                  placeholder="Add manual subtask..." 
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-900 dark:text-white"
                />
                <div className="flex gap-2 justify-end">
                  <button 
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-750 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Step
                  </button>
                </div>
              </form>

            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-450 dark:text-slate-500 py-12 px-6">
              <ListTodo className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold">No Task Selected</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
                Click on a card from the task planner list to edit description notes, prioritize, and structure subtasks.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
