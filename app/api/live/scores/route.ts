import { NextResponse } from "next/server";
import type { LiveLeaderboard, LivePlayerScore } from "@/lib/types";

// ESPN's public golf scoreboard API (no auth required)
const ESPN_GOLF_URL =
  "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";

// Masters tournament ID on ESPN — updated each year.
// For 2026, this will need to be set once the tournament is listed.
// Fallback: the API returns the current/most-recent event when no ID is given.
const MASTERS_EVENT_ID = process.env.MASTERS_ESPN_EVENT_ID || "";

function parsePosition(displayValue: string): { position: string; positionNum: number } {
  if (!displayValue) return { position: "-", positionNum: 999 };
  const clean = displayValue.replace(/\s/g, "");
  const num = parseInt(clean.replace(/^T/, ""), 10);
  return {
    position: clean,
    positionNum: isNaN(num) ? 999 : num,
  };
}

function parseScore(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    if (val === "E") return 0;
    const n = parseInt(val, 10);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

export const dynamic = "force-dynamic"; // never cache at the edge

export async function GET() {
  try {
    const url = new URL(ESPN_GOLF_URL);
    if (MASTERS_EVENT_ID) {
      url.searchParams.set("event", MASTERS_EVENT_ID);
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 30 }, // server-side: cache for 30s
    });

    if (!res.ok) {
      throw new Error(`ESPN responded ${res.status}`);
    }

    const data = await res.json();

    // ESPN returns events[0] for the current/requested tournament
    const event = data?.events?.[0];
    if (!event) {
      return NextResponse.json(
        { error: "No active tournament found" },
        { status: 404 }
      );
    }

    const competition = event.competitions?.[0];
    const statusDetail = competition?.status?.type?.detail || "";
    const roundNum = competition?.status?.period || 1;
    const isInProgress = competition?.status?.type?.state === "in";
    const isComplete = competition?.status?.type?.completed === true;

    const roundStatus: LiveLeaderboard["roundStatus"] = isComplete
      ? "complete"
      : isInProgress
        ? "in_progress"
        : "not_started";

    const players: LivePlayerScore[] = (competition?.competitors || []).map(
      (c: Record<string, unknown>) => {
        const athlete = c.athlete as Record<string, unknown> | undefined;
        const name = (athlete?.displayName as string) || "Unknown";

        const { position, positionNum } = parsePosition(
          (c.status as Record<string, unknown>)?.displayValue as string ||
          String(c.order || "")
        );

        // Linescores are per-round scores
        const linescores = (c.linescores as { value: number }[]) || [];
        const round = (idx: number) =>
          linescores[idx] ? linescores[idx].value : null;

        const totalScore = parseScore(
          (c.score as Record<string, unknown>)?.displayValue ?? c.score
        );

        // "thru" comes from status
        const thru =
          (c.status as Record<string, unknown>)?.thru as string ||
          (isComplete ? "F" : "-");

        const today = parseScore(
          (c as Record<string, unknown>).todayScore ??
          (c.statistics as { name: string; displayValue: string }[])?.find(
            (s) => s.name === "today"
          )?.displayValue ?? 0
        );

        const statusType = (c.status as Record<string, unknown>)?.type as Record<string, unknown> | undefined;
        const isCut = statusType?.description === "cut";
        const isWD = statusType?.description === "withdrawn";

        return {
          name,
          position,
          positionNum,
          today,
          thru,
          totalScore,
          round1: round(0),
          round2: round(1),
          round3: round(2),
          round4: round(3),
          status: isCut
            ? "cut"
            : isWD
              ? "withdrawn"
              : isComplete
                ? "finished"
                : "active",
        } satisfies LivePlayerScore;
      }
    );

    // Sort by position
    players.sort((a, b) => a.positionNum - b.positionNum);

    const leaderboard: LiveLeaderboard = {
      tournamentName: event.name || "The Masters",
      currentRound: roundNum,
      roundStatus,
      lastUpdated: new Date().toISOString(),
      players,
    };

    return NextResponse.json(leaderboard, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
      },
    });
  } catch (error) {
    console.error("Live scores error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch live scores",
        detail: error instanceof Error ? error.message : "Unknown",
      },
      { status: 502 }
    );
  }
}
