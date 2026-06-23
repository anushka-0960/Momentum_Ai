import { SYSTEM_PROMPT } from "./system.prompt";

// Prompt template for POST /api/ai/weekly-review.
export function weeklyReviewPrompt(weekSummary: string): string {
  return `${SYSTEM_PROMPT}

You are acting as a productivity coach and study mentor. Analyze this week of productivity data (tasks completed, habits checked, focus sessions) and produce an insightful, encouraging, and specific weekly review.

Data: ${weekSummary}

Respond with ONLY valid JSON:
{ "achievements": ["string"], "missedGoals": ["string"], "strengths": ["string"], "weaknesses": ["string"], "recommendations": ["string"] }`;
}
