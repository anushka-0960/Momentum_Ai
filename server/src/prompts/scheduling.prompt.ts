import { SYSTEM_PROMPT } from "./system.prompt";

// Prompt template for POST /api/ai/schedule.
export function schedulingPrompt(params: {
  date: string;
  workHours: { start: string; end: string };
  tasksSummary: string;
}): string {
  return `${SYSTEM_PROMPT}

You are acting as a planner and scheduling consultant. Generate an optimized schedule for ${params.date} between ${params.workHours.start} and ${params.workHours.end}.
Ensure tasks fit efficiently within the designated times, matching duration guidelines.

Tasks to fit in: ${params.tasksSummary}

Respond with ONLY valid JSON:
{ "date": "${params.date}", "blocks": [{ "taskId": "string", "startTime": "HH:mm", "endTime": "HH:mm" }] }`;
}
