import { SYSTEM_PROMPT } from "./system.prompt";

export function taskBreakdownPrompt(taskTitle: string): string {
  return `${SYSTEM_PROMPT}

You are an expert Project Planning AI. Your job is to convert the following project title/goal into a custom, detailed execution roadmap.

Project Title: "${taskTitle}"

### Rules & Guidelines
1. NEVER return a fixed or predefined breakdown.
2. Carefully analyze the project: what they are trying to build, likely technologies involved, complexity, domain, and deliverables.
3. Break the project into logical phases. Choose only relevant phases from: Research, Requirement Analysis, Planning, UI/UX Design, Database Design, Backend Development, Frontend Development, AI Development, Authentication, API Integration, Payment Integration, Testing, Security, Deployment, Documentation, Marketing, Maintenance. Do NOT include unnecessary phases.
4. Large projects should have many phases; small projects should have fewer phases.
5. If technologies are not mentioned in the title, intelligently suggest the best technology stack in the project summary.
6. Estimate realistic time for every phase.
7. Every task must include:
   - title
   - description (a short actionable sentence)
   - estimatedMinutes (realistic time)
   - difficulty ("easy" | "medium" | "hard")

Respond in ONLY valid JSON matching this exact structure:
{
  "summary": "Brief explanation of the project approach, goals, and suggested tech stack.",
  "phases": [
    {
      "name": "Phase Name (e.g., Phase 1: Research & Setup)",
      "estimatedTime": "Estimated total time for this phase (e.g., '10 hours' or '3 days')",
      "tasks": [
        {
          "title": "Task Title",
          "description": "Short actionable task description",
          "estimatedMinutes": 60,
          "difficulty": "easy"
        }
      ]
    }
  ]
}`;
}
