import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "./components/layout/RequireAuth";

// Each page is a placeholder for now — this routing skeleton is what
// every later step (landing page, dashboard, etc.) will fill in.
import LandingPage from "./pages/landing/LandingPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import TasksPage from "./pages/tasks/TasksPage";
import CalendarPage from "./pages/calendar/CalendarPage";
import FocusModePage from "./pages/focus/FocusModePage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import SettingsPage from "./pages/settings/SettingsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/tasks" element={<RequireAuth><TasksPage /></RequireAuth>} />
      <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
      <Route path="/focus" element={<RequireAuth><FocusModePage /></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
    </Routes>
  );
}
