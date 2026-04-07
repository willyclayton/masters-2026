"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { LiveLeaderboard, LiveOddsUpdate, LiveData } from "./types";

const POLL_INTERVAL_MS = 30_000; // 30 seconds
const TOURNAMENT_START = "2026-04-09"; // Thursday
const TOURNAMENT_END = "2026-04-13"; // day after Sunday

// Active polling window: 5:00 AM – 10:00 PM Eastern
const ACTIVE_HOUR_START = 5;
const ACTIVE_HOUR_END = 22;

/**
 * Checks if we should be actively polling.
 * True during tournament week between 5 AM and 10 PM Eastern.
 */
function isWithinActiveWindow(): boolean {
  const now = new Date();

  // Convert to Eastern Time
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const hour = et.getHours();
  if (hour < ACTIVE_HOUR_START || hour >= ACTIVE_HOUR_END) return false;

  // Check if we're within tournament dates
  const dateStr = et.toISOString().slice(0, 10);
  return dateStr >= TOURNAMENT_START && dateStr < TOURNAMENT_END;
}

async function fetchScores(): Promise<LiveLeaderboard | null> {
  try {
    const res = await fetch("/api/live/scores", { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchOdds(): Promise<LiveOddsUpdate | null> {
  try {
    const res = await fetch("/api/live/odds", { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useLiveData(): LiveData & { forceRefresh: () => void } {
  const [leaderboard, setLeaderboard] = useState<LiveLeaderboard | null>(null);
  const [odds, setOdds] = useState<LiveOddsUpdate | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  const fetchAll = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const [scores, liveOdds] = await Promise.all([
        fetchScores(),
        fetchOdds(),
      ]);

      if (!isMounted.current) return;

      if (scores) setLeaderboard(scores);
      if (liveOdds) setOdds(liveOdds);
      setLastFetch(new Date().toISOString());
      setError(null);

      // We're "live" if we got scores back and the round is in progress
      setIsLive(
        scores?.roundStatus === "in_progress" ||
          scores?.roundStatus === "complete" ||
          false
      );
    } catch (e) {
      if (isMounted.current) {
        setError(e instanceof Error ? e.message : "Fetch failed");
      }
    }
  }, []);

  const startPolling = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isWithinActiveWindow()) {
      // Outside active window — do a single fetch for latest state,
      // then check again in 5 minutes if the window has opened
      fetchAll();
      intervalRef.current = setInterval(() => {
        if (isWithinActiveWindow()) {
          // Window opened — switch to 30s polling
          if (intervalRef.current) clearInterval(intervalRef.current);
          fetchAll();
          intervalRef.current = setInterval(fetchAll, POLL_INTERVAL_MS);
        }
      }, 300_000); // check every 5 min
      return;
    }

    // Within active window — poll every 30s
    fetchAll();
    intervalRef.current = setInterval(() => {
      if (!isWithinActiveWindow()) {
        // Window closed — slow down
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          if (isWithinActiveWindow()) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            fetchAll();
            intervalRef.current = setInterval(fetchAll, POLL_INTERVAL_MS);
          }
        }, 300_000);
        return;
      }
      fetchAll();
    }, POLL_INTERVAL_MS);
  }, [fetchAll]);

  useEffect(() => {
    isMounted.current = true;
    startPolling();

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startPolling]);

  return {
    leaderboard,
    odds,
    isLive,
    lastFetch,
    error,
    forceRefresh: fetchAll,
  };
}
