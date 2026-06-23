import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY ?? "";
const isMockKey = !apiKey || apiKey.startsWith("mock") || apiKey === "your_gemini_api_key";

let genAI: GoogleGenerativeAI | null = null;
if (!isMockKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Generic helper: sends a prompt, expects strict JSON back, and parses it.
// Implements development fallback if the Gemini API key is missing or mock.
export async function generateJSON<T>(prompt: string, fallbackType?: "breakdown" | "prioritize" | "schedule" | "coach" | "weekly-review"): Promise<T> {
  if (isMockKey || !genAI) {
    console.log("Using Gemini Service Mock Fallback Mode for prompt:", prompt.substring(0, 100) + "...");
    return getMockFallback(prompt, fallbackType) as T;
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Gemini API call failed, attempting mock fallback:", error);
    return getMockFallback(prompt, fallbackType) as T;
  }
}

// Helper to provide realistic mock structures when API is unavailable or mock keys are used
function getMockFallback(prompt: string, fallbackType?: string): any {
  if (fallbackType === "breakdown" || prompt.includes("subtasks")) {
    const match = prompt.match(/Task: "(.*)"/);
    const taskTitle = match ? match[1] : "Project";
    return {
      subtasks: [
        { id: Math.random().toString(36).substring(2, 9), title: `🔍 Research context for "${taskTitle}"`, estimatedMinutes: 45, difficulty: "easy", done: false },
        { id: Math.random().toString(36).substring(2, 9), title: `🎨 Draft basic wireframes and style guides`, estimatedMinutes: 90, difficulty: "medium", done: false },
        { id: Math.random().toString(36).substring(2, 9), title: `💻 Implement core frontend layout scaffolding`, estimatedMinutes: 180, difficulty: "hard", done: false },
        { id: Math.random().toString(36).substring(2, 9), title: `🧪 Perform accessibility and responsiveness audits`, estimatedMinutes: 60, difficulty: "medium", done: false },
        { id: Math.random().toString(36).substring(2, 9), title: `🚀 Execute deployment pipeline configurations`, estimatedMinutes: 30, difficulty: "easy", done: false },
      ]
    };
  }

  if (fallbackType === "prioritize" || prompt.includes("orderedTaskIds")) {
    // Attempt to extract task IDs from the prompt
    const ids: string[] = [];
    const idMatches = prompt.match(/"id":"([^"]+)"/g);
    if (idMatches) {
      idMatches.forEach(m => {
        const id = m.split('":"')[1].slice(0, -1);
        if (!ids.includes(id)) ids.push(id);
      });
    }
    
    return {
      orderedTaskIds: ids.length > 0 ? ids : ["mock-task-id-1", "mock-task-id-2"],
      reasoning: "Tasks were prioritized based on nearest upcoming deadlines and indicated task dependencies."
    };
  }

  if (fallbackType === "schedule" || prompt.includes("blocks")) {
    const dateMatch = prompt.match(/Generate an optimized schedule for ([^\s]+)/);
    const dateStr = dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0];
    
    // Attempt to extract task IDs
    const ids: string[] = [];
    const idMatches = prompt.match(/"id":"([^"]+)"/g);
    if (idMatches) {
      idMatches.forEach(m => {
        const id = m.split('":"')[1].slice(0, -1);
        if (!ids.includes(id)) ids.push(id);
      });
    }

    return {
      date: dateStr,
      blocks: ids.slice(0, 3).map((id, index) => {
        const startHour = 9 + index * 2;
        return {
          taskId: id,
          startTime: `${startHour.toString().padStart(2, "0")}:00`,
          endTime: `${(startHour + 1).toString().padStart(2, "0")}:30`
        };
      })
    };
  }

  if (fallbackType === "coach" || prompt.includes("coach") || prompt.includes("productivity coach")) {
    return {
      message: "You have a two-hour free window before dinner. Completing your research task now will keep your overall project on schedule."
    };
  }

  if (fallbackType === "weekly-review" || prompt.includes("weekly review") || prompt.includes("achievements")) {
    return {
      achievements: [
        "🏆 Completed 85% of high-priority project tasks this week.",
        "⌛ Logged 265 focus minutes total, surpassing last week by 20%."
      ],
      missedGoals: [
        "⚠️ Missed due date for 'Finalize slides presentation' by 1 day.",
        "📝 Habit tracker: Missed 2 days of 'Morning Stretching'."
      ],
      strengths: [
        "🏆 High consistency in morning hours (09:00 - 11:30).",
        "🎯 Exceptional completion rate on tasks broken down by AI."
      ],
      weaknesses: [
        "📉 Noticeable drop in focus sessions on Thursday afternoon.",
        "🚧 Leaving difficult tasks to late evening hours."
      ],
      recommendations: [
        "💡 Schedule complex coding or writing tasks on Monday/Tuesday morning.",
        "🚶 Take a 15-minute screen-free walk on Thursday after lunch to recharge."
      ]
    };
  }

  return {
    message: "Momentum Coach recommends taking a quick stretch and focusing on your nearest due task."
  };
}
