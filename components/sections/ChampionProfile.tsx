"use client";

import { useState, useMemo } from "react";
import { Layout07Blueprint } from "./champion-profile/Layout07Blueprint";
import { PlayerMatchCard } from "./champion-profile/PlayerMatchCard";
import { evaluateAllPlayers } from "@/lib/champion-criteria";
import championData from "@/data/champion-profile.json";
import playersData from "@/data/players-2026.json";
import type { Player } from "@/lib/types";

export function ChampionProfile() {
  const [showAll, setShowAll] = useState(false);

  const playerMatches = useMemo(
    () => evaluateAllPlayers(playersData as Player[]),
    []
  );

  const displayedPlayers = showAll ? playerMatches : playerMatches.slice(0, 15);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/* Section header */}
      <div className="text-center mb-6">
        <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Champion DNA
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          What do the last 10 Masters winners have in common — and who matches the profile in 2026?
        </p>
      </div>

      {/* Blueprint layout */}
      <div className="mb-10">
        <Layout07Blueprint categories={championData.categories} />
      </div>

      {/* Match % Leaderboard */}
      <div>
        <div className="text-center mb-6">
          <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
            2026 Field: Champion DNA Match
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            How closely does each player match the historic champion profile?
          </p>
        </div>

        <div className="flex flex-col gap-2 max-w-2xl mx-auto">
          {displayedPlayers.map((player, i) => (
            <PlayerMatchCard key={player.name} player={player} rank={i + 1} />
          ))}
        </div>

        {!showAll && playerMatches.length > 15 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm text-[#006B54] font-medium hover:underline"
            >
              Show all {playerMatches.length} players
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
