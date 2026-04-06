"use client";

import { useState } from "react";
import type { Player, PredictionsData } from "@/lib/types";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { MomentumDots } from "@/components/ui/MomentumDots";
import { StrokesGainedBars } from "@/components/charts/StrokesGainedBars";
import { Badge } from "@/components/ui/badge";
import { WinProbBar } from "@/components/ui/WinProbBar";
import { ChevronDown } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  predictions: PredictionsData;
}

const tagColors: Record<string, string> = {
  "Past Champion": "bg-masters-gold-light text-masters-gold border-masters-gold/30",
  "Major Winner": "bg-masters-green-light text-masters-green border-masters-green/30",
  "Dark Horse": "bg-blue-50 text-masters-blue border-masters-blue/30",
  "LIV Golfer": "bg-gray-100 text-[var(--text-secondary)] border-gray-300",
  "First Timer": "bg-purple-50 text-purple-700 border-purple-200",
  "Amateur": "bg-orange-50 text-orange-700 border-orange-200",
  "Fan Favorite": "bg-red-50 text-red-700 border-red-200",
  "Defending Champion": "bg-masters-gold-light text-masters-gold border-masters-gold/30",
};

export function PlayerCard({ player, predictions }: PlayerCardProps) {
  const [expanded, setExpanded] = useState(false);

  const consensus = predictions.consensus.rankings.find(
    (r) => r.name === player.name
  );
  const simRanking = predictions.simulator.rankings.find(
    (r) => r.name === player.name
  );
  const scoutRanking = predictions.scout.rankings.find(
    (r) => r.name === player.name
  );
  const analystRanking = predictions.analyst.rankings.find(
    (r) => r.name === player.name
  );

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-white transition-shadow hover:shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <InitialsAvatar initials={player.initials} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-sm font-bold text-[var(--text-primary)] truncate">
              {player.name}
            </h3>
            <span className="shrink-0 text-xs text-[var(--text-muted)]">
              #{player.worldRanking}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <MomentumDots results={player.momentumLast5} />
            {consensus && (
              <span className="text-xs font-medium tabular-nums text-masters-green">
                {consensus.winPct.toFixed(1)}% win
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {player.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${tagColors[tag] || ""}`}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {player.mastersWins > 0 && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {player.mastersWins}x Masters Champion · Best: {player.mastersBestFinish}
            </p>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] p-4 space-y-4">
          {/* Narrative */}
          <p className="text-sm italic text-[var(--text-secondary)]">
            {player.narrative}
          </p>

          {/* Model Predictions */}
          {consensus && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Model Predictions
              </p>
              <div className="space-y-1.5">
                {simRanking && (
                  <WinProbBar value={simRanking.winPct} label="🎲 Sim" />
                )}
                {scoutRanking && (
                  <WinProbBar value={scoutRanking.winPct} label="🔍 Scout" />
                )}
                {analystRanking && (
                  <WinProbBar value={analystRanking.winPct} label="🧠 AI" />
                )}
                <WinProbBar
                  value={consensus.winPct}
                  label="Combined"
                  className="font-semibold"
                />
              </div>
            </div>
          )}

          {/* Masters History */}
          {player.mastersHistory.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Masters History
              </p>
              <div className="flex gap-3">
                {player.mastersHistory.map((h) => (
                  <div key={h.year} className="text-center">
                    <p className="text-xs text-[var(--text-muted)]">{h.year}</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {h.finish}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{h.score}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Season Stats */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              2026 Season
            </p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {player.season2026.events}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Events</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {player.season2026.wins}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Wins</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {player.season2026.top10s}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Top 10s</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-masters-green">
                  {player.season2026.earnings}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Earnings</p>
              </div>
            </div>
          </div>

          {/* Strokes Gained */}
          <StrokesGainedBars sg={player.strokesGained} />

          {/* Injury */}
          {player.injuryStatus && (
            <div className="rounded-md bg-red-50 p-2">
              <p className="text-xs text-masters-red">
                ⚠️ {player.injuryStatus}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
