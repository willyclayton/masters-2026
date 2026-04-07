import type { ModelPrediction } from "@/lib/types";
import { ScoreboardTile } from "@/components/ui/ScoreboardTile";

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
    <div className="min-w-[280px] flex-1 rounded-lg overflow-hidden shadow-sm snap-start border border-[var(--border-color)]">
      {/* Green board header */}
      <div className="board-surface px-4 py-3">
        <div className="relative flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {modelName}
            </h3>
            <p className="text-[10px] text-white/50">{description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4">
        {/* #1 Pick as tile */}
        <div className="mb-4 rounded-md bg-[var(--bg-primary)] p-3">
          <p className="mb-2 text-[10px] font-bold tracking-wider uppercase text-masters-green">
            #1 Pick
          </p>
          <div className="flex items-center gap-3">
            <ScoreboardTile size="md" variant="red" rotation={-0.8}>
              1
            </ScoreboardTile>
            <div>
              <p className="font-bold text-[var(--text-primary)] uppercase tracking-wide text-sm">
                {topPick.name}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <ScoreboardTile size="xs" variant="red" rotation={0.5}>
                  {topPick.winPct.toFixed(1)}
                </ScoreboardTile>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
                  win %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 */}
        <div className="mb-3">
          <p className="mb-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Top 5
          </p>
          <ol className="space-y-1.5">
            {top5.map((player, i) => (
              <li
                key={player.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <ScoreboardTile
                    size="xs"
                    variant={i < 3 ? "red" : "default"}
                    rotation={[0.5, -0.3, 0.8, -0.5, 0.4][i]}
                  >
                    {i + 1}
                  </ScoreboardTile>
                  <span className="text-[var(--text-primary)] text-xs font-medium uppercase tracking-wide">
                    {player.name}
                  </span>
                </span>
                <span className="tabular-nums text-xs font-semibold text-[var(--text-secondary)]">
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
    </div>
  );
}
