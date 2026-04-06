interface WinProbBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function WinProbBar({
  value,
  max = 25,
  label,
  showValue = true,
  className = "",
}: WinProbBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="w-16 shrink-0 text-xs text-[var(--text-muted)]">
          {label}
        </span>
      )}
      <div className="h-2 flex-1 rounded-full bg-masters-green-light">
        <div
          className="h-full rounded-full bg-masters-green transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums text-[var(--text-primary)]">
          {value.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
