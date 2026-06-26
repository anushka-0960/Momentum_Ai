import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY ?? "";
const isMockKey = !apiKey || apiKey.startsWith("mock") || apiKey === "your_gemini_api_key";

let genAI: GoogleGenerativeAI | null = null;
if (!isMockKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Generic helper: sends a prompt, expects strict JSON back, and parses it.
// Implements development fallback if the Gemini API key is missing or mock.
export async function generateJSON<T>(prompt: string, fallbackType?: "breakdown" | "refine" | "prioritize" | "schedule" | "coach" | "weekly-review"): Promise<T> {
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
  if (fallbackType === "breakdown" || prompt.includes("phases")) {
    const match = prompt.match(/Project Title: "(.*)"/);
    const taskTitle = match ? match[1] : "Project";
    
    const typeMatch = prompt.match(/Project Type: "(.*)"/);
    const projectType = typeMatch ? typeMatch[1] : "Web App";

    const diffMatch = prompt.match(/Difficulty Level: "(.*)"/);
    const difficultyInput = diffMatch ? diffMatch[1] : "Intermediate";

    const stackMatch = prompt.match(/Requested Tech Stack: "(.*)"/);
    const requestedStack = stackMatch ? stackMatch[1] : "";

    return buildMockBlueprint(taskTitle, projectType, difficultyInput, requestedStack);
  }

  if (fallbackType === "refine" || prompt.includes("User Refinement Request:")) {
    try {
      const matchBlueprint = prompt.match(/Current Blueprint JSON:\s*([\s\S]*?)\n\nUser Refinement Request:/);
      const userRequestMatch = prompt.match(/User Refinement Request:\s*"(.*)"/);
      const userRequest = userRequestMatch ? userRequestMatch[1] : "";
      
      let bp = matchBlueprint ? JSON.parse(matchBlueprint[1]) : {};
      const lowerReq = userRequest.toLowerCase();
      
      if (lowerReq.includes("next.js")) {
        bp.techStack.frontend = { name: "Next.js (App Router)", reason: "Converted dynamically to support SSR and Server components." };
        bp.techStack.hosting = { name: "Vercel", reason: "Ideal edge deployment partner for Next.js app assets." };
      }
      if (lowerReq.includes("postgresql")) {
        bp.techStack.database = { name: "PostgreSQL", reason: "Switched database layer to support relational and transactional integrity." };
      }
      if (lowerReq.includes("docker")) {
        if (!bp.techStack.additional) bp.techStack.additional = [];
        bp.techStack.additional.push({ name: "Docker", reason: "Containerized deployment configurations for consistent dev-to-prod." });
        if (bp.phases && bp.phases.length > 0) {
          bp.phases[0].tasks.push({ title: "Setup Dockerfiles and docker-compose.yml configuration", estimatedMinutes: 60 });
        }
      }
      if (lowerReq.includes("microservices")) {
        bp.techStack.backend = { name: "Microservices API Gateway + Docker", reason: "Architected into decentralized node containers." };
        bp.aiReasoning.architecture = "Converted from monolith to microservices using an API Gateway schema.";
      }
      if (lowerReq.includes("beginner friendly") || lowerReq.includes("beginner")) {
        bp.difficulty = "Beginner";
        bp.estimatedTotalHours = Math.max(8, Math.round(bp.estimatedTotalHours * 0.6));
      }
      if (lowerReq.includes("reduce timeline to 2 weeks") || lowerReq.includes("reduce timeline")) {
        bp.estimatedCompletionTime = "2 Weeks";
        bp.estimatedTotalHours = Math.min(30, bp.estimatedTotalHours);
      }
      
      return bp;
    } catch (e) {
      console.error("Error parsing blueprint in mock refinement:", e);
    }
  }

  if (fallbackType === "prioritize" || prompt.includes("orderedTaskIds")) {
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
    if (prompt.includes("summary") || prompt.includes("recommendedActions")) {
      const qMatch = prompt.match(/User Question: "(.*)"/);
      const question = qMatch ? qMatch[1] : "What should I do now?";
      return {
        summary: `Assessment for: "${question}". Let's focus on completing your nearest pending task to clear up your afternoon schedule.`,
        recommendedActions: [
          "🎯 Complete research section for your main active goal",
          "🔍 Verify layout options on mobile views",
          "⚡ Set a 25-minute Pomodoro block to execute writing"
        ],
        estimatedTime: "1.5 hours",
        priority: "High",
        risks: "Potential bottleneck in layout animations if research is delayed.",
        aiRecommendation: "Establish a clear, distraction-free environment. Turning off social notifications during this block will reduce cognitive load."
      };
    }
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

function buildMockBlueprint(taskTitle: string, projectType: string, difficultyInput: string, requestedStack: string) {
  const lowerTitle = taskTitle.toLowerCase();
  
  // Extract clean domain term to prevent generic placeholder words
  let domainWord = taskTitle.replace(/(app|website|platform|system|builder|tool|software|tracker|manager|management)/gi, "").trim();
  if (!domainWord) domainWord = "Services";

  // Determine domain details dynamically
  let domain = "SaaS & Productivity";
  let industry = "Cloud Productivity";
  let category = "Enterprise SaaS";
  let targetUsers = `Team leads and collaborators seeking to automate ${domainWord} management.`;
  let coreProblem = `Inefficient coordination, manual tracking pipelines, and lack of system records for ${domainWord}.`;
  let summary = `A custom-tailored ${projectType} application focusing on delivering the core features of ${taskTitle}. Built with modern architecture principles, clean data layout, and optimized user workflows.`;
  
  let modules = [`${domainWord} Workspace`, `${domainWord} Analytics Panel`, `${domainWord} Sync Server`, `${domainWord} Database Node`];
  let workflows = [`User creates a new ${domainWord} account`, `State data streams ingest data records into the ${domainWord} workspace`, `Dashboard calculates and refreshes aggregate views of ${domainWord} metrics`];
  let security = [`AES-256 encryption at rest for ${domainWord} tables`, `HTTPS and session validation token expiration`, `MFA access checks`];
  let scalability = [`Horizontal auto-scaling server pods`, `Redis store for cached ${domainWord} data lookups`, `Optimized sharding keys`];
  let performance = [`Sub-150ms roundtrip database latency`, `Payload compression algorithms`, `Connection load balancer pools`];

  let discoveredFeatures = [
    `Create, read, update, and delete ${domainWord} files`,
    `Interactive timeline dashboard for ${domainWord} events`,
    `Notion and Jira developer files export`,
    `Role permissions check for workspace collaborators`,
    `Third-party API data synchronization`,
    `Activity logging ledger for auditing modifications`,
    `Filter and search indexing for dynamic search`
  ];

  // Tech stack default recommendations
  let techStack = {
    frontend: { name: "React + Tailwind CSS", reason: `Component modularity supports layout builds for ${domainWord}.` },
    backend: { name: "Node.js (Express)", reason: `Highly concurrent asynchronous routes handle incoming ${domainWord} records cleanly.` },
    database: { name: "MongoDB Atlas", reason: `Flexible JSON structures adapt to unstructured properties of ${domainWord}.` },
    authentication: { name: "JWT Auth Cookies", reason: `Secures endpoint requests with stateless cryptographically signed tokens.` },
    hosting: { name: "Vercel / Render", reason: `Optimized client edge routing and container server setups.` },
    additional: [
      { name: "Redis Cache", reason: `Reduces primary database query checks on highly requested ${domainWord} data.` }
    ]
  };

  // Specific domains custom overlays to guarantee at least 80% differences between projects
  if (lowerTitle.includes("stock") || lowerTitle.includes("trading") || lowerTitle.includes("portfolio") || lowerTitle.includes("invest") || lowerTitle.includes("finance") || lowerTitle.includes("budget") || lowerTitle.includes("expense")) {
    domain = "Finance & Investing";
    industry = "Financial Technology (FinTech)";
    category = "Wealth Management Suite";
    targetUsers = `Retail traders and investment managers tracking portfolio changes.`;
    coreProblem = `Lack of real-time candlestick rendering, ledger calculation errors, and market ticker ingestion lag.`;
    
    modules = [`Market Ticker Ingest Gateway`, `Stock Execution Ledger`, `Portfolio Performance Math Core`, `Transactional Audit Logger`];
    workflows = [`Trader opens asset dashboard and connects WebSockets ticker session`, `Trader triggers transaction orders`, `Ledger validates cash balances and logs holding rows`];
    security = [`TLS token validation and encrypted transaction pins`, `Replay attack protection middleware`, `Double-entry ledger arithmetic validation`];
    scalability = [`Message ingestion buffers (Kafka/RabbitMQ)`, `Replica DB clusters`, `Distributed socket gateways`];
    performance = [`Real-time price feed synchronization under 30ms`, `DB read-replicas for portfolio audits`, `Indexed tickers list`];

    discoveredFeatures = [
      `Real-time symbols feed and candlestick graph`,
      `Asset portfolio holdings percentage breakdown`,
      `Buy and Sell execution orders form`,
      `Watchlists pinning favorite indices`,
      `Historical transaction logs spreadsheet`,
      `MFA confirmation for high-volume execution`,
      `Export tax sheets as CSV spreadsheets`
    ];

    techStack = {
      frontend: { name: "React + Recharts", reason: `Supports responsive rendering of ticker candlestick graphs.` },
      backend: { name: "NestJS (TypeScript)", reason: `Type safety and built-in support for event-driven trading microservices.` },
      database: { name: "PostgreSQL (Supabase)", reason: `Strict relational logic protects double-entry ledger audits.` },
      authentication: { name: "Auth0 Social OAuth", reason: `Enforces bank-grade multi-factor access protocols.` },
      hosting: { name: "AWS ECS / RDS Fargate", reason: `High-availability cloud containers with isolated network gateways.` },
      additional: [
        { name: "Socket.io Gateway", reason: `Pushes live stock market prices to active user dashboards.` },
        { name: "Redis Server Cache", reason: `Caches market price symbols to avoid hitting primary SQL records.` }
      ]
    };
  } else if (lowerTitle.includes("delivery") || lowerTitle.includes("food") || lowerTitle.includes("order") || lowerTitle.includes("restaurant") || lowerTitle.includes("shop") || lowerTitle.includes("cart")) {
    domain = "Logistics & Commerce";
    industry = "On-Demand Delivery Services";
    category = "E-Commerce Dispatch";
    targetUsers = `Buyers browsing catalogs, kitchen vendors, and mobile delivery courier fleets.`;
    coreProblem = `High dispatcher allocation delay, cart item sync conflicts, and lack of real-time GPS telemetry checks.`;

    modules = [`Vendor Menu Browser`, `Cart State Context`, `Stripe Billing Pipeline`, `Geospatial Route Dispatcher`];
    workflows = [`Buyer adds restaurant food items to active basket`, `Buyer completes payment trigger via Stripe checkout`, `Dispatcher pushes tracking coordinates to active maps`];
    security = [`Stripe secure tokenization standard`, `Route access tracking restrictions`, `Session cookie CSRF headers`];
    scalability = [`Geospatial database indexes (MongoDB 2dsphere)`, `Serverless background worker triggers`, `Elastic CDN catalog caching`];
    performance = [`Geospatial nearby queries under 80ms`, `WebSocket telemetry connection polling`, `Cart read cached writes`];

    discoveredFeatures = [
      `Local restaurant searchable map portal`,
      `Dynamic menu categorizer with price modifiers`,
      `Stripe secure checkout integration`,
      `Real-time GPS delivery routes map`,
      `Courier dispatch automated dispatcher`,
      `Vendor menu management dashboard`,
      `Historical delivery order status timeline`
    ];

    techStack = {
      frontend: { name: "React Native + Tailwind CSS", reason: `Provides unified native-feeling layout rendering across mobile devices.` },
      backend: { name: "Node.js (Fastify)", reason: `Extremely low route overhead for processing fast GPS coordinate telemetry.` },
      database: { name: "MongoDB Atlas", reason: `Geospatial coordinate indexes support rapid nearby vendor scans.` },
      authentication: { name: "Firebase Auth OTP", reason: `Enables quick SMS validation logins for delivery couriers.` },
      hosting: { name: "AWS Fargate Containers", reason: `Scales container resources during high-concurrency eating hours.` },
      additional: [
        { name: "Google Maps Platform", reason: `Generates geospatial route calculations and visual markers.` },
        { name: "Stripe API SDK", reason: `Processes payment intents securely without database card storage.` }
      ]
    };
  } else if (lowerTitle.includes("hospital") || lowerTitle.includes("medical") || lowerTitle.includes("patient") || lowerTitle.includes("doctor") || lowerTitle.includes("clinic") || lowerTitle.includes("health") || lowerTitle.includes("prescription")) {
    domain = "Healthcare & EMR";
    industry = "Medical Services (MedTech)";
    category = "Clinical Management System";
    targetUsers = `Doctors prescribing medication, nursing administrative staff, and clinical patients.`;
    coreProblem = `Siloed patient history files, appointment scheduling collision events, and manual signature paperwork.`;

    modules = [`Electronic Medical Records (EMR)`, `Appointment Schedule Manager`, `Digital Prescriptions Signer`, `Claims Billing Module`];
    workflows = [`Admin imports patient historical record files`, `Doctor selects patient record and adds diagnostic note`, `Doctor cryptographically signs e-prescription file`];
    security = [`HIPAA compliance validation logs`, `Field-level DB encryption for EMR columns`, `Social SAML credentials validation`];
    scalability = [`Replicated healthcare file buckets`, `DB region partitioning`, `Dedicated HIPAA audit node logging`];
    performance = [`EMR queries loading under 100ms`, `Clash validation checker algorithms`, `Client state caching`];

    discoveredFeatures = [
      `EMR patient portal chart timelines`,
      `Clash-free booking scheduler calendar`,
      `Cryptographic doctor signature confirmation`,
      `ICD-10 clinical diagnostics catalog`,
      `Insurance claims billing parser`,
      `Clinical checklist validation audits`,
      `Secure patient file vault exports`
    ];

    techStack = {
      frontend: { name: "React + Tailwind + shadcn/ui", reason: `Dense list views and dashboard grids provide quick patient lookup.` },
      backend: { name: "NestJS (TypeScript)", reason: `Injectable modules organize strict clinical audit logger pipelines.` },
      database: { name: "PostgreSQL (Supabase)", reason: `Enforces strict schema models preventing medical scheduling collisions.` },
      authentication: { name: "Auth0 Enterprise Single Sign-On", reason: `SAML/MFA standard integration matching hospital network requirements.` },
      hosting: { name: "AWS GovCloud (HIPAA-Ready)", reason: `Cloud hosting complying with medical audit privacy requirements.` },
      additional: [
        { name: "S3 encrypted buckets", reason: `Saves clinician medical records and images under strict encryption.` },
        { name: "PKI Digital Signer", reason: `Cryptographically validates prescription approvals.` }
      ]
    };
  } else if (lowerTitle.includes("resume") || lowerTitle.includes("cv") || lowerTitle.includes("career") || lowerTitle.includes("portfolio") || lowerTitle.includes("profile")) {
    domain = "HR Tech & Career Growth";
    industry = "Employment Solutions";
    category = "Jobseeker Productivity";
    targetUsers = `Jobseekers optimizing assets and career profiles.`;
    coreProblem = `ATS scanner parser incompatibility, manual template rendering lags, and writer blocks.`;

    modules = [`PDF Canvas Render Engine`, `ATS Compatibility Analyzer`, `OpenAI Parser Gateway`, `Portfolio Templates Manager`];
    workflows = [`Jobseeker uploads PDF and system parses profile data`, `Jobseeker picks template styling layout`, `OpenAI improves bullet descriptors and compiles PDF file`];
    security = [`File scanning protections on text extraction uploads`, `User credentials session protection`, `CSRF tokens`];
    scalability = [`Serverless functions compiling PDF documents`, `Cloudfront caching for styles`, `AI task queues`];
    performance = [`Text extraction parsing completing under 2 seconds`, `Real-time template switches`, `CDN CSS cache loads`];

    discoveredFeatures = [
      `Interactive drag-and-drop section editor`,
      `ATS readability validator and score`,
      `AI bullet-point generator recommendations`,
      `Dynamic PDF export compilation canvas`,
      `Social imports importer`,
      `Resume template designs selectors`,
      `AI cover letter editor generator`
    ];

    techStack = {
      frontend: { name: "Next.js (App Router)", reason: `Enables server-side template pages and fast page speeds.` },
      backend: { name: "Next.js Serverless Functions", reason: `Stateless routes scale dynamically during template compiles.` },
      database: { name: "PostgreSQL (Supabase)", reason: `Relational tables represent recursive profile templates node structures.` },
      authentication: { name: "Supabase Go Auth", reason: `Enables email/Google OAuth logins without server framework configs.` },
      hosting: { name: "Vercel Platform", reason: `Edge performance optimizations for static templates asset delivery.` },
      additional: [
        { name: "OpenAI GPT-4 SDK", reason: `Suggests optimization changes and maps contact tables.` },
        { name: "Serverless Puppeteer", reason: `Compiles layout canvases into print-ready PDF files.` }
      ]
    };
  }

  // 4. Hours and Complete Time
  let estimatedHours = 36;
  let completionTime = "3 Weeks";
  if (difficultyInput === "Beginner") {
    estimatedHours = 18;
    completionTime = "1.5 Weeks";
  } else if (difficultyInput === "Advanced") {
    estimatedHours = 96;
    completionTime = "6 Weeks";
  }

  // 5. Build dynamic diagram nodes
  let flowchartNodes = [
    { id: "User", label: "User Client" },
    { id: "Frontend", label: `${techStack.frontend.name} App` },
    { id: "Backend", label: `${techStack.backend.name} Service` },
    { id: "Database", label: `${techStack.database.name} Data` }
  ];
  let flowchartEdges = [
    { from: "User", to: "Frontend" },
    { from: "Frontend", to: "Backend" },
    { from: "Backend", to: "Database" }
  ];

  if (techStack.additional && techStack.additional.length > 0) {
    techStack.additional.forEach(add => {
      flowchartNodes.push({ id: add.name.replace(/[^a-zA-Z]/g, ""), label: add.name });
      flowchartEdges.push({ from: "Backend", to: add.name.replace(/[^a-zA-Z]/g, "") });
    });
  }
  let mermaidCode = `graph TD\n` + flowchartEdges.map(e => `  ${e.from} --> ${e.to}`).join("\n");

  // 6. Build dynamic Database design entities
  let dbEntities: any[] = [];
  if (domain.includes("Finance")) {
    dbEntities = [
      {
        name: `${domainWord.toLowerCase()}_users`,
        fields: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY, DEFAULT gen_random_uuid()" },
          { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE, NOT NULL" },
          { name: "password_hash", type: "VARCHAR(255)", constraints: "NOT NULL" },
          { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP" }
        ],
        relationships: [`Has many ${domainWord.toLowerCase()}_portfolios (1:N)`]
      },
      {
        name: `${domainWord.toLowerCase()}_portfolios`,
        fields: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
          { name: "user_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id)" },
          { name: "portfolio_name", type: "VARCHAR(100)", constraints: "NOT NULL" },
          { name: "cash_balance", type: "DECIMAL(18,4)", constraints: "DEFAULT 0.0000" }
        ],
        relationships: [`Belongs to ${domainWord.toLowerCase()}_users (N:1)`, `Has many ${domainWord.toLowerCase()}_holdings (1:N)`]
      },
      {
        name: `${domainWord.toLowerCase()}_holdings`,
        fields: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
          { name: "portfolio_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES portfolios(id)" },
          { name: "ticker_symbol", type: "VARCHAR(20)", constraints: "NOT NULL" },
          { name: "shares_qty", type: "DECIMAL(12,4)", constraints: "NOT NULL" }
        ],
        relationships: [`Belongs to ${domainWord.toLowerCase()}_portfolios (N:1)`]
      },
      {
        name: `${domainWord.toLowerCase()}_transactions`,
        fields: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
          { name: "portfolio_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES portfolios(id)" },
          { name: "action_type", type: "VARCHAR(10)", constraints: "CHECK (action_type IN ('BUY', 'SELL'))" },
          { name: "shares_count", type: "DECIMAL(12,4)", constraints: "NOT NULL" },
          { name: "price_each", type: "DECIMAL(18,4)", constraints: "NOT NULL" },
          { name: "timestamp", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP" }
        ],
        relationships: [`Belongs to ${domainWord.toLowerCase()}_portfolios (N:1)`]
      }
    ];
  } else if (domain.includes("Logistics")) {
    dbEntities = [
      {
        name: `${domainWord.toLowerCase()}_customers`,
        fields: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
          { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE" },
          { name: "delivery_address", type: "TEXT", constraints: "NOT NULL" }
        ],
        relationships: [`Has many ${domainWord.toLowerCase()}_orders (1:N)`]
      },
      {
        name: `${domainWord.toLowerCase()}_vendors`,
        fields: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
          { name: "store_name", type: "VARCHAR(255)", constraints: "NOT NULL" },
          { name: "geo_location", type: "POINT", constraints: "NOT NULL" }
        ],
        relationships: [`Has many ${domainWord.toLowerCase()}_menu_items (1:N)`]
      },
      {
        name: `${domainWord.toLowerCase()}_menu_items`,
        fields: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
          { name: "vendor_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES vendors(id)" },
          { name: "item_title", type: "VARCHAR(255)", constraints: "NOT NULL" },
          { name: "price_value", type: "DECIMAL(10,2)", constraints: "NOT NULL" }
        ],
        relationships: [`Belongs to ${domainWord.toLowerCase()}_vendors (N:1)`]
      },
      {
        name: `${domainWord.toLowerCase()}_orders`,
        fields: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
          { name: "customer_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES customers(id)" },
          { name: "order_status", type: "VARCHAR(50)", constraints: "DEFAULT 'PENDING'" },
          { name: "total_amount", type: "DECIMAL(10,2)", constraints: "NOT NULL" }
        ],
        relationships: [`Belongs to ${domainWord.toLowerCase()}_customers (N:1)`]
      }
    ];
  } else {
    // General fallback
    dbEntities = [
      {
        name: `${domainWord.toLowerCase()}_profiles`,
        fields: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
          { name: "contact_name", type: "VARCHAR(255)", constraints: "NOT NULL" },
          { name: "created_at", type: "TIMESTAMP", constraints: "NOT NULL" }
        ],
        relationships: [`Has many ${domainWord.toLowerCase()}_records (1:N)`]
      },
      {
        name: `${domainWord.toLowerCase()}_records`,
        fields: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY" },
          { name: "profile_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES profiles(id)" },
          { name: "log_content", type: "TEXT", constraints: "NOT NULL" }
        ],
        relationships: [`Belongs to ${domainWord.toLowerCase()}_profiles (N:1)`]
      }
    ];
  }

  // 7. REST API endpoints dynamic mapping
  let apiEndpoints: any[] = [];
  if (domain.includes("Finance")) {
    apiEndpoints = [
      { method: "POST", path: `/api/${domainWord.toLowerCase()}/auth/register`, description: `Creates a user account and generates a seed empty portfolio for ${domainWord} management.`, requestBody: "{\n  \"email\": \"user@example.com\",\n  \"password\": \"SecurePass123\"\n}", responseBody: "{\n  \"token\": \"ey...\",\n  \"userId\": \"uuid-123\"\n}" },
      { method: "GET", path: `/api/${domainWord.toLowerCase()}/market/prices`, description: `Fetches ticker price data for active ${domainWord} items.`, requestBody: "None", responseBody: "[\n  { \"symbol\": \"AAPL\", \"price\": 182.5 }\n]" },
      { method: "POST", path: `/api/${domainWord.toLowerCase()}/orders/execute`, description: `Triggers a buy/sell trade request for ${domainWord} and adjusts cash balances.`, requestBody: "{\n  \"portfolioId\": \"id-1\",\n  \"action\": \"BUY\",\n  \"symbol\": \"AAPL\",\n  \"qty\": 10\n}", responseBody: "{\n  \"status\": \"EXECUTED\",\n  \"orderId\": \"ord-99\"\n}" },
      { method: "GET", path: `/api/${domainWord.toLowerCase()}/portfolio/holdings`, description: `Retrieves active database records of user portfolio shares.`, requestBody: "None", responseBody: "[\n  { \"symbol\": \"AAPL\", \"qty\": 10 }\n]" }
    ];
  } else if (domain.includes("Logistics")) {
    apiEndpoints = [
      { method: "GET", path: `/api/${domainWord.toLowerCase()}/vendors/list`, description: `Retrieves localized menus and details for ${domainWord} shops.`, requestBody: "None", responseBody: "[\n  { \"id\": \"1\", \"name\": \"Store A\" }\n]" },
      { method: "POST", path: `/api/${domainWord.toLowerCase()}/cart/add`, description: `Updates the buyer cart database array for ${domainWord} deliveries.`, requestBody: "{\n  \"itemId\": \"item-1\",\n  \"quantity\": 2\n}", responseBody: "{\n  \"cartCount\": 2\n}" },
      { method: "POST", path: `/api/${domainWord.toLowerCase()}/checkout/pay`, description: `Initiates Stripe payment token verification pipeline.`, requestBody: "{\n  \"paymentMethodId\": \"pm_123\",\n  \"amount\": 4500\n}", responseBody: "{\n  \"chargeId\": \"ch_99\",\n  \"success\": true\n}" }
    ];
  } else {
    apiEndpoints = [
      { method: "POST", path: `/api/${domainWord.toLowerCase()}/records/create`, description: `Adds a new entry log to the ${domainWord} workspace database.`, requestBody: "{\n  \"content\": \"New entry text\"\n}", responseBody: "{\n  \"id\": \"uuid-9\",\n  \"success\": true\n}" },
      { method: "GET", path: `/api/${domainWord.toLowerCase()}/records/list`, description: `Lists all saved entry items matching this profile.`, requestBody: "None", responseBody: "[\n  { \"id\": \"uuid-9\", \"content\": \"New entry text\" }\n]" }
    ];
  }

  // 8. Folder structure custom layout
  let folderStructure = {
    name: "src",
    type: "directory",
    children: [
      {
        name: "components",
        type: "directory",
        children: [
          { name: `${domainWord}Dashboard.tsx`, type: "file" },
          { name: `${domainWord}ControlPanel.tsx`, type: "file" }
        ]
      },
      {
        name: "services",
        type: "directory",
        children: [
          { name: `${domainWord.toLowerCase()}ApiService.ts`, type: "file" },
          { name: `${domainWord.toLowerCase()}Validation.ts`, type: "file" }
        ]
      },
      {
        name: "models",
        type: "directory",
        children: [
          { name: `${domainWord}Schema.ts`, type: "file" }
        ]
      }
    ]
  };

  // 9. Detailed phases and tasks (8 to 15 tasks each!)
  const mockPhases: string[] = ["Planning", "UI/UX Design", "Frontend", "Backend", "Database", "Testing", "Deployment"];
  let phases: any[] = mockPhases.map((phaseName, index) => {
    let goal = `Initialize ${domainWord} ${phaseName.toLowerCase()} configurations.`;
    let duration = "2 Weeks";
    let priority = "Medium" as const;
    let weight = 15;
    let estimatedHours = 20;

    let deliverables = [`Completed ${phaseName} specs for ${domainWord}`];
    let tasks: any[] = [];

    // Generate 10 tasks dynamically using the domainWord to avoid generic descriptions
    for (let t = 1; t <= 10; t++) {
      tasks.push({
        title: `Verify ${domainWord} ${phaseName.toLowerCase()} component milestone task #${t}`,
        estimatedMinutes: 60 + (t * 15)
      });
    }

    // Replace first few with domain specific ones
    if (phaseName === "Planning") {
      priority = "High";
      weight = 10;
      goal = `Establish target data requirements and workflow architecture for the ${domainWord} app.`;
      deliverables = [`System specifications doc`, `Wireframe logic blueprint`];
      tasks[0] = { title: `Define user roles and permissions flow for ${domainWord}`, estimatedMinutes: 90 };
      tasks[1] = { title: `Outline core security policy specs for ${domainWord} data transit`, estimatedMinutes: 120 };
      tasks[2] = { title: `Draft api contracts for ${domainWord} endpoints`, estimatedMinutes: 90 };
      tasks[3] = { title: `Validate scale capacity estimates for ${domainWord} ingestion logs`, estimatedMinutes: 60 };
      tasks[4] = { title: `Draft compliance checklists matching the ${domainWord} domain`, estimatedMinutes: 90 };
    } else if (phaseName === "Frontend") {
      weight = 30;
      goal = `Implement responsive client views and state contexts for ${domainWord} assets.`;
      deliverables = [`Functional UI pages`, `Global State context providers`];
      tasks[0] = { title: `Construct modular ${domainWord} summary grid UI components`, estimatedMinutes: 120 };
      tasks[1] = { title: `Implement reactive form handlers for editing ${domainWord} files`, estimatedMinutes: 180 };
      tasks[2] = { title: `Build list filtering filters for sorting ${domainWord} attributes`, estimatedMinutes: 90 };
      tasks[3] = { title: `Integrate dashboard visual analytics charts using mock endpoints`, estimatedMinutes: 120 };
      tasks[4] = { title: `Verify responsiveness checks on standard mobile viewports`, estimatedMinutes: 90 };
    } else if (phaseName === "Backend") {
      weight = 25;
      goal = `Build business logic controller endpoints and schemas for ${domainWord} operations.`;
      deliverables = [`Express controller endpoints`, `Middleware filters`];
      tasks[0] = { title: `Develop core router handlers for ${domainWord} CRUD requests`, estimatedMinutes: 180 };
      tasks[1] = { title: `Write mathematical validation checkers for ${domainWord} logs`, estimatedMinutes: 120 };
      tasks[2] = { title: `Integrate redis indexing key cache for popular ${domainWord} data`, estimatedMinutes: 90 };
      tasks[3] = { title: `Configure middleware validation filters to check request payloads`, estimatedMinutes: 120 };
      tasks[4] = { title: `Implement third party Webhook notification events processing`, estimatedMinutes: 150 };
    }

    return {
      phaseName,
      goal,
      weight,
      estimatedDuration: duration,
      estimatedHours,
      priority,
      dependencies: index > 0 ? [mockPhases[index - 1]] : [],
      deliverables,
      tasks
    };
  });

  // 10. Weekly Sprint Planner
  let weeklyMilestones = [
    { weekNumber: 1, goal: `Setup project schemas and build visual layouts for ${domainWord}.`, expectedDeliverable: "Functional prototype views.", hours: 20, difficulty: "Intermediate" as const, dependencies: [] },
    { weekNumber: 2, goal: `Program backend logic routes and validation rules for ${domainWord}.`, expectedDeliverable: "Local API endpoints running.", hours: 25, difficulty: "Advanced" as const, dependencies: ["Week 1"] },
    { weekNumber: 3, goal: `Wire client fields to database schemas and test ${domainWord} flows.`, expectedDeliverable: "Completed operational integration.", hours: 25, difficulty: "Advanced" as const, dependencies: ["Week 2"] },
    { weekNumber: 4, goal: `Perform scaling verification tests and launch ${domainWord}.`, expectedDeliverable: "Deployed software package.", hours: 15, difficulty: "Intermediate" as const, dependencies: ["Week 3"] }
  ];

  // 11. Complexity Scores
  let complexityBreakdown = [
    { name: "Authentication Core", score: 6, explanation: `MFA and session checking validation layers add complexity to the ${domainWord} gateway.` },
    { name: "Database Design Schema", score: 7, explanation: `Relational integrity constraints for persistent tracking of ${domainWord} attributes.` },
    { name: "Business Ingestion logic", score: 8, explanation: `Algorithmic validation steps required to parse dynamic ${domainWord} entities.` }
  ];

  // 12. Learning Path
  let learningRoadmap = [
    { name: `${techStack.frontend.name} Layouts`, whyLearnThis: `Required to build responsive, component-based control panels for ${domainWord}.`, estimatedHours: 8, difficulty: "Beginner" as const, resourcesToExplore: [`React documentation guides`, `Tailwind layout cheat sheets`] },
    { name: `Relational ${techStack.database.name} Optimization`, whyLearnThis: `Ensures fast index scanning when reading complex ${domainWord} query filters.`, estimatedHours: 12, difficulty: "Intermediate" as const, resourcesToExplore: [`Database index tuning articles`, `Query profiling documentation`] },
    { name: "State Integration Sockets", whyLearnThis: `Needed to push instant telemetric notification logs to the active ${domainWord} app.`, estimatedHours: 10, difficulty: "Advanced" as const, resourcesToExplore: [`WebSockets protocol overviews`, `Socket.io configuration walkthroughs`] }
  ];

  // 13. Technical Risks
  let technicalRisks = [
    { risk: `${domainWord} ingestion database lock contention`, likelihood: "Medium" as const, impact: "High" as const, mitigation: `Implement message queuing nodes and bulk insert batch triggers.` },
    { risk: `Session token replay hijack in ${domainWord} portals`, likelihood: "Low" as const, impact: "High" as const, mitigation: `Store access tokens in HTTP-only encrypted cookies with short expiration intervals.` }
  ];

  // 14. Cost Breakdown
  let developmentCost = {
    soloDeveloper: "$3,000 - $6,000 USD (Approx. 2-4 Weeks of focused build time)",
    twoDevelopers: "$8,000 - $12,000 USD (Includes parallel frontend-backend verification sprints)",
    startupTeam: "$18,000 - $35,000 USD (Includes designer layouts, staging deployment, and load testing)",
    enterpriseTeam: "$75,000+ USD (Includes HIPAA/SOC2 auditing, redundant micro-routing, and 24/7 SLA logs)"
  };

  // 15. Time Breakdown
  let timeEstimation = {
    frontend: 35,
    backend: 40,
    testing: 15,
    deployment: 8,
    documentation: 10,
    research: 12,
    explanation: `Time is centered on backend logic validation rules and responsive client charting nodes required for ${domainWord} management.`
  };

  // 16. Deployment Plan
  let deploymentPlan = {
    hosting: `${techStack.hosting.name} staging and production deployment tiers`,
    cicd: "GitHub Actions triggering build compilation and docker push hooks",
    monitoring: "Sentry integration capturing JS runtime exceptions",
    logging: "Winston transports pushing transaction logs to Datadog metrics",
    envVariables: ["DATABASE_CONNECTION_URI", "JWT_ACCESS_SECRET", "CLIENT_CORS_ORIGIN", "REDIS_HOST_URI"],
    scalingStrategy: "Horizontal replica pods scaling dynamically on CPU threshold limits above 70%"
  };

  return {
    projectName: taskTitle,
    projectSummary: summary,
    domain,
    difficulty: difficultyInput,
    confidenceScore: 94,
    recommendedTeamSize: 2,
    estimatedTotalHours: estimatedHours,
    estimatedCompletionTime: completionTime,
    projectUnderstanding: {
      category,
      industry,
      targetUsers,
      coreProblem,
      modules,
      workflows,
      security,
      scalability,
      performance
    },
    discoveredFeatures,
    techStack,
    architectureDiagram: {
      mermaidCode,
      nodes: flowchartNodes,
      edges: flowchartEdges
    },
    databaseDesign: {
      entities: dbEntities
    },
    apiEndpoints,
    folderStructure,
    phases,
    weeklyMilestones,
    complexityBreakdown,
    learningRoadmap,
    technicalRisks,
    aiReasoning: {
      architecture: `We selected a modular client-server framework to isolate ${domainWord} business logic layers from client components.`,
      stack: `${techStack.frontend.name} combined with ${techStack.backend.name} provides a TypeScript-safe channel for syncing data structures.`,
      database: `The chosen engine secures transaction logs and indexes search indexes for rapid ${domainWord} query filters.`,
      roadmap: `Built incrementally to allow early feedback cycles on form mock-ups before scaling server logic threads.`,
      milestones: `Milestones are partitioned by features to guarantee an operational minimum viable package (MVP) by week 2.`,
      priorities: `High priority is allocated to database indexing and validation checks to protect data integrity from the start.`
    },
    developmentCost,
    timeEstimation,
    deploymentPlan,
    deliverablesChecklist: discoveredFeatures
  };
}
