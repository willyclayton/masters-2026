import type { ModelPrediction } from "@/lib/types";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";

interface ModelCardProps {
  modelName: string;
  emoji: string;
  description: string;
  methodology: string;
  topPick: ModelPrediction & { initials?: string };
  top5: (ModelPrediction & { initials?: string })[];
}

export function ModelCard({
  modelName,
  emoji,
  description,
  methodology,
  topPick,
  top5,
}: ModelCardProps) {
  return (
    <div className="min-w-[280px] flex-1 rounded-lg border border-[var(--border-color)] bg-white p-5 snap-start">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <div>
          <h3 className="font-heading text-base font-bold text-[var(--text-primary)]">
            {modelName}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">{description}</p>
        </div>
      </div>

      <div className="mb-4 rounded-md bg-masters-green-light p-3">
        <p className="mb-1 text-xs font-medium text-masters-green">
          #1 Pick
        </p>
        <div className="flex items-center gap-2">
          <InitialsAvatar
            initials={topPick.initials || topPick.name.split(" ").map(n => n[0]).join("")}
            size="sm"
          />
          <div>
            <p className="font-medium text-[var(--text-primary)]">
              {topPick.name}
            </p>
            <p className="text-sm font-semibold tabular-nums text-masters-green">
              {topPick.winPct.toFixed(1)}% win
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="mb-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Top 5
        </p>
        <ol className="space-y-1.5">
          {top5.map((player, i) => (
            <li
              key={player.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 text-xs text-[var(--text-muted)]">
                  {i + 1}.
                </span>
                <span className="text-[var(--text-primary)]">{player.name}</span>
              </span>
              <span className="tabular-nums text-xs text-[var(--text-secondary)]">
                {player.winPct.toFixed(1)}%
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-xs leading-relaxed text-[var(--text-muted)]">
        {methodology}
      </p>
    </div>
  );
}
