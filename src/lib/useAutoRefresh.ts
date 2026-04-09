// ═══════════════════════════════════════════════════════════════
// useAutoRefresh — Polling hook with manual refresh + indicator
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseAutoRefreshOptions {
  /** Fetch function — called on mount and every interval */
  fetchFn: () => Promise<void>;
  /** Refresh interval in ms (default: 30s) */
  intervalMs?: number;
  /** Whether to enable auto-refresh (default: true) */
  enabled?: boolean;
}

interface UseAutoRefreshReturn {
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Whether a fetch is in progress */
  isRefreshing: boolean;
  /** Timestamp of last successful refresh */
  lastRefreshed: Date | null;
  /** Time until next auto-refresh (ms) */
  nextRefreshIn: number;
}

export function useAutoRefresh({
  fetchFn,
  intervalMs = 30_000,
  enabled = true,
}: UseAutoRefreshOptions): UseAutoRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(intervalMs);
  const fetchFnRef = useRef(fetchFn);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep fetchFn ref fresh
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchFnRef.current();
      setLastRefreshed(new Date());
      setNextRefreshIn(intervalMs);
    } finally {
      setIsRefreshing(false);
    }
  }, [intervalMs]);

  // Initial fetch + interval
  useEffect(() => {
    if (!enabled) return;

    // Fetch immediately on mount
    refresh();

    intervalRef.current = setInterval(refresh, intervalMs);

    // Countdown timer (updates every second for the indicator)
    countdownRef.current = setInterval(() => {
      setNextRefreshIn((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [enabled, intervalMs, refresh]);

  return { refresh, isRefreshing, lastRefreshed, nextRefreshIn };
}
