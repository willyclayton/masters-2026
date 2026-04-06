import type { MomentumResult } from "@/lib/types";

interface MomentumDotsProps {
  results: MomentumResult[];
}

function getColor(result: MomentumResult): string {
  if (result === "W") return "bg-masters-green";
  if (["T2", "T3", "T5", "T10"].includes(result)) return "bg-emerald-400";
  if (["T15", "T20", "T25"].includes(result)) return "bg-yellow-400";
  if (["MC", "CUT"].includes(result)) return "bg-gray-300";
  if (result === "WD") return "bg-masters-red";
  return "bg-gray-200";
}

export function MomentumDots({ results }: MomentumDotsProps) {
  return (
    <div className="flex items-center gap-1">
      {results.map((result, i) => (
        <div
          key={i}
          className={`h-2.5 w-2.5 rounded-full ${getColor(result)}`}
          title={result}
        />
      ))}
    </div>
  );
}
