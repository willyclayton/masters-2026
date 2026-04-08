"use client";

import { useState, useMemo } from "react";
import type { BettingEdgeResult, Player } from "@/lib/types";
import { generateMoneyBets } from "@/lib/edge-calculations";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Lock,
  Flame,
  Rocket,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";

interface MakeMoneyBetsProps {
  edges: BettingEdgeResult[];
  players: Player[];
}

type MoneyTab = "locks" | "value" | "longshots";

export function MakeMoneyBets({ edges, players }: MakeMoneyBetsProps) {
  const [tab, setTab] = useState<MoneyTab>("locks");
  const [expandedBet, setExpandedBet] = useState<string | null>(null);

  const { locks, valuePlays, longshots, totalDailyEV, topParlayEV } = useMemo(
    () => generateMoneyBets(edges, players),
    [edges, players]
  );

  const toggleExpand = (key: string) =>
    setExpandedBet((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-6">
      {/* Money Header */}
      <div className="overflow-hidden rounded-xl border-2 border-masters-gold bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-5 text-white">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-masters-gold">
            <DollarSign className="h-5 w-5 text-[#1a1a2e]" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold">
              Let&apos;s Make Money
            </h3>
            <p className="text-[10px] text-white/60">
              AI-curated bets with the best risk/reward
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
            <div className="text-lg font-bold text-masters-gold tabular-nums">
              {locks.length}
            </div>
            <div className="text-[10px] text-white/60">Locks</div>
          </div>
          <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
            <div className="text-lg font-bold text-green-400 tabular-nums">
              +${totalDailyEV.toFixed(0)}
            </div>
            <div className="text-[10px] text-white/60">Total EV</div>
          </div>
          <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
            <div className="text-lg font-bold text-orange-400 tabular-nums">
              {longshots.length}
            </div>
            <div className="text-[10px] text-white/60">Longshots</div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {(
          [
            { id: "locks" as MoneyTab, label: "Lock It In", icon: Lock },
            { id: "value" as MoneyTab, label: "Best Value", icon: Flame },
            {
              id: "longshots" as MoneyTab,
              label: "Longshot Goldmines",
              icon: Rocket,
            },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.id
                  ? "bg-masters-green text-white"
                  : "border border-[var(--border-color)] bg-white text-[var(--text-secondary)] hover:border-masters-green"
              }`}
            >
              <Icon className="h-3 w-3" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Lock It In */}
      {tab === "locks" && (
        <div className="space-y-3">
          <div className="text-xs text-[var(--text-muted)]">
            High-confidence bets where all 3 AI models agree and the edge is
            strong. These are the safest plays on the board.
          </div>
          {locks.map((bet) => {
            const key = `${bet.playerName}-${bet.market}`;
            const isOpen = expandedBet === key;
            return (
              <div
                key={key}
                className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-white"
              >
                <button
                  onClick={() => toggleExpand(key)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-primary)]"
                >
                  <InitialsAvatar initials={bet.initials} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {bet.playerName}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-masters-green-light text-masters-green text-[10px]"
                      >
                        {bet.marketLabel}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                      <span>#{bet.worldRanking} in world</span>
                      <span>&middot;</span>
                      <span className="font-bold text-masters-green">
                        {bet.confidence} confidence
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      {bet.americanOdds}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                        +{bet.edge.toFixed(1)}%
                      </span>
                      <span className="text-[10px] font-bold tabular-nums text-masters-green">
                        +${bet.ev100.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[var(--text-muted)]">
                          DK Implied
                        </span>
                        <span className="ml-1 font-semibold">
                          {bet.dkImpliedProb.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">
                          AI Probability
                        </span>
                        <span className="ml-1 font-semibold text-masters-green">
                          {bet.aiProb.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">
                          Edge
                        </span>
                        <span className="ml-1 font-bold text-green-700">
                          +{bet.edge.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">
                          EV / $100
                        </span>
                        <span className="ml-1 font-bold text-masters-green">
                          +${bet.ev100.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 rounded bg-white p-2 text-[10px] text-[var(--text-secondary)]">
                      <Star className="mb-0.5 mr-1 inline h-3 w-3 text-masters-gold" />
                      <strong>Why this is a lock:</strong> {bet.reason}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Best Value Singles */}
      {tab === "value" && (
        <div className="space-y-3">
          <div className="text-xs text-[var(--text-muted)]">
            The biggest mismatches between our AI models and DraftKings. These
            bets have the highest expected value per dollar wagered.
          </div>
          {valuePlays.map((bet, i) => {
            const key = `val-${bet.playerName}-${bet.market}`;
            const isOpen = expandedBet === key;
            return (
              <div
                key={key}
                className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-white"
              >
                <button
                  onClick={() => toggleExpand(key)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-primary)]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xs font-bold text-white">
                    #{i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {bet.playerName}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-orange-50 text-orange-700 text-[10px]"
                      >
                        {bet.marketLabel}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                      AI says {bet.aiProb.toFixed(1)}% &middot; DK says{" "}
                      {bet.dkImpliedProb.toFixed(1)}%
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      {bet.americanOdds}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-bold tabular-nums text-green-700">
                        +${bet.ev100.toFixed(0)} EV
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded bg-white p-2 text-center">
                        <div className="text-[var(--text-muted)]">
                          Edge
                        </div>
                        <div className="text-sm font-bold text-green-700">
                          +{bet.edge.toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded bg-white p-2 text-center">
                        <div className="text-[var(--text-muted)]">
                          EV / $100
                        </div>
                        <div className="text-sm font-bold text-masters-green">
                          +${bet.ev100.toFixed(2)}
                        </div>
                      </div>
                      <div className="rounded bg-white p-2 text-center">
                        <div className="text-[var(--text-muted)]">
                          $100 Pays
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                          ${((bet.decimalOdds * 100)).toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 rounded bg-white p-2 text-[10px] text-[var(--text-secondary)]">
                      <Flame className="mb-0.5 mr-1 inline h-3 w-3 text-orange-500" />
                      <strong>Why it&apos;s undervalued:</strong> {bet.reason}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Longshot Goldmines */}
      {tab === "longshots" && (
        <div className="space-y-3">
          <div className="text-xs text-[var(--text-muted)]">
            High-odds plays where the AI sees real value the books are missing.
            These won&apos;t always hit, but when they do, they pay BIG.
          </div>
          {longshots.map((bet) => {
            const key = `ls-${bet.playerName}-${bet.market}`;
            const isOpen = expandedBet === key;
            const payout = (bet.decimalOdds * 100).toFixed(0);
            return (
              <div
                key={key}
                className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-white"
              >
                <button
                  onClick={() => toggleExpand(key)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-primary)]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {bet.playerName}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-purple-50 text-purple-700 text-[10px]"
                      >
                        {bet.marketLabel}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                      $100 wins ${payout}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-purple-700">
                      {bet.americanOdds}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                        +{bet.edge.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[var(--text-muted)]">
                          DK Implied
                        </span>
                        <span className="ml-1 font-semibold">
                          {bet.dkImpliedProb.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">
                          AI Probability
                        </span>
                        <span className="ml-1 font-semibold text-purple-700">
                          {bet.aiProb.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">
                          Edge %
                        </span>
                        <span className="ml-1 font-bold text-green-700">
                          +{bet.edgePct.toFixed(0)}% over book
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">
                          EV / $100
                        </span>
                        <span className="ml-1 font-bold text-masters-green">
                          +${bet.ev100.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 rounded bg-white p-2 text-[10px] text-[var(--text-secondary)]">
                      <Rocket className="mb-0.5 mr-1 inline h-3 w-3 text-purple-600" />
                      <strong>The case for this bet:</strong> {bet.reason}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-center">
        <p className="text-[10px] text-[var(--text-muted)]">
          All edges calculated by comparing 3 independent AI models against
          DraftKings implied probabilities. Positive EV means profitable over
          time. Bet responsibly &mdash; the goal is smart money, not all money.
        </p>
      </div>
    </div>
  );
}
