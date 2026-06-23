import { createContext, useContext, ReactNode } from "react";
import type { Task } from "../types/task";

interface TaskContextValue {
  tasks: Task[];
}

// Filled in during the Dashboard + Task CRUD step with a live
// Firestore onSnapshot listener (see architecture doc, section 9).
const TaskContext = createContext<TaskContextValue>({ tasks: [] });

export function TaskProvider({ children }: { children: ReactNode }) {
  return <TaskContext.Provider value={{ tasks: [] }}>{children}</TaskContext.Provider>;
}

export function useTaskContext() {
  return useContext(TaskContext);
}
