// Prompt template for POST /api/ai/schedule.
export function schedulingPrompt(params: {
  date: string;
  workHours: { start: string; end: string };
  tasksSummary: string;
}): string {
  return `Generate an optimized schedule for ${params.date} between ${params.workHours.start} and ${params.workHours.end}.

Tasks to fit in: ${params.tasksSummary}

Respond with ONLY valid JSON:
{ "date": "${params.date}", "blocks": [{ "taskId": "string", "startTime": "HH:mm", "endTime": "HH:mm" }] }`;
}
