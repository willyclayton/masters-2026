"use client";

import { useState, useMemo } from "react";
import playersData from "@/data/players-2026.json";
import predictionsData from "@/data/predictions.json";
import type { Player, PredictionsData } from "@/lib/types";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { FilterChips, type FilterOption } from "@/components/ui/FilterChips";
import { Search } from "lucide-react";

const players = playersData as unknown as Player[];
const predictions = predictionsData as unknown as PredictionsData;

export function PlayerProfiles() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("All");

  const filtered = useMemo(() => {
    let result = [...players];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filter === "Past Champions") {
      result = result.filter((p) => p.tags.includes("Past Champion"));
    } else if (filter === "Dark Horses") {
      result = result.filter((p) => p.tags.includes("Dark Horse"));
    } else if (filter === "LIV Golfers") {
      result = result.filter((p) => p.isLIV);
    } else if (filter === "Major Winners") {
      result = result.filter((p) => p.majorWins > 0);
    }

    // Sort by world ranking
    result.sort((a, b) => a.worldRanking - b.worldRanking);

    return result;
  }, [search, filter]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <h2 className="mb-4 font-heading text-xl font-bold text-[var(--text-primary)]">
        Player Profiles
      </h2>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[var(--border-color)] bg-white py-2.5 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-masters-green focus:outline-none focus:ring-1 focus:ring-masters-green"
        />
      </div>

      {/* Filter Chips */}
      <div className="mb-4">
        <FilterChips active={filter} onChange={setFilter} />
      </div>

      {/* Results count */}
      <p className="mb-3 text-xs text-[var(--text-muted)]">
        {filtered.length} player{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Player Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((player) => (
          <PlayerCard
            key={player.name}
            player={player}
            predictions={predictions}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-[var(--text-muted)]">
          No players match your search.
        </p>
      )}
    </section>
  );
}
