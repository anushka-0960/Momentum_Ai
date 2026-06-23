import type { Request, Response, NextFunction } from "express";
import { generateJSON } from "../services/geminiService";
import { taskBreakdownPrompt } from "../prompts/taskBreakdown.prompt";
import { prioritizationPrompt } from "../prompts/prioritization.prompt";
import { schedulingPrompt } from "../prompts/scheduling.prompt";
import { weeklyReviewPrompt } from "../prompts/weeklyReview.prompt";

// POST /api/ai/breakdown
// Expects: { title: string }
export async function handleBreakdown(req: Request, res: Response, next: NextFunction) {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Missing required property: title" });
  }

  try {
    const prompt = taskBreakdownPrompt(title);
    const result = await generateJSON<any>(prompt, "breakdown");
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/ai/prioritize
// Expects: { tasks: [{ id, title, dueDate, priority }] }
export async function handlePrioritize(req: Request, res: Response, next: NextFunction) {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: "Missing or invalid tasks array" });
  }

  try {
    const prompt = prioritizationPrompt(tasks);
    const result = await generateJSON<any>(prompt, "prioritize");
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/ai/schedule
// Expects: { date: string, workHours: { start, end }, tasksSummary: string }
export async function handleSchedule(req: Request, res: Response, next: NextFunction) {
  const { date, workHours, tasksSummary } = req.body;
  if (!date || !workHours || !tasksSummary) {
    return res.status(400).json({ error: "Missing date, workHours, or tasksSummary" });
  }

  try {
    const prompt = schedulingPrompt({ date, workHours, tasksSummary });
    const result = await generateJSON<any>(prompt, "schedule");
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/ai/coach
// Expects: { tasksSummary: string, habitsSummary?: string }
export async function handleCoach(req: Request, res: Response, next: NextFunction) {
  const { tasksSummary, habitsSummary } = req.body;
  try {
    const prompt = `You are an AI productivity coach. Give a short, single-sentence context-aware advice snippet (max 30 words) based on the user's workload.
    
    Workload: ${tasksSummary || "No tasks scheduled."}
    Habits: ${habitsSummary || "No habits logged."}
    
    Respond in ONLY valid JSON:
    { "message": "your advice string here" }`;

    const result = await generateJSON<{ message: string }>(prompt, "coach");
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/ai/weekly-review
// Expects: { weekSummary: string }
export async function handleWeeklyReview(req: Request, res: Response, next: NextFunction) {
  const { weekSummary } = req.body;
  if (!weekSummary) {
    return res.status(400).json({ error: "Missing weekSummary data to analyze" });
  }

  try {
    const prompt = weeklyReviewPrompt(weekSummary);
    const result = await generateJSON<any>(prompt, "weekly-review");
    res.json(result);
  } catch (error) {
    next(error);
  }
}
