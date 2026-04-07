"use client";

import { useState } from "react";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { ChevronDown, Check, X } from "lucide-react";
import type { PlayerCriteriaResult, CriteriaKey } from "@/lib/champion-criteria";
import { CRITERIA_LABELS } from "@/lib/champion-criteria";

interface PlayerMatchCardProps {
  player: PlayerCriteriaResult;
  rank: number;
}

const FLAG_MAP: Record<string, string> = {
  USA: "\u{1F1FA}\u{1F1F8}",
  ENG: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  NIR: "\u{1F1EC}\u{1F1E7}",
  SCO: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  ESP: "\u{1F1EA}\u{1F1F8}",
  JPN: "\u{1F1EF}\u{1F1F5}",
  AUS: "\u{1F1E6}\u{1F1FA}",
  RSA: "\u{1F1FF}\u{1F1E6}",
  KOR: "\u{1F1F0}\u{1F1F7}",
  SWE: "\u{1F1F8}\u{1F1EA}",
  NOR: "\u{1F1F3}\u{1F1F4}",
  CAN: "\u{1F1E8}\u{1F1E6}",
  MEX: "\u{1F1F2}\u{1F1FD}",
  COL: "\u{1F1E8}\u{1F1F4}",
  CHI: "\u{1F1E8}\u{1F1F1}",
  ARG: "\u{1F1E6}\u{1F1F7}",
  IRL: "\u{1F1EE}\u{1F1EA}",
  FRA: "\u{1F1EB}\u{1F1F7}",
  GER: "\u{1F1E9}\u{1F1EA}",
  ITA: "\u{1F1EE}\u{1F1F9}",
  DEN: "\u{1F1E9}\u{1F1F0}",
  TWN: "\u{1F1F9}\u{1F1FC}",
  CHN: "\u{1F1E8}\u{1F1F3}",
  THA: "\u{1F1F9}\u{1F1ED}",
  IND: "\u{1F1EE}\u{1F1F3}",
};

export function PlayerMatchCard({ player, rank }: PlayerMatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const flag = FLAG_MAP[player.country] ?? "";

  const pctColor =
    player.matchPct === 100
      ? "text-[#006B54]"
      : player.matchPct >= 88
        ? "text-[#006B54]"
        : player.matchPct >= 75
          ? "text-[#2E6B8A]"
          : "text-[var(--text-secondary)]";

  const barWidth = `${player.matchPct}%`;

  return (
    <div
      className={`border rounded-lg bg-white transition-all ${
        player.matchPct === 100
          ? "border-[#C8A951] shadow-[0_0_0_1px_rgba(200,169,81,0.2)]"
          : "border-[var(--border)]"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="w-6 shrink-0 text-center text-xs font-bold text-[var(--text-muted)] tabular-nums">
          {rank}
        </span>
        <InitialsAvatar initials={player.initials} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-sm font-semibold text-[var(--text-primary)] truncate">
              {player.name}
            </span>
            {flag && <span className="text-xs">{flag}</span>}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[var(--masters-green-light)]">
              <div
                className="h-full rounded-full bg-[#006B54] transition-all duration-700"
                style={{ width: barWidth }}
              />
            </div>
            <span
              className={`text-xs font-bold tabular-nums ${pctColor}`}
            >
              {player.matchPct}%
            </span>
          </div>
        </div>
        <span className="text-xs text-[var(--text-muted)] tabular-nums">
          #{player.worldRanking}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {(Object.entries(player.criteria) as [CriteriaKey, boolean][]).map(
              ([key, met]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  {met ? (
                    <Check className="h-3.5 w-3.5 text-[#006B54] shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-[#C0392B] shrink-0" />
                  )}
                  <span
                    className={
                      met
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] line-through"
                    }
                  >
                    {CRITERIA_LABELS[key]}
                  </span>
                </div>
              )
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">
              {player.matchCount}/{Object.keys(player.criteria).length} criteria met
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
