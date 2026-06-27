import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer as createViteServer } from "vite";

import { errorHandler } from "./server/src/middleware/errorHandler";
import { authRouter } from "./server/src/routes/auth.routes";
import { tasksRouter } from "./server/src/routes/tasks.routes";
import { aiRouter } from "./server/src/routes/ai.routes";
import { analyticsRouter } from "./server/src/routes/analytics.routes";

dotenv.config();

async function startServer() {
  const app = express();
  
  app.use(cors()); 
  app.use(express.json());
  
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  
  app.use("/api/auth", authRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/analytics", analyticsRouter);
  
  // Always registered last
  app.use(errorHandler);
  
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
