"use client";

import { useLiveDataContext } from "@/lib/live-data-context";
import { RefreshCw } from "lucide-react";

export function LiveStatusBar() {
  const {
    leaderboard,
    isLive,
    lastFetch,
    error,
    quotaRemaining,
    oddsSource,
    forceRefresh,
  } = useLiveDataContext();

  const lastFetchTime = lastFetch
    ? new Date(lastFetch).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "America/New_York",
      })
    : null;

  const quotaColor =
    quotaRemaining === null
      ? "text-[var(--text-muted)]"
      : quotaRemaining < 20
        ? "text-masters-red"
        : quotaRemaining < 50
          ? "text-yellow-600"
          : "text-[var(--text-muted)]";

  // Pre-tournament bar
  if (!isLive && !leaderboard) {
    return (
      <div className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-yellow-400" />
            <span className="truncate text-[10px] font-medium text-[var(--text-muted)] sm:text-xs">
              Pre-Tournament — Live Apr 9
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {quotaRemaining !== null && (
              <span className={`hidden text-[10px] font-medium sm:inline ${quotaColor}`}>
                {quotaRemaining}/500
              </span>
            )}
            <button
              onClick={forceRefresh}
              className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-white hover:text-masters-green"
              title="Refresh now"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Live tournament bar
  const top3 = leaderboard?.players.slice(0, 3) || [];

  return (
    <div className="border-b border-green-200 bg-masters-green-light">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-masters-green" />
            <span className="text-xs font-bold text-masters-green">LIVE</span>
          </div>

          {leaderboard && (
            <span className="text-xs text-masters-green-dark">
              R{leaderboard.currentRound}{" "}
              {leaderboard.roundStatus === "in_progress"
                ? "In Progress"
                : leaderboard.roundStatus === "complete"
                  ? "Complete"
                  : "Starting Soon"}
            </span>
          )}

          {/* Mini leaderboard */}
          {top3.length > 0 && (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-[10px] text-masters-green/60">|</span>
              {top3.map((p, i) => (
                <span
                  key={p.name}
                  className="text-[11px] text-masters-green-dark"
                >
                  <span className="font-bold">
                    {i + 1}. {p.name.split(" ").pop()}
                  </span>{" "}
                  <span className="tabular-nums">
                    {p.totalScore > 0 ? "+" : ""}
                    {p.totalScore === 0 ? "E" : p.totalScore}
                  </span>
                  {p.thru !== "F" && p.thru !== "-" && (
                    <span className="text-masters-green/60"> ({p.thru})</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {quotaRemaining !== null && (
            <span className={`hidden text-[10px] font-medium sm:inline ${quotaColor}`}>
              {quotaRemaining < 20
                ? `Quota low (${quotaRemaining})`
                : `${quotaRemaining} credits`}
            </span>
          )}
          <span className="hidden text-[10px] text-masters-green/70 sm:inline">
            {lastFetchTime && <>{lastFetchTime} ET</>}
          </span>
          <button
            onClick={forceRefresh}
            className="rounded p-1 text-masters-green/60 transition-colors hover:bg-white/50 hover:text-masters-green"
            title="Refresh now"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
