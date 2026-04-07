import { NextResponse } from "next/server";
import type { LiveOddsUpdate } from "@/lib/types";

// ── Odds API Configuration ──────────────────────────────────────
//
// DraftKings does not offer a public odds API. Options for live odds:
//
// 1. **The Odds API** (https://the-odds-api.com) — aggregates odds from
//    DraftKings, FanDuel, BetMGM, etc. Free tier: 500 requests/month.
//    Set ODDS_API_KEY in your .env.local to enable.
//
// 2. **Direct DraftKings scraping** — against TOS, not recommended.
//
// 3. **Manual/semi-auto updates** — update data/betting-odds.json
//    periodically during the tournament and this route serves it.
//
// When ODDS_API_KEY is set, this route fetches live odds from The Odds API.
// Otherwise, it serves the static betting-odds.json as a fallback.
// ─────────────────────────────────────────────────────────────────

const ODDS_API_KEY = process.env.ODDS_API_KEY || "";
const ODDS_API_URL = "https://api.the-odds-api.com/v4/sports/golf_masters_tournament_winner/odds";

export const dynamic = "force-dynamic";

async function fetchLiveOdds(): Promise<LiveOddsUpdate | null> {
  if (!ODDS_API_KEY) return null;

  const url = new URL(ODDS_API_URL);
  url.searchParams.set("apiKey", ODDS_API_KEY);
  url.searchParams.set("regions", "us");
  url.searchParams.set("markets", "h2h,outrights");
  url.searchParams.set("bookmakers", "draftkings");
  url.searchParams.set("oddsFormat", "american");

  const res = await fetch(url.toString(), {
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    console.error(`Odds API responded ${res.status}`);
    return null;
  }

  const data = await res.json();

  // The Odds API returns an array of events, each with bookmakers
  const event = Array.isArray(data) ? data[0] : data;
  const dk = event?.bookmakers?.find(
    (b: { key: string }) => b.key === "draftkings"
  );

  if (!dk) return null;

  // Parse outright/win market
  const outrightMarket = dk.markets?.find(
    (m: { key: string }) => m.key === "outrights" || m.key === "h2h"
  );

  if (!outrightMarket) return null;

  const players = (outrightMarket.outcomes || []).map(
    (o: { name: string; price: number }) => {
      const american =
        o.price >= 0 ? `+${o.price}` : String(o.price);
      const decimal =
        o.price >= 0
          ? Math.round((1 + o.price / 100) * 100) / 100
          : Math.round((1 + 100 / Math.abs(o.price)) * 100) / 100;
      const impliedProb =
        o.price >= 0
          ? Math.round((100 / (o.price + 100)) * 1000) / 10
          : Math.round((Math.abs(o.price) / (Math.abs(o.price) + 100)) * 1000) / 10;

      return {
        name: o.name,
        odds: {
          win: {
            american,
            decimal,
            impliedProb,
            previousImplied: impliedProb, // no history on first fetch
            movement: "stable" as const,
          },
        },
      };
    }
  );

  return {
    lastUpdated: new Date().toISOString(),
    source: "DraftKings via The Odds API",
    players,
  };
}

async function getStaticOdds(): Promise<LiveOddsUpdate> {
  // Serve static betting-odds.json as fallback
  const staticData = await import("@/data/betting-odds.json");
  const data = staticData.default as unknown as {
    lastUpdated: string;
    source: string;
    players: {
      name: string;
      odds: Record<string, { american: string; decimal: number; impliedProb: number; movement: string }>;
    }[];
  };

  return {
    lastUpdated: data.lastUpdated,
    source: data.source + " (static)",
    players: data.players.map((p) => ({
      name: p.name,
      odds: Object.fromEntries(
        Object.entries(p.odds).map(([market, o]) => [
          market,
          {
            american: o.american,
            decimal: o.decimal,
            impliedProb: o.impliedProb,
            previousImplied: o.impliedProb,
            movement: (o.movement || "stable") as "rising" | "falling" | "stable",
          },
        ])
      ),
    })),
  };
}

export async function GET() {
  try {
    // Try live odds first, fall back to static
    const liveOdds = await fetchLiveOdds();
    const odds = liveOdds || (await getStaticOdds());

    return NextResponse.json(odds, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
        "X-Data-Source": liveOdds ? "live" : "static",
      },
    });
  } catch (error) {
    console.error("Live odds error:", error);

    // Always fall back to static on error
    try {
      const fallback = await getStaticOdds();
      return NextResponse.json(fallback, {
        headers: { "X-Data-Source": "static-fallback" },
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch odds data" },
        { status: 502 }
      );
    }
  }
}
