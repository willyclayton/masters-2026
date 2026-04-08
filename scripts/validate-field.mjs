#!/usr/bin/env node

/**
 * Validate Masters field and DraftKings odds data integrity.
 *
 * Usage:
 *   node scripts/validate-field.mjs              # dry-run report
 *   node scripts/validate-field.mjs --fix        # remove non-field players from data files
 *   node scripts/validate-field.mjs --fix --update-odds  # also update win odds with live DK data
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PLAYERS_PATH = path.join(ROOT, "data", "players-2026.json");
const ODDS_PATH = path.join(ROOT, "data", "betting-odds.json");
const PREDICTIONS_PATH = path.join(ROOT, "data", "predictions.json");

const args = process.argv.slice(2);
const FIX = args.includes("--fix");
const UPDATE_ODDS = args.includes("--update-odds");

// ── Read .env.local ────────────────────────────────────────────

function readEnv() {
  try {
    const envPath = path.join(ROOT, ".env.local");
    const content = fs.readFileSync(envPath, "utf8");
    const vars = {};
    for (const line of content.split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) vars[m[1]] = m[2].trim();
    }
    return vars;
  } catch {
    return {};
  }
}

const env = readEnv();

// ── Name normalization ─────────────────────────────────────────

// Map of special characters that NFD decomposition doesn't handle
const SPECIAL_CHARS = {
  ø: "o", Ø: "O", ð: "d", Ð: "D", þ: "th", Þ: "Th",
  æ: "ae", Æ: "AE", œ: "oe", Œ: "OE", ß: "ss", ł: "l", Ł: "L",
  á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n",
};

function normalize(name) {
  let s = name;
  // Replace special chars that NFD won't decompose
  for (const [from, to] of Object.entries(SPECIAL_CHARS)) {
    s = s.replaceAll(from, to);
  }
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
    .replace(/-/g, " ") // hyphens to spaces
    .replace(/\./g, "") // remove periods
    .replace(/'/g, "'") // normalize fancy apostrophes
    .replace(/\s+/g, " ") // collapse whitespace
    .trim()
    .toLowerCase();
}

// Build a lookup set from an array of names; returns { normalized→original } map
function buildNameLookup(names) {
  const map = {};
  for (const n of names) map[normalize(n)] = n;
  return map;
}

// ── ESPN API: fetch actual tournament field ────────────────────

async function fetchESPNField() {
  const url = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";
  console.log("Fetching ESPN scoreboard...");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN responded ${res.status}`);
  const data = await res.json();

  const event = data?.events?.[0];
  if (!event) throw new Error("No event found on ESPN scoreboard");

  const eventName = event.name || "";
  console.log(`ESPN event: "${eventName}"`);

  if (!eventName.toLowerCase().includes("masters")) {
    console.warn(
      `\n⚠️  WARNING: ESPN is not showing the Masters right now (showing "${eventName}").`
    );
    console.warn("   The field data may be for a different tournament.");
    console.warn("   Proceeding anyway — review results carefully.\n");
  }

  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];

  const names = competitors.map((c) => {
    const athlete = c.athlete || {};
    return athlete.displayName || "Unknown";
  });

  console.log(`ESPN field: ${names.length} players\n`);
  return names;
}

// ── The Odds API: fetch DraftKings odds ────────────────────────

async function fetchDraftKingsOdds() {
  const apiKey = env.ODDS_API_KEY;
  if (!apiKey) {
    console.warn("No ODDS_API_KEY in .env.local — skipping live odds fetch.\n");
    return null;
  }

  const url = new URL(
    "https://api.the-odds-api.com/v4/sports/golf_masters_tournament_winner/odds"
  );
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", "us");
  url.searchParams.set("markets", "outrights");
  url.searchParams.set("bookmakers", "draftkings");
  url.searchParams.set("oddsFormat", "american");

  console.log("Fetching DraftKings odds from The Odds API...");
  const res = await fetch(url.toString());

  const remaining = res.headers.get("x-requests-remaining");
  const used = res.headers.get("x-requests-used");
  console.log(`Odds API quota: ${remaining} remaining, ${used} used`);

  if (!res.ok) {
    console.warn(`Odds API responded ${res.status} — skipping live odds.\n`);
    return null;
  }

  const data = await res.json();
  const event = Array.isArray(data) ? data[0] : data;
  if (!event) {
    console.warn("No Masters event found on The Odds API.\n");
    return null;
  }

  const dk = event.bookmakers?.find((b) => b.key === "draftkings");
  if (!dk) {
    console.warn("DraftKings not found in Odds API response.\n");
    return null;
  }

  const outrightMarket = dk.markets?.find(
    (m) => m.key === "outrights" || m.key === "h2h"
  );
  if (!outrightMarket) {
    console.warn("No outrights market found.\n");
    return null;
  }

  const odds = {};
  for (const o of outrightMarket.outcomes || []) {
    const american = o.price >= 0 ? `+${o.price}` : String(o.price);
    const decimal =
      o.price >= 0
        ? Math.round((1 + o.price / 100) * 100) / 100
        : Math.round((1 + 100 / Math.abs(o.price)) * 100) / 100;
    const impliedProb =
      o.price >= 0
        ? Math.round((100 / (o.price + 100)) * 1000) / 10
        : Math.round((Math.abs(o.price) / (Math.abs(o.price) + 100)) * 1000) / 10;

    odds[o.name] = { american, decimal, impliedProb };
  }

  console.log(`DraftKings odds: ${Object.keys(odds).length} players\n`);
  return odds;
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  console.log("=== Masters 2026 Field Validation ===\n");

  // 1. Fetch external data
  let espnField;
  try {
    espnField = await fetchESPNField();
  } catch (err) {
    console.error("Failed to fetch ESPN field:", err.message);
    console.error("Cannot validate without ESPN data. Exiting.");
    process.exit(1);
  }

  const dkOdds = await fetchDraftKingsOdds();

  // 2. Read local data files
  const playersData = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf8"));
  const oddsData = JSON.parse(fs.readFileSync(ODDS_PATH, "utf8"));
  const predictionsData = JSON.parse(fs.readFileSync(PREDICTIONS_PATH, "utf8"));

  const localPlayerNames = playersData.map((p) => p.name);
  const localOddsNames = oddsData.players.map((p) => p.name);
  const localPredNames = predictionsData.consensus.rankings.map((r) => r.name);

  // 3. Build normalized lookups
  const espnLookup = buildNameLookup(espnField);
  const espnNormSet = new Set(Object.keys(espnLookup));

  const dkLookup = dkOdds ? buildNameLookup(Object.keys(dkOdds)) : null;

  // 4. Cross-reference: find players NOT in ESPN field
  function findMissing(names, label) {
    const missing = [];
    const matched = [];
    for (const name of names) {
      const norm = normalize(name);
      if (espnNormSet.has(norm)) {
        matched.push(name);
      } else {
        missing.push(name);
      }
    }
    return { missing, matched };
  }

  const playersResult = findMissing(localPlayerNames, "players-2026.json");
  const oddsResult = findMissing(localOddsNames, "betting-odds.json");
  const predsResult = findMissing(localPredNames, "predictions.json");

  // 5. Find ESPN players not in our data
  const localNormSet = new Set(localPlayerNames.map(normalize));
  const espnNotInLocal = espnField.filter((n) => !localNormSet.has(normalize(n)));

  // 6. Print report
  console.log("════════════════════════════════════════════════════════════");
  console.log("                    VALIDATION REPORT");
  console.log("════════════════════════════════════════════════════════════\n");

  console.log(`ESPN field size:          ${espnField.length}`);
  console.log(`players-2026.json:        ${localPlayerNames.length}`);
  console.log(`betting-odds.json:        ${localOddsNames.length}`);
  console.log(`predictions.json:         ${localPredNames.length}`);
  if (dkOdds) {
    console.log(`Live DraftKings odds:     ${Object.keys(dkOdds).length}`);
  }

  console.log("\n── Players in our data but NOT in ESPN field ──────────────\n");

  if (playersResult.missing.length === 0) {
    console.log("  (none — all players verified!)\n");
  } else {
    console.log(`  ${playersResult.missing.length} player(s) to REMOVE from players-2026.json:`);
    for (const name of playersResult.missing) {
      const hasDkOdds = dkOdds
        ? Object.keys(dkOdds).some((dk) => normalize(dk) === normalize(name))
        : "unknown";
      console.log(`    ✗ ${name}  [DK odds: ${hasDkOdds}]`);
    }
    console.log();
  }

  if (oddsResult.missing.length > 0) {
    console.log(`  ${oddsResult.missing.length} player(s) to REMOVE from betting-odds.json:`);
    for (const name of oddsResult.missing) {
      console.log(`    ✗ ${name}`);
    }
    console.log();
  }

  if (predsResult.missing.length > 0) {
    console.log(`  ${predsResult.missing.length} player(s) to REMOVE from predictions.json:`);
    for (const name of predsResult.missing) {
      console.log(`    ✗ ${name}`);
    }
    console.log();
  }

  if (espnNotInLocal.length > 0) {
    console.log("── ESPN field players NOT in our data (informational) ─────\n");
    for (const name of espnNotInLocal) {
      console.log(`    + ${name}`);
    }
    console.log();
  }

  // DraftKings odds verification
  if (dkOdds) {
    console.log("── DraftKings Odds Verification ──────────────────────────\n");
    const dkNormMap = {};
    for (const [name, odds] of Object.entries(dkOdds)) {
      dkNormMap[normalize(name)] = { name, ...odds };
    }

    let verified = 0;
    let unverified = 0;
    let mismatch = 0;

    for (const bp of oddsData.players) {
      const norm = normalize(bp.name);
      if (dkNormMap[norm]) {
        verified++;
        const live = dkNormMap[norm];
        const staticAmerican = bp.odds?.win?.american;
        if (staticAmerican && staticAmerican !== live.american) {
          mismatch++;
          if (mismatch <= 10) {
            console.log(
              `    △ ${bp.name}: static ${staticAmerican} → live ${live.american}`
            );
          }
        }
      } else {
        unverified++;
        if (unverified <= 10) {
          console.log(`    ? ${bp.name}: no live DK odds found`);
        }
      }
    }
    if (mismatch > 10) console.log(`    ... and ${mismatch - 10} more mismatches`);
    if (unverified > 10) console.log(`    ... and ${unverified - 10} more unverified`);
    console.log(
      `\n  Summary: ${verified} verified, ${mismatch} with different odds, ${unverified} unverified\n`
    );
  }

  // 7. Apply fixes if --fix flag
  if (!FIX) {
    console.log("════════════════════════════════════════════════════════════");
    console.log("  DRY RUN — no changes made.");
    console.log("  Run with --fix to remove non-field players.");
    console.log("  Run with --fix --update-odds to also update DK win odds.");
    console.log("════════════════════════════════════════════════════════════\n");
    return;
  }

  console.log("════════════════════════════════════════════════════════════");
  console.log("                  APPLYING FIXES");
  console.log("════════════════════════════════════════════════════════════\n");

  // Filter players-2026.json
  const filteredPlayers = playersData.filter((p) => espnNormSet.has(normalize(p.name)));
  const removedPlayers = playersData.length - filteredPlayers.length;
  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(filteredPlayers, null, 2) + "\n");
  console.log(`players-2026.json: kept ${filteredPlayers.length}, removed ${removedPlayers}`);

  // Filter betting-odds.json
  const filteredOddsPlayers = oddsData.players.filter((p) =>
    espnNormSet.has(normalize(p.name))
  );
  const removedOdds = oddsData.players.length - filteredOddsPlayers.length;

  // Update win odds with live DK data if requested
  if (UPDATE_ODDS && dkOdds) {
    const dkNormMap = {};
    for (const [name, odds] of Object.entries(dkOdds)) {
      dkNormMap[normalize(name)] = odds;
    }

    let updated = 0;
    for (const bp of filteredOddsPlayers) {
      const norm = normalize(bp.name);
      const live = dkNormMap[norm];
      if (live && bp.odds?.win) {
        bp.odds.win.american = live.american;
        bp.odds.win.decimal = live.decimal;
        bp.odds.win.impliedProb = live.impliedProb;
        bp.odds.win.movement = "stable";
        updated++;
      }
    }
    console.log(`betting-odds.json: updated ${updated} win odds with live DK data`);
  }

  oddsData.players = filteredOddsPlayers;
  oddsData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(ODDS_PATH, JSON.stringify(oddsData, null, 2) + "\n");
  console.log(`betting-odds.json: kept ${filteredOddsPlayers.length}, removed ${removedOdds}`);

  // Filter predictions.json
  const filteredPreds = predictionsData.consensus.rankings.filter((r) =>
    espnNormSet.has(normalize(r.name))
  );
  const removedPreds =
    predictionsData.consensus.rankings.length - filteredPreds.length;
  predictionsData.consensus.rankings = filteredPreds;
  fs.writeFileSync(PREDICTIONS_PATH, JSON.stringify(predictionsData, null, 2) + "\n");
  console.log(`predictions.json: kept ${filteredPreds.length}, removed ${removedPreds}`);

  console.log("\nDone! Run `npm run build` to verify the app still builds.\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
