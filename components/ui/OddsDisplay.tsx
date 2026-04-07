"use client";

import type { BettingOdds } from "@/lib/types";

interface OddsDisplayProps {
  odds: BettingOdds;
}

export function OddsDisplay({ odds }: OddsDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-[var(--text-primary)]">
        {odds.currentOdds}
      </span>
      <span className="text-xs text-[var(--text-muted)]">
        {odds.impliedProbability.toFixed(1)}%
      </span>
      {odds.movement === "rising" && (
        <span className="text-xs text-masters-green" title="Rising">
          ▲
        </span>
      )}
      {odds.movement === "falling" && (
        <span className="text-xs text-masters-red" title="Falling">
          ▼
        </span>
      )}
      {odds.movement === "stable" && (
        <span className="text-xs text-[var(--text-muted)]" title="Stable">
          —
        </span>
      )}
    </div>
  );
}
