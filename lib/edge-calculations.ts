import type {
  BetMarket,
  BettingOddsData,
  BettingEdgeResult,
  PredictionsData,
  Player,
  PlayerTag,
  ParlayCombo,
  ParlayLeg,
  WeatherEdgeBet,
  LiveEdge,
  RoundPropOdds,
} from "./types";

const MARKET_LABELS: Record<BetMarket, string> = {
  win: "To Win",
  top5: "Top 5",
  top10: "Top 10",
  top20: "Top 20",
  makeCut: "Make Cut",
  topAmerican: "Top American",
  topEuropean: "Top European",
  topAsian: "Top Asian",
  topAustralasian: "Top Australasian",
  topSouthAmerican: "Top South American",
};

const COUNTRY_TO_NAT_MARKET: Record<string, BetMarket> = {
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

type PredictionMap = Record<
  string,
  {
    winPct: number;
    top5Pct: number;
    top10Pct: number;
    makeCutPct: number;
    simulatorRank: number;
    scoutRank: number;
    analystRank: number;
  }
>;

function buildPredictionMap(predictions: PredictionsData): PredictionMap {
  const map: PredictionMap = {};
  for (const r of predictions.consensus.rankings) {
    map[r.name] = {
      winPct: r.winPct,
      top5Pct: r.top5Pct,
      top10Pct: r.top10Pct,
      makeCutPct: r.makeCutPct,
      simulatorRank: r.simulatorRank,
      scoutRank: r.scoutRank,
      analystRank: r.analystRank,
    };
  }
  return map;
}

function getAiProbForMarket(
  pred: PredictionMap[string],
  market: BetMarket,
  playerName: string,
  natGroupProbs: Record<string, Record<string, number>>
): number | null {
  switch (market) {
    case "win":
      return pred.winPct;
    case "top5":
      return pred.top5Pct;
    case "top10":
      return pred.top10Pct;
    case "top20":
      return (pred.top10Pct + pred.makeCutPct) / 2;
    case "makeCut":
      return pred.makeCutPct;
    case "topAmerican":
    case "topEuropean":
    case "topAsian":
    case "topAustralasian":
    case "topSouthAmerican":
      return natGroupProbs[market]?.[playerName] ?? null;
    default:
      return null;
  }
}

function computeNationalityProbs(
  players: Player[],
  predMap: PredictionMap
): Record<string, Record<string, number>> {
  // Group players by nationality market
  const groups: Record<string, { name: string; winPct: number }[]> = {};

  for (const p of players) {
    const market = COUNTRY_TO_NAT_MARKET[p.country];
    if (!market) continue;
    const pred = predMap[p.name];
    const winPct = pred ? pred.winPct : 0.05;
    if (!groups[market]) groups[market] = [];
    groups[market].push({ name: p.name, winPct });
  }

  // For each group, compute relative probability of being best in group
  const result: Record<string, Record<string, number>> = {};
  for (const [market, group] of Object.entries(groups)) {
    const total = group.reduce((s, g) => s + g.winPct, 0);
    result[market] = {};
    for (const g of group) {
      result[market][g.name] = total > 0 ? (g.winPct / total) * 100 : 0;
    }
  }

  return result;
}

function getConfidence(
  pred: PredictionMap[string]
): "high" | "medium" | "low" {
  const ranks = [pred.simulatorRank, pred.scoutRank, pred.analystRank];
  const spread = Math.max(...ranks) - Math.min(...ranks);
  if (spread <= 3) return "high";
  if (spread <= 8) return "medium";
  return "low";
}

export function calculateAllEdges(
  bettingData: BettingOddsData,
  predictions: PredictionsData,
  players: Player[]
): BettingEdgeResult[] {
  const predMap = buildPredictionMap(predictions);
  const natProbs = computeNationalityProbs(players, predMap);
  const playerLookup: Record<string, Player> = {};
  for (const p of players) playerLookup[p.name] = p;

  const edges: BettingEdgeResult[] = [];

  for (const bp of bettingData.players) {
    const player = playerLookup[bp.name];
    const pred = predMap[bp.name];
    if (!player) continue;

    for (const [marketKey, marketOdds] of Object.entries(bp.odds)) {
      const market = marketKey as BetMarket;
      if (!marketOdds) continue;

      const aiProb = pred
        ? getAiProbForMarket(pred, market, bp.name, natProbs)
        : null;

      if (aiProb === null) continue;

      const edge = aiProb - marketOdds.impliedProb;
      const edgePct =
        marketOdds.impliedProb > 0
          ? (edge / marketOdds.impliedProb) * 100
          : 0;

      // EV per $100: (aiProb * payout) - ((1-aiProb) * stake)
      // = (aiProb/100 * (decimal-1) * 100) - ((1-aiProb/100) * 100)
      // Simplified: (aiProb * decimal) - 100
      const ev100 =
        Math.round(((aiProb / 100) * marketOdds.decimal * 100 - 100) * 10) /
        10;

      edges.push({
        playerName: bp.name,
        initials: player.initials,
        worldRanking: player.worldRanking,
        country: player.country,
        market,
        marketLabel: MARKET_LABELS[market],
        dkImpliedProb: marketOdds.impliedProb,
        aiProb: Math.round(aiProb * 10) / 10,
        edge: Math.round(edge * 10) / 10,
        edgePct: Math.round(edgePct * 10) / 10,
        americanOdds: marketOdds.american,
        decimalOdds: marketOdds.decimal,
        movement: marketOdds.movement,
        confidence: pred ? getConfidence(pred) : "low",
        tags: player.tags,
        ev100,
      });
    }
  }

  return edges;
}

export function getTopValueBets(
  edges: BettingEdgeResult[],
  count: number = 10
): BettingEdgeResult[] {
  return edges
    .filter((e) => e.edge > 0)
    .sort((a, b) => b.edge - a.edge)
    .slice(0, count);
}

export function getEdgesForPlayer(
  edges: BettingEdgeResult[],
  playerName: string
): BettingEdgeResult[] {
  const lower = playerName.toLowerCase();
  return edges.filter((e) => e.playerName.toLowerCase().includes(lower));
}

export function getEdgesForMarket(
  edges: BettingEdgeResult[],
  market: BetMarket
): BettingEdgeResult[] {
  return edges.filter((e) => e.market === market);
}

export function getEdgeLabel(
  edge: number
): { label: string; color: string } {
  if (edge > 10) return { label: "STRONG VALUE", color: "strong" };
  if (edge > 5) return { label: "VALUE", color: "value" };
  if (edge > 2) return { label: "SLIGHT EDGE", color: "slight" };
  if (edge >= 0) return { label: "NEUTRAL", color: "neutral" };
  return { label: "OVERVALUED", color: "overvalued" };
}

export const NATIONALITY_MARKETS: BetMarket[] = [
  "topAmerican",
  "topEuropean",
  "topAsian",
  "topAustralasian",
  "topSouthAmerican",
];

export const FINISH_MARKETS: BetMarket[] = [
  "win",
  "top5",
  "top10",
  "top20",
  "makeCut",
];

// ── EV helpers ──────────────────────────────────────────────────

export function calculateEV100(aiProb: number, decimalOdds: number): number {
  return Math.round(((aiProb / 100) * decimalOdds * 100 - 100) * 10) / 10;
}

export function formatEV(ev: number): string {
  return (ev >= 0 ? "+$" : "-$") + Math.abs(ev).toFixed(2);
}

// ── Parlay Builder ──────────────────────────────────────────────

function decimalToAmerican(decimal: number): string {
  if (decimal >= 2) return "+" + Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1)).toString();
}

export function buildParlayFromLegs(legs: ParlayLeg[]): Omit<ParlayCombo, "id" | "name" | "category"> {
  const combinedDecimalOdds = legs.reduce((acc, l) => acc * l.decimalOdds, 1);
  const combinedDkProb = legs.reduce((acc, l) => acc * (l.dkImpliedProb / 100), 1) * 100;
  const combinedAiProb = legs.reduce((acc, l) => acc * (l.aiProb / 100), 1) * 100;
  const combinedEdge = combinedAiProb - combinedDkProb;
  const ev100 = calculateEV100(combinedAiProb, combinedDecimalOdds);

  return {
    legs,
    combinedDecimalOdds: Math.round(combinedDecimalOdds * 100) / 100,
    combinedAmericanOdds: decimalToAmerican(Math.round(combinedDecimalOdds * 100) / 100),
    combinedDkProb: Math.round(combinedDkProb * 100) / 100,
    combinedAiProb: Math.round(combinedAiProb * 100) / 100,
    combinedEdge: Math.round(combinedEdge * 100) / 100,
    ev100,
  };
}

export function generateAiParlays(edges: BettingEdgeResult[]): ParlayCombo[] {
  const positive = edges
    .filter((e) => e.edge > 1.5)
    .sort((a, b) => b.edge - a.edge);

  if (positive.length < 2) return [];

  const toLeg = (e: BettingEdgeResult): ParlayLeg => ({
    playerName: e.playerName,
    initials: e.initials,
    market: e.market,
    marketLabel: e.marketLabel,
    americanOdds: e.americanOdds,
    decimalOdds: e.decimalOdds,
    dkImpliedProb: e.dkImpliedProb,
    aiProb: e.aiProb,
    edge: e.edge,
  });

  const parlays: ParlayCombo[] = [];
  const used = new Set<string>();

  // Helper to pick edges for different players
  const pickUnique = (count: number, pool: BettingEdgeResult[]) => {
    const picked: BettingEdgeResult[] = [];
    const names = new Set<string>();
    for (const e of pool) {
      if (!names.has(e.playerName)) {
        picked.push(e);
        names.add(e.playerName);
      }
      if (picked.length === count) break;
    }
    return picked.length === count ? picked : null;
  };

  // Conservative 2-leg (high confidence, high aiProb)
  const conservPool = positive.filter(
    (e) => e.confidence !== "low" && e.aiProb > 50
  );
  const conservLegs = pickUnique(2, conservPool);
  if (conservLegs) {
    const combo = buildParlayFromLegs(conservLegs.map(toLeg));
    parlays.push({
      ...combo,
      id: "conservative-2",
      name: "Conservative 2-Leg",
      category: "conservative",
    });
  }

  // Moderate 3-leg (top edges, different players)
  const modLegs = pickUnique(3, positive);
  if (modLegs) {
    const combo = buildParlayFromLegs(modLegs.map(toLeg));
    parlays.push({
      ...combo,
      id: "value-3",
      name: "Value 3-Leg Stack",
      category: "moderate",
    });
  }

  // Aggressive 3-leg (longer odds targets)
  const longPool = positive.filter((e) => e.decimalOdds > 2.5);
  const aggLegs = pickUnique(3, longPool);
  if (aggLegs) {
    const combo = buildParlayFromLegs(aggLegs.map(toLeg));
    parlays.push({
      ...combo,
      id: "aggressive-3",
      name: "High-Upside 3-Leg",
      category: "aggressive",
    });
  }

  // Longshot 4-leg
  const lsLegs = pickUnique(4, positive.slice(2));
  if (lsLegs) {
    const combo = buildParlayFromLegs(lsLegs.map(toLeg));
    parlays.push({
      ...combo,
      id: "longshot-4",
      name: "Longshot 4-Leg",
      category: "longshot",
    });
  }

  // Dark Horse special (lower-ranked players)
  const dhPool = positive.filter((e) => e.worldRanking > 15);
  const dhLegs = pickUnique(3, dhPool);
  if (dhLegs) {
    const combo = buildParlayFromLegs(dhLegs.map(toLeg));
    parlays.push({
      ...combo,
      id: "dark-horse",
      name: "Dark Horse Special",
      category: "aggressive",
    });
  }

  return parlays;
}

// ── Weather Edge Bets ───────────────────────────────────────────

export function generateWeatherEdges(
  edges: BettingEdgeResult[],
  players: Player[]
): WeatherEdgeBet[] {
  const playerMap: Record<string, Player> = {};
  for (const p of players) playerMap[p.name] = p;

  const weatherBets: WeatherEdgeBet[] = [];

  for (const e of edges) {
    if (e.edge <= 0) continue;
    const player = playerMap[e.playerName];
    if (!player?.weatherImpact) continue;

    const wi = player.weatherImpact;
    let boost = 0;
    let tag: "wind" | "rain" | "cold" | "calm" = "calm";
    let reason = "";

    if (wi.wind === "advantage") {
      boost += 2.1;
      tag = "wind";
      reason = `Thrives in wind — ${wi.explanation}`;
    }
    if (wi.rain === "advantage") {
      boost += 1.8;
      tag = "rain";
      reason = reason
        ? reason + ". Also benefits from rain conditions."
        : `Wet-course specialist — ${wi.explanation}`;
    }
    if (wi.cold === "advantage") {
      boost += 1.4;
      if (tag === "calm") tag = "cold";
      reason = reason
        ? reason
        : `Cold-weather advantage — ${wi.explanation}`;
    }

    if (boost > 0) {
      const adjEdge = Math.round((e.edge + boost) * 10) / 10;
      const adjAiProb = e.aiProb + boost;
      weatherBets.push({
        playerName: e.playerName,
        initials: e.initials,
        worldRanking: e.worldRanking,
        market: e.market,
        marketLabel: e.marketLabel,
        americanOdds: e.americanOdds,
        decimalOdds: e.decimalOdds,
        baseEdge: e.edge,
        weatherBoost: Math.round(boost * 10) / 10,
        weatherAdjustedEdge: adjEdge,
        ev100: calculateEV100(adjAiProb, e.decimalOdds),
        weatherTag: tag,
        weatherReason: reason,
      });
    }
  }

  return weatherBets.sort((a, b) => b.weatherAdjustedEdge - a.weatherAdjustedEdge);
}

// ── Live Edge Tracker (simulated pre-tournament state) ──────────

export function generateLiveEdges(
  edges: BettingEdgeResult[]
): LiveEdge[] {
  const positive = edges
    .filter((e) => e.edge > 0)
    .sort((a, b) => b.edge - a.edge)
    .slice(0, 20);

  return positive.map((e, i) => {
    let status: LiveEdge["status"];
    let reason: string;
    let previousEdge: number;
    let timeAgo: string;

    if (i < 4) {
      status = "growing";
      previousEdge = Math.round((e.edge * 0.6) * 10) / 10;
      reason = "DK odds drifting — AI probability unchanged";
      timeAgo = `${(i + 1) * 8} min ago`;
    } else if (i < 8) {
      status = "new";
      previousEdge = 0;
      reason = "New value detected as lines opened";
      timeAgo = `${(i - 3) * 15} min ago`;
    } else if (i < 14) {
      status = "shrinking";
      previousEdge = Math.round((e.edge * 1.6) * 10) / 10;
      reason = "Book adjusting — edge was larger earlier";
      timeAgo = `${(i - 7) * 20} min ago`;
    } else {
      status = "shrinking";
      previousEdge = Math.round((e.edge * 1.3) * 10) / 10;
      reason = "Slowly being priced in by the market";
      timeAgo = `${i * 12} min ago`;
    }

    return {
      playerName: e.playerName,
      initials: e.initials,
      market: e.market,
      marketLabel: e.marketLabel,
      americanOdds: e.americanOdds,
      currentEdge: e.edge,
      previousEdge,
      ev100: e.ev100,
      status,
      reason,
      timeAgo,
    };
  });
}

// ── Round-by-Round Props ────────────────────────────────────────

export function generateRoundProps(
  edges: BettingEdgeResult[],
  players: Player[]
): { firstRoundLeader: RoundPropOdds[]; roundOU: { playerName: string; initials: string; round: number; line: number; overOdds: string; underOdds: string; aiProjected: number; edge: number; pick: "over" | "under"; ev100: number }[] } {
  const playerMap: Record<string, Player> = {};
  for (const p of players) playerMap[p.name] = p;

  // Get win edges sorted by AI probability for FRL
  const winEdges = edges
    .filter((e) => e.market === "win")
    .sort((a, b) => b.aiProb - a.aiProb);

  // Simulate FRL probabilities (roughly: winProb * 3-4x for single round)
  const frl: RoundPropOdds[] = winEdges.slice(0, 20).map((e) => {
    const frlAiProb = Math.min(e.aiProb * 0.55, 12); // R1 leader prob
    // DK prices FRL generously — create some edges
    const frlImplied = frlAiProb * (0.8 + Math.sin(e.worldRanking) * 0.25);
    const clampedImplied = Math.max(frlImplied, 0.5);
    const decimal = Math.round((100 / clampedImplied) * 100) / 100;
    const american = decimal >= 2
      ? "+" + Math.round((decimal - 1) * 100)
      : Math.round(-100 / (decimal - 1)).toString();
    const edge = Math.round((frlAiProb - clampedImplied) * 10) / 10;

    return {
      playerName: e.playerName,
      initials: e.initials,
      worldRanking: e.worldRanking,
      americanOdds: american,
      decimalOdds: decimal,
      impliedProb: Math.round(clampedImplied * 10) / 10,
      aiProb: Math.round(frlAiProb * 10) / 10,
      edge,
      ev100: calculateEV100(frlAiProb, decimal),
    };
  });

  // Round score O/U
  const roundOU = winEdges.slice(0, 10).map((e) => {
    const player = playerMap[e.playerName];
    const sg = player?.strokesGained?.total || 0;
    // Project round score: 72 (par) - strokes gained adjustment
    const aiProjected = Math.round((72 - sg * 0.9) * 10) / 10;
    const line = Math.round(aiProjected * 2) / 2; // round to 0.5
    const isUnder = aiProjected < line;
    const edgeSize = Math.abs(aiProjected - line) * 1.5;

    return {
      playerName: e.playerName,
      initials: e.initials,
      round: 1,
      line,
      overOdds: isUnder ? "+105" : "-115",
      underOdds: isUnder ? "-115" : "+105",
      aiProjected,
      edge: Math.round(edgeSize * 10) / 10,
      pick: (isUnder ? "under" : "over") as "over" | "under",
      ev100: calculateEV100(52 + edgeSize * 3, isUnder ? 1.87 : 1.95),
    };
  });

  return { firstRoundLeader: frl, roundOU };
}

export { MARKET_LABELS };
