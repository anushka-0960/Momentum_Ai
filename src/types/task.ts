export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";
export type Difficulty = "easy" | "medium" | "hard";

export interface Subtask {
  id: string;
  title: string;
  estimatedMinutes: number;
  difficulty: Difficulty;
  done: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subtasks: Subtask[];
  priority: Priority;
  dueDate?: string; // ISO date
  estimatedMinutes?: number;
  status: TaskStatus;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}
