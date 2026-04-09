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

function fmtTotal(n: number): string {
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : `${n}`;
}

function hasTeedOffThisRound(score: LivePlayerScore): boolean {
  return score.thru !== "-" && score.thru !== "" && score.thru !== null;
}

function holesPlayed(
  score: LivePlayerScore,
  currentRound: number
): number {
  // Completed prior rounds × 18 + holes in current round
  const priorRoundHoles = Math.max(0, (currentRound - 1) * 18);
  if (score.thru === "F") return priorRoundHoles + 18;
  if (!hasTeedOffThisRound(score)) return priorRoundHoles;
  const n = parseInt(score.thru, 10);
  return priorRoundHoles + (isNaN(n) ? 0 : n);
}

function thruDetail(score: LivePlayerScore, currentRound: number): string {
  const total = fmtTotal(score.totalScore);
  if (!hasTeedOffThisRound(score)) {
    return `${score.position} • ${total} • R${currentRound} not started`;
  }
  if (score.thru === "F") {
    return `${score.position} • ${total} • R${currentRound} F`;
  }
  return `${score.position} • ${total} • thru ${score.thru} (R${currentRound})`;
}

// ── Masters cut line ────────────────────────────────────────────
//
// Masters rule (since 2020): the top 50 players AND ties after 36 holes
// (round 2) make the cut. We compute this ourselves rather than relying on
// ESPN's per-player status field, which is frequently unpopulated.
//
// The result is also used for top-N / win markets — if the player is on the
// wrong side of the cut once R2 is final, those bets are dead too.

interface CutLine {
  line: number;        // total score (vs par) at the cut threshold
  final: boolean;      // true once R2 is complete
  active: boolean;     // true once we're in or past R2
}

export function computeCutLine(leaderboard: LiveLeaderboard | null): CutLine | null {
  if (!leaderboard) return null;
  if (leaderboard.currentRound < 2) return null;

  const eligible = leaderboard.players.filter(
    (p) => p.status !== "withdrawn"
  );
  if (eligible.length < 50) return null;

  // Only count players who have a meaningful score (i.e., have played some
  // golf). totalScore defaults to 0 for players who haven't started, which
  // would skew the line; treat unstarted players as worse than the field.
  const scored = eligible.filter(
    (p) => p.round1 !== null || p.thru !== "-"
  );
  const universe = scored.length >= 50 ? scored : eligible;

  const sorted = [...universe].sort((a, b) => a.totalScore - b.totalScore);
  const fiftieth = sorted[49];

  return {
    line: fiftieth.totalScore,
    final:
      leaderboard.currentRound > 2 ||
      (leaderboard.currentRound === 2 &&
        leaderboard.roundStatus === "complete"),
    active: true,
  };
}

function madeCutAgainst(score: LivePlayerScore, cut: CutLine): boolean {
  return score.totalScore <= cut.line;
}

// Blend AI baseline with positional confidence, weighted by tournament progress.
// Early in tournament: trust AI prob; late: trust position.
function blendTopN(
  baseProb: number,
  positionNum: number,
  N: number,
  holesPlayedTotal: number
): number {
  const progress = clamp(holesPlayedTotal / 72, 0, 1);
  let positional: number;
  if (positionNum <= N) {
    // Inside cutoff: 95% at #1, ~75% at #N
    positional = 75 + ((N - positionNum + 1) / Math.max(1, N)) * 20;
  } else {
    // Outside: exponential decay
    const over = positionNum - N;
    positional = Math.max(3, 45 * Math.exp(-over / Math.max(1, N)));
  }
  // Weight: 20% positional pre-tournament, up to 90% by R4 final hole
  const w = 0.2 + progress * 0.7;
  return clamp(baseProb * (1 - w) + positional * w, 0.5, 99);
}

export function evaluateLeg(
  leg: TrackedBetLeg,
  predMap: Record<string, PredEntry>,
  natProbs: Record<string, Record<string, number>>,
  leaderboard: LiveLeaderboard | null,
  currentRound: number,
  cut: CutLine | null
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

  const detail = thruDetail(score, currentRound);
  const teedOff = hasTeedOffThisRound(score);
  const totalHoles = holesPlayed(score, currentRound);

  // Cut decision (Masters: top 50 + ties after 36 holes). Computed from the
  // leaderboard, not from ESPN's per-player status field.
  const missedCut = cut?.final === true && !madeCutAgainst(score, cut);
  if (missedCut) {
    return {
      status: "lost",
      prob: 0,
      detail: `Missed cut (${fmtTotal(score.totalScore)})`,
      position: score.position,
      thru: score.thru,
    };
  }

  // ── Make Cut ──
  if (leg.market === "makeCut") {
    // R2 official: cut line is final → definitive made/missed.
    if (cut?.final) {
      return {
        status: "won",
        prob: 100,
        detail: `Made cut (${fmtTotal(score.totalScore)} ≤ ${fmtTotal(cut.line)})`,
        position: score.position,
        thru: score.thru,
      };
    }
    // Pre-R2 with no projection yet: use AI baseline.
    if (!cut) {
      if (!teedOff && currentRound === 1) {
        return { status: "live", prob: baseProb, detail, position: score.position, thru: score.thru };
      }
      const inCutZoneR1 = score.positionNum > 0 && score.positionNum <= 50;
      const adjusted = inCutZoneR1
        ? Math.min(99, baseProb * 1.1)
        : Math.max(20, baseProb * 0.8);
      return { status: "live", prob: adjusted, detail, position: score.position, thru: score.thru };
    }
    // R2 in progress: project against the live cut line. Distance from line
    // (in strokes) drives confidence — closer = more uncertain.
    const margin = cut.line - score.totalScore; // positive = inside cut zone
    // Sigmoid: margin 0 → 50%, +3 → ~85%, -3 → ~15%
    const projected = 100 / (1 + Math.exp(-margin * 0.7));
    // Blend with AI baseline (less weight on AI as more R2 holes are played).
    const r2Holes = clamp(totalHoles - 18, 0, 18);
    const w = 0.4 + (r2Holes / 18) * 0.5; // 0.4 → 0.9
    const blended = baseProb * (1 - w) + projected * w;
    return {
      status: "live",
      prob: clamp(blended, 1, 99),
      detail: `${detail} • cut ${fmtTotal(cut.line)}`,
      position: score.position,
      thru: score.thru,
    };
  }

  // ── Top N (5/10/20) ──
  const topN = TOP_N[leg.market];
  if (topN !== undefined) {
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
    // Pre-tee-off: don't apply position-based adjustment (their order is just where
    // ESPN sorts non-started players — usually toward the back).
    if (!teedOff && currentRound === 1) {
      return { status: "live", prob: baseProb, detail, position: score.position, thru: score.thru };
    }
    const adjusted = blendTopN(baseProb, score.positionNum, topN, totalHoles);
    return { status: "live", prob: adjusted, detail, position: score.position, thru: score.thru };
  }

  // ── Outright Win ──
  if (leg.market === "win") {
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
    if (!teedOff && currentRound === 1) {
      return { status: "live", prob: baseProb, detail, position: score.position, thru: score.thru };
    }
    // Mid-tournament: scale by current position + strokes back
    const leader = leaderboard.players.find((p) => p.positionNum === 1);
    const strokesBack =
      leader && score.totalScore !== undefined
        ? score.totalScore - leader.totalScore
        : 0;
    const progress = clamp(totalHoles / 72, 0, 1);
    const positionPenalty = Math.max(
      0.05,
      1 - score.positionNum * 0.04 - strokesBack * 0.06
    );
    const positional = baseProb * positionPenalty * 1.5;
    const w = 0.2 + progress * 0.7;
    const adjusted = clamp(baseProb * (1 - w) + positional * w, 0.2, 80);
    return { status: "live", prob: adjusted, detail, position: score.position, thru: score.thru };
  }

  // ── Nationality / Debutant / Former (no live adjustment) ──
  return { status: "live", prob: baseProb, detail, position: score.position, thru: score.thru };
}

// ── Bet aggregation ─────────────────────────────────────────────

export function evaluateBet(
  bet: TrackedBet,
  predMap: Record<string, PredEntry>,
  natProbs: Record<string, Record<string, number>>,
  leaderboard: LiveLeaderboard | null,
  cut: CutLine | null
): BetResult {
  const currentRound = leaderboard?.currentRound ?? 0;
  const legResults = bet.legs.map((leg) =>
    evaluateLeg(leg, predMap, natProbs, leaderboard, currentRound, cut)
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
