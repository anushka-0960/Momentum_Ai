import { SYSTEM_PROMPT } from "./system.prompt";

export function coachPrompt(question: string, tasksSummary: string, habitsSummary: string): string {
  return `${SYSTEM_PROMPT}

You are acting as the AI Coach Assistant. Answer the user's productivity question below using their workload and habits context.
Analyze their data, detect priorities/risks/time estimates, and provide a structured, encouraging response.

User Question: "${question}"
User Workload: ${tasksSummary}
User Habits: ${habitsSummary}

Respond in ONLY valid JSON matching this exact structure:
{
  "summary": "A concise summary of the assessment and immediate focus (max 50 words).",
  "recommendedActions": [
    "Direct actionable step 1",
    "Direct actionable step 2",
    "Direct actionable step 3"
  ],
  "estimatedTime": "Estimated total hours/minutes to finish these actions (e.g., '1.5 hours' or '45 mins').",
  "priority": "High" | "Medium" | "Low",
  "risks": "Any deadlines at risk, workload overflow, or habit slippage warnings.",
  "aiRecommendation": "Proactive and personalized coaching advice, strategy, or motivation (max 50 words)."
}`;
}
export function defaultCoachPrompt(tasksSummary: string, habitsSummary: string): string {
  return `${SYSTEM_PROMPT}

Provide a short, single-sentence context-aware advice snippet (max 30 words) based on the user's current workload and habits.

User Workload: ${tasksSummary}
User Habits: ${habitsSummary}

Respond in ONLY valid JSON matching this structure:
{
  "message": "your advice string here"
}`;
}
