"use client";

import type { BettingEdgeResult } from "@/lib/types";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { Badge } from "@/components/ui/badge";

interface BestBetsCardProps {
  bets: BettingEdgeResult[];
}

export function BestBetsCard({ bets }: BestBetsCardProps) {
  if (bets.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-lg border-l-4 border-masters-gold bg-white p-5 shadow-sm sm:p-6">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-masters-gold-light opacity-40" />
      <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-masters-gold-light opacity-20" />

      <div className="relative">
        <Badge
          variant="secondary"
          className="mb-3 bg-masters-gold-light text-masters-gold"
        >
          AI Best Bets
        </Badge>
        <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
          Top Value Plays
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Highest positive edge — where our AI models see the most value vs.
          DraftKings odds
        </p>

        <div className="mt-4 space-y-2">
          {bets.map((bet, i) => (
            <div
              key={`${bet.playerName}-${bet.market}`}
              className="flex items-center gap-3 rounded-lg bg-[var(--bg-primary)] p-3 transition-colors hover:bg-masters-green-light"
            >
              {/* Rank */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-masters-gold-light text-xs font-bold text-masters-gold">
                {i + 1}
              </span>

              {/* Player */}
              <InitialsAvatar initials={bet.initials} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {bet.playerName}
                  </span>
                  <MarketBadge market={bet.market} />
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  DK: {bet.americanOdds} ({bet.dkImpliedProb.toFixed(1)}%)
                </div>
              </div>

              {/* Edge + EV */}
              <div className="shrink-0 text-right">
                <div className="text-sm font-bold text-masters-green">
                  +{bet.edge.toFixed(1)}%
                </div>
                <div className="text-[10px] font-semibold tabular-nums text-masters-green">
                  EV: +${bet.ev100.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
