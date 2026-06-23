import { apiClient } from "./client";
import type {
  BreakdownResponse,
  PrioritizationResponse,
  ScheduleResponse,
  CoachResponse,
  WeeklyReviewResponse,
} from "../types/ai";

// One function per AI endpoint defined in the architecture doc (section 6).
// Implemented fully in the "AI task breakdown" build step.
export const aiApi = {
  breakdown: (title: string) =>
    apiClient<BreakdownResponse>("/api/ai/breakdown", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  prioritize: (taskIds: string[]) =>
    apiClient<PrioritizationResponse>("/api/ai/prioritize", {
      method: "POST",
      body: JSON.stringify({ taskIds }),
    }),
  schedule: (date: string) =>
    apiClient<ScheduleResponse>("/api/ai/schedule", {
      method: "POST",
      body: JSON.stringify({ date }),
    }),
  coach: () => apiClient<CoachResponse>("/api/ai/coach", { method: "POST" }),
  weeklyReview: (weekId: string) =>
    apiClient<WeeklyReviewResponse>("/api/ai/weekly-review", {
      method: "POST",
      body: JSON.stringify({ weekId }),
    }),
};
