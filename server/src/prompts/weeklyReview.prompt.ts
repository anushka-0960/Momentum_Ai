// Prompt template for POST /api/ai/weekly-review.
export function weeklyReviewPrompt(weekSummary: string): string {
  return `Analyze this week of productivity data and produce a short, specific weekly review.

Data: ${weekSummary}

Respond with ONLY valid JSON:
{ "achievements": ["string"], "missedGoals": ["string"], "strengths": ["string"], "weaknesses": ["string"], "recommendations": ["string"] }`;
}
