import { SYSTEM_PROMPT } from "./system.prompt";

export function taskBreakdownPrompt(
  taskTitle: string,
  projectType: string,
  difficulty: string,
  techStack?: string
): string {
  return `${SYSTEM_PROMPT}

You are an AI Software Architect and Hackathon Judge.
Your ONLY job is to analyze a user's project idea and generate an extremely detailed, handcrafted implementation blueprint.

Project Title: "${taskTitle}"
Project Type: "${projectType}"
Difficulty Level: "${difficulty}"
${techStack ? `Requested Tech Stack: "${techStack}"` : ""}

### PRIMARY GOALS & CONSTRAINTS
1. NEVER use generic templates or filled placeholders. At least 80% of the entire output MUST be unique to this specific project name.
2. Prohibited words: Do NOT use generic words like "Project", "Utility", "Core Logic", "Dashboard", "Custom APIs", "database schema", "API routes", "setup environment", "configure DB". Every sentence, task, API endpoint, module, database entity, and risk mitigation must refer specifically to "${taskTitle}" domain concepts.
3. Every phase in the detailed roadmap MUST contain between 8 to 15 actionable, domain-specific tasks. No phase should have only 2-5 generic items.
4. Explanations must feel like a senior engineer spent 30 minutes designing this specific architecture.

### STEP-BY-STEP BREAKDOWN SCHEMAS
Include all the following steps in your JSON output:

- **Project Understanding**: Detail category, industry, target users, core business problem, required modules, workflows, security, scalability, and performance considerations.
- **Feature Discovery**: Dynamically identify specific features required (e.g. for Stock Trading: Watchlists, Portfolio, BUY/SELL Orders, WebSockets real-time charts).
- **Tech Stack Recommendations**: Explain exactly WHY every technology (Frontend, Backend, Database, Authentication, Hosting, and Caching/Queues if needed) was chosen.
- **System Architecture Graph**: Provide valid TD graph Mermaid syntax, along with a flat "nodes" and "edges" mapping.
- **Database Design**: Generate a list of entities/tables (e.g., watchlists, portfolios, transactions), each table containing typed fields (with constraints) and explicit relationships.
- **REST API Endpoints**: Detail specific endpoints matching the project domain (e.g., POST /api/trades/execute, GET /api/portfolio/stats).
- **Folder Structure**: Output a custom-designed folder tree structure that fits this project category.
- **Detailed Roadmap**: Output phases (Planning, Design, Frontend, Backend, Database, Authentication, API Integration, Testing, Deployment) where each phase includes goal, deliverables, estimatedHours, priority ("High" | "Medium" | "Low"), dependencies, and a detailed checklist of 8-15 custom tasks.
- **Weekly Sprint Planner**: Details week number, objectives, expectedDeliverable, hours, difficulty, and dependencies.
- **Complexity Scores**: Score Authentication, Database, Real-time Features, Payments, and Charts out of 10 and write a project-specific explanation of why.
- **Learning Path**: List concepts to learn in order, detailing why, estimated hours, difficulty, and resource links.
- **Technical Risks**: Problem, likelihood ("Low" | "Medium" | "High"), impact ("Low" | "Medium" | "High"), and concrete mitigation.
- **AI Reasoning**: Dynamic reasoning explaining stack, architecture, database, roadmap, and milestones selection.
- **Development Cost**: Expected ranges (in USD or days) for a Solo Developer, 2 Developers, a Startup Team, and an Enterprise Team.
- **Time Estimation**: Breakdown of hours for Frontend, Backend, Testing, Deployment, Documentation, and Research, with explanations.
- **Deployment Plan**: hosting, CI/CD provider, monitoring, logging service, envVariables list, and scaling strategy.

Respond in ONLY valid JSON matching this exact structure (do not include markdown syntax, just the raw JSON text):
{
  "projectName": "string",
  "projectSummary": "2-3 sentences explaining what this project does and key components to build",
  "domain": "string representing the industry domain, e.g., 'Finance', 'E-commerce', 'Healthcare'",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "confidenceScore": number, // out of 100
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
    "additional": [
      { "name": "string", "reason": "string" }
    ]
  },
  "architectureDiagram": {
    "mermaidCode": "string graph TD",
    "nodes": [
      { "id": "string", "label": "string" }
    ],
    "edges": [
      { "from": "string", "to": "string" }
    ]
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
        "children": [] // only present for type: "directory"
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

