"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { LiveLeaderboard, LiveOddsUpdate, LiveData } from "./types";

// ── Polling intervals ───────────────────────────────────────────
//
// Scores (ESPN): Free, unlimited
//   - During round: every 30s
//   - Between rounds / pre-tournament: every 2 min
//   - Outside tournament dates: every 5 min (just checking)
//
// Odds (The Odds API): 500 credits/month free tier
//   - Only fetched when a round is actually in progress
//   - Server caches for 15 min, so even at 30s client polls
//     we only burn ~1 credit per 15 min
//   - During round: piggybacks on score polls (server handles caching)
//   - Between rounds / not in progress: skip odds entirely
//
// Budget: 4 rounds × ~6 hrs avg = 24 hrs of play
//   24 hrs × 4 calls/hr (15-min cache) = ~96 credits. Well within 500.
// ─────────────────────────────────────────────────────────────────

const SCORES_FAST_MS = 30_000;    // 30s during active round
const SCORES_SLOW_MS = 120_000;   // 2 min between rounds
const SCORES_IDLE_MS = 300_000;   // 5 min outside tournament

const TOURNAMENT_START = "2026-04-09";
const TOURNAMENT_END = "2026-04-13";

function getTournamentPhase(): "outside" | "tournament" {
  const now = new Date();
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const dateStr = et.toISOString().slice(0, 10);
  if (dateStr >= TOURNAMENT_START && dateStr < TOURNAMENT_END) return "tournament";
  return "outside";
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
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [oddsSource, setOddsSource] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);
  const roundInProgressRef = useRef(false);

  const fetchAll = useCallback(async (forceOdds = false) => {
    if (!isMounted.current) return;

    try {
      // Always fetch scores (free)
      const scores = await fetchScores();

      if (!isMounted.current) return;
      if (scores) {
        setLeaderboard(scores);
        roundInProgressRef.current = scores.roundStatus === "in_progress";
      }

      const roundActive = scores?.roundStatus === "in_progress";
      setIsLive(roundActive || scores?.roundStatus === "complete" || false);

      // Only fetch odds when round is in progress OR forced
      // The server-side 15-min cache protects the quota regardless
      if (roundActive || forceOdds) {
        const liveOdds = await fetchOdds();
        if (!isMounted.current) return;
        if (liveOdds) {
          setOdds(liveOdds);
          if (liveOdds.quotaRemaining !== null && liveOdds.quotaRemaining !== undefined) {
            setQuotaRemaining(liveOdds.quotaRemaining);
          }
          setOddsSource(
            liveOdds.cached
              ? `${liveOdds.source} (cached)`
              : liveOdds.source
          );
        }
      }

      setLastFetch(new Date().toISOString());
      setError(null);
    } catch (e) {
      if (isMounted.current) {
        setError(e instanceof Error ? e.message : "Fetch failed");
      }
    }
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const phase = getTournamentPhase();

    if (phase === "outside") {
      // Outside tournament — single fetch + slow check
      fetchAll(true); // force odds on initial load for pre-tournament display
      intervalRef.current = setInterval(() => {
        const p = getTournamentPhase();
        if (p === "tournament") {
          // Tournament started — restart with faster polling
          if (intervalRef.current) clearInterval(intervalRef.current);
          startPolling();
        }
      }, SCORES_IDLE_MS);
      return;
    }

    // During tournament week — adaptive polling
    fetchAll(true); // initial fetch with odds

    intervalRef.current = setInterval(() => {
      const p = getTournamentPhase();
      if (p === "outside") {
        // Tournament over
        if (intervalRef.current) clearInterval(intervalRef.current);
        startPolling();
        return;
      }
      // fetchAll will check roundInProgress internally to decide on odds
      fetchAll();
    }, roundInProgressRef.current ? SCORES_FAST_MS : SCORES_SLOW_MS);
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
    quotaRemaining,
    oddsSource,
    forceRefresh: () => fetchAll(true),
  };
}
