import type { Priority } from "./task";

// Shapes returned by the /api/ai/* endpoints — kept in sync with the
// prompt schemas defined in server/src/prompts/.
export interface BreakdownTask {
  title: string;
  estimatedMinutes: number;
}

export interface BreakdownPhase {
  phaseName: string;
  tasks: BreakdownTask[];
}

export interface BreakdownResponse {
  projectName: string;
  phases: BreakdownPhase[];
}

export interface PrioritizationResponse {
  orderedTaskIds: string[];
  reasoning: string;
}

export interface ScheduleBlock {
  taskId: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleResponse {
  date: string;
  blocks: ScheduleBlock[];
}

export interface CoachResponse {
  message?: string;
  summary?: string;
  recommendedActions?: string[];
  estimatedTime?: string;
  priority?: "High" | "Medium" | "Low";
  risks?: string;
  aiRecommendation?: string;
}

export interface WeeklyReviewResponse {
  achievements: string[];
  missedGoals: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export type { Priority };
