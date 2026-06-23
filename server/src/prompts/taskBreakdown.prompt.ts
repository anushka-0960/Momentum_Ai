// Prompt template for POST /api/ai/breakdown. Kept separate from the
// controller so prompt iteration doesn't require touching route logic.
export function taskBreakdownPrompt(taskTitle: string): string {
  return `You are a productivity coach. Break the following task into 4-8 concrete subtasks.

Task: "${taskTitle}"

Respond with ONLY valid JSON, no markdown, matching exactly this shape:
{
  "subtasks": [
    { "id": "string", "title": "string", "estimatedMinutes": number, "difficulty": "easy" | "medium" | "hard", "done": false }
  ]
}`;
}
