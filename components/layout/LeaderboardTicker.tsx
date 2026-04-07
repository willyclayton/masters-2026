"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLiveDataContext } from "@/lib/live-data-context";
import type { LivePlayerScore } from "@/lib/types";
import { ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;
const AUTO_FAN_MS = 8000;
const STAGGER_MS = 150;

type CellState = "idle" | "dropping-out" | "dropping-in";

interface AnimatedCell {
  player: LivePlayerScore;
  state: CellState;
  delay: number;
}

export function LeaderboardTicker() {
  const { leaderboard } = useLiveDataContext();
  const [page, setPage] = useState(0);
  const [cells, setCells] = useState<AnimatedCell[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPageRef = useRef(0);

  const players = leaderboard?.players || [];
  const leader = players[0];
  const field = players.slice(1);
  const totalPages = Math.max(1, Math.ceil(field.length / PAGE_SIZE));

  const getCells = useCallback(
    (p: number, state: CellState): AnimatedCell[] => {
      const start = p * PAGE_SIZE;
      return field.slice(start, start + PAGE_SIZE).map((player, i) => ({
        player,
        state,
        delay: i * STAGGER_MS,
      }));
    },
    [field]
  );

  useEffect(() => {
    if (field.length > 0 && cells.length === 0) {
      setCells(getCells(0, "idle"));
    }
  }, [field.length, cells.length, getCells]);

  const animateToPage = useCallback(
    (nextPage: number) => {
      if (isAnimating || field.length === 0) return;
      setIsAnimating(true);

      setCells((prev) =>
        prev.map((c, i) => ({ ...c, state: "dropping-out" as CellState, delay: i * STAGGER_MS }))
      );

      const dropOutDuration = (PAGE_SIZE - 1) * STAGGER_MS + 250;
      setTimeout(() => {
        const newCells = getCells(nextPage, "dropping-in");
        setCells(newCells);
        setPage(nextPage);

        const dropInDuration = (PAGE_SIZE - 1) * STAGGER_MS + 400;
        setTimeout(() => {
          setCells((prev) => prev.map((c) => ({ ...c, state: "idle" as CellState })));
          setIsAnimating(false);
        }, dropInDuration);
      }, dropOutDuration * 0.6);
    },
    [isAnimating, field.length, getCells]
  );

  const nextPage = useCallback(() => {
    const next = (page + 1) % totalPages;
    animateToPage(next);
  }, [page, totalPages, animateToPage]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(nextPage, AUTO_FAN_MS);
    return () => clearInterval(timer);
  }, [nextPage, totalPages]);

  useEffect(() => {
    setPage(0);
    setCells(getCells(0, "idle"));
    setIsAnimating(false);
  }, [leaderboard?.lastUpdated, getCells]);

  if (!leader) return null;

  const round = leaderboard?.currentRound || 1;
  const roundLabel = `R${round}`;
  const inProgress = leaderboard?.roundStatus === "in_progress";

  return (
    <div className="w-full border-b-2 border-[#004D3C] bg-[#004D3C]">
      {/* Gravity drop keyframes */}
      <style>{`
        @keyframes grav-out {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(36px); opacity: 0; }
        }
        @keyframes grav-in {
          0% { transform: translateY(-50px); opacity: 0; }
          70% { transform: translateY(2px); opacity: 1; }
          85% { transform: translateY(-1px); }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="mx-auto flex max-w-7xl items-stretch">
        {/* Live badge */}
        <div className="flex shrink-0 items-center gap-1.5 bg-[#003D2E] px-3 sm:px-4">
          {inProgress && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-300" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-wide text-white/80">
            {roundLabel}
          </span>
        </div>

        {/* Pinned leader — tile style */}
        <div className="flex shrink-0 items-center gap-1.5 border-r border-white/10 px-3 py-1.5 sm:px-4">
          <span
            className="scoreboard-tile inline-flex items-center justify-center min-w-[22px] h-[20px] text-[10px] font-extrabold text-[#C0392B] rounded-[2px] px-1"
            style={{ transform: "rotate(-0.5deg)" }}
          >
            1
          </span>
          <span className="text-xs font-bold text-white sm:text-sm">
            {lastName(leader.name)}
          </span>
          <span
            className="scoreboard-tile inline-flex items-center justify-center min-w-[28px] h-[20px] text-[11px] font-extrabold text-[#C0392B] rounded-[2px] px-1"
            style={{ transform: "rotate(0.5deg)" }}
          >
            {formatScore(leader.totalScore)}
          </span>
          {leader.thru && leader.thru !== "-" && (
            <span className="hidden text-[10px] text-white/40 sm:inline">
              {leader.thru === "F"
                ? roundScore(leader, round)
                : `thru ${leader.thru}`}
            </span>
          )}
        </div>

        {/* Animated field cells */}
        <div className="flex min-w-0 flex-1 items-stretch overflow-hidden">
          {cells.map((cell, i) => {
            const animStyle: React.CSSProperties =
              cell.state === "dropping-out"
                ? {
                    animation: `grav-out 250ms ease ${cell.delay}ms forwards`,
                  }
                : cell.state === "dropping-in"
                  ? {
                      opacity: 0,
                      animation: `grav-in 400ms ease ${cell.delay + 130}ms forwards`,
                    }
                  : {};

            return (
              <div
                key={`${cell.player.name}-${cell.state}-${page}`}
                className={`flex shrink-0 items-center gap-1 px-2 py-1.5 sm:gap-1.5 sm:px-3 ${
                  i < cells.length - 1
                    ? "border-r border-white/10"
                    : ""
                }`}
                style={animStyle}
              >
                <span className="text-[10px] font-bold text-white/40">
                  {cell.player.positionNum}
                </span>
                <span className="text-[11px] font-semibold text-white/70 sm:text-xs">
                  {lastName(cell.player.name)}
                </span>
                <span
                  className="scoreboard-tile inline-flex items-center justify-center min-w-[24px] h-[18px] text-[10px] font-extrabold text-[#C0392B] rounded-[1px] px-0.5"
                  style={{ transform: `rotate(${[-0.5, 0.3, -0.8, 0.6, -0.3][i % 5]}deg)` }}
                >
                  {formatScore(cell.player.totalScore)}
                </span>
                {cell.player.thru &&
                  cell.player.thru !== "-" &&
                  cell.player.thru !== "F" && (
                    <span className="hidden text-[10px] text-white/30 lg:inline">
                      thru {cell.player.thru}
                    </span>
                  )}
                {cell.player.thru === "F" && (
                  <span className="hidden text-[10px] text-white/30 lg:inline">
                    {roundScore(cell.player, round)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Fan navigation */}
        {totalPages > 1 && (
          <div className="flex shrink-0 items-center gap-1 px-1.5 sm:px-2">
            <span className="hidden text-[9px] font-semibold text-white/30 sm:inline">
              {page * PAGE_SIZE + 2}-
              {Math.min(page * PAGE_SIZE + PAGE_SIZE + 1, players.length)}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-1 rounded-full transition-colors ${
                    i === page
                      ? "bg-[#C8A951]"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextPage}
              className="hidden h-6 w-6 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white hover:bg-white/10 sm:flex"
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
