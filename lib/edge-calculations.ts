import type {
  BetMarket,
  BettingOddsData,
  BettingEdgeResult,
  PredictionsData,
  Player,
  PlayerTag,
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

export { MARKET_LABELS };
