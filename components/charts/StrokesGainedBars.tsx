import type { StrokesGained } from "@/lib/types";

interface StrokesGainedBarsProps {
  sg: StrokesGained;
}

const categories: { key: keyof Omit<StrokesGained, "total">; label: string }[] = [
  { key: "offTheTee", label: "Off the Tee" },
  { key: "approach", label: "Approach" },
  { key: "aroundGreen", label: "Around Green" },
  { key: "putting", label: "Putting" },
];

export function StrokesGainedBars({ sg }: StrokesGainedBarsProps) {
  const maxVal = Math.max(
    ...categories.map((c) => Math.abs(sg[c.key])),
    1.5
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Strokes Gained
        </p>
        <p className="text-xs font-semibold text-masters-green">
          Total: {sg.total > 0 ? "+" : ""}
          {sg.total.toFixed(2)}
        </p>
      </div>
      {categories.map((cat) => {
        const val = sg[cat.key];
        const pct = (Math.abs(val) / maxVal) * 50;
        const isPositive = val >= 0;

        return (
          <div key={cat.key} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-xs text-[var(--text-muted)]">
              {cat.label}
            </span>
            <div className="relative h-3 flex-1">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 h-full w-px bg-[var(--border-color)]" />
              {/* Bar */}
              <div
                className={`absolute top-0 h-full rounded-sm transition-all ${
                  isPositive ? "bg-masters-green" : "bg-masters-red"
                }`}
                style={{
                  left: isPositive ? "50%" : `${50 - pct}%`,
                  width: `${pct}%`,
                }}
              />
            </div>
            <span
              className={`w-10 text-right text-xs font-medium tabular-nums ${
                isPositive ? "text-masters-green" : "text-masters-red"
              }`}
            >
              {val > 0 ? "+" : ""}
              {val.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
