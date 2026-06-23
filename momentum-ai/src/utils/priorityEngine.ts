import type { Task } from "../types/task";

// Deterministic fallback ranking used when the Gemini prioritization
// endpoint is unavailable (see architecture doc, section 7). Ranks by
// due date first, then manually-set priority.
const PRIORITY_WEIGHT: Record<Task["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function rankTasksLocally(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const dueDiff = (a.dueDate ? Date.parse(a.dueDate) : Infinity) -
      (b.dueDate ? Date.parse(b.dueDate) : Infinity);
    if (dueDiff !== 0) return dueDiff;
    return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
  });
}
