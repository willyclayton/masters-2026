"use client";

import { useMemo } from "react";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Radio,
  TrendingUp,
} from "lucide-react";

import betsData from "@/data/bets.json";
import predictionsData from "@/data/predictions.json";
import playersData from "@/data/players-2026.json";

import type {
  TrackedBet,
  TrackedBetLeg,
  TrackedBetsFile,
  PredictionsData,
  Player,
  BetResult,
  LegResult,
  BetMarket,
} from "@/lib/types";
import {
  buildEvaluators,
  computeCutLine,
  evaluateBet,
  summarizeBets,
} from "@/lib/bet-tracking";
import { useLiveData } from "@/lib/use-live-data";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { MarketBadge } from "@/components/ui/MarketBadge";

// ── Helpers ─────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function probColor(prob: number, status: BetResult["status"]): string {
  if (status === "won") return "bg-masters-green";
  if (status === "lost") return "bg-gray-300";
  if (prob >= 40) return "bg-masters-green";
  if (prob >= 15) return "bg-masters-gold";
  return "bg-masters-red";
}

function legDotColor(status: LegResult["status"], prob: number): string {
  if (status === "won") return "bg-masters-green";
  if (status === "lost") return "bg-masters-red";
  if (prob >= 40) return "bg-masters-green";
  if (prob >= 15) return "bg-masters-gold";
  return "bg-gray-400";
}

function StatusPill({ status }: { status: BetResult["status"] }) {
  if (status === "won") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-masters-green-light px-2 py-0.5 text-[10px] font-semibold uppercase text-masters-green-dark">
        <CheckCircle2 className="h-3 w-3" /> Won
      </span>
    );
  }
  if (status === "lost") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
        <XCircle className="h-3 w-3" /> Lost
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-masters-gold-light px-2 py-0.5 text-[10px] font-semibold uppercase text-masters-gold">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-masters-gold" />
      Live
    </span>
  );
}

function LegMarketBadge({ leg }: { leg: TrackedBetLeg }) {
  // Use built-in MarketBadge for known markets; render a fallback for the
  // two extras the edge-finder doesn't model.
  if (leg.market === "topDebutant") {
    return (
      <span className="inline-flex items-center rounded-full border border-purple-300 bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
        Debutant
      </span>
    );
  }
  if (leg.market === "topFormer") {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-400 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
        Top Former
      </span>
    );
  }
  return <MarketBadge market={leg.market as BetMarket} />;
}

// ── Components ──────────────────────────────────────────────────

interface LegRowProps {
  leg: TrackedBetLeg;
  result: LegResult;
}

function LegRow({ leg, result }: LegRowProps) {
  const lostStyle = result.status === "lost" ? "opacity-60" : "";
  return (
    <div
      className={`flex items-center gap-3 rounded-md px-2 py-2 ${lostStyle}`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${legDotColor(result.status, result.prob)}`}
      />
      <InitialsAvatar initials={getInitials(leg.player)} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`truncate text-sm font-semibold text-[var(--text-primary)] ${
              result.status === "lost" ? "line-through" : ""
            }`}
          >
            {leg.player}
          </span>
          <LegMarketBadge leg={leg} />
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <span className="font-mono">{leg.americanOdds}</span>
          <span>•</span>
          <span>{result.detail}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        {result.status === "won" ? (
          <CheckCircle2 className="h-4 w-4 text-masters-green" />
        ) : result.status === "lost" ? (
          <XCircle className="h-4 w-4 text-masters-red" />
        ) : (
          <span className="text-sm font-bold text-[var(--text-primary)]">
            {result.prob.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

interface BetCardProps {
  bet: TrackedBet;
  result: BetResult;
}

function BetCard({ bet, result }: BetCardProps) {
  const isParlay = bet.type === "Parlay";
  const barColor = probColor(result.overallProb, result.status);

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
            #{bet.id}
          </span>
          <span className="rounded-md bg-[var(--bg-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            {bet.type}
          </span>
          {isParlay && (
            <span className="text-[11px] text-[var(--text-muted)]">
              {bet.legs.length} legs
            </span>
          )}
          <StatusPill status={result.status} />
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-bold text-masters-green-dark">
            {bet.combinedAmericanOdds}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            ${bet.stake} → <span className="font-semibold text-[var(--text-primary)]">${bet.potentialPayout}</span>
          </div>
        </div>
      </div>

      {/* Likelihood bar */}
      <div className="mb-3">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {result.status === "won"
              ? "Hit"
              : result.status === "lost"
                ? "Missed"
                : "Live Likelihood"}
          </span>
          <span className="font-heading text-lg font-bold text-[var(--text-primary)]">
            {result.overallProb < 1 && result.status === "live"
              ? "<1"
              : result.overallProb.toFixed(result.overallProb < 10 ? 1 : 0)}
            %
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-primary)]">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.max(2, Math.min(100, result.overallProb))}%` }}
          />
        </div>
        {isParlay && (
          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
            {result.legsWon > 0 && (
              <span className="text-masters-green-dark">
                ✓ {result.legsWon} won
              </span>
            )}
            {result.legsLive > 0 && (
              <span>{result.legsLive} live</span>
            )}
            {result.legsLost > 0 && (
              <span className="text-masters-red">
                ✗ {result.legsLost} lost
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legs — sorted by likelihood desc (won → live → lost) */}
      <div className="divide-y divide-[var(--border-color)] border-t border-[var(--border-color)] pt-1">
        {bet.legs
          .map((leg, i) => ({ leg, result: result.legResults[i], originalIdx: i }))
          .sort((a, b) => {
            const order = { won: 0, live: 1, lost: 2 } as const;
            const so = order[a.result.status] - order[b.result.status];
            if (so !== 0) return so;
            return b.result.prob - a.result.prob;
          })
          .map(({ leg, result: legResult, originalIdx }) => (
            <LegRow key={`${bet.id}-${originalIdx}`} leg={leg} result={legResult} />
          ))}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────

export function BetsTracking() {
  const { leaderboard, isLive } = useLiveData();
  const file = betsData as unknown as TrackedBetsFile;

  const { predMap, natProbs } = useMemo(
    () =>
      buildEvaluators(
        predictionsData as unknown as PredictionsData,
        playersData as unknown as Player[]
      ),
    []
  );

  const cut = useMemo(() => computeCutLine(leaderboard), [leaderboard]);

  const evaluations = useMemo(() => {
    return file.bets.map((bet) => ({
      bet,
      result: evaluateBet(bet, predMap, natProbs, leaderboard, cut),
    }));
  }, [file.bets, predMap, natProbs, leaderboard, cut]);

  // Sort: live (by prob desc) → won → lost
  const sorted = useMemo(() => {
    const order: Record<BetResult["status"], number> = { live: 0, won: 1, lost: 2 };
    return [...evaluations].sort((a, b) => {
      const so = order[a.result.status] - order[b.result.status];
      if (so !== 0) return so;
      return b.result.overallProb - a.result.overallProb;
    });
  }, [evaluations]);

  const summary = useMemo(
    () => summarizeBets(file.bets, evaluations.map((e) => e.result)),
    [file.bets, evaluations]
  );

  const preTournament =
    !leaderboard || leaderboard.roundStatus === "not_started";

  return (
    <div className="space-y-6">
      {/* Header / Summary */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-masters-green" />
          <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">
            Bets Tracking
          </h2>
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-masters-green-light px-2 py-0.5 text-[10px] font-semibold uppercase text-masters-green-dark">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-masters-green" />
              Live
            </span>
          )}
        </div>

        {/* 3-column stat grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg bg-masters-green-light p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-masters-green-dark">
              Total Staked
            </div>
            <div className="mt-1 font-heading text-xl font-bold text-masters-green-dark">
              ${summary.totalStaked.toFixed(0)}
            </div>
            <div className="text-[10px] text-masters-green-dark/70">
              across {file.bets.length} bets
            </div>
          </div>
          <div className="rounded-lg bg-masters-gold-light p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-masters-gold">
              Expected Return
            </div>
            <div className="mt-1 font-heading text-xl font-bold text-masters-gold">
              ${summary.liveExpectedReturn.toFixed(0)}
            </div>
            <div className="text-[10px] text-masters-gold/80">
              of ${summary.totalPotential.toFixed(0)} potential
            </div>
          </div>
          <div className="rounded-lg bg-gray-100 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Status
            </div>
            <div className="mt-1 font-heading text-xl font-bold text-[var(--text-primary)]">
              {summary.liveCount}
              <span className="text-xs font-normal text-[var(--text-muted)]"> live</span>
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              {summary.wonCount} won • {summary.lostCount} lost
            </div>
          </div>
        </div>
      </div>

      {/* Pre-tournament banner */}
      {preTournament && (
        <div className="flex items-start gap-2 rounded-lg border border-masters-green/20 bg-masters-green-light/40 p-3">
          <Radio className="mt-0.5 h-4 w-4 shrink-0 text-masters-green" />
          <div className="text-xs text-masters-green-dark">
            <span className="font-semibold">Pre-tournament view.</span>{" "}
            Showing AI hit-likelihood for each bet. Live progress will update
            once Round 1 begins.
          </div>
        </div>
      )}

      {/* Cut line banner */}
      {cut && !preTournament && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-xs">
          <span className="text-[var(--text-muted)]">
            Masters cut (top 50 + ties after 36 holes)
          </span>
          <span className="font-mono font-semibold text-[var(--text-primary)]">
            {cut.line === 0 ? "E" : cut.line > 0 ? `+${cut.line}` : cut.line}{" "}
            <span className="ml-1 text-[10px] font-normal text-[var(--text-muted)]">
              {cut.final ? "official" : "projected"}
            </span>
          </span>
        </div>
      )}

      {/* Bet cards */}
      <div className="space-y-3">
        {sorted.map(({ bet, result }) => (
          <BetCard key={bet.id} bet={bet} result={result} />
        ))}
      </div>

      {/* Footnote */}
      <div className="rounded-lg bg-[var(--bg-primary)] p-3 text-center">
        <p className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)]">
          <TrendingUp className="h-3 w-3" />
          Likelihoods blend AI consensus probabilities with live tournament
          state. Parlay likelihood = product of leg probabilities.
        </p>
      </div>
    </div>
  );
}
