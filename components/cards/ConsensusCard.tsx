"use client";

import { useState } from "react";
import type { ConsensusPrediction } from "@/lib/types";
import { ScoreboardTile } from "@/components/ui/ScoreboardTile";
import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { ShareButton } from "@/components/ui/ShareButton";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface ConsensusCardProps {
  prediction: ConsensusPrediction;
  initials: string;
}

export function ConsensusCard({ prediction, initials }: ConsensusCardProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg">
      {/* Green board top section */}
      <div className="board-surface px-6 pt-5 pb-4">
        <div className="relative flex items-center gap-3 mb-4">
          <Badge
            variant="secondary"
            className="bg-[#C8A951]/20 text-[#C8A951] border border-[#C8A951]/30"
          >
            AI Consensus Pick
          </Badge>
          <span className="text-[10px] tracking-widest uppercase text-white/40">
            #1 Predicted
          </span>
        </div>

        <div className="relative flex items-start gap-4">
          {/* Position tile */}
          <ScoreboardTile size="xl" variant="red" rotation={-1.5} animated delay={0}>
            1
          </ScoreboardTile>

          <div className="flex-1">
            {/* Nameplate */}
            <div className="nameplate relative inline-block px-4 py-2 mb-3" style={{ transform: "rotate(0.3deg)" }}>
              <span className="text-xl font-black tracking-wider uppercase text-[#1a1a1a] md:text-2xl"
                style={{ fontFamily: "var(--font-heading), serif" }}>
                {prediction.name}
              </span>
            </div>

            {/* Stats as tiles */}
            <div className="flex flex-wrap items-end gap-3 mt-1">
              <div className="flex flex-col items-center gap-1">
                <ScoreboardTile size="lg" variant="red" rotation={0.5} animated delay={200}>
                  <CountUpNumber
                    end={prediction.winPct}
                    className="text-inherit font-inherit"
                  />
                </ScoreboardTile>
                <span className="text-[9px] font-semibold tracking-wider uppercase text-white/50">Win %</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ScoreboardTile size="md" variant="red" rotation={-0.8} animated delay={320}>
                  {prediction.top5Pct.toFixed(1)}
                </ScoreboardTile>
                <span className="text-[9px] font-semibold tracking-wider uppercase text-white/50">Top 5</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ScoreboardTile size="md" variant="default" rotation={0.6} animated delay={440}>
                  {prediction.top10Pct.toFixed(1)}
                </ScoreboardTile>
                <span className="text-[9px] font-semibold tracking-wider uppercase text-white/50">Top 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* White analysis section below */}
      <div className="bg-white border border-t-0 border-[var(--border-color)] rounded-b-lg px-6 py-4">
        <p className="text-sm italic text-[var(--text-secondary)] line-clamp-3">
          &ldquo;{prediction.rationale}&rdquo;
        </p>

        {/* Scenario Analysis */}
        {prediction.scenarioAnalysis && (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-md bg-masters-green-light p-2">
              <p className="text-[10px] font-medium uppercase text-masters-green">Best Case</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{prediction.scenarioAnalysis.bestCase}</p>
            </div>
            <div className="rounded-md bg-gray-50 p-2">
              <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">Most Likely</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{prediction.scenarioAnalysis.mostLikely}</p>
            </div>
            <div className="rounded-md bg-red-50 p-2">
              <p className="text-[10px] font-medium uppercase text-masters-red">Worst Case</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{prediction.scenarioAnalysis.worstCase}</p>
            </div>
          </div>
        )}

        {/* Why They Will Win */}
        {prediction.whyTheyWillWin && (
          <div className="mt-4">
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="flex items-center gap-1 text-xs font-medium text-masters-green hover:underline"
            >
              {showAnalysis ? "Hide" : "Read"} Full Analysis
              <ChevronDown className={`h-3 w-3 transition-transform ${showAnalysis ? "rotate-180" : ""}`} />
            </button>
            {showAnalysis && (
              <div className="mt-2 rounded-md bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {prediction.whyTheyWillWin}
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <ShareButton
            playerName={prediction.name}
            winPct={prediction.winPct}
          />
        </div>
      </div>
    </div>
  );
}
