"use client";

import { useState, useMemo } from "react";
import type { BettingEdgeResult, ParlayCombo, ParlayLeg } from "@/lib/types";
import {
  generateAiParlays,
  buildParlayFromLegs,
} from "@/lib/edge-calculations";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X, ChevronDown } from "lucide-react";

interface ParlayBuilderProps {
  edges: BettingEdgeResult[];
}

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  conservative: { label: "Conservative", color: "bg-blue-50 text-blue-700" },
  moderate: { label: "Moderate", color: "bg-masters-green-light text-masters-green" },
  aggressive: { label: "Aggressive", color: "bg-amber-50 text-amber-700" },
  longshot: { label: "Longshot", color: "bg-masters-gold-light text-masters-gold" },
};

function ParlayCard({
  parlay,
  defaultOpen,
}: {
  parlay: ParlayCombo;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const cat = CATEGORY_STYLES[parlay.category];

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {parlay.name}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.color}`}
              >
                {cat.label}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-[var(--text-muted)]">
              {parlay.legs.length} legs &middot; AI prob:{" "}
              {parlay.combinedAiProb.toFixed(1)}%
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-lg font-bold text-[var(--text-primary)]">
              {parlay.combinedAmericanOdds}
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] font-bold text-masters-green">
                +{parlay.combinedEdge.toFixed(1)}% edge
              </span>
              <span className="text-[10px] font-bold tabular-nums text-masters-green">
                EV: +${parlay.ev100.toFixed(2)}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
          {parlay.legs.map((leg, i) => (
            <div
              key={`${leg.playerName}-${leg.market}`}
              className="relative flex items-center gap-3 px-4 py-3"
            >
              {i < parlay.legs.length - 1 && (
                <div className="absolute bottom-0 left-[29px] z-10 flex h-5 w-5 -translate-y-[-10px] items-center justify-center rounded-full bg-masters-gold text-[10px] font-bold text-white">
                  +
                </div>
              )}
              <InitialsAvatar initials={leg.initials} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {leg.playerName}
                  </span>
                  <MarketBadge market={leg.market} />
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {leg.americanOdds} &middot; AI: {leg.aiProb.toFixed(1)}%
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                +{leg.edge.toFixed(1)}%
              </span>
            </div>
          ))}
          <div className="border-t border-[var(--border-color)] px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">
                Combined: {parlay.combinedAmericanOdds} ({parlay.combinedDecimalOdds.toFixed(2)}x)
              </span>
              <span className="font-bold text-masters-green">
                $100 wins ${((parlay.combinedDecimalOdds - 1) * 100).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ParlayBuilder({ edges }: ParlayBuilderProps) {
  const [search, setSearch] = useState("");
  const [customLegs, setCustomLegs] = useState<ParlayLeg[]>([]);
  const [showCustom, setShowCustom] = useState(false);

  const aiParlays = useMemo(() => generateAiParlays(edges), [edges]);

  // Search for edges to add as custom legs
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const lower = search.toLowerCase();
    return edges
      .filter(
        (e) =>
          e.edge > 0 &&
          e.playerName.toLowerCase().includes(lower) &&
          !customLegs.some(
            (l) => l.playerName === e.playerName && l.market === e.market
          )
      )
      .slice(0, 8);
  }, [search, edges, customLegs]);

  const customParlay = useMemo(() => {
    if (customLegs.length < 2) return null;
    return buildParlayFromLegs(customLegs);
  }, [customLegs]);

  const addLeg = (e: BettingEdgeResult) => {
    if (customLegs.length >= 6) return;
    setCustomLegs([
      ...customLegs,
      {
        playerName: e.playerName,
        initials: e.initials,
        market: e.market,
        marketLabel: e.marketLabel,
        americanOdds: e.americanOdds,
        decimalOdds: e.decimalOdds,
        dkImpliedProb: e.dkImpliedProb,
        aiProb: e.aiProb,
        edge: e.edge,
      },
    ]);
    setSearch("");
  };

  const removeLeg = (idx: number) => {
    setCustomLegs(customLegs.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* AI Parlays */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="secondary" className="bg-masters-gold-light text-masters-gold">
            AI-Powered
          </Badge>
          <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
            AI Parlay Picks
          </h3>
        </div>
        <p className="mb-4 text-xs text-[var(--text-muted)]">
          Auto-generated parlays combining uncorrelated positive-edge bets.
          Every leg has value.
        </p>
        <div className="space-y-3">
          {aiParlays.map((p, i) => (
            <ParlayCard key={p.id} parlay={p} defaultOpen={i === 0} />
          ))}
        </div>
      </div>

      {/* Custom Builder */}
      <div>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex w-full items-center justify-between rounded-lg border border-[var(--border-color)] bg-white p-4 text-left transition-colors hover:bg-[var(--bg-primary)]"
        >
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Build Your Own Parlay
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Select 2-6 value bets to combine
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${showCustom ? "rotate-180" : ""}`}
          />
        </button>

        {showCustom && (
          <div className="mt-3 space-y-3">
            {/* Current legs */}
            {customLegs.length > 0 && (
              <div className="rounded-lg border border-[var(--border-color)] bg-white p-3 space-y-2">
                {customLegs.map((leg, i) => (
                  <div
                    key={`${leg.playerName}-${leg.market}`}
                    className="flex items-center gap-2 rounded-md bg-[var(--bg-primary)] p-2"
                  >
                    <InitialsAvatar initials={leg.initials} size="sm" />
                    <span className="flex-1 text-sm font-medium">
                      {leg.playerName}
                    </span>
                    <MarketBadge market={leg.market} />
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {leg.americanOdds}
                    </span>
                    <button
                      onClick={() => removeLeg(i)}
                      className="rounded-full p-1 text-[var(--text-muted)] hover:bg-red-50 hover:text-masters-red"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {customParlay && (
                  <div className="mt-2 flex items-center justify-between border-t border-[var(--border-color)] pt-2">
                    <div className="text-xs text-[var(--text-muted)]">
                      {customLegs.length}-Leg Parlay
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        {customParlay.combinedAmericanOdds}
                      </span>
                      <span className="text-xs font-bold text-masters-green">
                        +{customParlay.combinedEdge.toFixed(1)}% edge
                      </span>
                      <span className="text-xs font-bold tabular-nums text-masters-green">
                        EV: {customParlay.ev100 >= 0 ? "+" : ""}${customParlay.ev100.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Search to add */}
            {customLegs.length < 6 && (
              <div className="relative">
                <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search player to add a leg..."
                  className="w-full rounded-lg border border-dashed border-[var(--border-color)] bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-[var(--text-muted)] focus:border-masters-green focus:outline-none"
                />
              </div>
            )}

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="rounded-lg border border-[var(--border-color)] bg-white divide-y divide-[var(--border-color)]">
                {searchResults.map((e) => (
                  <button
                    key={`${e.playerName}-${e.market}`}
                    onClick={() => addLeg(e)}
                    className="flex w-full items-center gap-2 p-3 text-left transition-colors hover:bg-masters-green-light"
                  >
                    <InitialsAvatar initials={e.initials} size="sm" />
                    <span className="flex-1 text-sm font-medium">
                      {e.playerName}
                    </span>
                    <MarketBadge market={e.market} />
                    <span className="text-xs font-bold">
                      {e.americanOdds}
                    </span>
                    <span className="text-[10px] font-bold text-masters-green">
                      +{e.edge.toFixed(1)}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
