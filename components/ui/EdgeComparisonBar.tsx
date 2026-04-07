"use client";

interface EdgeComparisonBarProps {
  dkProb: number;
  aiProb: number;
  maxValue?: number;
}

export function EdgeComparisonBar({
  dkProb,
  aiProb,
  maxValue = 100,
}: EdgeComparisonBarProps) {
  const dkWidth = Math.min((dkProb / maxValue) * 100, 100);
  const aiWidth = Math.min((aiProb / maxValue) * 100, 100);
  const edge = aiProb - dkProb;
  const isPositive = edge > 0;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="w-8 shrink-0 text-[10px] font-medium text-[var(--text-muted)]">
          DK
        </span>
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gray-300 transition-all"
            style={{ width: `${dkWidth}%` }}
          />
        </div>
        <span className="w-12 shrink-0 text-right text-xs font-medium text-[var(--text-secondary)]">
          {dkProb.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-8 shrink-0 text-[10px] font-medium text-masters-green">
          AI
        </span>
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all ${
              isPositive ? "bg-masters-green" : "bg-masters-red"
            }`}
            style={{ width: `${aiWidth}%` }}
          />
        </div>
        <span
          className={`w-12 shrink-0 text-right text-xs font-bold ${
            isPositive ? "text-masters-green" : "text-masters-red"
          }`}
        >
          {aiProb.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
