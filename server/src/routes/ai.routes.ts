import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import {
  handleBreakdown,
  handleRefine,
  handlePrioritize,
  handleSchedule,
  handleCoach,
  handleWeeklyReview,
} from "../controllers/ai.controller";

export const aiRouter = Router();

// Expose breakdown & refine as public for the simplified hackathon tool
aiRouter.post("/breakdown", handleBreakdown);
aiRouter.post("/refine", handleRefine);

// Keep authentication checks for other routes
aiRouter.post("/prioritize", verifyFirebaseToken, handlePrioritize);
aiRouter.post("/schedule", verifyFirebaseToken, handleSchedule);
aiRouter.post("/coach", verifyFirebaseToken, handleCoach);
aiRouter.post("/weekly-review", verifyFirebaseToken, handleWeeklyReview);
