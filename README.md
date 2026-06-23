# Momentum AI

> **"Your AI productivity partner that helps you finish work instead of just reminding you."**

Momentum AI is a flagship, premium productivity ecosystem built for hackathons and portfolios. Instead of simply reminding users about deadlines (which is often ineffective), it serves as a personal productivity coach. Using Google Gemini (via Google AI Studio) and Firebase, it breaks down projects, optimizes calendar slots, filters web distractions, tracks habits, and aggregates weekly performance reports.

---

## ⚡ Key Features

1. **AI Task Breakdown**: Type in any large goal (e.g. *"Build portfolio"*), and Gemini structures it into concrete steps, assigning estimated times, difficulty ranks, and contextual tips.
2. **AI Coach Dashboard**: Real-time analytical dashboard greeting card showing dynamic coach advice reflecting active tasks and habit streaks.
3. **Voice Assistant**: Integrated hands-free Web Speech API converter allowing users to dictate new tasks instantly from the dashboard.
4. **Interactive Calendar**: Full month schedule tracking task due dates and mapping slots dynamically.
5. **Pomodoro Focus Mode**: Circular countdown timer supporting Focus (25m), Short Break (5m), and Long Break (15m) modes, integrated with mock ambient lofi noise and a website blocker checklist.
6. **AI Weekly Reviews**: Analytical charts (Completion rates, focus trends) coupled with Gemini-generated weekly review reports detailing achievements, strengths, focus leakages, and custom adjustments.
7. **Premium Responsive Design**: Minimalist light/dark theme aesthetics, glassmorphism card layouts, soft color palettes, and Framer Motion animations.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts (Data Visuals), Framer Motion (Animations), Lucide React (Icons).
* **Backend**: Node.js, Express, TypeScript.
* **Authentication**: Firebase Authentication (Google Login + Email/Password).
* **Database**: Firebase Firestore.
* **AI Engine**: Google Gemini API via `@google/generative-ai`.

---

## 📂 Project Architecture

```
momentum-ai-project/
├── momentum-ai/             # Vite + React Frontend Client
│   ├── src/
│   │   ├── api/             # Fetch client & API routes
│   │   ├── components/      # UI components & App Shell layouts
│   │   ├── contexts/        # Auth, Theme, and Task state providers
│   │   ├── hooks/           # custom react hooks
│   │   ├── pages/           # Landing, Auth, Dashboard, Tasks, Calendar, Focus, Analytics, Settings
│   │   ├── services/        # Firebase client init & Task CRUD helpers
│   │   └── types/           # TS definitions
│   └── package.json
│
├── server/                  # Node.js + Express Backend Proxy
│   ├── src/
│   │   ├── controllers/     # AI request handlers
│   │   ├── middleware/      # Error handling & Firebase auth validation
│   │   ├── prompts/         # Structured prompt templates for Gemini
│   │   ├── services/        # Gemini API client & Firestore admin connection
│   │   └── routes/          # API route definitions
│   └── package.json
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase Project setup
- Google Gemini API Key

---

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository and install frontend dependencies
cd momentum-ai
npm install

# Install backend dependencies
cd ../server
npm install
```

---

### Step 2: Configure Environment Variables

Create `.env` files in both subdirectories based on their templates.

#### **Frontend (`momentum-ai/.env`)**
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:5000
```

#### **Backend (`server/.env`)**
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_google_gemini_api_key
FIREBASE_SERVICE_ACCOUNT_JSON={"type": "service_account", "project_id": "...", ...}
```

*Note: In development mode, mock fallbacks exist for both Firebase Auth validation and the Gemini API client so that the project compiles and remains fully browsable even if keys are left blank.*

---

### Step 3: Run the Servers

#### Start Backend API
```bash
cd server
npm run dev
```

#### Start Frontend Client
```bash
cd momentum-ai
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing Instructions

1. **Verify Landing Page**: Access `http://localhost:5173`. Interact with the simulated AI Breakdown demo, FAQ accordions, and toggle light/dark theme.
2. **Register/Login**: Navigate to Sign Up. Create an account or sign in using mockup templates.
3. **Test Dashboard & Voice Input**: Click the microphone icon next to "Quick Add Task". Speak your task, check that text updates, and hit Add Task.
4. **Test Task Breakdown**: Navigate to Tasks page. select any task, click the **AI Breakdown** button, and watch as Gemini splits it into estimated steps.
5. **Test Pomodoro & Focus Music**: Go to Focus Mode. Start the Pomodoro, toggle blocker sites, and listen to the ambient audio selectors.
6. **Test Analytics**: Complete a few tasks, log some habits, and check the charts and **AI Weekly Review** summaries.
