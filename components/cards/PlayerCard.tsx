"use client";

import { useState } from "react";
import type { Player, PredictionsData } from "@/lib/types";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { MomentumDots } from "@/components/ui/MomentumDots";
import { StrokesGainedBars } from "@/components/charts/StrokesGainedBars";
import { Badge } from "@/components/ui/badge";
import { WinProbBar } from "@/components/ui/WinProbBar";
import { OddsDisplay } from "@/components/ui/OddsDisplay";
import { PressureGauge } from "@/components/ui/PressureGauge";
import { ScoutBreakdownCard } from "@/components/cards/ScoutBreakdownCard";
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

type TabId = "overview" | "win-case" | "course-fit" | "stats";

export function PlayerCard({ player, predictions }: PlayerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

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

  const hasWinCase = player.whyTheyWillWin || player.whyTheyWontWin;
  const hasCourseFit = player.augustaCourseFit || player.augustaKeyHoles || player.weatherImpact;

  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: "overview", label: "Overview", show: true },
    { id: "win-case", label: "Why They Win", show: !!hasWinCase },
    { id: "course-fit", label: "Course Fit", show: !!hasCourseFit },
    { id: "stats", label: "Stats", show: true },
  ];

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
            {player.bettingOdds && (
              <OddsDisplay odds={player.bettingOdds} />
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
        <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
          {/* Injury Banner */}
          {player.injuryStatus && (
            <div className="mx-4 mt-3 rounded-md bg-red-50 p-2">
              <p className="text-xs text-masters-red">
                ⚠️ {player.injuryStatus}
              </p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto border-b border-[var(--border-color)] px-4 pt-3">
            {tabs.filter((t) => t.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-masters-green border border-[var(--border-color)] border-b-white -mb-px"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 space-y-4">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                <p className="text-sm italic text-[var(--text-secondary)]">
                  {player.narrative}
                </p>

                {/* Key Strengths & Weaknesses */}
                {(player.keyStrengths || player.keyWeaknesses) && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {player.keyStrengths && player.keyStrengths.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                          Strengths
                        </p>
                        <ul className="space-y-1">
                          {player.keyStrengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
                              <span className="mt-0.5 text-masters-green">+</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {player.keyWeaknesses && player.keyWeaknesses.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                          Weaknesses
                        </p>
                        <ul className="space-y-1">
                          {player.keyWeaknesses.map((w, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
                              <span className="mt-0.5 text-masters-red">−</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Pressure Rating */}
                {player.pressureRating !== undefined && (
                  <PressureGauge rating={player.pressureRating} />
                )}

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
              </>
            )}

            {/* Why They Win Tab */}
            {activeTab === "win-case" && hasWinCase && (
              <>
                {player.whyTheyWillWin && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-masters-green">
                      The Case For Winning
                    </p>
                    <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                      {player.whyTheyWillWin}
                    </div>
                  </div>
                )}

                {player.whyTheyWontWin && (
                  <div className="rounded-md bg-red-50/50 p-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-masters-red">
                      Risk Factors
                    </p>
                    <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                      {player.whyTheyWontWin}
                    </div>
                  </div>
                )}

                {/* Historical Comparisons */}
                {player.comparisons && player.comparisons.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Historical Parallels
                    </p>
                    <div className="space-y-2">
                      {player.comparisons.map((c, i) => (
                        <div key={i} className="rounded-md border border-[var(--border-color)] bg-white p-3">
                          <p className="text-xs font-semibold text-[var(--text-primary)]">
                            {c.playerName}, {c.year}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {c.comparison}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Course Fit Tab */}
            {activeTab === "course-fit" && hasCourseFit && (
              <>
                {/* Augusta Course Fit Stats */}
                {player.augustaCourseFit && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Augusta Course Fit
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <div className="rounded-md bg-white p-2 text-center border border-[var(--border-color)]">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {player.augustaCourseFit.par5Scoring > 0 ? "+" : ""}{player.augustaCourseFit.par5Scoring.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">Par-5 Avg</p>
                      </div>
                      <div className="rounded-md bg-white p-2 text-center border border-[var(--border-color)]">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {player.augustaCourseFit.amenCornerAvg > 0 ? "+" : ""}{player.augustaCourseFit.amenCornerAvg.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">Amen Corner</p>
                      </div>
                      <div className="rounded-md bg-white p-2 text-center border border-[var(--border-color)]">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          #{player.augustaCourseFit.drivingDistanceRank}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">Drive Dist</p>
                      </div>
                      <div className="rounded-md bg-white p-2 text-center border border-[var(--border-color)]">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {player.augustaCourseFit.greensInRegulation.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">GIR</p>
                      </div>
                      <div className="rounded-md bg-white p-2 text-center border border-[var(--border-color)]">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {player.augustaCourseFit.scramblingPct.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">Scrambling</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Augusta Holes */}
                {player.augustaKeyHoles && player.augustaKeyHoles.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Key Augusta Holes
                    </p>
                    <div className="space-y-2">
                      {player.augustaKeyHoles.map((h) => (
                        <div key={h.hole} className="flex items-start gap-2">
                          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-masters-green text-[10px] font-bold text-white">
                            {h.hole}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">{h.name}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{h.advantage}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weather Impact */}
                {player.weatherImpact && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Weather Impact
                    </p>
                    <div className="flex gap-3 mb-2">
                      {(["wind", "rain", "cold"] as const).map((condition) => {
                        const val = player.weatherImpact![condition];
                        const color = val === "advantage" ? "text-masters-green bg-masters-green-light" :
                                      val === "disadvantage" ? "text-masters-red bg-red-50" :
                                      "text-[var(--text-muted)] bg-gray-50";
                        return (
                          <div key={condition} className={`rounded-md px-2 py-1 text-center ${color}`}>
                            <p className="text-[10px] font-medium uppercase">{condition}</p>
                            <p className="text-xs font-semibold capitalize">{val}</p>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {player.weatherImpact.explanation}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <>
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

                {/* Masters History */}
                {player.mastersHistory.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Masters History
                    </p>
                    <div className="flex gap-3 overflow-x-auto">
                      {player.mastersHistory.map((h) => (
                        <div key={h.year} className="shrink-0 text-center">
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

                {/* Major History */}
                {player.majorHistory && player.majorHistory.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Major Championship History
                    </p>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[var(--border-color)]">
                            <th className="py-1 text-left font-medium text-[var(--text-muted)]">Year</th>
                            <th className="py-1 text-left font-medium text-[var(--text-muted)]">Championship</th>
                            <th className="py-1 text-right font-medium text-[var(--text-muted)]">Finish</th>
                          </tr>
                        </thead>
                        <tbody>
                          {player.majorHistory.map((m, i) => (
                            <tr key={i} className="border-b border-[var(--border-color)] last:border-0">
                              <td className="py-1 text-[var(--text-secondary)]">{m.year}</td>
                              <td className="py-1 text-[var(--text-secondary)]">{m.championship}</td>
                              <td className={`py-1 text-right font-medium ${
                                m.finish === "1st" ? "text-masters-green" : "text-[var(--text-primary)]"
                              }`}>
                                {m.finish}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Head to Head */}
                {player.headToHead && player.headToHead.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Head-to-Head
                    </p>
                    <div className="space-y-1.5">
                      {player.headToHead.map((h, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md bg-white p-2 border border-[var(--border-color)]">
                          <span className="text-xs font-medium text-[var(--text-primary)]">{h.opponent}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs tabular-nums">
                              <span className="text-masters-green font-semibold">{h.wins}W</span>
                              <span className="text-[var(--text-muted)]"> - </span>
                              <span className="text-masters-red font-semibold">{h.losses}L</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scout Breakdown */}
                {scoutRanking && "scores" in scoutRanking && (
                  <ScoutBreakdownCard
                    scores={scoutRanking.scores}
                    explanations={"scoreExplanations" in scoutRanking ? (scoutRanking as any).scoreExplanations : undefined}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
