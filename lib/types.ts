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
  })[];
}

export interface ConsensusPrediction {
  name: string;
  winPct: number;
  top5Pct: number;
  top10Pct: number;
  makeCutPct: number;
  rationale: string;
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
