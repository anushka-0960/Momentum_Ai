import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import {
  handleBreakdown,
  handlePrioritize,
  handleSchedule,
  handleCoach,
  handleWeeklyReview,
} from "../controllers/ai.controller";

export const aiRouter = Router();

aiRouter.use(verifyFirebaseToken);
aiRouter.post("/breakdown", handleBreakdown);
aiRouter.post("/prioritize", handlePrioritize);
aiRouter.post("/schedule", handleSchedule);
aiRouter.post("/coach", handleCoach);
aiRouter.post("/weekly-review", handleWeeklyReview);
