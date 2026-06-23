import type { Task } from "../types/task.placeholder";
import { SYSTEM_PROMPT } from "./system.prompt";

// Prompt template for POST /api/ai/prioritize.
export function prioritizationPrompt(tasks: Pick<Task, "id" | "title" | "dueDate" | "priority">[]): string {
  return `${SYSTEM_PROMPT}

You are acting as a project manager and time management expert. Rank these tasks by what should be done first. Consider deadlines, urgency, importance, and workload. Provide a clear reasoning paragraph.

Tasks: ${JSON.stringify(tasks)}

Respond with ONLY valid JSON:
{ "orderedTaskIds": ["string"], "reasoning": "one short paragraph" }`;
}
