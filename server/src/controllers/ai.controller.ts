import type { Request, Response, NextFunction } from "express";
import { generateJSON } from "../services/geminiService";
import { taskBreakdownPrompt } from "../prompts/taskBreakdown.prompt";
import { prioritizationPrompt } from "../prompts/prioritization.prompt";
import { schedulingPrompt } from "../prompts/scheduling.prompt";
import { weeklyReviewPrompt } from "../prompts/weeklyReview.prompt";
import { coachPrompt, defaultCoachPrompt } from "../prompts/coach.prompt";

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
// Expects: { tasksSummary: string, habitsSummary?: string, question?: string }
export async function handleCoach(req: Request, res: Response, next: NextFunction) {
  const { tasksSummary, habitsSummary, question } = req.body;
  try {
    const prompt = question 
      ? coachPrompt(question, tasksSummary || "No tasks scheduled.", habitsSummary || "No habits logged.")
      : defaultCoachPrompt(tasksSummary || "No tasks scheduled.", habitsSummary || "No habits logged.");

    const result = await generateJSON<any>(prompt, "coach");
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
