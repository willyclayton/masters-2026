import type {
  TrackedBet,
  TrackedBetLeg,
  TrackedBetMarket,
  LegResult,
  BetResult,
  PredictionsData,
  LiveLeaderboard,
  LivePlayerScore,
  Player,
} from "./types";

// ── Odds conversions ────────────────────────────────────────────

export function americanToDecimal(american: string): number {
  const n = parseInt(american.replace("+", ""), 10);
  if (isNaN(n)) return 1;
  return n > 0 ? 1 + n / 100 : 1 + 100 / Math.abs(n);
}

export function americanToImpliedProb(american: string): number {
  const n = parseInt(american.replace("+", ""), 10);
  if (isNaN(n)) return 0;
  return n > 0 ? (100 / (n + 100)) * 100 : (Math.abs(n) / (Math.abs(n) + 100)) * 100;
}

// ── AI probability lookup ───────────────────────────────────────

const COUNTRY_TO_NAT: Record<string, TrackedBetMarket> = {
  USA: "topAmerican",
  ENG: "topEuropean",
  SCO: "topEuropean",
  IRL: "topEuropean",
  NIR: "topEuropean",
  ESP: "topEuropean",
  FRA: "topEuropean",
  GER: "topEuropean",
  NOR: "topEuropean",
  SWE: "topEuropean",
  DEN: "topEuropean",
  AUT: "topEuropean",
  BEL: "topEuropean",
  POL: "topEuropean",
  JPN: "topAsian",
  KOR: "topAsian",
  AUS: "topAustralasian",
  NZL: "topAustralasian",
  FIJ: "topAustralasian",
  CHI: "topSouthAmerican",
  MEX: "topSouthAmerican",
};

interface PredEntry {
  winPct: number;
  top5Pct: number;
  top10Pct: number;
  makeCutPct: number;
}

function buildPredMap(predictions: PredictionsData): Record<string, PredEntry> {
  const map: Record<string, PredEntry> = {};
  for (const r of predictions.consensus.rankings) {
    map[r.name] = {
      winPct: r.winPct,
      top5Pct: r.top5Pct,
      top10Pct: r.top10Pct,
      makeCutPct: r.makeCutPct,
    };
  }
  return map;
}

function buildNatProbs(
  players: Player[],
  predMap: Record<string, PredEntry>
): Record<string, Record<string, number>> {
  const groups: Record<string, { name: string; winPct: number }[]> = {};
  for (const p of players) {
    const market = COUNTRY_TO_NAT[p.country];
    if (!market) continue;
    const winPct = predMap[p.name]?.winPct ?? 0.05;
    (groups[market] ||= []).push({ name: p.name, winPct });
  }
  const out: Record<string, Record<string, number>> = {};
  for (const [market, group] of Object.entries(groups)) {
    const total = group.reduce((s, g) => s + g.winPct, 0);
    out[market] = {};
    for (const g of group) {
      out[market][g.name] = total > 0 ? (g.winPct / total) * 100 : 0;
    }
  }
  return out;
}

function getAiProb(
  player: string,
  market: TrackedBetMarket,
  predMap: Record<string, PredEntry>,
  natProbs: Record<string, Record<string, number>>
): number | null {
  const pred = predMap[player];
  switch (market) {
    case "win":
      return pred?.winPct ?? null;
    case "top5":
      return pred?.top5Pct ?? null;
    case "top10":
      return pred?.top10Pct ?? null;
    case "top20":
      return pred ? (pred.top10Pct + pred.makeCutPct) / 2 : null;
    case "makeCut":
      return pred?.makeCutPct ?? null;
    case "topAmerican":
    case "topEuropean":
    case "topAsian":
    case "topAustralasian":
    case "topSouthAmerican":
      return natProbs[market]?.[player] ?? null;
    default:
      return null;
  }
}

// ── Live leg evaluation ─────────────────────────────────────────

const TOP_N: Partial<Record<TrackedBetMarket, number>> = {
  top5: 5,
  top10: 10,
  top20: 20,
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function findScore(
  player: string,
  leaderboard: LiveLeaderboard | null
): LivePlayerScore | null {
  if (!leaderboard) return null;
  return leaderboard.players.find((p) => p.name === player) ?? null;
}

function thruDetail(score: LivePlayerScore): string {
  if (score.thru === "F" || score.thru === "-") {
    return score.position;
  }
  return `${score.position} thru ${score.thru}`;
}

export function evaluateLeg(
  leg: TrackedBetLeg,
  predMap: Record<string, PredEntry>,
  natProbs: Record<string, Record<string, number>>,
  leaderboard: LiveLeaderboard | null,
  currentRound: number
): LegResult {
  const aiProb = getAiProb(leg.player, leg.market, predMap, natProbs);
  const impliedProb = americanToImpliedProb(leg.americanOdds);
  const baseProb = aiProb ?? impliedProb;

  const score = findScore(leg.player, leaderboard);

  // No live data → pre-tournament
  if (!score || !leaderboard || leaderboard.roundStatus === "not_started") {
    return {
      status: "live",
      prob: baseProb,
      detail: "Pre-tournament",
      position: score?.position ?? null,
      thru: score?.thru ?? null,
    };
  }

  const tournamentComplete =
    leaderboard.roundStatus === "complete" && currentRound >= 4;

  // Withdrawn or cut → most markets lost (except makeCut after cut applies separately)
  if (score.status === "withdrawn") {
    return {
      status: "lost",
      prob: 0,
      detail: "Withdrawn",
      position: score.position,
      thru: score.thru,
    };
  }

  // ── Make Cut ──
  if (leg.market === "makeCut") {
    if (score.status === "cut") {
      return { status: "lost", prob: 0, detail: "Missed cut", position: score.position, thru: score.thru };
    }
    // Cut is applied after R2. If we're past R2 and the player is still active, they made it.
    if (currentRound >= 3 || (currentRound === 2 && leaderboard.roundStatus === "complete")) {
      return { status: "won", prob: 100, detail: "Made cut", position: score.position, thru: score.thru };
    }
    // Mid R1/R2: blend AI prob with current standing relative to a notional cut line (~T50)
    const inCutZone = score.positionNum > 0 && score.positionNum <= 50;
    const adjusted = inCutZone ? Math.min(99, baseProb * 1.15) : Math.max(20, baseProb * 0.7);
    return {
      status: "live",
      prob: adjusted,
      detail: thruDetail(score),
      position: score.position,
      thru: score.thru,
    };
  }

  // ── Top N (5/10/20) ──
  const topN = TOP_N[leg.market];
  if (topN !== undefined) {
    if (score.status === "cut") {
      return { status: "lost", prob: 0, detail: "Missed cut", position: score.position, thru: score.thru };
    }
    if (tournamentComplete || score.status === "finished") {
      const inside = score.positionNum > 0 && score.positionNum <= topN;
      return {
        status: inside ? "won" : "lost",
        prob: inside ? 100 : 0,
        detail: `Finished ${score.position}`,
        position: score.position,
        thru: score.thru,
      };
    }
    const insideNow = score.positionNum > 0 && score.positionNum <= topN;
    const adjusted = insideNow
      ? clamp(baseProb * 1.6, 25, 95)
      : clamp(baseProb * 0.55, 2, 60);
    return {
      status: "live",
      prob: adjusted,
      detail: thruDetail(score),
      position: score.position,
      thru: score.thru,
    };
  }

  // ── Outright Win ──
  if (leg.market === "win") {
    if (score.status === "cut") {
      return { status: "lost", prob: 0, detail: "Missed cut", position: score.position, thru: score.thru };
    }
    if (tournamentComplete || score.status === "finished") {
      const won = score.positionNum === 1;
      return {
        status: won ? "won" : "lost",
        prob: won ? 100 : 0,
        detail: `Finished ${score.position}`,
        position: score.position,
        thru: score.thru,
      };
    }
    // Mid-tournament: scale by current position
    const leader = leaderboard.players.find((p) => p.positionNum === 1);
    const strokesBack =
      leader && score.totalScore !== undefined ? score.totalScore - leader.totalScore : 0;
    const positionPenalty = Math.max(0.1, 1 - score.positionNum * 0.06 - strokesBack * 0.08);
    const adjusted = clamp(baseProb * Math.max(0.1, positionPenalty * 1.5), 0.5, 80);
    return {
      status: "live",
      prob: adjusted,
      detail: thruDetail(score),
      position: score.position,
      thru: score.thru,
    };
  }

  // ── Nationality / Debutant / Former (no live adjustment) ──
  if (score.status === "cut") {
    return { status: "lost", prob: 0, detail: "Missed cut", position: score.position, thru: score.thru };
  }
  return {
    status: "live",
    prob: baseProb,
    detail: thruDetail(score),
    position: score.position,
    thru: score.thru,
  };
}

// ── Bet aggregation ─────────────────────────────────────────────

export function evaluateBet(
  bet: TrackedBet,
  predMap: Record<string, PredEntry>,
  natProbs: Record<string, Record<string, number>>,
  leaderboard: LiveLeaderboard | null
): BetResult {
  const currentRound = leaderboard?.currentRound ?? 0;
  const legResults = bet.legs.map((leg) =>
    evaluateLeg(leg, predMap, natProbs, leaderboard, currentRound)
  );

  let legsWon = 0;
  let legsLost = 0;
  let legsLive = 0;
  for (const r of legResults) {
    if (r.status === "won") legsWon++;
    else if (r.status === "lost") legsLost++;
    else legsLive++;
  }

  let status: BetResult["status"] = "live";
  let overallProb: number;

  if (legsLost > 0) {
    status = "lost";
    overallProb = 0;
  } else if (legsLive === 0) {
    status = "won";
    overallProb = 100;
  } else {
    // Combine probabilities: won legs contribute 1.0, live legs multiply.
    overallProb =
      legResults.reduce((acc, r) => {
        const p = r.status === "won" ? 1 : r.prob / 100;
        return acc * p;
      }, 1) * 100;
  }

  return { status, overallProb, legResults, legsWon, legsLost, legsLive };
}

// ── Top-level helpers ───────────────────────────────────────────

export function buildEvaluators(
  predictions: PredictionsData,
  players: Player[]
) {
  const predMap = buildPredMap(predictions);
  const natProbs = buildNatProbs(players, predMap);
  return { predMap, natProbs };
}

export interface BetsSummary {
  totalStaked: number;
  totalPotential: number;
  liveExpectedReturn: number; // sum of (potential × prob) for live + realized wins − stakes lost
  liveCount: number;
  wonCount: number;
  lostCount: number;
  realizedProfit: number;
}

export function summarizeBets(
  bets: TrackedBet[],
  results: BetResult[]
): BetsSummary {
  let totalStaked = 0;
  let totalPotential = 0;
  let liveExpectedReturn = 0;
  let liveCount = 0;
  let wonCount = 0;
  let lostCount = 0;
  let realizedProfit = 0;

  bets.forEach((bet, i) => {
    const r = results[i];
    totalStaked += bet.stake;
    totalPotential += bet.potentialPayout;
    if (r.status === "won") {
      wonCount++;
      realizedProfit += bet.potentialPayout - bet.stake;
      liveExpectedReturn += bet.potentialPayout;
    } else if (r.status === "lost") {
      lostCount++;
      realizedProfit -= bet.stake;
    } else {
      liveCount++;
      liveExpectedReturn += (bet.potentialPayout * r.overallProb) / 100;
    }
  });

  return {
    totalStaked,
    totalPotential,
    liveExpectedReturn,
    liveCount,
    wonCount,
    lostCount,
    realizedProfit,
  };
}
