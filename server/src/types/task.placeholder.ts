// Temporary local type until the backend imports the shared Task type
// from a common package — tracked for the AI build step.
export interface Task {
  id: string;
  title: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
}
