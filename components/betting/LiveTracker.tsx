"use client";

import { useMemo } from "react";
import type { BettingEdgeResult, LiveEdge } from "@/lib/types";
import { generateLiveEdges } from "@/lib/edge-calculations";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { Badge } from "@/components/ui/badge";
import { Radio, TrendingUp, TrendingDown, Sparkles, AlertCircle } from "lucide-react";

interface LiveTrackerProps {
  edges: BettingEdgeResult[];
}

const STATUS_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; color: string; dotClass: string }
> = {
  growing: {
    icon: TrendingUp,
    label: "EDGE GROWING",
    color: "text-masters-green",
    dotClass: "bg-masters-green animate-pulse",
  },
  new: {
    icon: Sparkles,
    label: "NEW EDGE",
    color: "text-masters-gold",
    dotClass: "bg-masters-gold animate-pulse",
  },
  shrinking: {
    icon: TrendingDown,
    label: "SHRINKING",
    color: "text-[var(--text-muted)]",
    dotClass: "bg-yellow-400",
  },
  dead: {
    icon: AlertCircle,
    label: "DEAD",
    color: "text-masters-red",
    dotClass: "bg-masters-red",
  },
};

export function LiveTracker({ edges }: LiveTrackerProps) {
  const liveEdges = useMemo(() => generateLiveEdges(edges), [edges]);

  const growing = liveEdges.filter((e) => e.status === "growing");
  const newEdges = liveEdges.filter((e) => e.status === "new");
  const shrinking = liveEdges.filter((e) => e.status === "shrinking");

  return (
    <div className="space-y-6">
      {/* Live header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-masters-green-light text-masters-green">
            <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-masters-green" />
            PRE-TOURNAMENT
          </Badge>
          <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
            Live Edge Tracker
          </h3>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Monitoring edge movement in real-time. Edges shift as DraftKings adjusts
        odds. During the tournament, this updates live as players perform.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-masters-green-light p-3 text-center">
          <div className="text-xl font-bold text-masters-green">
            {growing.length}
          </div>
          <div className="text-[10px] font-medium text-masters-green">
            Growing
          </div>
        </div>
        <div className="rounded-lg bg-masters-gold-light p-3 text-center">
          <div className="text-xl font-bold text-masters-gold">
            {newEdges.length}
          </div>
          <div className="text-[10px] font-medium text-masters-gold">
            New
          </div>
        </div>
        <div className="rounded-lg bg-gray-100 p-3 text-center">
          <div className="text-xl font-bold text-[var(--text-secondary)]">
            {shrinking.length}
          </div>
          <div className="text-[10px] font-medium text-[var(--text-muted)]">
            Shrinking
          </div>
        </div>
      </div>

      {/* Alert */}
      {growing.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-masters-green-light p-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-masters-green" />
            <span className="text-xs font-bold text-masters-green">
              Live Alert
            </span>
          </div>
          <p className="mt-1 text-xs text-masters-green-dark">
            {growing[0].playerName} {growing[0].marketLabel} edge has grown
            from +{growing[0].previousEdge.toFixed(1)}% to +
            {growing[0].currentEdge.toFixed(1)}% — DK is slow to adjust.
            EV per $100: +${growing[0].ev100.toFixed(2)}.
          </p>
        </div>
      )}

      {/* Edge list */}
      <div className="space-y-2">
        {liveEdges.map((le) => {
          const cfg = STATUS_CONFIG[le.status];
          const Icon = cfg.icon;
          const edgeDelta = le.currentEdge - le.previousEdge;

          return (
            <div
              key={`${le.playerName}-${le.market}`}
              className="flex items-center gap-3 rounded-lg border border-[var(--border-color)] bg-white p-3 transition-shadow hover:shadow-sm"
            >
              {/* Status dot */}
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dotClass}`}
              />

              <InitialsAvatar initials={le.initials} size="sm" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {le.playerName}
                  </span>
                  <MarketBadge market={le.market} />
                  <span className={`text-[10px] font-bold ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span>{le.reason}</span>
                  <span>&middot; {le.timeAgo}</span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Icon className={`h-3 w-3 ${cfg.color}`} />
                  <span className="text-sm font-bold text-masters-green">
                    +{le.currentEdge.toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] font-semibold tabular-nums text-masters-green">
                  EV: +${le.ev100.toFixed(2)}
                </div>
                {le.previousEdge > 0 && (
                  <div className="text-[10px] text-[var(--text-muted)]">
                    was +{le.previousEdge.toFixed(1)}%
                    <span
                      className={
                        edgeDelta > 0
                          ? "ml-1 text-masters-green"
                          : "ml-1 text-masters-red"
                      }
                    >
                      ({edgeDelta > 0 ? "+" : ""}
                      {edgeDelta.toFixed(1)})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-[var(--bg-primary)] p-3 text-center text-[10px] text-[var(--text-muted)]">
        Live tracking activates when the tournament begins April 9. Currently
        showing pre-tournament edge movement from opening lines.
      </div>
    </div>
  );
}
