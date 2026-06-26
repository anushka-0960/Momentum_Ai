import type { Priority } from "./task";

// Shapes returned by the /api/ai/* endpoints — kept in sync with the
// prompt schemas defined in server/src/prompts/.
export interface TechStackItem {
  name: string;
  reason: string;
}

export interface RecommendedTechStack {
  frontend: TechStackItem;
  backend: TechStackItem;
  database: TechStackItem;
  authentication: TechStackItem;
  hosting: TechStackItem;
  additional?: TechStackItem[];
}

export interface BreakdownTask {
  title: string;
  estimatedMinutes: number;
}

export interface BreakdownPhase {
  phaseName: "Planning" | "UI/UX Design" | "Frontend" | "Backend" | "Database" | "API Integration" | "AI Integration" | "Authentication" | "Testing" | "Deployment";
  goal: string;
  weight: number;
  estimatedDuration: string;
  estimatedHours: number;
  priority: "High" | "Medium" | "Low";
  dependencies: string[];
  deliverables: string[];
  tasks: BreakdownTask[];
}

export interface WeeklyMilestone {
  weekNumber: number;
  goal: string;
  expectedDeliverable: string;
  hours: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  dependencies: string[];
}

export interface ComplexityModule {
  name: string;
  score: number;
  explanation: string;
}

export interface LearningTopic {
  name: string;
  whyLearnThis: string;
  estimatedHours: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  resourcesToExplore: string[];
}

export interface RiskFactor {
  risk: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  mitigation: string;
}

export interface ReasoningItem {
  architecture: string;
  stack: string;
  database: string;
  roadmap: string;
  milestones: string;
  priorities: string;
}

export interface MermaidNode {
  id: string;
  label: string;
}

export interface MermaidEdge {
  from: string;
  to: string;
}

export interface ArchitectureDiagramData {
  mermaidCode: string;
  nodes: MermaidNode[];
  edges: MermaidEdge[];
}

export interface ProjectUnderstanding {
  category: string;
  industry: string;
  targetUsers: string;
  coreProblem: string;
  modules: string[];
  workflows: string[];
  security: string[];
  scalability: string[];
  performance: string[];
}

export interface DatabaseField {
  name: string;
  type: string;
  constraints?: string;
}

export interface DatabaseEntity {
  name: string;
  fields: DatabaseField[];
  relationships: string[];
}

export interface DatabaseDesign {
  entities: DatabaseEntity[];
}

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  requestBody?: string;
  responseBody?: string;
}

export interface FolderNode {
  name: string;
  type: "file" | "directory";
  children?: FolderNode[];
}

export interface DevelopmentCost {
  soloDeveloper: string;
  twoDevelopers: string;
  startupTeam: string;
  enterpriseTeam: string;
}

export interface TimeEstimation {
  frontend: number;
  backend: number;
  testing: number;
  deployment: number;
  documentation: number;
  research: number;
  explanation: string;
}

export interface DeploymentPlan {
  hosting: string;
  cicd: string;
  monitoring: string;
  logging: string;
  envVariables: string[];
  scalingStrategy: string;
}

export interface BreakdownResponse {
  projectName: string;
  projectSummary: string;
  domain: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  confidenceScore: number;
  recommendedTeamSize: number;
  estimatedTotalHours: number;
  estimatedCompletionTime: string;
  projectUnderstanding: ProjectUnderstanding;
  discoveredFeatures: string[];
  techStack: RecommendedTechStack;
  architectureDiagram: ArchitectureDiagramData;
  databaseDesign: DatabaseDesign;
  apiEndpoints: ApiEndpoint[];
  folderStructure: FolderNode;
  phases: BreakdownPhase[];
  weeklyMilestones: WeeklyMilestone[];
  complexityBreakdown: ComplexityModule[];
  learningRoadmap: LearningTopic[];
  technicalRisks: RiskFactor[];
  aiReasoning: ReasoningItem;
  developmentCost: DevelopmentCost;
  timeEstimation: TimeEstimation;
  deploymentPlan: DeploymentPlan;
  deliverablesChecklist: string[];
}

export interface PrioritizationResponse {
  orderedTaskIds: string[];
  reasoning: string;
}

export interface ScheduleBlock {
  taskId: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleResponse {
  date: string;
  blocks: ScheduleBlock[];
}

export interface CoachResponse {
  message?: string;
  summary?: string;
  recommendedActions?: string[];
  estimatedTime?: string;
  priority?: "High" | "Medium" | "Low";
  risks?: string;
  aiRecommendation?: string;
}

export interface WeeklyReviewResponse {
  achievements: string[];
  missedGoals: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export type { Priority };
