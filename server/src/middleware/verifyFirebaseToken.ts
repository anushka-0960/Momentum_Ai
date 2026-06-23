import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";

export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  // If authorization header is missing
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Development mode fallback
    if (process.env.GEMINI_API_KEY === "mock-gemini-api-key-replace-me" || process.env.NODE_ENV === "development") {
      req.userId = "mock-user-123";
      return next();
    }
    return res.status(401).json({ error: "Unauthorized: Missing authorization header token" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    // Development mode fallback
    if (process.env.GEMINI_API_KEY === "mock-gemini-api-key-replace-me" || process.env.NODE_ENV === "development") {
      req.userId = "mock-user-123";
      return next();
    }
    return res.status(401).json({ error: "Unauthorized: Invalid or expired credentials" });
  }
}
