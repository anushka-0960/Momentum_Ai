import { Router } from "express";

// Per the architecture doc (section 6): basic task CRUD goes through
// the Firestore client SDK directly. This router stays empty unless
// a feature later needs server-side validation or aggregation.
export const tasksRouter = Router();
