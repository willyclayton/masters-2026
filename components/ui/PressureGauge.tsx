"use client";

interface PressureGaugeProps {
  rating: number;
}

function getBarColor(rating: number): string {
  if (rating >= 80) return "bg-masters-green";
  if (rating >= 60) return "bg-yellow-400";
  return "bg-masters-red";
}

export function PressureGauge({ rating }: PressureGaugeProps) {
  const clamped = Math.max(0, Math.min(100, rating));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Pressure Rating
        </span>
        <span className="text-xs font-semibold tabular-nums text-[var(--text-primary)]">
          {clamped}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-masters-green-light">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
