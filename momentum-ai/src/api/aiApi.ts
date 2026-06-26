import { apiClient } from "./client";
import type {
  BreakdownResponse,
  PrioritizationResponse,
  ScheduleResponse,
  CoachResponse,
  WeeklyReviewResponse,
} from "../types/ai";

export const aiApi = {
  breakdown: (
    title: string,
    projectTypeOrToken?: string,
    difficulty?: string,
    techStack?: string,
    token?: string
  ) => {
    let resolvedProjectType = "Web App";
    let resolvedDifficulty = "Intermediate";
    let resolvedTechStack = techStack;
    let resolvedToken = token;

    if (projectTypeOrToken) {
      if (projectTypeOrToken.includes(".") || projectTypeOrToken.length > 50) {
        resolvedToken = projectTypeOrToken;
      } else {
        resolvedProjectType = projectTypeOrToken;
      }
    }

    if (difficulty) {
      resolvedDifficulty = difficulty;
    }

    return apiClient<BreakdownResponse>("/api/ai/breakdown", {
      method: "POST",
      body: JSON.stringify({
        title,
        projectType: resolvedProjectType,
        difficulty: resolvedDifficulty,
        techStack: resolvedTechStack,
      }),
      authToken: resolvedToken,
    });
  },
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
