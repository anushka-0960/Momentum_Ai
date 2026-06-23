import { Router } from "express";

// Most auth (sign in/up) happens client-side via the Firebase SDK.
// This router is reserved for any server-side auth needs — e.g.
// custom claims or account cleanup — scoped in the Auth step.
export const authRouter = Router();
