export interface AnalyticsSnapshot {
  userId: string;
  weekId: string;
  completionRate: number;
  focusMinutes: number;
  missedDeadlines: number;
  strengths: string[];
  weaknesses: string[];
}
