# Momentum AI — System Architecture & Project Plan

> "Your AI productivity partner that helps you finish work instead of just reminding you."

This document is the blueprint we'll build against. Every later step (scaffold, dashboard, AI engine, etc.) implements a piece of this plan — nothing gets built that isn't defined here first.

---

## 1. System Overview

Momentum AI is a single-page React application backed by a thin Express API, with Firebase handling auth/data and Gemini handling the "intelligence" layer (task breakdown, prioritization, scheduling, coaching).

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite)                    │
│  Landing → Auth → Dashboard → Tasks/Calendar/Focus/Analytics      │
└───────────────────────────┬───────────────────────────────────────┘
                            │ HTTPS (REST)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Express)                    │
│  /api/auth   /api/tasks   /api/ai   /api/schedule   /api/analytics│
└───────────┬───────────────────────────────────┬───────────────────┘
            │                                   │
            ▼                                   ▼
┌───────────────────────────┐      ┌─────────────────────────────┐
│  Firebase (Auth + Firestore)│      │   Google Gemini API          │
│  - Users, Tasks, Habits     │      │   - Task breakdown            │
│  - Sessions, Analytics docs │      │   - Prioritization             │
└───────────────────────────┘      │   - Schedule generation        │
                                    │   - Coaching insights          │
                                    └─────────────────────────────┘
```

**Why this split:** Firebase Auth handles identity so we never touch passwords directly. Firestore gives us realtime sync for free (tasks updating live across tabs/devices). The Express layer exists specifically to keep the Gemini API key server-side — it never ships to the browser — and to let us shape/validate AI prompts and responses before the client sees them.

---

## 2. Tech Stack (confirmed)

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | React 18 + Vite | Fast dev server, native ESM, easy code-splitting |
| Language | TypeScript | Strict mode on everywhere |
| Styling | Tailwind CSS | Utility-first, pairs well with design tokens for the glassmorphism theme |
| Animation | Framer Motion | Page transitions, card hover states, list reordering |
| Backend | Node.js + Express | Thin API layer, mainly a secure proxy to Gemini + business logic |
| Database | Firebase Firestore | Realtime, document-based, fits tasks/habits/sessions well |
| Auth | Firebase Authentication | Google Login + Email/Password |
| AI | Google Gemini API (via Google AI Studio key) | `gemini-2.0-flash` for fast structured responses, escalate to a pro model only if needed for weekly review synthesis |
| Hosting target | Google AI Studio / Firebase Hosting + Cloud Run (for the Express API) | |

---

## 3. Frontend Folder Structure

```
momentum-ai/
├── src/
│   ├── assets/                  # illustrations, icons, fonts
│   ├── components/
│   │   ├── ui/                  # Button, Card, Input, Modal, Skeleton, Badge...
│   │   ├── layout/               # Navbar, Sidebar, AppShell, Footer
│   │   ├── tasks/                 # TaskCard, TaskList, SubtaskItem, QuickAddTask
│   │   ├── dashboard/              # ProductivityScoreCard, FocusTimeCard, StreakCard
│   │   ├── calendar/                # MonthView, WeekView, DragDropGrid
│   │   ├── focus/                     # PomodoroTimer, FocusMusicPlaceholder, SiteBlockerPlaceholder
│   │   ├── analytics/                  # CompletionRateChart, WeeklyTrendChart
│   │   └── ai/                          # AISuggestionCard, AIChatBubble, CoachInsightCard
│   ├── pages/
│   │   ├── landing/               # Hero, Features, HowItWorks, Testimonials, FAQ, CTA
│   │   ├── auth/                   # SignIn, SignUp, ForgotPassword
│   │   ├── dashboard/               # DashboardPage
│   │   ├── tasks/                     # TasksPage, TaskDetailPage
│   │   ├── calendar/                   # CalendarPage
│   │   ├── focus/                       # FocusModePage
│   │   ├── analytics/                    # AnalyticsPage
│   │   └── settings/                      # SettingsPage
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   ├── useAISuggestions.ts
│   │   ├── useFocusTimer.ts
│   │   └── useTheme.ts
│   ├── services/
│   │   ├── firebase.ts           # Firebase app init
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   └── analyticsService.ts
│   ├── api/
│   │   ├── client.ts              # fetch wrapper, error handling, auth header injection
│   │   ├── aiApi.ts                 # calls /api/ai/*
│   │   └── scheduleApi.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── TaskContext.tsx
│   ├── types/
│   │   ├── task.ts
│   │   ├── user.ts
│   │   ├── ai.ts
│   │   └── analytics.ts
│   ├── utils/
│   │   ├── dateHelpers.ts
│   │   ├── priorityEngine.ts       # client-side fallback ranking if AI is unavailable
│   │   └── validators.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── public/
├── index.html
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Backend Folder Structure

```
server/
├── src/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── tasks.routes.ts
│   │   ├── ai.routes.ts            # /breakdown /prioritize /schedule /coach /weekly-review
│   │   └── analytics.routes.ts
│   ├── controllers/
│   │   ├── ai.controller.ts
│   │   └── tasks.controller.ts
│   ├── services/
│   │   ├── geminiService.ts        # all Gemini API calls + prompt templates live here
│   │   └── firestoreService.ts
│   ├── middleware/
│   │   ├── verifyFirebaseToken.ts
│   │   └── errorHandler.ts
│   ├── prompts/
│   │   ├── taskBreakdown.prompt.ts
│   │   ├── prioritization.prompt.ts
│   │   ├── scheduling.prompt.ts
│   │   └── weeklyReview.prompt.ts
│   ├── types/
│   └── app.ts
├── .env.example
├── tsconfig.json
└── package.json
```

**Why prompts live in their own folder:** Gemini prompt templates are product logic, not throwaway strings. Versioning them separately makes it easy to iterate on AI quality without touching controller code.

---

## 5. Core Data Models (Firestore)

```
users/{userId}
  - displayName, email, photoURL
  - createdAt
  - preferences: { theme, workHours, aiTone }

tasks/{taskId}
  - userId, title, description
  - subtasks: [{ id, title, estimatedMinutes, difficulty, done }]
  - priority: "low" | "medium" | "high"
  - dueDate, estimatedMinutes
  - status: "todo" | "in_progress" | "done"
  - labels: string[]
  - createdAt, updatedAt

habits/{habitId}
  - userId, name, frequency, streak, history: [date]

focusSessions/{sessionId}
  - userId, taskId, startedAt, endedAt, durationMinutes, completed

analyticsSnapshots/{userId}_{weekId}
  - completionRate, focusMinutes, missedDeadlines, strengths[], weaknesses[]
```

---

## 6. API Surface (Express)

| Endpoint | Purpose |
|---|---|
| `POST /api/ai/breakdown` | Takes a task title → returns structured subtasks (time, difficulty, priority) |
| `POST /api/ai/prioritize` | Takes current task list → returns ranked order + reasoning |
| `POST /api/ai/schedule` | Takes tasks + work hours + calendar → returns a generated daily plan |
| `POST /api/ai/coach` | Takes recent activity → returns a short, specific piece of advice |
| `POST /api/ai/weekly-review` | Takes the week's data → returns achievements/missed goals/recommendations |
| `GET/POST/PUT/DELETE /api/tasks` | Standard task CRUD (also doable directly via Firestore SDK client-side — decision below) |

**Decision point for later:** simple CRUD (tasks, habits) can talk to Firestore directly from the client via the Firebase SDK — no need to proxy that through Express. Express is reserved for anything touching the Gemini key or needing server-side validation/aggregation (AI endpoints, analytics rollups). This keeps the backend small and avoids duplicating Firestore logic in two places.

---

## 7. AI Architecture Detail

- **Model:** `gemini-2.0-flash` for breakdown/prioritization/scheduling (low latency, structured JSON output). Weekly review can use a higher-reasoning model call since it's infrequent and not latency-sensitive.
- **Structured output:** every AI route requests JSON-only responses against a strict schema (enforced via prompt instructions + response validation in `geminiService.ts`), so the frontend never parses free text.
- **Fallback behavior:** if Gemini is unreachable or returns malformed output, `priorityEngine.ts` on the client provides a basic deterministic ranking (deadline + manually set priority) so the app never fully breaks.
- **Context-aware reminders:** built by combining the user's calendar free/busy blocks + task list + a short prompt template, not by the AI freely improvising — this keeps responses grounded and fast.

---

## 8. Routing Structure (frontend)

```
/                      → Landing
/signin /signup /forgot-password
/dashboard             (protected)
/tasks  /tasks/:id      (protected)
/calendar               (protected)
/focus                   (protected)
/analytics                (protected)
/settings                  (protected)
```

Protected routes wrapped in a single `<RequireAuth>` guard reading from `AuthContext`.

---

## 9. State Management Strategy

- **Auth state:** `AuthContext` (Firebase `onAuthStateChanged` listener)
- **Tasks:** `TaskContext` + `useTasks` hook, backed by a live Firestore `onSnapshot` listener — no manual refetching, no Redux needed at this scale
- **Theme:** `ThemeContext` (light/dark, persisted to Firestore user prefs, not localStorage, since artifacts/sandboxes can't rely on browser storage and we want it synced across devices anyway)
- **AI suggestions:** local component state + `useAISuggestions`, since these are request/response, not persistent realtime data

---

## 10. Environment Variables

**Frontend (`.env`)**
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=          # points to the Express backend
```

**Backend (`.env`)**
```
GEMINI_API_KEY=
FIREBASE_SERVICE_ACCOUNT_JSON=
PORT=
CLIENT_ORIGIN=
```

---

## 11. Build Roadmap (the order we'll actually build in)

1. **Scaffold** — Vite + React + TS + Tailwind + Framer Motion, folder structure above, routing skeleton, theme system
2. **Landing page** — Hero, features, how-it-works, testimonials, FAQ, CTA, footer
3. **Auth** — Firebase setup, Google + email login, protected routes
4. **Dashboard shell + Task CRUD** — quick add, task list, subtasks, labels, due dates
5. **AI task breakdown** — Express + Gemini integration, first real AI feature end-to-end
6. **Smart prioritization + scheduling**
7. **Calendar (month/week, drag-and-drop)**
8. **Focus mode** (Pomodoro + placeholders)
9. **Analytics + weekly review**
10. **Settings, notifications, polish, accessibility pass**
11. **README, env setup guide, deployment guide**

Each step ships working, verified code before the next starts — matching the incremental process from your brief.

---

### Open decisions worth confirming before Step 1
- Should task CRUD go straight through the Firestore client SDK (faster, simpler) or always through Express (more consistent, easier to add validation later)? Plan above defaults to **client SDK for CRUD, Express only for AI** — flag now if you'd rather centralize everything through the backend.
