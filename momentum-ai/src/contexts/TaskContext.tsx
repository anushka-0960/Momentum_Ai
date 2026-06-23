import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Task, Subtask, Priority, TaskStatus, Difficulty } from "../types/task";
import { useAuth } from "../hooks/useAuth";
import { 
  createTask, 
  updateTask, 
  deleteTask, 
  subscribeToTasks 
} from "../services/taskService";

interface TaskContextValue {
  tasks: Task[];
  loadingTasks: boolean;
  addTask: (
    title: string, 
    priority: Priority, 
    dueDate?: string, 
    estimatedMinutes?: number, 
    description?: string
  ) => Promise<string>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTaskDetails: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTaskById: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (
    taskId: string, 
    title: string, 
    estimatedMinutes: number, 
    difficulty: Difficulty
  ) => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    setLoadingTasks(true);
    const unsubscribe = subscribeToTasks(user.uid, (fetchedTasks) => {
      setTasks(fetchedTasks);
      setLoadingTasks(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTask = async (
    title: string, 
    priority: Priority, 
    dueDate?: string, 
    estimatedMinutes?: number, 
    description?: string
  ): Promise<string> => {
    if (!user) throw new Error("User must be logged in to create tasks");
    
    return await createTask({
      userId: user.uid,
      title,
      description: description || "",
      subtasks: [],
      priority,
      dueDate: dueDate || undefined,
      estimatedMinutes: estimatedMinutes || 0,
      status: "todo",
      labels: []
    });
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status });
  };

  const updateTaskDetails = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
  };

  const deleteTaskById = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedSubtasks = task.subtasks.map(sub => {
      if (sub.id === subtaskId) {
        return { ...sub, done: !sub.done };
      }
      return sub;
    });

    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const addSubtask = async (
    taskId: string, 
    title: string, 
    estimatedMinutes: number, 
    difficulty: Difficulty
  ) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      estimatedMinutes,
      difficulty,
      done: false
    };

    await updateTask(taskId, {
      subtasks: [...task.subtasks, newSubtask]
    });
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      loadingTasks, 
      addTask, 
      updateTaskStatus, 
      updateTaskDetails, 
      deleteTaskById, 
      toggleSubtask,
      addSubtask 
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
