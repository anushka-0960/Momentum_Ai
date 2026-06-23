import { GoogleGenerativeAI } from "@google/generative-ai";

// Single shared client — every controller goes through this file so
// the API key and model choice live in exactly one place.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Generic helper: sends a prompt, expects strict JSON back, and parses
// it. Throws on malformed output so the caller's error handling (and
// the frontend's local fallback, see utils/priorityEngine.ts) kicks in.
export async function generateJSON<T>(prompt: string): Promise<T> {
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as T;
}
