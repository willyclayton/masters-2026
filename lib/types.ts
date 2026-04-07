export interface AugustaCourseFit {
  par5Scoring: number;
  amenCornerAvg: number;
  drivingDistanceRank: number;
  greensInRegulation: number;
  scramblingPct: number;
}

export interface MajorResult {
  championship: "Masters" | "PGA" | "US Open" | "The Open";
  year: number;
  finish: string;
}

export interface BettingOdds {
  currentOdds: string;
  impliedProbability: number;
  movement: "rising" | "falling" | "stable";
}

export interface HeadToHeadRecord {
  opponent: string;
  wins: number;
  losses: number;
  lastMeetingResult: string;
}

export interface AugustaKeyHole {
  hole: number;
  name: string;
  advantage: string;
}

export interface HistoricalComparison {
  playerName: string;
  year: number;
  comparison: string;
}

export interface WeatherImpact {
  wind: "advantage" | "neutral" | "disadvantage";
  rain: "advantage" | "neutral" | "disadvantage";
  cold: "advantage" | "neutral" | "disadvantage";
  explanation: string;
}

export interface Player {
  name: string;
  initials: string;
  worldRanking: number;
  age: number;
  country: string;
  isLIV: boolean;
  mastersAppearances: number;
  mastersWins: number;
  mastersBestFinish: string;
  mastersHistory: MastersResult[];
  majorWins: number;
  season2026: SeasonStats;
  strokesGained: StrokesGained;
  momentumLast5: MomentumResult[];
  injuryStatus: string | null;
  narrative: string;
  tags: PlayerTag[];
  augustaCourseFit?: AugustaCourseFit;
  majorHistory?: MajorResult[];
  bettingOdds?: BettingOdds;
  headToHead?: HeadToHeadRecord[];
  keyStrengths?: string[];
  keyWeaknesses?: string[];
  whyTheyWillWin?: string;
  whyTheyWontWin?: string;
  augustaKeyHoles?: AugustaKeyHole[];
  comparisons?: HistoricalComparison[];
  pressureRating?: number;
  weatherImpact?: WeatherImpact;
}

export type PlayerTag =
  | "Past Champion"
  | "Major Winner"
  | "Dark Horse"
  | "LIV Golfer"
  | "First Timer"
  | "Amateur"
  | "Fan Favorite"
  | "Defending Champion";

export interface MastersResult {
  year: number;
  finish: string;
  score: string;
}

export interface SeasonStats {
  events: number;
  wins: number;
  top10s: number;
  earnings: string;
  fedexRank?: number;
}

export interface StrokesGained {
  offTheTee: number;
  approach: number;
  aroundGreen: number;
  putting: number;
  total: number;
}

export type MomentumResult = "W" | "T2" | "T3" | "T5" | "T10" | "T15" | "T20" | "T25" | "T30" | "T40" | "T50" | "T60" | "MC" | "WD" | "CUT";

export interface ModelPrediction {
  name: string;
  winPct: number;
  top5Pct: number;
  top10Pct: number;
  makeCutPct: number;
}

export interface ScenarioAnalysis {
  bestCase: string;
  worstCase: string;
  mostLikely: string;
}

export interface ScoreExplanations {
  momentum: string;
  augustaExperience: string;
  majorClutch: string;
  weatherFit: string;
  intangibles: string;
}

export interface SimulatorOutput {
  modelName: "The Simulator";
  emoji: string;
  description: string;
  methodology: string;
  rankings: ModelPrediction[];
}

export interface ScoutOutput {
  modelName: "The Scout";
  emoji: string;
  description: string;
  methodology: string;
  rankings: (ModelPrediction & {
    scores: {
      momentum: number;
      augustaExperience: number;
      majorClutch: number;
      weatherFit: number;
      intangibles: number;
      total: number;
    };
    scoreExplanations?: ScoreExplanations;
  })[];
}

export interface AnalystOutput {
  modelName: "The Analyst";
  emoji: string;
  description: string;
  methodology: string;
  narrative: string;
  rankings: (ModelPrediction & {
    rationale: string;
    whyTheyWillWin?: string;
  })[];
}

export interface ConsensusPrediction {
  name: string;
  winPct: number;
  top5Pct: number;
  top10Pct: number;
  makeCutPct: number;
  rationale: string;
  whyTheyWillWin?: string;
  scenarioAnalysis?: ScenarioAnalysis;
  simulatorRank: number;
  scoutRank: number;
  analystRank: number;
}

export interface PredictionsData {
  lastUpdated: string;
  consensus: {
    rankings: ConsensusPrediction[];
  };
  simulator: SimulatorOutput;
  scout: ScoutOutput;
  analyst: AnalystOutput;
}

export interface WeatherDay {
  date: string;
  dayLabel: string;
  round: string;
  tempHigh: number;
  tempLow: number;
  windSpeed: number;
  windDirection: string;
  precipProbability: number;
  weatherCode: number;
  description: string;
}

export interface WeatherForecast {
  location: string;
  days: WeatherDay[];
  lastUpdated: string;
}

// ── Betting Edge Types ──────────────────────────────────────────

export type BetMarket =
  | "win"
  | "top5"
  | "top10"
  | "top20"
  | "makeCut"
  | "topAmerican"
  | "topEuropean"
  | "topAsian"
  | "topAustralasian"
  | "topSouthAmerican";

export interface MarketOdds {
  american: string;
  decimal: number;
  impliedProb: number;
  movement: "rising" | "falling" | "stable";
}

export interface MarketInfo {
  label: string;
  description: string;
}

export interface PlayerBettingOdds {
  name: string;
  odds: Partial<Record<BetMarket, MarketOdds>>;
}

export interface BettingOddsData {
  lastUpdated: string;
  source: string;
  markets: Record<BetMarket, MarketInfo>;
  players: PlayerBettingOdds[];
}

export interface BettingEdgeResult {
  playerName: string;
  initials: string;
  worldRanking: number;
  country: string;
  market: BetMarket;
  marketLabel: string;
  dkImpliedProb: number;
  aiProb: number;
  edge: number;
  edgePct: number;
  americanOdds: string;
  decimalOdds: number;
  movement: "rising" | "falling" | "stable";
  confidence: "high" | "medium" | "low";
  tags: PlayerTag[];
  ev100: number; // expected value per $100 bet
}

// Parlay types
export interface ParlayLeg {
  playerName: string;
  initials: string;
  market: BetMarket;
  marketLabel: string;
  americanOdds: string;
  decimalOdds: number;
  dkImpliedProb: number;
  aiProb: number;
  edge: number;
}

export interface ParlayCombo {
  id: string;
  name: string;
  legs: ParlayLeg[];
  combinedDecimalOdds: number;
  combinedAmericanOdds: string;
  combinedDkProb: number;
  combinedAiProb: number;
  combinedEdge: number;
  ev100: number;
  category: "conservative" | "moderate" | "aggressive" | "longshot";
}

// Round props types
export interface RoundPropOdds {
  playerName: string;
  initials: string;
  worldRanking: number;
  americanOdds: string;
  decimalOdds: number;
  impliedProb: number;
  aiProb: number;
  edge: number;
  ev100: number;
}

export interface RoundProps {
  lastUpdated: string;
  firstRoundLeader: RoundPropOdds[];
  roundScoreOU: {
    playerName: string;
    initials: string;
    round: number;
    line: number;
    overOdds: string;
    underOdds: string;
    aiProjected: number;
    edge: number;
    pick: "over" | "under";
    ev100: number;
  }[];
}

// Weather edge types
export interface WeatherEdgeBet {
  playerName: string;
  initials: string;
  worldRanking: number;
  market: BetMarket;
  marketLabel: string;
  americanOdds: string;
  decimalOdds: number;
  baseEdge: number;
  weatherBoost: number;
  weatherAdjustedEdge: number;
  ev100: number;
  weatherTag: "wind" | "rain" | "cold" | "calm";
  weatherReason: string;
}

// Live tracker types
export interface LiveEdge {
  playerName: string;
  initials: string;
  market: BetMarket;
  marketLabel: string;
  americanOdds: string;
  currentEdge: number;
  previousEdge: number;
  ev100: number;
  status: "growing" | "new" | "shrinking" | "dead";
  reason: string;
  timeAgo: string;
}

// ── Live Data Types ─────────────────────────────────────────────

export interface LivePlayerScore {
  name: string;
  position: string;        // "T1", "T4", "CUT", etc.
  positionNum: number;     // numeric for sorting (T1 = 1)
  today: number;           // strokes relative to par for current round
  thru: string;            // "F", "12", "B9", etc.
  totalScore: number;      // total strokes relative to par
  round1: number | null;
  round2: number | null;
  round3: number | null;
  round4: number | null;
  status: "active" | "cut" | "withdrawn" | "finished";
}

export interface LiveLeaderboard {
  tournamentName: string;
  currentRound: number;
  roundStatus: "not_started" | "in_progress" | "complete";
  lastUpdated: string;
  players: LivePlayerScore[];
}

export interface LiveOddsUpdate {
  lastUpdated: string;
  source: string;
  quotaRemaining: number | null;
  quotaUsed: number | null;
  cached: boolean;
  players: {
    name: string;
    odds: Partial<Record<BetMarket, {
      american: string;
      decimal: number;
      impliedProb: number;
      previousImplied: number;
      movement: "rising" | "falling" | "stable";
    }>>;
  }[];
}

export interface LiveData {
  leaderboard: LiveLeaderboard | null;
  odds: LiveOddsUpdate | null;
  isLive: boolean;
  lastFetch: string | null;
  error: string | null;
  quotaRemaining: number | null;
  oddsSource: string;
}
