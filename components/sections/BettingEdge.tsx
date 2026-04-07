"use client";

import { useState, useMemo } from "react";
import type {
  BetMarket,
  BettingEdgeResult,
  Player,
  PredictionsData,
  BettingOddsData,
} from "@/lib/types";
import {
  calculateAllEdges,
  getTopValueBets,
  NATIONALITY_MARKETS,
} from "@/lib/edge-calculations";
import { BestBetsCard } from "@/components/cards/BestBetsCard";
import { EdgeCard } from "@/components/cards/EdgeCard";
import { ParlayBuilder } from "@/components/betting/ParlayBuilder";
import { WeatherEdge } from "@/components/betting/WeatherEdge";
import { LiveTracker } from "@/components/betting/LiveTracker";
import { RoundPropsComponent } from "@/components/betting/RoundProps";
import {
  Search,
  TrendingUp,
  SlidersHorizontal,
  Layers,
  CloudRain,
  Radio,
  Target,
} from "lucide-react";

import bettingData from "@/data/betting-odds.json";
import predictionsData from "@/data/predictions.json";
import playersData from "@/data/players-2026.json";

// ── Sub-tab types ───────────────────────────────────────────────

type SubTab = "edge" | "parlays" | "weather" | "live" | "rounds";

const SUB_TABS: { id: SubTab; label: string; icon: React.ElementType }[] = [
  { id: "edge", label: "Edge Finder", icon: TrendingUp },
  { id: "parlays", label: "Parlay Builder", icon: Layers },
  { id: "weather", label: "Weather Edge", icon: CloudRain },
  { id: "live", label: "Live Tracker", icon: Radio },
  { id: "rounds", label: "Round Props", icon: Target },
];

// ── Edge Finder types ───────────────────────────────────────────

type MarketFilter =
  | "all"
  | "win"
  | "top5"
  | "top10"
  | "top20"
  | "makeCut"
  | "nationality";

type SortOption = "edge" | "ev" | "odds" | "ranking";

const MARKET_FILTERS: { id: MarketFilter; label: string }[] = [
  { id: "all", label: "All Markets" },
  { id: "win", label: "Win" },
  { id: "top5", label: "Top 5" },
  { id: "top10", label: "Top 10" },
  { id: "top20", label: "Top 20" },
  { id: "makeCut", label: "Make Cut" },
  { id: "nationality", label: "Nationality" },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "edge", label: "Biggest Edge" },
  { id: "ev", label: "Highest EV" },
  { id: "odds", label: "Best Odds" },
  { id: "ranking", label: "World Ranking" },
];

function parseSearch(
  query: string
): { name: string; market: BetMarket | null } {
  const lower = query.toLowerCase().trim();
  if (!lower) return { name: "", market: null };

  const marketKeywords: { pattern: RegExp; market: BetMarket }[] = [
    { pattern: /\b(win|outright|winner)\b/, market: "win" },
    { pattern: /\btop\s*5\b/, market: "top5" },
    { pattern: /\btop\s*10\b/, market: "top10" },
    { pattern: /\btop\s*20\b/, market: "top20" },
    {
      pattern: /\b(make\s*cut|make\s*the\s*cut|cut)\b/,
      market: "makeCut",
    },
    { pattern: /\b(american|usa|us)\b/, market: "topAmerican" },
    { pattern: /\b(european|europe)\b/, market: "topEuropean" },
    { pattern: /\b(asian|asia)\b/, market: "topAsian" },
    {
      pattern: /\b(australasian|australian|aussie)\b/,
      market: "topAustralasian",
    },
    {
      pattern: /\b(south\s*american|latin)\b/,
      market: "topSouthAmerican",
    },
  ];

  let detectedMarket: BetMarket | null = null;
  let remaining = lower;

  for (const kw of marketKeywords) {
    if (kw.pattern.test(lower)) {
      detectedMarket = kw.market;
      remaining = remaining.replace(kw.pattern, "").trim();
      break;
    }
  }

  return { name: remaining, market: detectedMarket };
}

// ── Edge Finder sub-component ───────────────────────────────────

function EdgeFinder({ allEdges }: { allEdges: BettingEdgeResult[] }) {
  const [search, setSearch] = useState("");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("edge");
  const [showAll, setShowAll] = useState(false);

  const bestBets = useMemo(() => getTopValueBets(allEdges, 5), [allEdges]);

  const filteredEdges = useMemo(() => {
    let edges = [...allEdges];
    const { name: searchName, market: searchMarket } = parseSearch(search);

    if (searchName) {
      edges = edges.filter((e) =>
        e.playerName.toLowerCase().includes(searchName)
      );
    }
    if (searchMarket) {
      edges = edges.filter((e) => e.market === searchMarket);
    }

    if (!searchMarket && marketFilter !== "all") {
      if (marketFilter === "nationality") {
        edges = edges.filter((e) => NATIONALITY_MARKETS.includes(e.market));
      } else {
        edges = edges.filter((e) => e.market === marketFilter);
      }
    }

    switch (sortBy) {
      case "edge":
        edges.sort((a, b) => b.edge - a.edge);
        break;
      case "ev":
        edges.sort((a, b) => b.ev100 - a.ev100);
        break;
      case "odds":
        edges.sort((a, b) => b.decimalOdds - a.decimalOdds);
        break;
      case "ranking":
        edges.sort((a, b) => a.worldRanking - b.worldRanking);
        break;
    }

    return edges;
  }, [allEdges, search, marketFilter, sortBy]);

  const displayEdges = showAll ? filteredEdges : filteredEdges.slice(0, 20);
  const hasMore = filteredEdges.length > 20;

  return (
    <div className="space-y-6">
      <BestBetsCard bets={bestBets} />

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search player or bet... e.g. "Scheffler top 10"'
            className="w-full rounded-lg border border-[var(--border-color)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-masters-green focus:outline-none focus:ring-1 focus:ring-masters-green"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {MARKET_FILTERS.map((filter) => {
            const isActive = marketFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setMarketFilter(filter.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-masters-green text-white"
                    : "border border-[var(--border-color)] bg-white text-[var(--text-secondary)] hover:border-masters-green hover:text-masters-green"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            {filteredEdges.length} results
            {search && (
              <button
                onClick={() => setSearch("")}
                className="ml-2 text-masters-green hover:underline"
              >
                Clear search
              </button>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded border border-[var(--border-color)] bg-white px-2 py-1 text-xs text-[var(--text-secondary)] focus:border-masters-green focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {displayEdges.length === 0 ? (
          <div className="rounded-lg border border-[var(--border-color)] bg-white p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              No edges found for this search. Try a different player or market.
            </p>
          </div>
        ) : (
          displayEdges.map((edge, i) => (
            <EdgeCard
              key={`${edge.playerName}-${edge.market}`}
              edge={edge}
              rank={sortBy === "edge" || sortBy === "ev" ? i + 1 : undefined}
            />
          ))
        )}
      </div>

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full rounded-lg border border-[var(--border-color)] bg-white py-3 text-sm font-medium text-masters-green transition-colors hover:bg-masters-green-light"
        >
          Show All {filteredEdges.length} Results
        </button>
      )}
      {showAll && hasMore && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full rounded-lg border border-[var(--border-color)] bg-white py-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-gray-50"
        >
          Show Less
        </button>
      )}
    </div>
  );
}

// ── Main BettingEdge Section ────────────────────────────────────

export function BettingEdge() {
  const [activeTab, setActiveTab] = useState<SubTab>("edge");

  const allEdges = useMemo(
    () =>
      calculateAllEdges(
        bettingData as unknown as BettingOddsData,
        predictionsData as unknown as PredictionsData,
        playersData as unknown as Player[]
      ),
    []
  );

  const positiveEdges = allEdges.filter((e) => e.edge > 0).length;
  const totalEV = allEdges
    .filter((e) => e.ev100 > 0)
    .reduce((sum, e) => sum + e.ev100, 0);

  return (
    <section>
      {/* Hero */}
      <div className="bg-gradient-to-b from-masters-green-dark to-masters-green px-4 py-10 text-white sm:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5 text-masters-gold" />
            <span className="text-xs font-medium uppercase tracking-widest text-masters-gold">
              Betting Intelligence
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">
            Betting Edge
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">
            AI-powered value detection across DraftKings markets. Find where our
            models see odds the book has wrong.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div>
              <span className="text-xl font-bold text-masters-gold">
                {positiveEdges}
              </span>
              <span className="ml-1 text-white/70">value bets</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <span className="text-xl font-bold text-masters-gold">
                {allEdges.length}
              </span>
              <span className="ml-1 text-white/70">markets</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <span className="text-xl font-bold text-masters-gold">
                +${totalEV.toFixed(0)}
              </span>
              <span className="ml-1 text-white/70">total EV</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-[var(--border-color)] bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-1 overflow-x-auto px-4">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex shrink-0 items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-masters-green"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-masters-green" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {activeTab === "edge" && <EdgeFinder allEdges={allEdges} />}
        {activeTab === "parlays" && <ParlayBuilder edges={allEdges} />}
        {activeTab === "weather" && (
          <WeatherEdge
            edges={allEdges}
            players={playersData as unknown as Player[]}
          />
        )}
        {activeTab === "live" && <LiveTracker edges={allEdges} />}
        {activeTab === "rounds" && (
          <RoundPropsComponent
            edges={allEdges}
            players={playersData as unknown as Player[]}
          />
        )}

        {/* Footer note */}
        <div className="mt-6 rounded-lg bg-[var(--bg-primary)] p-3 text-center">
          <p className="text-[10px] text-[var(--text-muted)]">
            Odds sourced from DraftKings as of{" "}
            {new Date(
              (bettingData as unknown as BettingOddsData).lastUpdated
            ).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
            . Edge = AI Probability - DK Implied Probability. EV = Expected
            Value per $100 bet. Positive values indicate profitable bets over
            time. Not financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}
