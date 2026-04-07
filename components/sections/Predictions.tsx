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
import { ScoutBreakdownCard } from "@/components/cards/ScoutBreakdownCard";
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
  const [showAll, setShowAll] = useState(false);
  const [showWinCase, setShowWinCase] = useState<number | null>(null);
  const consensus = predictions.consensus.rankings;
  const winner = consensus[0];

  const displayCount = showAll ? Math.min(consensus.length, 30) : 15;

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

      {/* Leaderboard */}
      <div className="mb-8">
        <h3 className="mb-3 font-heading text-lg font-bold text-[var(--text-primary)]">
          Top {displayCount} Leaderboard
        </h3>
        <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-white">
          {consensus.slice(0, displayCount).map((player, i) => {
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
            const isWinCaseOpen = showWinCase === i;

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
                  <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 space-y-3">
                    {/* Model Breakdown */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {simRanking && (
                        <div>
                          <p className="text-xs font-medium text-[var(--text-muted)]">
                            🎲 Simulator
                          </p>
                          <WinProbBar value={simRanking.winPct} label="Win" />
                          <WinProbBar value={simRanking.top10Pct} max={100} label="Top 10" />
                        </div>
                      )}
                      {scoutRanking && (
                        <div>
                          <p className="text-xs font-medium text-[var(--text-muted)]">
                            🔍 Scout
                          </p>
                          <WinProbBar value={scoutRanking.winPct} label="Win" />
                          <WinProbBar value={scoutRanking.top10Pct} max={100} label="Top 10" />
                        </div>
                      )}
                      {analystRanking && (
                        <div>
                          <p className="text-xs font-medium text-[var(--text-muted)]">
                            🧠 Analyst
                          </p>
                          <WinProbBar value={analystRanking.winPct} label="Win" />
                          <WinProbBar value={analystRanking.top10Pct} max={100} label="Top 10" />
                        </div>
                      )}
                    </div>

                    {/* Scout Score Breakdown */}
                    {scoutRanking && "scores" in scoutRanking && (
                      <ScoutBreakdownCard
                        scores={scoutRanking.scores}
                        explanations={"scoreExplanations" in scoutRanking ? (scoutRanking as any).scoreExplanations : undefined}
                      />
                    )}

                    {/* Rationale */}
                    <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <p className="italic line-clamp-4">{player.rationale}</p>
                    </div>

                    {/* Scenario Analysis */}
                    {player.scenarioAnalysis && (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="rounded-md bg-masters-green-light/50 p-2">
                          <p className="text-[10px] font-medium uppercase text-masters-green">Best Case</p>
                          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{player.scenarioAnalysis.bestCase}</p>
                        </div>
                        <div className="rounded-md bg-gray-50 p-2">
                          <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">Most Likely</p>
                          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{player.scenarioAnalysis.mostLikely}</p>
                        </div>
                        <div className="rounded-md bg-red-50/50 p-2">
                          <p className="text-[10px] font-medium uppercase text-masters-red">Worst Case</p>
                          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{player.scenarioAnalysis.worstCase}</p>
                        </div>
                      </div>
                    )}

                    {/* Why They Will Win - Collapsible */}
                    {player.whyTheyWillWin && (
                      <div>
                        <button
                          onClick={() => setShowWinCase(isWinCaseOpen ? null : i)}
                          className="flex items-center gap-1 text-xs font-medium text-masters-green hover:underline"
                        >
                          {isWinCaseOpen ? "Hide" : "Read"} Full Win Case
                          <ChevronDown className={`h-3 w-3 transition-transform ${isWinCaseOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isWinCaseOpen && (
                          <div className="mt-2 rounded-md bg-white p-3 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line border border-[var(--border-color)]">
                            {player.whyTheyWillWin}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show More / Less */}
        {consensus.length > 15 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-3 w-full rounded-md border border-[var(--border-color)] bg-white py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-masters-green-light/50 transition-colors"
          >
            {showAll ? "Show Top 15 Only" : `Show Top 30 (${consensus.length - 15} more)`}
          </button>
        )}
      </div>

      {/* Analyst Narrative */}
      {predictions.analyst.narrative && (
        <div className="mb-8 rounded-lg border border-[var(--border-color)] bg-white p-5">
          <h3 className="mb-3 font-heading text-lg font-bold text-[var(--text-primary)]">
            🧠 The Analyst&apos;s Tournament Preview
          </h3>
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {predictions.analyst.narrative}
          </div>
        </div>
      )}

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
