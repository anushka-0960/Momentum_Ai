import type { Request, Response, NextFunction } from "express";

// Catches anything thrown in a route/controller and returns a
// consistent JSON error shape instead of leaking stack traces.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const message = err instanceof Error ? err.message : "Unexpected server error";
  res.status(500).json({ error: message });
}
