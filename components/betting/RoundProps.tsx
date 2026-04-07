"use client";

import { useState, useMemo } from "react";
import type { BettingEdgeResult, Player } from "@/lib/types";
import { generateRoundProps } from "@/lib/edge-calculations";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { Badge } from "@/components/ui/badge";

interface RoundPropsComponentProps {
  edges: BettingEdgeResult[];
  players: Player[];
}

type RoundTab = "frl" | "ou";

export function RoundPropsComponent({ edges, players }: RoundPropsComponentProps) {
  const [tab, setTab] = useState<RoundTab>("frl");
  const [showAll, setShowAll] = useState(false);

  const { firstRoundLeader, roundOU } = useMemo(
    () => generateRoundProps(edges, players),
    [edges, players]
  );

  const displayFRL = showAll ? firstRoundLeader : firstRoundLeader.slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="secondary" className="bg-masters-green-light text-masters-green">
            Round Props
          </Badge>
          <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
            Round-by-Round Props
          </h3>
        </div>
        <p className="mb-4 text-xs text-[var(--text-muted)]">
          First round leader odds and individual round score over/unders with AI
          edge analysis.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("frl")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === "frl"
              ? "bg-masters-green text-white"
              : "border border-[var(--border-color)] bg-white text-[var(--text-secondary)] hover:border-masters-green"
          }`}
        >
          First Round Leader
        </button>
        <button
          onClick={() => setTab("ou")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === "ou"
              ? "bg-masters-green text-white"
              : "border border-[var(--border-color)] bg-white text-[var(--text-secondary)] hover:border-masters-green"
          }`}
        >
          Round Score O/U
        </button>
      </div>

      {/* FRL Tab */}
      {tab === "frl" && (
        <div>
          <div className="mb-2 text-xs text-[var(--text-muted)]">
            Who leads after 18 holes on Thursday? AI calculates round-specific
            probabilities using historical R1 data and current form.
          </div>
          <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-white">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-x-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2 text-[10px] font-semibold uppercase text-[var(--text-muted)]">
              <span>#</span>
              <span>Player</span>
              <span className="hidden sm:block">DK Odds</span>
              <span>DK Prob</span>
              <span>AI Prob</span>
              <span className="text-right">Edge / EV</span>
            </div>
            {displayFRL.map((frl, i) => (
              <div
                key={frl.playerName}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-x-3 border-b border-[var(--border-color)] px-4 py-3 last:border-b-0 hover:bg-[var(--bg-primary)]"
              >
                <span
                  className={`text-xs font-bold ${
                    i < 3 ? "text-masters-gold" : "text-[var(--text-muted)]"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex items-center gap-2">
                  <InitialsAvatar initials={frl.initials} size="sm" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {frl.playerName}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      #{frl.worldRanking}
                    </div>
                  </div>
                </div>
                <span className="hidden text-sm font-bold text-[var(--text-primary)] sm:block">
                  {frl.americanOdds}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {frl.impliedProb.toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-masters-green">
                  {frl.aiProb.toFixed(1)}%
                </span>
                <div className="text-right">
                  {frl.edge > 0 ? (
                    <>
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                        +{frl.edge.toFixed(1)}%
                      </span>
                      <div className="mt-0.5 text-[10px] font-semibold tabular-nums text-masters-green">
                        EV: +${frl.ev100.toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      {frl.edge.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!showAll && firstRoundLeader.length > 10 && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 w-full rounded-lg border border-[var(--border-color)] bg-white py-2.5 text-sm font-medium text-masters-green hover:bg-masters-green-light"
            >
              Show All {firstRoundLeader.length} Players
            </button>
          )}
        </div>
      )}

      {/* O/U Tab */}
      {tab === "ou" && (
        <div>
          <div className="mb-2 text-xs text-[var(--text-muted)]">
            AI-projected round scores vs. DraftKings over/under lines. Pick
            where the AI sees a gap.
          </div>
          <div className="space-y-2">
            {roundOU.map((ou) => (
              <div
                key={`${ou.playerName}-r${ou.round}`}
                className="flex items-center gap-3 rounded-lg border border-[var(--border-color)] bg-white p-3"
              >
                <InitialsAvatar initials={ou.initials} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {ou.playerName} R{ou.round} O/U {ou.line}
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                    AI projected: {ou.aiProjected.toFixed(1)} &middot; Over{" "}
                    {ou.overOdds} / Under {ou.underOdds}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      ou.pick === "under"
                        ? "bg-masters-green-light text-masters-green"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {ou.pick === "under" ? "UNDER" : "OVER"} {ou.pick === "under" ? ou.underOdds : ou.overOdds}
                  </span>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <span className="text-[10px] font-bold text-masters-green">
                      +{ou.edge.toFixed(1)}% edge
                    </span>
                    <span className="text-[10px] font-semibold tabular-nums text-masters-green">
                      EV: +${ou.ev100.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
