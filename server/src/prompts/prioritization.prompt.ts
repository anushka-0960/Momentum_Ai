import type { Task } from "../types/task.placeholder";

// Prompt template for POST /api/ai/prioritize.
export function prioritizationPrompt(tasks: Pick<Task, "id" | "title" | "dueDate" | "priority">[]): string {
  return `Rank these tasks by what should be done first, considering deadline, stated priority, and dependencies.

Tasks: ${JSON.stringify(tasks)}

Respond with ONLY valid JSON:
{ "orderedTaskIds": ["string"], "reasoning": "one short paragraph" }`;
}
