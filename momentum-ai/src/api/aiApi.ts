import { apiClient } from "./client";
import type {
  BreakdownResponse,
  PrioritizationResponse,
  ScheduleResponse,
  CoachResponse,
  WeeklyReviewResponse,
} from "../types/ai";

export const aiApi = {
  breakdown: (title: string, projectType: string, difficulty: string, techStack?: string, token?: string) =>
    apiClient<BreakdownResponse>("/api/ai/breakdown", {
      method: "POST",
      body: JSON.stringify({ title, projectType, difficulty, techStack }),
      authToken: token,
    }),
  refine: (currentBlueprint: BreakdownResponse, refinementPrompt: string, token?: string) =>
    apiClient<BreakdownResponse>("/api/ai/refine", {
      method: "POST",
      body: JSON.stringify({ currentBlueprint, refinementPrompt }),
      authToken: token,
    }),
  prioritize: (tasks: { id: string; title: string; dueDate?: string; priority: string }[], token?: string) =>
    apiClient<PrioritizationResponse>("/api/ai/prioritize", {
      method: "POST",
      body: JSON.stringify({ tasks }),
      authToken: token,
    }),
  schedule: (date: string, workHours: { start: string; end: string }, tasksSummary: string, token?: string) =>
    apiClient<ScheduleResponse>("/api/ai/schedule", {
      method: "POST",
      body: JSON.stringify({ date, workHours, tasksSummary }),
      authToken: token,
    }),
  coach: (tasksSummary: string, habitsSummary: string, question?: string, token?: string) => 
    apiClient<CoachResponse>("/api/ai/coach", { 
      method: "POST",
      body: JSON.stringify({ tasksSummary, habitsSummary, question }),
      authToken: token,
    }),
  weeklyReview: (weekSummary: string, token?: string) =>
    apiClient<WeeklyReviewResponse>("/api/ai/weekly-review", {
      method: "POST",
      body: JSON.stringify({ weekSummary }),
      authToken: token,
    }),
};
