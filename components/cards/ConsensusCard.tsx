"use client";

import { useState } from "react";
import type { ConsensusPrediction } from "@/lib/types";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
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
    <div className="relative overflow-hidden rounded-lg border-l-4 border-masters-gold bg-white p-6 shadow-sm">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-masters-gold-light opacity-50" />

      <div className="relative">
        <Badge
          variant="secondary"
          className="mb-4 bg-masters-gold-light text-masters-gold"
        >
          AI Consensus Pick
        </Badge>

        <div className="flex items-start gap-4">
          <InitialsAvatar initials={initials} size="lg" />
          <div className="flex-1">
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
              {prediction.name}
            </h2>

            <div className="mt-3 flex items-baseline gap-3">
              <CountUpNumber
                end={prediction.winPct}
                className="text-4xl font-bold text-masters-green md:text-5xl"
              />
              <span className="text-sm text-[var(--text-muted)]">
                win probability
              </span>
            </div>

            <div className="mt-2 flex gap-4">
              <div>
                <span className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
                  {prediction.top5Pct.toFixed(1)}%
                </span>
                <span className="ml-1 text-xs text-[var(--text-muted)]">
                  Top 5
                </span>
              </div>
              <div>
                <span className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
                  {prediction.top10Pct.toFixed(1)}%
                </span>
                <span className="ml-1 text-xs text-[var(--text-muted)]">
                  Top 10
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm italic text-[var(--text-secondary)] line-clamp-3">
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

            {/* Why They Will Win - Collapsible */}
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
      </div>
    </div>
  );
}
