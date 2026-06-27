import { useState, useCallback } from "react";
import { aiApi } from "../api/aiApi";
import type { BreakdownResponse } from "../types/ai";

// Wraps the AI breakdown call with loading/error state so components
// (e.g. QuickAddTask) don't manage that boilerplate themselves.
export function useAISuggestions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBreakdown = useCallback(async (title: string): Promise<BreakdownResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      return await aiApi.breakdown(title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getBreakdown, loading, error };
}
