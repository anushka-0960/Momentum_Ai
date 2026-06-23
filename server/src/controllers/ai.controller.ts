import type { Request, Response, NextFunction } from "express";

// Each handler will call geminiService with the matching prompt
// template from src/prompts/ — implemented in the "AI task breakdown"
// and "Smart prioritization + scheduling" build steps.
export async function handleBreakdown(_req: Request, res: Response, _next: NextFunction) {
  res.json({ subtasks: [] });
}

export async function handlePrioritize(_req: Request, res: Response, _next: NextFunction) {
  res.json({ orderedTaskIds: [], reasoning: "" });
}

export async function handleSchedule(_req: Request, res: Response, _next: NextFunction) {
  res.json({ date: "", blocks: [] });
}

export async function handleCoach(_req: Request, res: Response, _next: NextFunction) {
  res.json({ message: "" });
}

export async function handleWeeklyReview(_req: Request, res: Response, _next: NextFunction) {
  res.json({ achievements: [], missedGoals: [], strengths: [], weaknesses: [], recommendations: [] });
}
