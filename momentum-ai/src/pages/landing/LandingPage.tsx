import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  Zap, 
  BookOpen, 
  Map, 
  Clock, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  ShieldAlert, 
  ListTodo, 
  GraduationCap, 
  TrendingUp, 
  CheckCircle2, 
  CheckCircle,
  Database,
  Server,
  Layers,
  HelpCircle,
  Download,
  Copy,
  ChevronRight,
  Sparkles,
  Users,
  Compass,
  CheckSquare,
  Search,
  Moon,
  Sun,
  LayoutGrid,
  FileCode,
  DollarSign,
  Cpu,
  FolderOpen
} from "lucide-react";
import { aiApi } from "../../api/aiApi";
import type { BreakdownResponse, FolderNode } from "../../types/ai";

const PHASE_EMOJIS: Record<string, string> = {
  "Planning": "📋",
  "UI/UX Design": "🎨",
  "Frontend": "💻",
  "Backend": "⚙️",
  "Database": "🗄️",
  "API Integration": "🔌",
  "AI Integration": "🧠",
  "Authentication": "🔒",
  "Testing": "🧪",
  "Deployment": "🚀"
};

const PROJECT_TYPES = [
  "Web App",
  "Mobile App",
  "Desktop App",
  "AI Application",
  "SaaS",
  "Game",
  "API",
  "CLI Tool",
  "IoT Project"
];

const DIFFICULTY_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced"
];

const VAGUE_TITLES = ["website", "mobile app", "project", "ai", "app", "web app", "desktop app", "game", "site", "software"];

const LOADING_STAGES = [
  "Initializing domain mapper parameters...",
  "Analyzing target industry user workflows...",
  "Designing project-specific database models...",
  "Structuring REST API router contracts...",
  "Creating custom folder hierarchy trees...",
  "Detailing implementation phase steps...",
  "Mapping weekly sprints and objectives...",
  "Calculating complexity scores and costs...",
  "Formulating cloud deployment pipelines..."
];

function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }
  return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMinutes} min`;
}

// Tree view rendering of dynamic folders
function FolderTree({ node }: { node: FolderNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const isDir = node.type === "directory";
  return (
    <div className="pl-4 select-none text-left">
      <div 
        onClick={() => isDir && setIsOpen(!isOpen)} 
        className={`flex items-center gap-1.5 py-1 text-xs font-semibold cursor-pointer ${
          isDir ? "text-blue-600 dark:text-blue-400" : "text-slate-650 dark:text-slate-450"
        }`}
      >
        {isDir ? (isOpen ? "📂" : "📁") : "📄"}
        <span>{node.name}</span>
      </div>
      {isDir && isOpen && node.children && (
        <div className="border-l border-slate-200 dark:border-slate-700 ml-2">
          {node.children.map((child, idx) => (
            <FolderTree key={idx} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

// Layout positions for Visual SVG flow graph
const SVG_NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  "User": { x: 175, y: 30 },
  "Frontend": { x: 175, y: 95 },
  "Backend": { x: 175, y: 160 },
  "Database": { x: 75, y: 235 },
  "Redis": { x: 275, y: 235 },
  "Stripe": { x: 175, y: 285 },
  "SocketioGateway": { x: 275, y: 160 },
  "S3SecureBuckets": { x: 75, y: 160 },
  "PKIDigitalSigner": { x: 175, y: 285 },
  "OpenAIGPT4SDK": { x: 275, y: 95 },
  "ServerlessPuppeteer": { x: 75, y: 95 }
};

export default function LandingPage() {
  const { user } = useAuth();
  // Theme & layout states
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Input states
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("Web App");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [techStackInput, setTechStackInput] = useState("");

  // AI Output states
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [roadmap, setRoadmap] = useState<BreakdownResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Refinement states
  const [refinePrompt, setRefinePrompt] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineMessages, setRefineMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);

  // Checklist & modal triggers
  const [completedDeliverables, setCompletedDeliverables] = useState<Record<string, boolean>>({});
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"markdown" | "json" | "notion" | "jira" | "trello" | "github_issues">("markdown");
  const [copySuccess, setCopySuccess] = useState(false);

  const generatorRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Handle stage increments when loading
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage(prev => (prev + 1) % LOADING_STAGES.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Dark mode effect toggler
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setError(null);

    const trimmedTitle = projectName.trim().toLowerCase();
    
    // Validate project name
    if (!projectName.trim()) return;

    if (VAGUE_TITLES.includes(trimmedTitle) || trimmedTitle.length < 3) {
      setValidationError(
        'Please enter a specific project idea, such as "Expense Tracker App", "Food Delivery Platform", or "AI Resume Builder".'
      );
      return;
    }

    setLoading(true);
    setRoadmap(null);
    setCompletedDeliverables({});
    setExpandedPhases({});
    setRefineMessages([]);

    try {
      const response = await aiApi.breakdown(
        projectName,
        projectType,
        difficulty,
        techStackInput || undefined
      );
      setRoadmap(response);
      
      // Auto expand all phases by default
      const initialExpanded: Record<string, boolean> = {};
      response.phases.forEach(p => {
        initialExpanded[p.phaseName] = true;
      });
      setExpandedPhases(initialExpanded);
      
      // Smooth scroll to output cards
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Failed to generate blueprint. Please check that your server is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Refine endpoint triggers conversational changes
  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinePrompt.trim() || !roadmap) return;

    const userMessage = refinePrompt;
    setRefineMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setRefinePrompt("");
    setRefineLoading(true);

    try {
      const updatedRoadmap = await aiApi.refine(roadmap, userMessage);
      setRoadmap(updatedRoadmap);
      
      setRefineMessages(prev => [
        ...prev,
        { role: "assistant", text: `Blueprint updated successfully to apply: "${userMessage}"` }
      ]);
    } catch (err) {
      console.error(err);
      setRefineMessages(prev => [
        ...prev,
        { role: "assistant", text: "Error: Failed to refine roadmap. Please try again." }
      ]);
    } finally {
      setRefineLoading(false);
    }
  };

  // Export content generators
  const getExportContent = () => {
    if (!roadmap) return "";

    if (exportFormat === "json") {
      return JSON.stringify(roadmap, null, 2);
    }

    if (exportFormat === "markdown") {
      let md = `# Project Blueprint: ${roadmap.projectName}\n\n`;
      md += `**Domain:** ${roadmap.domain} | **Difficulty:** ${roadmap.difficulty} | **Hours:** ${roadmap.estimatedTotalHours} hours\n\n`;
      md += `## Summary\n${roadmap.projectSummary}\n\n`;
      md += `## Recommended Tech Stack\n`;
      md += `* **Frontend:** ${roadmap.techStack.frontend.name} - ${roadmap.techStack.frontend.reason}\n`;
      md += `* **Backend:** ${roadmap.techStack.backend.name} - ${roadmap.techStack.backend.reason}\n`;
      md += `* **Database:** ${roadmap.techStack.database.name} - ${roadmap.techStack.database.reason}\n`;
      md += `* **Authentication:** ${roadmap.techStack.authentication.name} - ${roadmap.techStack.authentication.reason}\n`;
      md += `* **Hosting:** ${roadmap.techStack.hosting.name} - ${roadmap.techStack.hosting.reason}\n\n`;
      md += `## Development Roadmap\n`;
      roadmap.phases.forEach(phase => {
        md += `### ${phase.phaseName} (Goal: ${phase.goal} | Weight: ${phase.weight}% | Priority: ${phase.priority})\n`;
        md += `**Dependencies:** ${phase.dependencies.join(", ") || "None"}\n`;
        phase.tasks.forEach(task => {
          md += `* [ ] ${task.title} (${formatMinutes(task.estimatedMinutes)})\n`;
        });
        md += `\n`;
      });
      return md;
    }

    if (exportFormat === "notion") {
      let notion = `Notion Database Format:\n\nTask | Phase | Duration | Weight | Priority\n---|---|---|---|---\n`;
      roadmap.phases.forEach(phase => {
        phase.tasks.forEach(task => {
          notion += `${task.title} | ${phase.phaseName} | ${formatMinutes(task.estimatedMinutes)} | ${phase.weight}% | ${phase.priority}\n`;
        });
      });
      return notion;
    }

    if (exportFormat === "trello") {
      let trello = `Trello Cards Format (Group by List/Phase):\n\n`;
      roadmap.phases.forEach(phase => {
        trello += `List Name: ${phase.phaseName}\n`;
        phase.tasks.forEach(task => {
          trello += `- [ ] ${task.title} (${formatMinutes(task.estimatedMinutes)})\n`;
        });
        trello += `\n`;
      });
      return trello;
    }

    if (exportFormat === "jira") {
      let jira = `Summary,Issue Type,Description,Priority\n`;
      roadmap.phases.forEach(phase => {
        phase.tasks.forEach(task => {
          jira += `"${task.title}","Sub-task","Phase: ${phase.phaseName} - Goal: ${phase.goal}","${phase.priority}"\n`;
        });
      });
      return jira;
    }

    if (exportFormat === "github_issues") {
      let github = `## GitHub Issues for ${roadmap.projectName}\n\n`;
      roadmap.phases.forEach(phase => {
        github += `### Issue: Phase [${phase.phaseName}] - ${phase.goal}\n`;
        github += `**Priority:** ${phase.priority}\n`;
        github += `**Tasks list:**\n`;
        phase.tasks.forEach(task => {
          github += `- [ ] ${task.title} (${formatMinutes(task.estimatedMinutes)})\n`;
        });
        github += `\n`;
      });
      return github;
    }

    return "";
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(getExportContent());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadFile = () => {
    const content = getExportContent();
    const ext = exportFormat === "json" ? "json" : "md";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${roadmap?.projectName.toLowerCase().replace(/\s+/g, "_")}_blueprint.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleDeliverable = (item: string) => {
    setCompletedDeliverables(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const togglePhase = (phaseName: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseName]: !prev[phaseName]
    }));
  };

  const getNodePosition = (id: string, index: number, _total: number) => {
    if (SVG_NODE_POSITIONS[id]) return SVG_NODE_POSITIONS[id];
    return {
      x: 50 + (index % 3) * 115,
      y: 235 + Math.floor(index / 3) * 60
    };
  };

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter phases/tasks based on user search query
  const getFilteredPhases = () => {
    if (!roadmap) return [];
    if (!searchQuery.trim()) return roadmap.phases;

    return roadmap.phases.map(phase => {
      const matchedTasks = phase.tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchedGoal = phase.goal.toLowerCase().includes(searchQuery.toLowerCase());
      const matchedName = phase.phaseName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const shouldInclude = matchedName || matchedGoal || matchedTasks.length > 0;
      
      return {
        ...phase,
        tasks: matchedTasks,
        shouldInclude
      };
    }).filter(p => p.shouldInclude);
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Zap className="w-5 h-5 fill-white" />
            </span>
            <span className="font-bold text-xl tracking-tight">
              Momentum<span className="text-blue-600">AI</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-650 dark:text-slate-350">
            <a href="#" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/signin" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
                Sign In
              </Link>
            )}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-150 dark:border-blue-800/40">
          🧠 AI Software Architect & System Planner
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
          AI Software Architect
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Input any dynamic project target and instantly generate database schemas, REST routes, sprint timetables, SVG topology diagrams, costs, and risk audits.
        </p>
        <div className="pt-4">
          <button 
            onClick={scrollToGenerator} 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-base shadow-sm hover:shadow"
          >
            Design Architecture <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Main Architect Settings Form */}
      <section ref={generatorRef} className="max-w-6xl mx-auto px-6 py-12 scroll-mt-20">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm space-y-8">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Architect Planner</h2>
            <p className="text-sm text-slate-550 dark:text-slate-400 font-medium">Auto-discovers features, structural folders, database tables, and milestones dynamically.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div className="space-y-2">
                <label htmlFor="project-name" className="block text-sm font-bold text-slate-705 dark:text-slate-300">
                  Project Name / Target Goal
                </label>
                <input 
                  id="project-name"
                  type="text" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Stock Trading Platform, AI Resume Builder..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              {/* Project Type */}
              <div className="space-y-2">
                <label htmlFor="project-type" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Application Category
                </label>
                <select
                  id="project-type"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  {PROJECT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <label htmlFor="difficulty" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Complexity Scope
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Optional Tech Stack */}
              <div className="space-y-2">
                <label htmlFor="tech-stack" className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Target Tech Stack</span>
                  <span className="text-xs text-slate-400 font-semibold">Leave blank for AI decision</span>
                </label>
                <input 
                  id="tech-stack"
                  type="text" 
                  value={techStackInput} 
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. Flutter + Firebase, MERN, Rails + Postgres..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Validation Warnings */}
            {validationError && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium leading-normal">{validationError}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                disabled={loading || !projectName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl px-8 py-3.5 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Domain & Generating Spec...
                  </>
                ) : (
                  <>
                    Compile Architect Blueprint
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Typing Loading State */}
          {loading && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[350px]">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="space-y-2.5 max-w-md">
                <p className="font-bold text-slate-800 dark:text-white text-lg">AI Software Architect at Work</p>
                <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 animate-pulse block">
                    {LOADING_STAGES[loadingStage]}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">Creating project-specific database tables, folder trees, REST API endpoints, sprint timelines, and mitigations.</p>
              </div>
            </div>
          )}

          {/* AI OUTPUT VIEWPORT PORTAL */}
          <div ref={outputRef} className="scroll-mt-20">
            {roadmap && !loading && (
              <div className="grid lg:grid-cols-12 gap-8 items-start text-left">
                
                {/* Navigator Sidebar */}
                <div className="lg:col-span-3 hidden lg:block sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">Blueprint Navigator</h3>
                  {[
                    { label: "1. Overview & Understanding", id: "#overview" },
                    { label: "2. Features & Tech Stack", id: "#features-list" },
                    { label: "3. Flow Diagram", id: "#diagram" },
                    { label: "4. Database Design", id: "#database-design" },
                    { label: "5. REST API Endpoints", id: "#apis" },
                    { label: "6. Folder Structure", id: "#folders" },
                    { label: "7. Detailed Phases", id: "#detailed-roadmap" },
                    { label: "8. Weekly Sprints", id: "#weekly-sprints" },
                    { label: "9. Complexity Metrics", id: "#complexity-metrics" },
                    { label: "10. Topics & Risks", id: "#learning-risks" },
                    { label: "11. Cost & Time Estimates", id: "#costs" },
                    { label: "12. Deployment Plan", id: "#deploy" },
                    { label: "13. Refinement chatbot", id: "#refinement" }
                  ].map((link, linkIdx) => (
                    <a 
                      key={linkIdx} 
                      href={link.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      {link.label}
                    </a>
                  ))}
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 px-3">
                    <button 
                      onClick={() => setExportModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-850 dark:hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Export Specs
                    </button>
                  </div>
                </div>

                {/* Dashboard panels */}
                <div className="lg:col-span-9 space-y-8">
                  
                  {/* Step 1: Project Understanding & Summary */}
                  <div id="overview" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm scroll-mt-24">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                      <div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          Handcrafted System Blueprint
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{roadmap.projectName}</h2>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-200/40 dark:border-blue-800/40">
                          {roadmap.domain}
                        </span>
                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-650 dark:text-slate-350 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                          {projectType}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                          roadmap.difficulty === "Beginner" 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/40" 
                            : roadmap.difficulty === "Advanced"
                            ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-200/40"
                            : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200/40"
                        }`}>
                          {roadmap.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6 text-center border-b border-slate-100 dark:border-slate-700 pb-6">
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-400 font-bold block mb-1">Time Estimation</span>
                        <span className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {roadmap.estimatedTotalHours} Hours
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-400 font-bold block mb-1">Architect Confidence</span>
                        <span className="text-lg font-extrabold text-slate-800 dark:text-white">
                          {roadmap.confidenceScore}%
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-400 font-bold block mb-1">Suggested Team Size</span>
                        <span className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          {roadmap.recommendedTeamSize} Dev{roadmap.recommendedTeamSize > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Architect Summary</h3>
                        <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">{roadmap.projectSummary}</p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deep Project Analysis</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="font-extrabold text-slate-700 dark:text-slate-300 block">Industry Segment:</span>
                            <span className="text-slate-600 dark:text-slate-400">{roadmap.projectUnderstanding.industry}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="font-extrabold text-slate-700 dark:text-slate-300 block">Core Problem:</span>
                            <span className="text-slate-600 dark:text-slate-400">{roadmap.projectUnderstanding.coreProblem}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="font-extrabold text-slate-700 dark:text-slate-300 block">Target Audience:</span>
                            <span className="text-slate-600 dark:text-slate-400">{roadmap.projectUnderstanding.targetUsers}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="font-extrabold text-slate-700 dark:text-slate-300 block">System Category:</span>
                            <span className="text-slate-600 dark:text-slate-400">{roadmap.projectUnderstanding.category}</span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
                          <div className="space-y-1.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-blue-500" /> Security Controls</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-455">
                              {roadmap.projectUnderstanding.security.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          </div>
                          <div className="space-y-1.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-blue-500" /> Scalability</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-455">
                              {roadmap.projectUnderstanding.scalability.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          </div>
                          <div className="space-y-1.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Performance Specs</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-455">
                              {roadmap.projectUnderstanding.performance.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 & 3: Discovered Features & Tech Stack */}
                  <div id="features-list" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm scroll-mt-24">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                          <ListTodo className="w-5 h-5 text-blue-600" />
                          Auto-Discovered Core Features
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-350">
                          {roadmap.discoveredFeatures.map((f, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="text-blue-500 font-bold mt-0.5">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                          <Layers className="w-5 h-5 text-blue-600" />
                          Recommended Tech Stack & Reasons
                        </h3>
                        <div className="space-y-2">
                          {[
                            { label: "Frontend", item: roadmap.techStack.frontend },
                            { label: "Backend", item: roadmap.techStack.backend },
                            { label: "Database", item: roadmap.techStack.database },
                            { label: "Authentication", item: roadmap.techStack.authentication },
                            { label: "Hosting Platform", item: roadmap.techStack.hosting }
                          ].map((stack, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                              <div className="flex justify-between font-bold text-slate-705 dark:text-slate-300">
                                <span>{stack.label}:</span>
                                <span className="text-blue-600 dark:text-blue-400">{stack.item.name}</span>
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 mt-1">{stack.item.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Flow Diagram */}
                  <div id="diagram" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm scroll-mt-24">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <Compass className="w-5 h-5 text-blue-600" />
                      Visual System Diagram Nodes
                    </h3>
                    <div className="relative">
                      <svg className="w-full h-80 border border-slate-150 dark:border-slate-750 rounded-xl bg-slate-50/50 dark:bg-slate-900/50" viewBox="0 0 350 320">
                        <defs>
                          <marker 
                            id="arrow-dark" 
                            viewBox="0 0 10 10" 
                            refX="6" 
                            refY="5" 
                            markerWidth="6" 
                            markerHeight="6" 
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                          </marker>
                        </defs>
                        
                        {/* Edges */}
                        {roadmap.architectureDiagram.edges.map((edge, idx) => {
                          const fromPos = getNodePosition(edge.from, idx, roadmap.architectureDiagram.nodes.length);
                          const toPos = getNodePosition(edge.to, idx, roadmap.architectureDiagram.nodes.length);
                          return (
                            <line 
                              key={idx} 
                              x1={fromPos.x} 
                              y1={fromPos.y + 16} 
                              x2={toPos.x} 
                              y2={toPos.y - 16} 
                              stroke="#3b82f6" 
                              strokeWidth="1.5" 
                              markerEnd="url(#arrow-dark)" 
                            />
                          );
                        })}

                        {/* Nodes */}
                        {roadmap.architectureDiagram.nodes.map((node, idx) => {
                          const pos = getNodePosition(node.id, idx, roadmap.architectureDiagram.nodes.length);
                          return (
                            <g key={node.id}>
                              <rect 
                                x={pos.x - 52} 
                                y={pos.y - 16} 
                                width="104" 
                                height="32" 
                                rx="6" 
                                fill={darkMode ? "#1e293b" : "white"} 
                                stroke="#3b82f6" 
                                strokeWidth="2" 
                                className="shadow-sm"
                              />
                              <text 
                                x={pos.x} 
                                y={pos.y + 4} 
                                textAnchor="middle" 
                                fontSize="8" 
                                fontWeight="bold" 
                                fill={darkMode ? "#f1f5f9" : "#334155"}
                              >
                                {node.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Step 5: Database Design */}
                  <div id="database-design" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm scroll-mt-24">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <Database className="w-5 h-5 text-blue-600" />
                      Dynamic Database Design (Entities & Relationships)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {roadmap.databaseDesign.entities.map((ent, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl p-4 space-y-3">
                          <h4 className="font-extrabold text-blue-650 dark:text-blue-450 text-sm flex items-center justify-between">
                            <span>🔑 Table: {ent.name}</span>
                          </h4>
                          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs">
                            <table className="w-full text-left bg-white dark:bg-slate-900">
                              <thead>
                                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                                  <th className="px-3 py-1.5">Column</th>
                                  <th className="px-3 py-1.5">Type</th>
                                  <th className="px-3 py-1.5">Constraints</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ent.fields.map((f: any, fIdx: number) => (
                                  <tr key={fIdx} className="border-b border-slate-150 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                                    <td className="px-3 py-1.5 font-bold font-mono text-slate-700 dark:text-slate-300">{f.name}</td>
                                    <td className="px-3 py-1.5 font-mono text-slate-550 dark:text-slate-400">{f.type}</td>
                                    <td className="px-3 py-1.5 text-slate-400 font-semibold">{f.constraints || "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relationships</span>
                            <ul className="text-xs list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
                              {ent.relationships.map((rel: string, relIdx: number) => (
                                <li key={relIdx}>{rel}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 6: REST API Endpoints */}
                  <div id="apis" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm scroll-mt-24">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <FileCode className="w-5 h-5 text-blue-600" />
                      Dynamic REST API Endpoints
                    </h3>
                    <div className="space-y-4">
                      {roadmap.apiEndpoints.map((api, idx) => {
                        const isGet = api.method === "GET";
                        const isPost = api.method === "POST";
                        const isDelete = api.method === "DELETE";
                        const methodColor = isGet 
                          ? "bg-emerald-500" 
                          : isPost 
                          ? "bg-blue-600" 
                          : isDelete 
                          ? "bg-red-500" 
                          : "bg-amber-500";
                        return (
                          <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-slate-150 dark:border-slate-750">
                              <span className={`text-[10px] font-extrabold text-white px-2.5 py-1 rounded-md shrink-0 text-center ${methodColor}`}>
                                {api.method}
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-750 dark:text-slate-200 break-all">
                                {api.path}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium sm:ml-auto">
                                {api.description}
                              </span>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-4 p-4 text-[10px] font-mono leading-normal bg-white dark:bg-slate-900">
                              <div className="space-y-1">
                                <span className="text-slate-400 font-bold block uppercase tracking-wider">Request Payload</span>
                                <pre className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg overflow-x-auto text-slate-650 dark:text-slate-350 max-h-36">
                                  {api.requestBody || "None / Query params"}
                                </pre>
                              </div>
                              <div className="space-y-1">
                                <span className="text-slate-400 font-bold block uppercase tracking-wider">Response Payload</span>
                                <pre className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg overflow-x-auto text-slate-650 dark:text-slate-350 max-h-36">
                                  {api.responseBody || "Status status check"}
                                </pre>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 7: Folder Structure */}
                  <div id="folders" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm scroll-mt-24">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                      Dynamic Workspace Folder Structure
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-150 dark:border-slate-800 rounded-xl">
                      <FolderTree node={roadmap.folderStructure} />
                    </div>
                  </div>

                  {/* Step 8: Detailed Roadmap */}
                  <div id="detailed-roadmap" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm scroll-mt-24">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Map className="w-5 h-5 text-blue-600" />
                        Detailed Implementation Phases
                      </h3>
                      
                      {/* Search / Filter input */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Filter tasks / goals..."
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {getFilteredPhases().length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-6">No matching phases or tasks found.</p>
                      ) : (
                        getFilteredPhases().map((phase, idx) => {
                          const emoji = PHASE_EMOJIS[phase.phaseName] || "📋";
                          const isExpanded = !!expandedPhases[phase.phaseName];

                          return (
                            <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                              
                              {/* Header trigger */}
                              <div 
                                onClick={() => togglePhase(phase.phaseName)}
                                className="bg-white dark:bg-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-750/30 px-6 py-4 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl flex items-center justify-center p-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg">{emoji}</span>
                                  <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{phase.phaseName}</h4>
                                    <span className="text-xs text-slate-400 font-semibold">{phase.estimatedDuration} • {phase.weight}% Weight • Priority: {phase.priority}</span>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                  {isExpanded ? "Collapse" : "Expand"}
                                </span>
                              </div>

                              {/* Collapsible content */}
                              {isExpanded && (
                                <div className="px-6 py-4 bg-slate-50/30 dark:bg-slate-900/20 space-y-4">
                                  <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-3">
                                    <div>
                                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Phase Goal</span>
                                      <span className="text-slate-700 dark:text-slate-300">{phase.goal}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Dependencies</span>
                                      <span className="text-slate-700 dark:text-slate-300">{phase.dependencies.join(", ") || "None"}</span>
                                    </div>
                                    <div className="sm:col-span-2">
                                      <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Deliverables</span>
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                        {phase.deliverables.map((del, delIdx) => (
                                          <span key={delIdx} className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-750 px-2 py-0.5 rounded">
                                            {del}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {phase.tasks.map((task, taskIdx) => (
                                      <li key={taskIdx} className="py-3 flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-2.5">
                                          <span className="text-blue-500 font-bold mt-0.5">•</span>
                                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-normal">{task.title}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded shrink-0">
                                          {formatMinutes(task.estimatedMinutes)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Step 9: Weekly Sprints */}
                  <div id="weekly-sprints" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm scroll-mt-24">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      Weekly Sprints & Milestones
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {roadmap.weeklyMilestones.map((w, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Week {w.weekNumber}</span>
                              <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                                {w.difficulty}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white">{w.goal}</h4>
                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                              <span className="text-[10px] text-slate-400 block mb-0.5">Expected Deliverable:</span>
                              <span className="text-xs font-semibold text-slate-650 dark:text-slate-400 leading-normal">{w.expectedDeliverable}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/40 mt-3">
                            <span>Sprints: {w.hours} Hours</span>
                            <span>Deps: {w.dependencies.join(", ") || "None"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 10: Complexity Scores */}
                  <div id="complexity-metrics" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm scroll-mt-24">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <LayoutGrid className="w-5 h-5 text-blue-600" />
                      Core Module Complexity Analysis
                    </h3>
                    <div className="space-y-4">
                      {roadmap.complexityBreakdown.map((item, idx) => (
                        <div key={idx} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl">
                          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                            <span>{item.name}</span>
                            <span>{item.score}/10</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5">
                            <div 
                              className="bg-rose-500 h-2.5 rounded-full transition-all duration-700 ease-out" 
                              style={{ width: `${item.score * 10}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                            <span className="font-bold text-slate-750 dark:text-slate-300">Why:</span> {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 11 & 12: Learning path & Technical risks */}
                  <div id="learning-risks" className="grid md:grid-cols-2 gap-6 scroll-mt-24">
                    
                    {/* Learning path */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Domain Learning Path
                      </h3>
                      <div className="space-y-4">
                        {roadmap.learningRoadmap.map((topic, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-150 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-850 dark:text-white">{topic.name}</span>
                              <span className="text-blue-600 dark:text-blue-400">{topic.difficulty} ({topic.estimatedHours} Hrs)</span>
                            </div>
                            <p className="text-slate-650 dark:text-slate-400 leading-normal"><span className="font-bold text-slate-700">Goal:</span> {topic.whyLearnThis}</p>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block mb-1">Resources:</span>
                              <div className="flex flex-wrap gap-1">
                                {topic.resourcesToExplore.map((res, rIdx) => (
                                  <span key={rIdx} className="bg-white dark:bg-slate-950 text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
                                    {res}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risks & Mitigations */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        Mitigating Tech Risks
                      </h3>
                      <div className="space-y-3.5">
                        {roadmap.technicalRisks.map((riskItem, idx) => (
                          <div key={idx} className="bg-red-50/30 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 space-y-2 text-xs">
                            <div className="flex justify-between font-bold text-red-700 dark:text-red-400">
                              <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Risk: {riskItem.risk}</span>
                            </div>
                            <div className="flex gap-4 text-[10px] text-slate-400 font-bold">
                              <span>Likelihood: {riskItem.likelihood}</span>
                              <span>Impact: {riskItem.impact}</span>
                            </div>
                            <p className="text-slate-650 dark:text-slate-405 leading-normal">
                              <span className="font-bold text-slate-800 dark:text-slate-300">Solution:</span> {riskItem.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 11: Direct Checklist */}
                  <div id="checklist" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                      Dynamic Checklist
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 pt-1">
                      {roadmap.deliverablesChecklist.map((item, idx) => {
                        const checked = !!completedDeliverables[item];
                        return (
                          <div 
                            key={idx}
                            onClick={() => toggleDeliverable(item)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                              checked 
                                ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-slate-400 line-through" 
                                : "bg-slate-50 dark:bg-slate-900/50 border-slate-250 dark:border-slate-750 hover:border-slate-350 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {checked ? (
                              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-600 shrink-0 bg-white dark:bg-slate-900" />
                            )}
                            <span className="text-xs font-bold truncate">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 13: Why choose these configurations */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
                    <details className="group cursor-pointer">
                      <summary className="font-bold text-slate-900 dark:text-white text-base flex items-center justify-between list-none">
                        <span className="flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-blue-600" />
                          Why did AI choose this roadmap?
                        </span>
                        <span className="text-xs font-bold text-blue-600 group-open:hidden">Expand reasoning</span>
                        <span className="text-xs font-bold text-blue-600 hidden group-open:inline">Collapse</span>
                      </summary>
                      
                      <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-slate-105 dark:border-slate-705 mt-4 text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-800 dark:text-slate-300 block text-xs">System Architecture</span>
                          <p>{roadmap.aiReasoning.architecture}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-800 dark:text-slate-300 block text-xs">Technology Choices</span>
                          <p>{roadmap.aiReasoning.stack}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-800 dark:text-slate-300 block text-xs">Database Choices</span>
                          <p>{roadmap.aiReasoning.database}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-800 dark:text-slate-300 block text-xs">Milestone Divisions</span>
                          <p>{roadmap.aiReasoning.milestones}</p>
                        </div>
                      </div>
                    </details>
                  </div>

                  {/* Step 14 & 15: Costs & Time Estimates */}
                  <div id="costs" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm scroll-mt-24">
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Costs card */}
                      <div className="space-y-4 text-xs">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-blue-500" /> Development Cost Projection</h4>
                        <div className="space-y-3">
                          {[
                            { team: "Solo Developer", val: roadmap.developmentCost.soloDeveloper },
                            { team: "2 Developers Team", val: roadmap.developmentCost.twoDevelopers },
                            { team: "Startup Team (3-5 Devs)", val: roadmap.developmentCost.startupTeam },
                            { team: "Enterprise Squad (SLA)", val: roadmap.developmentCost.enterpriseTeam }
                          ].map((cost, idx) => (
                            <div key={idx} className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                              <span className="font-bold text-slate-700 dark:text-slate-400">{cost.team}:</span>
                              <span className="text-slate-600 dark:text-slate-300 font-semibold">{cost.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Time estimates */}
                      <div className="space-y-4 text-xs">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> Work Hours Allocation</h4>
                        <div className="space-y-2">
                          {[
                            { name: "Frontend Client UI", value: roadmap.timeEstimation.frontend },
                            { name: "Backend Logic APIs", value: roadmap.timeEstimation.backend },
                            { name: "Unit & Integration Testing", value: roadmap.timeEstimation.testing },
                            { name: "Hosting Deployment", value: roadmap.timeEstimation.deployment },
                            { name: "Documentation", value: roadmap.timeEstimation.documentation },
                            { name: "Domain & Scope Research", value: roadmap.timeEstimation.research }
                          ].map((time, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-400">
                                <span>{time.name}</span>
                                <span>{time.value} Hours</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (time.value / 60) * 100)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed mt-2 italic">{roadmap.timeEstimation.explanation}</p>
                      </div>

                    </div>
                  </div>

                  {/* Step 16: Deployment Plan */}
                  <div id="deploy" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm scroll-mt-24">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <Server className="w-5 h-5 text-blue-600" />
                      Cloud Deployment & Scaling Plan
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 text-xs leading-normal">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-700 dark:text-slate-350 block uppercase tracking-wider text-[10px] text-slate-400">Hosting Solution</span>
                          <p className="text-slate-650 dark:text-slate-400 font-semibold">{roadmap.deploymentPlan.hosting}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-700 dark:text-slate-350 block uppercase tracking-wider text-[10px] text-slate-400">CI/CD Engine</span>
                          <p className="text-slate-650 dark:text-slate-400 font-semibold">{roadmap.deploymentPlan.cicd}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-700 dark:text-slate-350 block uppercase tracking-wider text-[10px] text-slate-400">Telemetry & Alerts</span>
                          <p className="text-slate-650 dark:text-slate-400 font-semibold">{roadmap.deploymentPlan.monitoring}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-700 dark:text-slate-350 block uppercase tracking-wider text-[10px] text-slate-400">Logging Transports</span>
                          <p className="text-slate-650 dark:text-slate-400 font-semibold">{roadmap.deploymentPlan.logging}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-700 dark:text-slate-350 block uppercase tracking-wider text-[10px] text-slate-400">Scalability Strategy</span>
                          <p className="text-slate-650 dark:text-slate-400 font-semibold">{roadmap.deploymentPlan.scalingStrategy}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-700 dark:text-slate-350 block uppercase tracking-wider text-[10px] text-slate-400">Config Environment Variables</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {roadmap.deploymentPlan.envVariables.map((env, envIdx) => (
                              <span key={envIdx} className="bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-350 border border-slate-200 dark:border-slate-700 font-mono text-[9px] px-2 py-0.5 rounded">
                                {env}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 17: Interactive AI Refinement Panel */}
                  <div id="refinement" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm scroll-mt-24">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                      Architect Refinement Assistant
                    </h3>

                    {/* Chat log */}
                    <div className="space-y-3 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50">
                      {refineMessages.length === 0 ? (
                        <p className="text-xs text-slate-400 font-medium text-center py-4">No blueprint changes submitted yet. Submit prompts below to adjust databases, hosting options, or timelines.</p>
                      ) : (
                        refineMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`p-3 rounded-xl max-w-[80%] text-xs font-semibold ${
                              msg.role === "user" 
                                ? "bg-blue-600 text-white" 
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))
                      )}
                      
                      {refineLoading && (
                        <div className="flex justify-start items-center gap-2 text-xs text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          Modifying tables, stack choices, and folders...
                        </div>
                      )}
                    </div>

                    {/* Suggestions */}
                    <div className="flex flex-wrap gap-2 py-1">
                      {[
                        "Convert to Next.js",
                        "Replace MongoDB with PostgreSQL",
                        "Reduce timeline to 2 weeks",
                        "Add Docker",
                        "Make beginner friendly",
                        "Convert into microservices"
                      ].map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRefinePrompt(sug)}
                          disabled={refineLoading}
                          className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-650 dark:text-blue-300 border border-blue-100 dark:border-blue-800 hover:bg-blue-100/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>

                    {/* Submit Form */}
                    <form onSubmit={handleRefineSubmit} className="flex gap-2">
                      <input 
                        type="text" 
                        value={refinePrompt}
                        onChange={(e) => setRefinePrompt(e.target.value)}
                        placeholder="e.g. Add Docker build steps or change stack to NestJS..."
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100"
                        disabled={refineLoading}
                      />
                      <button 
                        type="submit" 
                        disabled={refineLoading || !refinePrompt.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl px-5 py-2.5 text-xs transition-colors shadow-sm shrink-0 cursor-pointer"
                      >
                        Refine Blueprint
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* EXPORT OPTIONS MODAL */}
      <AnimatePresence>
        {exportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-705 rounded-2xl p-6 max-w-xl w-full space-y-6 shadow-2xl relative text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  Developer Export Formats
                </h3>
                <button 
                  onClick={() => setExportModalOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-655"
                >
                  Close
                </button>
              </div>

              {/* Format selection */}
              <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                {[
                  { id: "markdown", label: "Markdown (.md)" },
                  { id: "json", label: "JSON Raw" },
                  { id: "notion", label: "Notion (CSV)" },
                  { id: "trello", label: "Trello Board" },
                  { id: "jira", label: "Jira / CSV" },
                  { id: "github_issues", label: "GitHub Issues" }
                ].map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => setExportFormat(f.id as any)}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                      exportFormat === f.id 
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-350"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Content Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Preview Export Content</label>
                <textarea 
                  readOnly 
                  value={getExportContent()} 
                  className="w-full h-60 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-750 rounded-xl p-3.5 text-[10px] font-mono leading-normal focus:outline-none text-slate-700 dark:text-slate-300"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button 
                  onClick={handleCopyClipboard}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 hover:bg-blue-105/50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  {copySuccess ? "Copied!" : "Copy to Clipboard"}
                </button>
                <button 
                  onClick={handleDownloadFile}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-750 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-slate-200 dark:border-slate-800">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-800 hover:border-blue-350 transition-all text-left">
            <div className="space-y-4">
              <span className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 inline-flex border border-blue-100 dark:border-blue-800/40">
                <BookOpen className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Project Analysis</h3>
              <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                Analyzes industry categories, workflows, target users, security requirements, and scalability bottlenecks dynamically.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-800 hover:border-blue-350 transition-all text-left">
            <div className="space-y-4">
              <span className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 inline-flex border border-blue-100 dark:border-blue-800/40">
                <Map className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Roadmap Generation</h3>
              <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                Generates detailed implementation tasks and weekly sprints, avoiding generic guidelines.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-800 hover:border-blue-350 transition-all text-left">
            <div className="space-y-4">
              <span className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 inline-flex border border-blue-100 dark:border-blue-800/40">
                <Clock className="w-6 h-6" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cost & Deployment Planner</h3>
              <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                Provides development costs, hour distributions, environment variables lists, and scaling guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Momentum AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
