"use client";

import { useState, useEffect, useCallback } from "react";
import { useLiveDataContext } from "@/lib/live-data-context";
import type { LivePlayerScore } from "@/lib/types";
import { ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;
const AUTO_FAN_MS = 8000; // auto-fan every 8 seconds

export function LeaderboardTicker() {
  const { leaderboard, isLive } = useLiveDataContext();
  const [page, setPage] = useState(0);

  const players = leaderboard?.players || [];
  const leader = players[0];
  const field = players.slice(1); // everyone except the leader
  const totalPages = Math.max(1, Math.ceil(field.length / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const visibleField = field.slice(pageStart, pageEnd);

  const nextPage = useCallback(() => {
    setPage((p) => (p + 1) % totalPages);
  }, [totalPages]);

  // Auto-fan through pages
  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(nextPage, AUTO_FAN_MS);
    return () => clearInterval(timer);
  }, [nextPage, totalPages]);

  // Reset page when leaderboard updates
  useEffect(() => {
    setPage(0);
  }, [leaderboard?.lastUpdated]);

  // Don't render if no data
  if (!leader) return null;

  const round = leaderboard?.currentRound || 1;
  const roundLabel = `R${round}`;
  const inProgress = leaderboard?.roundStatus === "in_progress";

  return (
    <div className="w-full border-b-2 border-masters-green bg-white">
      <div className="mx-auto flex max-w-7xl items-stretch">
        {/* Live badge */}
        <div className="flex shrink-0 items-center gap-1.5 bg-masters-green px-3 sm:px-4">
          {inProgress && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-300" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-wide text-white">
            {roundLabel}
          </span>
        </div>

        {/* Pinned leader */}
        <div className="flex shrink-0 items-center gap-1.5 border-r-2 border-masters-green bg-masters-green-light px-3 py-1.5 sm:px-4">
          <span className="text-[10px] font-extrabold text-masters-gold sm:text-xs">
            1
          </span>
          <span className="text-xs font-bold text-[var(--text-primary)] sm:text-sm">
            {lastName(leader.name)}
          </span>
          <span className="text-sm font-extrabold text-masters-red sm:text-base">
            {formatScore(leader.totalScore)}
          </span>
          {leader.thru && leader.thru !== "-" && (
            <span className="hidden text-[10px] text-[var(--text-muted)] sm:inline">
              {leader.thru === "F"
                ? roundScore(leader, round)
                : `thru ${leader.thru}`}
            </span>
          )}
        </div>

        {/* Fanning field cells */}
        <div className="flex min-w-0 flex-1 items-stretch overflow-hidden">
          {visibleField.map((p, i) => (
            <div
              key={p.name}
              className={`flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 sm:px-3 ${
                i < visibleField.length - 1
                  ? "border-r border-[var(--border-color)]"
                  : ""
              }`}
            >
              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                {p.positionNum}
              </span>
              <span className="hidden text-xs font-semibold text-[var(--text-secondary)] sm:inline">
                {lastName(p.name)}
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)] sm:hidden">
                {shortName(p.name)}
              </span>
              <span className="text-xs font-extrabold text-masters-red">
                {formatScore(p.totalScore)}
              </span>
              {p.thru && p.thru !== "-" && p.thru !== "F" && (
                <span className="hidden text-[10px] text-[var(--text-muted)] lg:inline">
                  thru {p.thru}
                </span>
              )}
              {p.thru === "F" && (
                <span className="hidden text-[10px] text-[var(--text-muted)] lg:inline">
                  {roundScore(p, round)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Fan navigation */}
        {totalPages > 1 && (
          <div className="flex shrink-0 items-center gap-1 px-2">
            <span className="text-[9px] font-semibold text-[var(--text-muted)]">
              {pageStart + 2}-{Math.min(pageStart + PAGE_SIZE + 1, players.length)}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-1 rounded-full transition-colors ${
                    i === page ? "bg-masters-green" : "bg-[var(--border-color)]"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextPage}
              className="flex h-6 w-6 items-center justify-center rounded-full text-masters-green transition-colors hover:bg-masters-green-light"
              aria-label="Next group"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function lastName(fullName: string): string {
  const parts = fullName.split(" ");
  return parts[parts.length - 1];
}

function shortName(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length < 2) return fullName;
  return parts[0][0] + ". " + parts[parts.length - 1];
}

function formatScore(score: number): string {
  if (score === 0) return "E";
  return score > 0 ? `+${score}` : String(score);
}

function roundScore(player: LivePlayerScore, round: number): string {
  const scores = [player.round1, player.round2, player.round3, player.round4];
  const s = scores[round - 1];
  if (s === null) return "";
  return `R${round}: ${s}`;
}
