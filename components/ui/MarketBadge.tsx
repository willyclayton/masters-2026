"use client";

import type { BetMarket } from "@/lib/types";

const MARKET_STYLES: Record<string, string> = {
  win: "bg-masters-gold-light text-masters-gold border-masters-gold",
  top5: "bg-emerald-50 text-emerald-700 border-emerald-300",
  top10: "bg-green-50 text-green-700 border-green-300",
  top20: "bg-teal-50 text-teal-700 border-teal-300",
  makeCut: "bg-blue-50 text-blue-700 border-blue-300",
  topAmerican: "bg-red-50 text-red-700 border-red-300",
  topEuropean: "bg-indigo-50 text-indigo-700 border-indigo-300",
  topAsian: "bg-amber-50 text-amber-700 border-amber-300",
  topAustralasian: "bg-cyan-50 text-cyan-700 border-cyan-300",
  topSouthAmerican: "bg-orange-50 text-orange-700 border-orange-300",
};

const MARKET_LABELS: Record<BetMarket, string> = {
  win: "Win",
  top5: "Top 5",
  top10: "Top 10",
  top20: "Top 20",
  makeCut: "Cut",
  topAmerican: "Top USA",
  topEuropean: "Top EUR",
  topAsian: "Top Asia",
  topAustralasian: "Top AUS",
  topSouthAmerican: "Top SA",
};

interface MarketBadgeProps {
  market: BetMarket;
  size?: "sm" | "md";
}

export function MarketBadge({ market, size = "sm" }: MarketBadgeProps) {
  const style = MARKET_STYLES[market] || MARKET_STYLES.win;
  const label = MARKET_LABELS[market];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${style} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      {label}
    </span>
  );
}
