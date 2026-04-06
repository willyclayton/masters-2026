import type { PredictionsData } from "@/lib/types";

interface ModelAgreementProps {
  predictions: PredictionsData;
}

export function ModelAgreement({ predictions }: ModelAgreementProps) {
  const simTop = predictions.simulator.rankings[0]?.name;
  const scoutTop = predictions.scout.rankings[0]?.name;
  const analystTop = predictions.analyst.rankings[0]?.name;

  const allAgree = simTop === scoutTop && scoutTop === analystTop;
  const twoAgree =
    simTop === scoutTop || simTop === analystTop || scoutTop === analystTop;

  const models = [
    { emoji: "🎲", name: "Simulator", pick: simTop },
    { emoji: "🔍", name: "Scout", pick: scoutTop },
    { emoji: "🧠", name: "Analyst", pick: analystTop },
  ];

  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Model Agreement
        </h3>
        {allAgree ? (
          <span className="rounded-full bg-masters-green px-2 py-0.5 text-xs font-medium text-white">
            Unanimous
          </span>
        ) : twoAgree ? (
          <span className="rounded-full bg-masters-gold-light px-2 py-0.5 text-xs font-medium text-masters-gold">
            2 of 3 Agree
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
            Split Decision
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {models.map((model) => (
          <div key={model.name} className="flex items-center gap-1.5">
            <span className="text-base">{model.emoji}</span>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{model.name}</p>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {model.pick}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
