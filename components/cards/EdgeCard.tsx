"use client";

import { useState } from "react";
import type { BettingEdgeResult } from "@/lib/types";
import { getEdgeLabel } from "@/lib/edge-calculations";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { EdgeComparisonBar } from "@/components/ui/EdgeComparisonBar";
import { ChevronDown } from "lucide-react";

interface EdgeCardProps {
  edge: BettingEdgeResult;
  rank?: number;
}

const EDGE_STYLES: Record<string, string> = {
  strong: "bg-emerald-100 text-emerald-800 border-emerald-300",
  value: "bg-green-50 text-green-700 border-green-200",
  slight: "bg-lime-50 text-lime-700 border-lime-200",
  neutral: "bg-gray-50 text-gray-600 border-gray-200",
  overvalued: "bg-red-50 text-red-600 border-red-200",
};

const CONFIDENCE_DOTS: Record<string, { color: string; label: string }> = {
  high: { color: "bg-masters-green", label: "Models agree" },
  medium: { color: "bg-yellow-400", label: "Mixed signals" },
  low: { color: "bg-gray-300", label: "Models diverge" },
};

export function EdgeCard({ edge, rank }: EdgeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { label: edgeLabel, color: edgeColor } = getEdgeLabel(edge.edge);
  const edgeStyle = EDGE_STYLES[edgeColor];
  const conf = CONFIDENCE_DOTS[edge.confidence];

  const maxBarValue = Math.max(edge.dkImpliedProb, edge.aiProb, 10) * 1.3;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-white transition-shadow hover:shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-2 p-3 sm:items-center sm:gap-3 sm:p-4">
          {/* Rank — desktop only */}
          {rank != null && (
            <span className="hidden w-6 shrink-0 text-center text-xs font-medium text-[var(--text-muted)] sm:block">
              {rank}
            </span>
          )}

          {/* Avatar */}
          <InitialsAvatar initials={edge.initials} size="sm" className="mt-0.5 sm:mt-0" />

          {/* Player info — wraps on mobile */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {edge.playerName}
              </span>
              <MarketBadge market={edge.market} />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-muted)]">
              <span>#{edge.worldRanking}</span>
              <span className="hidden sm:inline">{edge.country}</span>
              <span className="flex items-center gap-1">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${conf.color}`}
                />
                <span className="hidden sm:inline">{conf.label}</span>
              </span>
              {/* DK odds — show inline on mobile since the separate block is hidden */}
              <span className="sm:hidden">
                {edge.americanOdds} ({edge.dkImpliedProb.toFixed(1)}%)
                {edge.movement === "rising" && (
                  <span className="ml-0.5 text-masters-green">▲</span>
                )}
                {edge.movement === "falling" && (
                  <span className="ml-0.5 text-masters-red">▼</span>
                )}
              </span>
            </div>
          </div>

          {/* Odds — desktop only */}
          <div className="hidden shrink-0 text-right sm:block">
            <div className="text-sm font-bold text-[var(--text-primary)]">
              {edge.americanOdds}
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-[var(--text-muted)]">
              DK {edge.dkImpliedProb.toFixed(1)}%
              {edge.movement === "rising" && (
                <span className="text-masters-green">▲</span>
              )}
              {edge.movement === "falling" && (
                <span className="text-masters-red">▼</span>
              )}
            </div>
          </div>

          {/* Edge + EV */}
          <div className="shrink-0 text-right">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${edgeStyle}`}
            >
              {edge.edge > 0 ? "+" : ""}
              {edge.edge.toFixed(1)}%
            </span>
            <div
              className="mt-0.5 text-[10px] font-semibold tabular-nums"
              style={{
                color:
                  edge.ev100 >= 0
                    ? "var(--color-masters-green)"
                    : "var(--color-masters-red)",
              }}
            >
              EV: {edge.ev100 >= 0 ? "+$" : "-$"}
              {Math.abs(edge.ev100).toFixed(2)}
            </div>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="space-y-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
          <EdgeComparisonBar
            dkProb={edge.dkImpliedProb}
            aiProb={edge.aiProb}
            maxValue={maxBarValue}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">
                DraftKings Odds
              </p>
              <p className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">
                {edge.americanOdds}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                ({edge.decimalOdds.toFixed(2)} decimal)
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">
                DK Implied Prob
              </p>
              <p className="mt-0.5 text-sm font-bold text-[var(--text-secondary)]">
                {edge.dkImpliedProb.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase text-masters-green">
                AI Probability
              </p>
              <p className="mt-0.5 text-sm font-bold text-masters-green">
                {edge.aiProb.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">
                Edge
              </p>
              <p
                className={`mt-0.5 text-sm font-bold ${
                  edge.edge > 0 ? "text-masters-green" : "text-masters-red"
                }`}
              >
                {edge.edge > 0 ? "+" : ""}
                {edge.edge.toFixed(1)}% ({edge.edgePct > 0 ? "+" : ""}
                {edge.edgePct.toFixed(0)}% rel.)
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">
                EV per $100
              </p>
              <p
                className={`mt-0.5 text-sm font-bold ${
                  edge.ev100 >= 0 ? "text-masters-green" : "text-masters-red"
                }`}
              >
                {edge.ev100 >= 0 ? "+$" : "-$"}
                {Math.abs(edge.ev100).toFixed(2)}
              </p>
            </div>
          </div>

          {edge.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {edge.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
