"use client";

import type { ScoreExplanations } from "@/lib/types";

interface ScoutBreakdownCardProps {
  scores: {
    momentum: number;
    augustaExperience: number;
    majorClutch: number;
    weatherFit: number;
    intangibles: number;
    total: number;
  };
  explanations?: ScoreExplanations;
}

const dimensions: { key: keyof Omit<ScoutBreakdownCardProps["scores"], "total">; label: string }[] = [
  { key: "momentum", label: "Momentum" },
  { key: "augustaExperience", label: "Augusta Experience" },
  { key: "majorClutch", label: "Major Clutch" },
  { key: "weatherFit", label: "Weather Fit" },
  { key: "intangibles", label: "Intangibles" },
];

export function ScoutBreakdownCard({ scores, explanations }: ScoutBreakdownCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Scout Breakdown
        </p>
        <p className="text-xs font-semibold text-masters-green">
          Total: {scores.total}
        </p>
      </div>
      {dimensions.map((dim) => {
        const value = Math.max(0, Math.min(100, scores[dim.key]));
        const explanationKey = dim.key as keyof ScoreExplanations;

        return (
          <div key={dim.key} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-32 shrink-0 text-xs text-[var(--text-muted)]">
                {dim.label}
              </span>
              <div className="h-2 flex-1 rounded-full bg-masters-green-light">
                <div
                  className="h-full rounded-full bg-masters-green transition-all duration-500"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-[var(--text-primary)]">
                {scores[dim.key]}
              </span>
            </div>
            {explanations?.[explanationKey] && (
              <p className="pl-32 text-[10px] leading-tight text-[var(--text-secondary)]">
                {explanations[explanationKey]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
