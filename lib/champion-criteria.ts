import type { Player } from "./types";

export type CriteriaKey =
  | "top25"
  | "top15"
  | "top10"
  | "age27to36"
  | "notDebut"
  | "priorStarts3"
  | "lastCutMade"
  | "recentTop10"
  | "multipleTop10s"
  | "madeCut2025"
  | "priorMastersTop10"
  | "notDefending"
  | "seasonWin"
  | "top30T2G"
  | "playedUSA"
  | "noWithdrawal";

export const ALL_CRITERIA: CriteriaKey[] = [
  "top25",
  "top15",
  "top10",
  "age27to36",
  "notDebut",
  "priorStarts3",
  "lastCutMade",
  "recentTop10",
  "multipleTop10s",
  "madeCut2025",
  "priorMastersTop10",
  "notDefending",
  "seasonWin",
  "top30T2G",
  "playedUSA",
  "noWithdrawal",
];

export const CRITERIA_LABELS: Record<CriteriaKey, string> = {
  top25: "Top 25 in the world",
  top15: "Top 15 in the world",
  top10: "Top 10 in the world",
  age27to36: "Aged 27–36",
  notDebut: "Not a Masters debutant",
  priorStarts3: "3+ prior Masters starts",
  lastCutMade: "Made the cut in last start",
  recentTop10: "Recent Top 10 finish",
  multipleTop10s: "Multiple Top 10s this season",
  madeCut2025: "Made the cut at 2025 Masters",
  priorMastersTop10: "Prior Top 10 at Augusta",
  notDefending: "Not the defending champion",
  seasonWin: "Won an event this season",
  top30T2G: "Top 30 Tee-to-Green",
  playedUSA: "Played in the USA this year",
  noWithdrawal: "No withdrawal in last start",
};

const TOP_10_FINISHES = new Set([
  "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th",
  "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10",
]);

const MADE_CUT_RESULTS = new Set([
  "W", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10",
  "T15", "T20", "T25", "T30", "T40", "T50", "T60",
]);

function isTop10Momentum(result: string): boolean {
  return ["W", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"].includes(result);
}

export interface PlayerCriteriaResult {
  name: string;
  initials: string;
  worldRanking: number;
  country: string;
  age: number;
  criteria: Record<CriteriaKey, boolean>;
  matchCount: number;
  matchPct: number;
}

export function evaluatePlayer(
  player: Player,
  t2gRank: number
): PlayerCriteriaResult {
  const lastResult = player.momentumLast5?.[0];
  const recentThree = player.momentumLast5?.slice(0, 3) ?? [];

  // Check 2025 Masters history
  const masters2025 = player.mastersHistory?.find((h) => h.year === 2025);
  const madeCut2025 =
    masters2025 != null &&
    masters2025.finish !== "MC" &&
    masters2025.finish !== "CUT" &&
    masters2025.finish !== "WD";
  const isDefending = masters2025?.finish === "1st";
  const hasPriorTop10 = player.mastersHistory?.some((h) =>
    TOP_10_FINISHES.has(h.finish)
  ) ?? false;

  const criteria: Record<CriteriaKey, boolean> = {
    top25: player.worldRanking <= 25,
    top15: player.worldRanking <= 15,
    top10: player.worldRanking <= 10,
    age27to36: player.age >= 27 && player.age <= 36,
    notDebut: player.mastersAppearances > 1,
    priorStarts3: player.mastersAppearances >= 4,
    lastCutMade: lastResult != null && MADE_CUT_RESULTS.has(lastResult),
    recentTop10: recentThree.some(isTop10Momentum),
    multipleTop10s: (player.season2026?.top10s ?? 0) >= 2,
    madeCut2025: madeCut2025,
    priorMastersTop10: hasPriorTop10,
    notDefending: !isDefending,
    seasonWin: (player.season2026?.wins ?? 0) >= 1,
    top30T2G: t2gRank <= 30,
    playedUSA: !player.isLIV || player.country === "USA",
    noWithdrawal: lastResult !== "WD",
  };

  const matchCount = Object.values(criteria).filter(Boolean).length;
  const matchPct = Math.round((matchCount / ALL_CRITERIA.length) * 100);

  return {
    name: player.name,
    initials: player.initials,
    worldRanking: player.worldRanking,
    country: player.country,
    age: player.age,
    criteria,
    matchCount,
    matchPct,
  };
}

export function evaluateAllPlayers(players: Player[]): PlayerCriteriaResult[] {
  // Calculate Tee-to-Green rankings (SG: off-tee + approach + around-green)
  const withT2G = players.map((p) => ({
    player: p,
    t2g:
      (p.strokesGained?.offTheTee ?? 0) +
      (p.strokesGained?.approach ?? 0) +
      (p.strokesGained?.aroundGreen ?? 0),
  }));

  // Sort by T2G descending to assign ranks
  const sorted = [...withT2G].sort((a, b) => b.t2g - a.t2g);
  const rankMap = new Map<string, number>();
  sorted.forEach((entry, i) => {
    rankMap.set(entry.player.name, i + 1);
  });

  // Evaluate each player
  const results = players.map((p) =>
    evaluatePlayer(p, rankMap.get(p.name) ?? 999)
  );

  // Sort by match count desc, then world ranking asc
  results.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return a.worldRanking - b.worldRanking;
  });

  return results;
}
