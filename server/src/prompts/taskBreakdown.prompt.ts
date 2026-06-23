import { SYSTEM_PROMPT } from "./system.prompt";

// Prompt template for POST /api/ai/breakdown.
export function taskBreakdownPrompt(taskTitle: string): string {
  return `${SYSTEM_PROMPT}

You are acting as a task planner. Break the following task into 4-8 concrete, actionable subtasks. Estimate time (estimatedMinutes) and assign difficulty for each.

Task: "${taskTitle}"

Respond with ONLY valid JSON, matching exactly this shape:
{
  "subtasks": [
    { "id": "string", "title": "string", "estimatedMinutes": number, "difficulty": "easy" | "medium" | "hard", "done": false }
  ]
}`;
}
