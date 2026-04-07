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
