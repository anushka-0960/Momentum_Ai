import { SYSTEM_PROMPT } from "./system.prompt";

export function taskRefinementPrompt(currentBlueprintJson: string, userRequest: string): string {
  return `${SYSTEM_PROMPT}

You are an AI Project Planner acting as a Senior AI Project Architect.
Your ONLY job is to modify an existing software project blueprint JSON based on the user's refinement request.

Current Blueprint JSON:
${currentBlueprintJson}

User Refinement Request:
"${userRequest}"

### Core Behavior & Rules
1. Apply the user's refinement request directly to the blueprint.
2. Maintain the exact same JSON structure as the current blueprint.
3. Update the fields that need modifications:
   - For example, if they request "Convert to Next.js", update the recommended tech stack (frontend: "Next.js", hosting: "Vercel", etc.), the phases/tasks to refer to Next.js components (e.g. Server Components, route handlers, dynamic routes), and relevant learning resources.
   - If they request "Add Docker", add Docker setup tasks to the planning/development/deployment phases, deliverables checklist, learning resources, and update the architecture diagram to show the Docker container setup.
4. Keep the output extremely project-specific, detailed, and professional.
5. Do NOT change anything unrelated to the user's request. Keep everything else intact.
6. The response MUST be ONLY valid JSON matching the exact schema. Do NOT include markdown blocks (\`\`\`) in the response, return ONLY the raw JSON text.

Respond in ONLY valid JSON matching this exact structure:
{
  "projectName": "string",
  "projectSummary": "string",
  "domain": "string",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "confidenceScore": number,
  "recommendedTeamSize": number,
  "estimatedTotalHours": number,
  "estimatedCompletionTime": "string",
  "projectUnderstanding": {
    "category": "string",
    "industry": "string",
    "targetUsers": "string",
    "coreProblem": "string",
    "modules": ["string"],
    "workflows": ["string"],
    "security": ["string"],
    "scalability": ["string"],
    "performance": ["string"]
  },
  "discoveredFeatures": ["string"],
  "techStack": {
    "frontend": { "name": "string", "reason": "string" },
    "backend": { "name": "string", "reason": "string" },
    "database": { "name": "string", "reason": "string" },
    "authentication": { "name": "string", "reason": "string" },
    "hosting": { "name": "string", "reason": "string" },
    "additional": [ { "name": "string", "reason": "string" } ]
  },
  "architectureDiagram": {
    "mermaidCode": "string",
    "nodes": [ { "id": "string", "label": "string" } ],
    "edges": [ { "from": "string", "to": "string" } ]
  },
  "databaseDesign": {
    "entities": [
      {
        "name": "string",
        "fields": [
          { "name": "string", "type": "string", "constraints": "string" }
        ],
        "relationships": ["string"]
      }
    ]
  },
  "apiEndpoints": [
    {
      "method": "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
      "path": "string",
      "description": "string",
      "requestBody": "string",
      "responseBody": "string"
    }
  ],
  "folderStructure": {
    "name": "string",
    "type": "directory" | "file",
    "children": [
      {
        "name": "string",
        "type": "directory" | "file",
        "children": []
      }
    ]
  },
  "phases": [
    {
      "phaseName": "Planning" | "UI/UX Design" | "Frontend" | "Backend" | "Database" | "API Integration" | "AI Integration" | "Authentication" | "Testing" | "Deployment",
      "goal": "string",
      "weight": number,
      "estimatedDuration": "string",
      "estimatedHours": number,
      "priority": "High" | "Medium" | "Low",
      "dependencies": ["string"],
      "deliverables": ["string"],
      "tasks": [
        { "title": "string", "estimatedMinutes": number }
      ]
    }
  ],
  "weeklyMilestones": [
    {
      "weekNumber": number,
      "goal": "string",
      "expectedDeliverable": "string",
      "hours": number,
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "dependencies": ["string"]
    }
  ],
  "complexityBreakdown": [
    { "name": "string", "score": number, "explanation": "string" }
  ],
  "learningRoadmap": [
    {
      "name": "string",
      "whyLearnThis": "string",
      "estimatedHours": number,
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "resourcesToExplore": ["string"]
    }
  ],
  "technicalRisks": [
    {
      "risk": "string",
      "likelihood": "Low" | "Medium" | "High",
      "impact": "Low" | "Medium" | "High",
      "mitigation": "string"
    }
  ],
  "aiReasoning": {
    "architecture": "string",
    "stack": "string",
    "database": "string",
    "roadmap": "string",
    "milestones": "string",
    "priorities": "string"
  },
  "developmentCost": {
    "soloDeveloper": "string",
    "twoDevelopers": "string",
    "startupTeam": "string",
    "enterpriseTeam": "string"
  },
  "timeEstimation": {
    "frontend": number,
    "backend": number,
    "testing": number,
    "deployment": number,
    "documentation": number,
    "research": number,
    "explanation": "string"
  },
  "deploymentPlan": {
    "hosting": "string",
    "cicd": "string",
    "monitoring": "string",
    "logging": "string",
    "envVariables": ["string"],
    "scalingStrategy": "string"
  },
  "deliverablesChecklist": ["string"]
}`;
}
