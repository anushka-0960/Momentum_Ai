import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";
import { tasksRouter } from "./routes/tasks.routes";
import { aiRouter } from "./routes/ai.routes";
import { analyticsRouter } from "./routes/analytics.routes";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/ai", aiRouter);
app.use("/api/analytics", analyticsRouter);

// Always registered last — see middleware/errorHandler.ts
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Momentum AI server listening on :${PORT}`));
