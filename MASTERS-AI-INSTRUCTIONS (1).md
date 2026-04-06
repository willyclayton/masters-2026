# The Green Jacket Lab — Claude Code Build Instructions

> Three AI models. One green jacket. Who takes Augusta?

An AI-powered prediction platform for the **2026 Masters Tournament** (April 9–12, Augusta National Golf Club). Built mobile-first, themed authentically around the Masters aesthetic, and designed to feel like a premium editorial sports experience — not an AI dashboard.

---

## Stack & Deployment
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Fonts:** Google Fonts — `Playfair Display` (serif, headings) + `Inter` (sans, body)
- **Deployment:** Vercel
- **AI Backend:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Weather:** OpenWeatherMap or WeatherAPI (free tier)
- **Data:** Hardcoded JSON + Claude enrichment

---

## Design System — "Augusta Editorial"

The single most important thing about this project is the design. It should feel like a premium golf publication crossed with a clean data product. Think: the masters.com website's restraint meets The Athletic's editorial clarity. **Not** a generic AI/tech dashboard. No gradients, no floating particles, no neon accents, no "neural network" visuals.

### Color Palette (use consistently EVERYWHERE)

| Token | Hex | Usage |
|-------|-----|-------|
| `--masters-green` | `#006B54` | Primary brand. Header, CTAs, active states, key accents. (Pantone 342 — the actual green jacket color) |
| `--masters-green-dark` | `#004D3C` | Hover states, pressed states, dark text on light |
| `--masters-green-light` | `#E8F5F0` | Light tint backgrounds, card hover fills, subtle section dividers |
| `--masters-gold` | `#C8A951` | Badges, winner highlights, the #1 pick accent, special callouts. Use SPARINGLY — gold is the punctuation, not the sentence. |
| `--masters-gold-light` | `#FBF5E6` | Light gold tint for featured/highlighted cards |
| `--bg-primary` | `#FAFAF7` | Page background — warm off-white, like aged paper |
| `--bg-card` | `#FFFFFF` | Card surfaces |
| `--border` | `#E5E5DC` | Card borders, dividers — warm gray, not cool |
| `--text-primary` | `#1A1A18` | Headings, primary text |
| `--text-secondary` | `#6B6B63` | Secondary text, labels, metadata |
| `--text-muted` | `#9B9B90` | Tertiary text, timestamps |
| `--red-flag` | `#C0392B` | Injury flags, negative indicators |
| `--blue-info` | `#2E6B8A` | Informational badges, weather |

### Typography
- **Headings (h1-h3):** `Playfair Display`, serif. Use for the site title, section headers, player names in hero cards. Gives that classic Augusta/editorial golf feel.
- **Body/UI:** `Inter`, sans-serif. All stats, labels, buttons, descriptions.
- **Numbers/Stats:** `Inter` tabular nums (`font-variant-numeric: tabular-nums`). Monospaced digits so percentages align cleanly.
- **Sizing:** Mobile-first. Body 15px on mobile, 16px on desktop. Headings scale fluidly with `clamp()`.

### Design Rules (ENFORCE THESE)
1. **Generous whitespace.** Padding minimum 16px on mobile, 24px+ on desktop. Cards have breathing room. Nothing feels cramped.
2. **Subtle borders, not shadows.** Use 1px `--border` color borders on cards. No drop shadows except on the sticky header (subtle, 2px blur max).
3. **Rounded but not bubbly.** Border radius: 8px on cards, 6px on buttons, 4px on badges. Not 16px+ — this isn't a kids' app.
4. **One green, one gold.** The green and gold should be the ONLY brand colors. No random blues, purples, or reds creeping in except for functional purposes (injury red, weather blue).
5. **Photo-free player cards.** Don't try to load player headshots (licensing issues). Instead, use the player's initials in a circular badge with `--masters-green` background and white text. Clean and distinctive.
6. **Smooth transitions.** All hover/tap states transition 150-200ms ease. Tab switches crossfade. Number animations count up from 0 over ~800ms on first load.
7. **No loading spinners — use skeletons.** Shimmer/pulse skeleton screens in `--masters-green-light` while data loads.
8. **Flag icon.** Use a small golf flag emoji (⛳) or SVG as the favicon and as a subtle decorative element. The site's personality comes from restraint, not decoration.

### shadcn/ui Components to Use
Initialize shadcn/ui with the custom Masters color theme. Key components:
- `Card` — player cards, model cards, weather widget
- `Badge` — player tags (Past Champion, Dark Horse, Injured, LIV Golfer)
- `Tabs` — only on desktop as an alternative nav; mobile uses hamburger
- `Progress` — win probability bars (themed green fill on warm gray track)
- `Tooltip` — stat explanations on hover/long-press
- `Separator` — section dividers
- `Collapsible` / `Accordion` — expandable player detail sections
- `Sheet` — mobile hamburger menu slide-out
- `Skeleton` — loading states

---

## Mobile-First UX (CRITICAL)

This site will primarily be viewed on phones (LinkedIn shares, text messages). Mobile is not an afterthought — it IS the product.

### Navigation: Sticky Header + Hamburger
- **Sticky header** — always visible at top. Contains:
  - Left: Hamburger icon (☰) that opens a `Sheet` (slide-from-left drawer)
  - Center: "The Green Jacket Lab" in `Playfair Display`, compact
  - Right: Small ⛳ icon or "2026" badge
  - Background: `--masters-green` with white text
  - On scroll: slight shadow appears (2px, subtle)
  - Auto-hides on scroll down, reappears on scroll up (saves screen space)
- **Hamburger drawer (Sheet):**
  - Full-height slide-out from left
  - Background: white
  - Navigation items:
    - 🏆 **AI Predictions** (default)
    - 👤 **Player Profiles**
    - 🔬 **Methodology & Live Data**
    - Separator
    - ⛳ About / Disclaimer
    - Share button
  - Active page highlighted with `--masters-green` left border accent
  - Tap outside or swipe left to close
- **Desktop (768px+):** Show horizontal tab bar below header instead of hamburger. Same 3 pages as tabs. Centered, clean.

### Mobile Layout Principles
- **Full-width cards** with 16px horizontal padding
- **Single column** — no side-by-side layouts on mobile (except small stat pairs like "Win % | Top 10 %")
- **Thumb-friendly tap targets** — minimum 44x44px on all interactive elements
- **Swipe hints** — if any horizontal scroll carousels exist (e.g., model comparison), show a subtle fade/peek on the right edge
- **Bottom padding** — add 80px+ bottom padding to avoid content being cut off behind any browser chrome
- **No horizontal scroll on the page itself** — ever
- **Pull-to-refresh feel** — if feasible, let users pull down to re-run the LLM model or refresh weather

### Breakpoints
- Mobile: 0-639px (default, design here first)
- Tablet: 640-1023px (2-column card grids)
- Desktop: 1024px+ (3-column grids, sidebar possible, max-width 1200px container)

---

## Page Structure — 3 Sections

### Section 1: "AI Predictions" (Default/Home)

**Hero Block (top of page):**
- Masters green gradient banner (subtle, `--masters-green` to `--masters-green-dark`)
- "The Green Jacket Lab" in large `Playfair Display` white text
- Subtitle: "Three AI models predict the 2026 Masters" in `Inter` light
- Small gold ⛳ icon
- "Last updated: [timestamp]" in muted text

**Consensus Winner Card (THE shareable moment):**
- Largest card on the page. Centered. Gold left border accent (`--masters-gold`).
- Layout:
  - Player initials circle (large, 64px, green bg, white serif letter)
  - Player name in `Playfair Display` h2
  - "AI Consensus Pick" gold `Badge`
  - **Win Probability: XX.X%** — large number, counts up on load, green text
  - Top 10 Probability: XX.X% — smaller, secondary
  - One-sentence AI rationale in italic (e.g., *"Elite approach play, Augusta pedigree, and peak current form make him the clear statistical favorite."*)
- **Share button** on this card — "Share Pick" button that copies a pre-formatted text blurb + link to clipboard. Design it to be obvious and tappable.

**Model Agreement Indicator:**
- Simple visual: 3 small circles (one per model), all green if they agree on the winner, mixed colors if they disagree
- "All 3 models agree" or "Models split — The Simulator and The Analyst pick [X], The Scout picks [Y]"
- This is the intrigue/hook that makes people explore further

**Top 10 Leaderboard:**
- Numbered list (1-10), each row is a compact card:
  - Rank number (large, bold)
  - Player initials circle (small, 36px)
  - Player name
  - Combined win % (with mini horizontal `Progress` bar, green fill)
  - Tap to expand: shows each model's individual probability as 3 small bars
- Alternating row backgrounds: white and `--bg-primary` for readability

**Model Breakdown (3 cards):**
- Horizontal scroll carousel on mobile (3 cards, peek the next one)
- Grid on desktop (3 columns)
- Each card:
  - Model name + emoji icon
    - 🎲 **The Simulator** (Monte Carlo)
    - 🔍 **The Scout** (Intangibles)
    - 🧠 **The Analyst** (LLM)
  - That model's #1 pick + win %
  - Top 5 mini-list
  - "How it works" one-liner
  - Card themed with very subtle model-specific accent (all still within the green/gold palette)

---

### Section 2: "Player Profiles"

**Search & Filter Bar (sticky below header on this page):**
- Search input: "Search players..." with green focus ring
- Filter chips (horizontally scrollable): All | Favorites (top 10) | Past Champions | Dark Horses | LIV Golfers
- Active filter chip: filled green, white text. Inactive: outlined.

**Player Card Grid:**
- Mobile: single column, full-width cards
- Tablet: 2 columns
- Desktop: 3 columns

**Player Card (collapsed state — what you see in the grid):**
- Player initials circle (40px)
- Player name (`Playfair Display`, medium weight)
- World ranking badge (small, muted)
- **Momentum Score:** 0-100, shown as a small circular progress indicator or horizontal bar
- **Current Form:** Last 5 tournament results as small dots (green = top 10, yellow = top 25, gray = missed cut, red = WD)
- **Masters History:** "Best: T3 (2022) | Played: 8x" — compact one-liner
- **Badges row:** Relevant tags — "Past Champion" (gold badge), "LIV" (muted badge), "Injury" (red badge), "Rookie" (blue badge)
- **Tap/click to expand →**

**Player Card (expanded state — accordion or modal):**
Expands below the card (accordion style on mobile, right-panel or modal on desktop):
- **AI Analysis:** 2-3 sentence Claude-generated scouting report
- **Win Probability:** Show all 3 model predictions side by side
- **Masters History Table:** Year | Finish | Score (last 10 appearances, scrollable)
- **2026 Season Stats:**
  - Events Played, Wins, Top 10s, Cuts Made
  - Strokes Gained breakdown: OTT, Approach, Around Green, Putting (shown as small horizontal bars, with tour average line)
- **Weather Fit:** "Performs well in [wind/rain/calm]" with indicator
- **Intangibles Note:** Free-text blurb — injury status, storyline, narrative factors
- **Collapse** button at bottom

**Key Players to Pre-Build Rich Profiles For:**
(These get the most detailed data — everyone else gets basics)
- Scottie Scheffler (#1, 2x Masters champ)
- Rory McIlroy (defending champion, career grand slam)
- Bryson DeChambeau (U.S. Open champ, LIV, huge following)
- Jon Rahm (2023 Masters winner, LIV)
- Xander Schauffele (2x major winner)
- Ludvig Åberg (young gun, 2024 runner-up)
- Collin Morikawa (2x major winner — check back injury status)
- Tommy Fleetwood (2025 Tour Championship winner)
- Patrick Cantlay, Shane Lowry, Sam Burns, Justin Rose, Russell Henley
- Gary Woodland (brain tumor comeback story)
- Keegan Bradley (PGA Tour winner, Ryder Cup captain)
- **NOTABLE ABSENCES:** Tiger Woods (withdrawn — DUI), Phil Mickelson (withdrawn — family health)

---

### Section 3: "Methodology & Live Data"

**Weather Widget (prominent, top of section):**
- Card with blue-info accent
- "Augusta, GA — Tournament Week Forecast"
- 4-day grid (Thu Apr 9 – Sun Apr 12):
  - Day label
  - Weather icon (sun, clouds, rain — use simple SVG icons, not emoji)
  - High/Low temp (°F)
  - Wind: speed + direction
  - Precipitation %
- Below: "Weather Impact Note" — 1-2 sentences on how conditions affect scoring/player selection
- Data source: OpenWeatherMap or WeatherAPI free tier
- Auto-refreshes every 4 hours

**How The Models Work (3 expandable sections):**

🎲 **The Simulator — Monte Carlo Method**
- Explain: Runs 10,000 simulated tournaments
- Inputs: Historical Augusta results (2005-2025), player strokes gained data, course fit scoring, current form weighting
- How course fit works: Augusta rewards length, high ball flight, elite putting on fast bentgrass greens, scrambling (Amen Corner recovery)
- Limitations: Pure numbers — doesn't account for narratives, injuries, or pressure
- Visual: Simple diagram showing "Player Stats → Simulation Engine → Win Probability Distribution"

🔍 **The Scout — Intangibles Model**
- Explain: Weighted scoring model for factors the numbers miss
- Inputs: Injury reports, player momentum/trending direction, Augusta experience (times played), major championship clutch rating, weather fit, narrative factors (comeback story, defending champ motivation, etc.)
- Each factor scored 0-10, weights applied:
  - Current Momentum: 25%
  - Augusta Experience: 20%
  - Major Clutch Factor: 20%
  - Weather Fit: 15%
  - Intangibles/News: 20%
- Visual: Factor breakdown bar chart for any given player

🧠 **The Analyst — LLM Consensus**
- Explain: Claude analyzes the complete picture — stats, form, conditions, narratives — and gives its prediction
- Inputs: Top 30 players with full profiles, weather forecast, recent news, betting market signals
- Process: Single rich prompt → structured JSON response → ranked top 10 with rationale
- Unique value: Can synthesize qualitative factors that pure models can't (e.g., "McIlroy's mental game has visibly improved since his U.S. Open heartbreak")
- Limitations: Subjective, based on training data patterns

**Consensus Methodology:**
- Weighted combination: Simulator 40% + Scout 30% + Analyst 30%
- Explain why these weights (Simulator has the most robust statistical foundation, but the other two capture important qualitative factors)
- Show the formula visually

**Data Sources & Transparency:**
- Historical results: Masters Tournament records 2005-2025
- Player stats: PGA Tour public data, Data Golf
- Weather: [API name] free tier
- News/narratives: Claude AI analysis of recent golf reporting
- Disclaimer: "These predictions are for entertainment purposes only. Golf is inherently unpredictable — that's what makes it great."

**Social/Market Sentiment (if feasible):**
- "Where the public money is going" — show top 5 most-bet players with relative bar chart
- Source: Public betting odds aggregation or manually compiled
- If not feasible to get live data, hardcode pre-tournament consensus odds as a static reference

---

## The Three AI Models — Implementation

### Model 1: The Simulator (Monte Carlo)
```
Implementation: /lib/monte-carlo.ts

Approach:
- For each player, define a scoring distribution based on:
  - Base skill: weighted average of recent strokes gained total
  - Augusta adjustment: course fit multiplier (favor long hitters, good approach players, elite putters)
  - Form adjustment: recent results weight (last 3 months weighted 2x vs last 12 months)
  - Experience adjustment: slight bonus for players with 5+ Masters appearances

- For each simulation (10,000 total):
  - Sample 4 rounds of scores for each player from their distribution
  - Sum to get tournament total
  - Determine winner (lowest total)
  - Track wins, top 5s, top 10s, made cuts

- Output per player:
  - Win %: wins / 10000
  - Top 5 %: top5s / 10000
  - Top 10 %: top10s / 10000
  - Make Cut %: cuts / 10000

Can run client-side in a Web Worker to avoid blocking UI.
Pre-compute on build as a fallback (store results in JSON).
```

### Model 2: The Scout (Intangibles)
```
Implementation: /lib/intangibles-scorer.ts

For each player, score these factors (0-10 scale):

1. Current Momentum (25% weight)
   - Based on last 5 tournament finishes
   - Win = 10, Top 5 = 8, Top 10 = 6, Top 25 = 4, MC = 1

2. Augusta Experience (20% weight)
   - 0 appearances = 2 (penalty for rookies but not zero — talent matters)
   - 1-3 appearances = 5
   - 4-7 appearances = 7
   - 8+ appearances = 9
   - Past champion = 10

3. Major Clutch Factor (20% weight)
   - Major wins * 2.5 + Major top 10s * 0.5 (capped at 10)

4. Weather Fit (15% weight)
   - Cross-reference player's historical performance in similar weather
   - Wind performance, rain performance from historical data
   - Match against this week's forecast

5. Intangibles/News (20% weight)
   - Claude-enriched: feed player name + recent news, return 0-10 score
   - Injury = penalty (-3 to -5 depending on severity)
   - Hot storyline = bonus (+1 to +2 for narrative momentum)
   - Defending champ = +1

Composite = weighted sum, normalize to 0-100 "Scout Score"
Convert to win probability via softmax across all players
```

### Model 3: The Analyst (LLM)
```
Implementation: /lib/claude-analyst.ts

Single Claude API call with a rich prompt:

System prompt: "You are an expert golf analyst predicting the 2026 Masters Tournament.
Analyze the provided player data, weather conditions, and news. Return a JSON object
with your top 10 predicted finishers, each with a win probability (%) and a 1-2 sentence
rationale. Be specific — reference stats, course fit, and current form. Be bold in your
picks — don't just pick the favorites."

User prompt: Include:
- Top 30 player profiles (name, world rank, recent form, SG stats, Masters history)
- 4-day weather forecast
- Recent injury/news notes
- Current betting favorites (as market signal)

Parse response as JSON. Cache result — don't re-call on every page load.
Add a "Re-run Analysis" button that triggers a fresh call (rate-limited, max 1/hour).
```

### Consensus Combination
```
Implementation: /lib/consensus.ts

1. Normalize each model's output to probabilities that sum to 100%
2. Weighted average: 0.4 * Simulator + 0.3 * Scout + 0.3 * Analyst
3. Re-normalize final probabilities
4. Rank by final probability
5. Output: ordered list with per-player consensus %, plus each model's individual %
```

---

## Data Files

### `/data/masters-history.json`
Historical Masters results 2005-2025. Per entry:
```json
{
  "year": 2025,
  "winner": "Rory McIlroy",
  "winnerScore": -11,
  "playoff": true,
  "playoffOpponent": "Justin Rose",
  "topResults": [
    { "player": "Rory McIlroy", "position": 1, "score": -11, "rounds": [70, 68, 66, 73] },
    { "player": "Justin Rose", "position": 2, "score": -11, "rounds": [65, 73, 73, 66] }
  ]
}
```

### `/data/players-2026.json`
Field of ~80-90 players. Per player:
```json
{
  "name": "Scottie Scheffler",
  "initials": "SS",
  "worldRanking": 1,
  "age": 29,
  "country": "USA",
  "livGolfer": false,
  "mastersAppearances": 6,
  "mastersWins": 2,
  "mastersBestFinish": 1,
  "mastersHistory": [
    { "year": 2024, "position": 1, "score": -10 },
    { "year": 2023, "position": "T10", "score": -5 }
  ],
  "majorWins": 2,
  "season2026": {
    "events": 8,
    "wins": 2,
    "top10s": 5,
    "cutsMade": 8
  },
  "strokesGained": {
    "total": 2.45,
    "offTheTee": 0.65,
    "approach": 0.82,
    "aroundGreen": 0.48,
    "putting": 0.50
  },
  "momentumLast5": ["W", "T3", "T8", "T2", "T15"],
  "injuryStatus": "healthy",
  "narrative": "Two-time Masters champion entering peak form. Won twice already in 2026.",
  "tags": ["Past Champion", "World #1", "Favorite"]
}
```

---

## Project Structure
```
/app
  /layout.tsx                — Root layout, fonts, metadata, theme
  /page.tsx                  — Main SPA with section routing
  /globals.css               — Tailwind + CSS variables (Masters theme)
  /api/
    /weather/route.ts        — Proxy to weather API
    /predict/route.ts        — Claude API call for The Analyst
/components
  /layout/
    Header.tsx               — Sticky header + hamburger
    MobileNav.tsx            — Sheet drawer navigation
    DesktopTabs.tsx          — Horizontal tabs for 768px+
  /sections/
    Predictions.tsx          — AI Predictions section
    PlayerProfiles.tsx       — Player Profiles section
    Methodology.tsx          — Methodology & Live Data section
  /cards/
    ConsensusCard.tsx        — THE hero card with share button
    PlayerCard.tsx           — Collapsible player card
    ModelCard.tsx            — Model summary card
    WeatherWidget.tsx        — 4-day forecast card
  /ui/
    CountUpNumber.tsx        — Animated number counter
    MomentumDots.tsx         — Last 5 results dot visualization
    WinProbBar.tsx           — Green progress bar for probabilities
    InitialsAvatar.tsx       — Player initials circle
    ShareButton.tsx          — Copy-to-clipboard share
    FilterChips.tsx          — Horizontal scrollable filter chips
    ModelAgreement.tsx       — 3-dot agreement indicator
    SkeletonCard.tsx         — Loading skeleton
  /charts/
    StrokesGainedBars.tsx    — Horizontal bar chart for SG categories
    ModelComparison.tsx      — 3-model probability comparison bars
/data
  masters-history.json
  players-2026.json
  model-weights.json
/lib
  monte-carlo.ts
  intangibles-scorer.ts
  claude-analyst.ts
  consensus.ts
  weather.ts
  types.ts
  utils.ts
```

---

## Environment Variables
```env
ANTHROPIC_API_KEY=           # Claude API for The Analyst model
NEXT_PUBLIC_WEATHER_API_KEY= # OpenWeatherMap or WeatherAPI
```

---

## Build Priority (MVP → Polish)

### Phase 1: Foundation
1. Next.js project scaffolding + Tailwind + shadcn/ui init
2. Masters color theme applied globally (CSS variables)
3. Fonts loaded (`Playfair Display` + `Inter`)
4. Sticky header + hamburger nav + Sheet drawer working on mobile
5. 3-section routing (SPA-style, no page reloads)
6. Responsive breakpoints confirmed

### Phase 2: Data & Models
7. Hardcode `players-2026.json` with top 30 players (full data)
8. Hardcode `masters-history.json` (2005-2025)
9. Build Monte Carlo simulation (`/lib/monte-carlo.ts`)
10. Build Intangibles scorer (`/lib/intangibles-scorer.ts`)
11. Build Claude Analyst integration (`/lib/claude-analyst.ts`)
12. Build consensus combination (`/lib/consensus.ts`)

### Phase 3: UI Assembly
13. Consensus Winner card with CountUpNumber animation
14. Top 10 leaderboard with expandable rows
15. Model breakdown carousel (horizontal scroll mobile, grid desktop)
16. Player Profiles grid with search + filter chips
17. Expandable player cards (collapsed → full detail)
18. Weather widget with 4-day forecast
19. Methodology expandable sections

### Phase 4: Polish & Ship
20. Skeleton loading states everywhere
21. Share button on Consensus card (clipboard copy)
22. Header auto-hide on scroll down / show on scroll up
23. Smooth tab/section transitions
24. Model agreement indicator
25. Mobile QA — test at 375px, 390px, 414px widths
26. SEO meta tags + Open Graph image for social shares
27. Deploy to Vercel

### Stretch Goals
- "My Picks vs AI" — user selects their top 5, compare to models
- Live tournament scoring integration (Thu-Sun)
- Twitter/X sentiment aggregation
- Player comparison tool (select 2, side by side)
- Dark mode toggle (dark green `#002A1F` background variant)

---

## Copy & Tone
- **Voice:** Confident, knowledgeable, editorial. Like a sharp golf columnist who happens to know data science.
- **Short copy.** No long paragraphs. Punchy sentences. Stats speak.
- **Golf vernacular:** Use naturally — Amen Corner, Augusta pedigree, strokes gained, Sunday red, green jacket.
- **Disclaimer (footer):** "For entertainment purposes only. AI predictions are probabilistic — that's what makes The Masters fun. Built with ⛳ by Will Clayton."
- **Credit line:** Link to willyclayton.com

---

## Key Context: 2026 Masters

- **Dates:** April 9-12, 2026
- **Defending Champion:** Rory McIlroy (won 2025 in playoff over Justin Rose, completed career grand slam)
- **World #1:** Scottie Scheffler
- **Notable absences:** Tiger Woods (withdrew — DUI arrest March 2026), Phil Mickelson (withdrew — family health matter). First time since 1994 neither is in the field.
- **Storylines:** McIlroy defending, Scheffler chasing 3rd jacket, DeChambeau/Rahm as LIV contenders, Fleetwood chasing first major, Woodland's comeback, Åberg's emergence
- **Course:** Augusta National, par 72, 7512 yards. Hurricane Helene (Sept 2024) damaged ~1000+ trees but course fully recovered.
