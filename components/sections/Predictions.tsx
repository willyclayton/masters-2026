"use client";

import { useState } from "react";
import predictionsData from "@/data/predictions.json";
import playersData from "@/data/players-2026.json";
import type { PredictionsData, Player } from "@/lib/types";
import { ConsensusCard } from "@/components/cards/ConsensusCard";
import { ModelCard } from "@/components/cards/ModelCard";
import { ModelAgreement } from "@/components/ui/ModelAgreement";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { WinProbBar } from "@/components/ui/WinProbBar";
import { ChevronDown } from "lucide-react";

const predictions = predictionsData as unknown as PredictionsData;
const players = playersData as unknown as Player[];

function getInitials(name: string): string {
  const player = players.find((p) => p.name === name);
  if (player) return player.initials;
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export function Predictions() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const consensus = predictions.consensus.rankings;
  const winner = consensus[0];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      {/* Hero Banner */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-masters-green to-masters-green-dark p-6 text-white">
        <h2 className="font-heading text-2xl font-bold md:text-3xl">
          2026 Masters Predictions
        </h2>
        <p className="mt-1 text-sm text-white/80">
          Three AI models. 10,000 simulations. One green jacket.
        </p>
      </div>

      {/* Consensus Winner Card */}
      <div className="mb-6">
        <ConsensusCard
          prediction={winner}
          initials={getInitials(winner.name)}
        />
      </div>

      {/* Model Agreement */}
      <div className="mb-6">
        <ModelAgreement predictions={predictions} />
      </div>

      {/* Top 10 Leaderboard */}
      <div className="mb-8">
        <h3 className="mb-3 font-heading text-lg font-bold text-[var(--text-primary)]">
          Top 10 Leaderboard
        </h3>
        <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-white">
          {consensus.slice(0, 10).map((player, i) => {
            const isExpanded = expandedRow === i;
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
              <div
                key={player.name}
                className={`border-b border-[var(--border-color)] last:border-b-0 ${
                  i % 2 === 0 ? "bg-white" : "bg-[var(--bg-primary)]"
                }`}
              >
                <button
                  onClick={() => setExpandedRow(isExpanded ? null : i)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-masters-green-light/50"
                >
                  <span className="w-6 text-center text-sm font-semibold text-[var(--text-muted)]">
                    {i + 1}
                  </span>
                  <InitialsAvatar
                    initials={getInitials(player.name)}
                    size="sm"
                  />
                  <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                    {player.name}
                  </span>
                  <div className="hidden w-48 sm:block">
                    <WinProbBar value={player.winPct} />
                  </div>
                  <span className="w-14 text-right text-sm font-semibold tabular-nums text-masters-green sm:hidden">
                    {player.winPct.toFixed(1)}%
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {simRanking && (
                        <div>
                          <p className="text-xs font-medium text-[var(--text-muted)]">
                            🎲 Simulator
                          </p>
                          <WinProbBar
                            value={simRanking.winPct}
                            label="Win"
                          />
                          <WinProbBar
                            value={simRanking.top10Pct}
                            max={100}
                            label="Top 10"
                          />
                        </div>
                      )}
                      {scoutRanking && (
                        <div>
                          <p className="text-xs font-medium text-[var(--text-muted)]">
                            🔍 Scout
                          </p>
                          <WinProbBar
                            value={scoutRanking.winPct}
                            label="Win"
                          />
                          <WinProbBar
                            value={scoutRanking.top10Pct}
                            max={100}
                            label="Top 10"
                          />
                        </div>
                      )}
                      {analystRanking && (
                        <div>
                          <p className="text-xs font-medium text-[var(--text-muted)]">
                            🧠 Analyst
                          </p>
                          <WinProbBar
                            value={analystRanking.winPct}
                            label="Win"
                          />
                          <WinProbBar
                            value={analystRanking.top10Pct}
                            max={100}
                            label="Top 10"
                          />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs italic text-[var(--text-secondary)]">
                      {player.rationale}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Breakdown */}
      <div>
        <h3 className="mb-3 font-heading text-lg font-bold text-[var(--text-primary)]">
          Model Breakdown
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
          <ModelCard
            modelName={predictions.simulator.modelName}
            emoji={predictions.simulator.emoji}
            description={predictions.simulator.description}
            methodology={predictions.simulator.methodology}
            topPick={{
              ...predictions.simulator.rankings[0],
              initials: getInitials(predictions.simulator.rankings[0].name),
            }}
            top5={predictions.simulator.rankings.slice(0, 5).map((r) => ({
              ...r,
              initials: getInitials(r.name),
            }))}
          />
          <ModelCard
            modelName={predictions.scout.modelName}
            emoji={predictions.scout.emoji}
            description={predictions.scout.description}
            methodology={predictions.scout.methodology}
            topPick={{
              ...predictions.scout.rankings[0],
              initials: getInitials(predictions.scout.rankings[0].name),
            }}
            top5={predictions.scout.rankings.slice(0, 5).map((r) => ({
              ...r,
              initials: getInitials(r.name),
            }))}
          />
          <ModelCard
            modelName={predictions.analyst.modelName}
            emoji={predictions.analyst.emoji}
            description={predictions.analyst.description}
            methodology={predictions.analyst.methodology}
            topPick={{
              ...predictions.analyst.rankings[0],
              initials: getInitials(predictions.analyst.rankings[0].name),
            }}
            top5={predictions.analyst.rankings.slice(0, 5).map((r) => ({
              ...r,
              initials: getInitials(r.name),
            }))}
          />
        </div>
      </div>
    </section>
  );
}
