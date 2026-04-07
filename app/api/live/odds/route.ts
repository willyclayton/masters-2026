import { NextResponse } from "next/server";
import type { LiveOddsUpdate } from "@/lib/types";

// ── Configuration ───────────────────────────────────────────────
//
// The Odds API free tier: 500 credits/month.
// Each call = 1 credit (1 region × 1 market).
// Budget: ~450 usable → 1 call every 5 min during tournament.
//
// This route uses an in-memory cache so the client can poll every
// 30s but we only hit The Odds API once every 5 minutes.
// ─────────────────────────────────────────────────────────────────

const ODDS_API_KEY = process.env.ODDS_API_KEY || "";
const ODDS_API_URL =
  "https://api.the-odds-api.com/v4/sports/golf_masters_tournament_winner/odds";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes — golf is slow, odds don't move fast
const QUOTA_HARD_STOP = 20; // stop calling API below this

export const dynamic = "force-dynamic";

// ── In-memory cache (survives across requests in the same process) ──

let cachedOdds: LiveOddsUpdate | null = null;
let cachedAt = 0; // timestamp ms
let quotaRemaining: number | null = null;
let quotaUsed: number | null = null;

function isCacheFresh(): boolean {
  return cachedOdds !== null && Date.now() - cachedAt < CACHE_TTL_MS;
}

// ── Fetch live odds from The Odds API ───────────────────────────

async function fetchLiveOdds(): Promise<LiveOddsUpdate | null> {
  if (!ODDS_API_KEY) return null;

  // Hard stop: don't call API if quota is critically low
  if (quotaRemaining !== null && quotaRemaining < QUOTA_HARD_STOP) {
    console.warn(
      `Odds API quota low (${quotaRemaining} remaining). Using cache/static.`
    );
    return null;
  }

  const url = new URL(ODDS_API_URL);
  url.searchParams.set("apiKey", ODDS_API_KEY);
  url.searchParams.set("regions", "us");
  url.searchParams.set("markets", "outrights");
  url.searchParams.set("bookmakers", "draftkings");
  url.searchParams.set("oddsFormat", "american");

  const res = await fetch(url.toString(), { cache: "no-store" });

  // Track quota from response headers
  const remaining = res.headers.get("x-requests-remaining");
  const used = res.headers.get("x-requests-used");
  if (remaining !== null) quotaRemaining = parseInt(remaining, 10);
  if (used !== null) quotaUsed = parseInt(used, 10);

  console.log(
    `[Odds API] Called. Quota: ${quotaRemaining} remaining, ${quotaUsed} used.`
  );

  if (!res.ok) {
    console.error(`Odds API responded ${res.status}`);
    return null;
  }

  const data = await res.json();
  const event = Array.isArray(data) ? data[0] : data;
  const dk = event?.bookmakers?.find(
    (b: { key: string }) => b.key === "draftkings"
  );
  if (!dk) return null;

  const outrightMarket = dk.markets?.find(
    (m: { key: string }) => m.key === "outrights" || m.key === "h2h"
  );
  if (!outrightMarket) return null;

  const players = (outrightMarket.outcomes || []).map(
    (o: { name: string; price: number }) => {
      const american = o.price >= 0 ? `+${o.price}` : String(o.price);
      const decimal =
        o.price >= 0
          ? Math.round((1 + o.price / 100) * 100) / 100
          : Math.round((1 + 100 / Math.abs(o.price)) * 100) / 100;
      const impliedProb =
        o.price >= 0
          ? Math.round((100 / (o.price + 100)) * 1000) / 10
          : Math.round(
              (Math.abs(o.price) / (Math.abs(o.price) + 100)) * 1000
            ) / 10;

      return {
        name: o.name,
        odds: {
          win: {
            american,
            decimal,
            impliedProb,
            previousImplied: impliedProb,
            movement: "stable" as const,
          },
        },
      };
    }
  );

  const result: LiveOddsUpdate = {
    lastUpdated: new Date().toISOString(),
    source: "DraftKings via The Odds API",
    quotaRemaining,
    quotaUsed,
    cached: false,
    players,
  };

  // Update cache
  cachedOdds = result;
  cachedAt = Date.now();

  return result;
}

// ── Static fallback ─────────────────────────────────────────────

async function getStaticOdds(): Promise<LiveOddsUpdate> {
  const staticData = await import("@/data/betting-odds.json");
  const data = staticData.default as unknown as {
    lastUpdated: string;
    source: string;
    players: {
      name: string;
      odds: Record<
        string,
        {
          american: string;
          decimal: number;
          impliedProb: number;
          movement: string;
        }
      >;
    }[];
  };

  return {
    lastUpdated: data.lastUpdated,
    source: data.source + " (static)",
    quotaRemaining,
    quotaUsed,
    cached: false,
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
            movement: (o.movement || "stable") as
              | "rising"
              | "falling"
              | "stable",
          },
        ])
      ),
    })),
  };
}

// ── Merge live win odds with static props ────────────────────────

function mergeOdds(
  liveWinOdds: LiveOddsUpdate,
  staticOdds: LiveOddsUpdate
): LiveOddsUpdate {
  const liveByName: Record<
    string,
    (typeof liveWinOdds.players)[number]
  > = {};
  for (const p of liveWinOdds.players) {
    liveByName[p.name] = p;
  }

  const merged = staticOdds.players.map((sp) => {
    const live = liveByName[sp.name];
    if (!live?.odds?.win) return sp;

    const prev = sp.odds?.win?.impliedProb ?? live.odds.win.impliedProb;
    const curr = live.odds.win.impliedProb;
    const diff = curr - prev;
    const movement: "rising" | "falling" | "stable" =
      diff < -1 ? "rising" : diff > 1 ? "falling" : "stable";

    return {
      ...sp,
      odds: {
        ...sp.odds,
        win: { ...live.odds.win, previousImplied: prev, movement },
      },
    };
  });

  for (const lp of liveWinOdds.players) {
    if (!staticOdds.players.some((sp) => sp.name === lp.name)) {
      merged.push(lp);
    }
  }

  return {
    lastUpdated: liveWinOdds.lastUpdated,
    source: "DraftKings (live win + static props)",
    quotaRemaining: liveWinOdds.quotaRemaining,
    quotaUsed: liveWinOdds.quotaUsed,
    cached: liveWinOdds.cached,
    players: merged,
  };
}

// ── Route handler ───────────────────────────────────────────────

export async function GET() {
  try {
    // Serve from cache if fresh (< 5 min old)
    if (isCacheFresh() && cachedOdds) {
      const staticOdds = await getStaticOdds();
      const merged = mergeOdds(
        { ...cachedOdds, cached: true },
        staticOdds
      );
      merged.cached = true;

      return NextResponse.json(merged, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
          "X-Data-Source": "live+static (cached)",
          "X-Odds-Quota-Remaining": String(quotaRemaining ?? "unknown"),
          "X-Cache-Age": String(
            Math.round((Date.now() - cachedAt) / 1000)
          ),
        },
      });
    }

    // Cache is stale — try fetching fresh odds
    const [liveOdds, staticOdds] = await Promise.all([
      fetchLiveOdds(),
      getStaticOdds(),
    ]);

    const odds = liveOdds
      ? mergeOdds(liveOdds, staticOdds)
      : staticOdds;

    return NextResponse.json(odds, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
        "X-Data-Source": liveOdds ? "live+static" : "static",
        "X-Odds-Quota-Remaining": String(quotaRemaining ?? "unknown"),
      },
    });
  } catch (error) {
    console.error("Live odds error:", error);

    // Serve cache if available, otherwise static
    if (cachedOdds) {
      return NextResponse.json(
        { ...cachedOdds, cached: true },
        { headers: { "X-Data-Source": "cached-fallback" } }
      );
    }

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
