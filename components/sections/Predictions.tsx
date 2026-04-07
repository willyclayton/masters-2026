"use client";

import { useState } from "react";
import predictionsData from "@/data/predictions.json";
import playersData from "@/data/players-2026.json";
import type { PredictionsData, Player } from "@/lib/types";
import { ConsensusCard } from "@/components/cards/ConsensusCard";
import { ModelCard } from "@/components/cards/ModelCard";
import { ModelAgreement } from "@/components/ui/ModelAgreement";
import { WinProbBar } from "@/components/ui/WinProbBar";
import { ScoutBreakdownCard } from "@/components/cards/ScoutBreakdownCard";
import { ScoreboardTile } from "@/components/ui/ScoreboardTile";
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

// Slight random-ish rotation for each tile to feel hand-placed
function tileRotation(index: number, seed: number = 0): number {
  const rotations = [-1.2, 0.5, -0.8, 1.0, -0.3, 0.7, -1.0, 0.4, -0.6, 1.1, -0.5, 0.3, -0.9, 0.6, -0.4];
  return rotations[(index + seed) % rotations.length];
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
      {/* Hero Banner — Scoreboard style */}
      <div className="board-surface mb-6 rounded-lg overflow-hidden shadow-lg">
        <div className="relative px-6 py-8 text-center">
          <h2 className="font-heading text-3xl font-black text-white tracking-wider uppercase board-header-paint md:text-4xl">
            LEADERS
          </h2>
          <p className="mt-2 text-xs font-semibold tracking-[0.25em] uppercase text-[#C8A951]">
            AI Predicted Finish · Masters 2026
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-[10px] tracking-widest uppercase text-white/40">Three models</span>
            <ScoreboardTile size="xs" variant="gold" rotation={-1}>·</ScoreboardTile>
            <span className="text-[10px] tracking-widest uppercase text-white/40">10,000 sims</span>
            <ScoreboardTile size="xs" variant="gold" rotation={0.5}>·</ScoreboardTile>
            <span className="text-[10px] tracking-widest uppercase text-white/40">One green jacket</span>
          </div>
        </div>
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

      {/* Leaderboard — Scoreboard rows */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
            Top {displayCount} Leaderboard
          </h3>
          <span className="text-[10px] tracking-widest uppercase text-[var(--text-muted)]">
            Predicted
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--border-color)] shadow-sm">
          {/* Header row */}
          <div className="board-surface">
            <div className="relative flex items-center gap-2 px-4 py-2">
              <span className="w-10 text-center text-[10px] font-bold tracking-wider uppercase text-white/60">
                Pos
              </span>
              <span className="flex-1 text-[10px] font-bold tracking-wider uppercase text-white/60 pl-1">
                Player
              </span>
              <span className="w-16 text-center text-[10px] font-bold tracking-wider uppercase text-white/60 hidden sm:block">
                Win %
              </span>
              <span className="w-14 text-right text-[10px] font-bold tracking-wider uppercase text-white/60 sm:hidden">
                Win
              </span>
              <span className="w-5" />
            </div>
          </div>

          {/* Player rows */}
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
                className={`border-b border-[var(--border-color)] last:border-b-0 row-enter ${
                  i % 2 === 0 ? "bg-white" : "bg-[var(--bg-primary)]"
                }`}
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <button
                  onClick={() => setExpandedRow(isExpanded ? null : i)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-masters-green-light/30"
                >
                  {/* Position tile */}
                  <div className="w-10 flex justify-center">
                    <ScoreboardTile
                      size="sm"
                      variant={i < 5 ? "red" : "default"}
                      rotation={tileRotation(i, 0)}
                    >
                      {i + 1}
                    </ScoreboardTile>
                  </div>

                  {/* Player name as nameplate */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">
                      {player.name}
                    </span>
                  </div>

                  {/* Win % as tile — desktop shows bar + tile */}
                  <div className="hidden w-16 sm:flex justify-center">
                    <ScoreboardTile
                      size="sm"
                      variant={player.winPct >= 5 ? "red" : "default"}
                      rotation={tileRotation(i, 3)}
                    >
                      {player.winPct.toFixed(1)}
                    </ScoreboardTile>
                  </div>

                  {/* Mobile: just the number */}
                  <span className="w-14 text-right text-sm font-extrabold tabular-nums text-masters-red sm:hidden">
                    {player.winPct.toFixed(1)}%
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-4 space-y-4">
                    {/* Tile stats row */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <ScoreboardTile
                          size="md"
                          variant={player.winPct >= 5 ? "red" : "default"}
                          rotation={tileRotation(i, 1)}
                          animated
                          delay={0}
                        >
                          {player.winPct.toFixed(1)}
                        </ScoreboardTile>
                        <span className="text-[9px] font-semibold tracking-wider uppercase text-[var(--text-muted)]">Win %</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ScoreboardTile
                          size="md"
                          variant="red"
                          rotation={tileRotation(i, 2)}
                          animated
                          delay={80}
                        >
                          {player.top5Pct.toFixed(1)}
                        </ScoreboardTile>
                        <span className="text-[9px] font-semibold tracking-wider uppercase text-[var(--text-muted)]">Top 5</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ScoreboardTile
                          size="md"
                          variant="red"
                          rotation={tileRotation(i, 4)}
                          animated
                          delay={160}
                        >
                          {player.top10Pct.toFixed(1)}
                        </ScoreboardTile>
                        <span className="text-[9px] font-semibold tracking-wider uppercase text-[var(--text-muted)]">Top 10</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ScoreboardTile
                          size="md"
                          variant="default"
                          rotation={tileRotation(i, 5)}
                          animated
                          delay={240}
                        >
                          {player.makeCutPct.toFixed(0)}
                        </ScoreboardTile>
                        <span className="text-[9px] font-semibold tracking-wider uppercase text-[var(--text-muted)]">Cut %</span>
                      </div>
                    </div>

                    {/* Model Breakdown */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {simRanking && (
                        <div className="rounded-md board-surface p-3">
                          <p className="relative text-[10px] font-bold tracking-wider uppercase text-white/70 mb-2">
                            🎲 Simulator
                          </p>
                          <div className="relative flex gap-2">
                            <ScoreboardTile size="sm" variant="red" rotation={-0.5}>
                              {simRanking.winPct.toFixed(1)}
                            </ScoreboardTile>
                            <ScoreboardTile size="sm" variant="default" rotation={0.8}>
                              {simRanking.top10Pct.toFixed(0)}
                            </ScoreboardTile>
                          </div>
                          <div className="relative flex gap-4 mt-1">
                            <span className="text-[9px] text-white/40 uppercase tracking-wide">Win</span>
                            <span className="text-[9px] text-white/40 uppercase tracking-wide">T10</span>
                          </div>
                        </div>
                      )}
                      {scoutRanking && (
                        <div className="rounded-md board-surface p-3">
                          <p className="relative text-[10px] font-bold tracking-wider uppercase text-white/70 mb-2">
                            🔍 Scout
                          </p>
                          <div className="relative flex gap-2">
                            <ScoreboardTile size="sm" variant="red" rotation={0.5}>
                              {scoutRanking.winPct.toFixed(1)}
                            </ScoreboardTile>
                            <ScoreboardTile size="sm" variant="default" rotation={-0.3}>
                              {scoutRanking.top10Pct.toFixed(0)}
                            </ScoreboardTile>
                          </div>
                          <div className="relative flex gap-4 mt-1">
                            <span className="text-[9px] text-white/40 uppercase tracking-wide">Win</span>
                            <span className="text-[9px] text-white/40 uppercase tracking-wide">T10</span>
                          </div>
                        </div>
                      )}
                      {analystRanking && (
                        <div className="rounded-md board-surface p-3">
                          <p className="relative text-[10px] font-bold tracking-wider uppercase text-white/70 mb-2">
                            🧠 Analyst
                          </p>
                          <div className="relative flex gap-2">
                            <ScoreboardTile size="sm" variant="red" rotation={-0.8}>
                              {analystRanking.winPct.toFixed(1)}
                            </ScoreboardTile>
                            <ScoreboardTile size="sm" variant="default" rotation={0.6}>
                              {analystRanking.top10Pct.toFixed(0)}
                            </ScoreboardTile>
                          </div>
                          <div className="relative flex gap-4 mt-1">
                            <span className="text-[9px] text-white/40 uppercase tracking-wide">Win</span>
                            <span className="text-[9px] text-white/40 uppercase tracking-wide">T10</span>
                          </div>
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
