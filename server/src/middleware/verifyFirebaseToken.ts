import type { Request, Response, NextFunction } from "express";

// Implemented in the Auth step: verifies the Firebase ID token sent
// in the Authorization header using firebase-admin, then attaches
// req.userId for downstream handlers.
export function verifyFirebaseToken(_req: Request, _res: Response, next: NextFunction) {
  next();
}
