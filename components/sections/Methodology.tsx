"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WeatherWidget } from "@/components/cards/WeatherWidget";

export function Methodology() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 space-y-6">
      <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">
        Methodology & Live Data
      </h2>

      {/* Weather Widget */}
      <WeatherWidget />

      {/* How The Models Work */}
      <div>
        <h3 className="mb-3 font-heading text-lg font-bold text-[var(--text-primary)]">
          How The Models Work
        </h3>
        <Accordion multiple className="rounded-lg border border-[var(--border-color)] bg-white">
          <AccordionItem value="simulator" className="border-b border-[var(--border-color)]">
            <AccordionTrigger className="px-5 py-4 text-sm font-semibold hover:no-underline">
              <span className="flex items-center gap-2">
                <span className="text-lg">🎲</span> The Simulator — Monte Carlo Engine
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              <p className="mb-3">
                The Simulator runs <strong>10,000 full tournament simulations</strong> using
                a Monte Carlo methodology. Each simulation models all four rounds at Augusta
                National, incorporating player-specific scoring distributions based on
                historical performance.
              </p>
              <p className="mb-3">
                <strong>Key inputs:</strong> Historical Augusta results (2005–2025), player
                strokes gained data (off the tee, approach, around the green, putting),
                course-specific fit metrics, and current form indicators.
              </p>
              <p className="mb-3">
                <strong>How it works:</strong> For each simulation, every player in the field
                receives a randomized score for each round, drawn from a distribution
                calibrated to their skill level and Augusta-specific performance. The model
                accounts for variance — the reason underdogs sometimes win — while
                statistically favoring players with elite strokes gained profiles that match
                Augusta&apos;s demands (long, accurate driving + precise approach play).
              </p>
              <p>
                <strong>Weight in consensus:</strong> 40% — the most statistically robust of
                our three models, grounded in hard numbers and repeated trials.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="scout" className="border-b border-[var(--border-color)]">
            <AccordionTrigger className="px-5 py-4 text-sm font-semibold hover:no-underline">
              <span className="flex items-center gap-2">
                <span className="text-lg">🔍</span> The Scout — Intangibles Scorer
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              <p className="mb-3">
                The Scout captures what pure statistics miss — the <strong>qualitative
                factors</strong> that separate contenders from pretenders at Augusta. Golf
                is a mental game, and The Masters amplifies that tenfold.
              </p>
              <p className="mb-3">
                <strong>Scoring categories (weighted):</strong>
              </p>
              <ul className="mb-3 list-disc pl-6 space-y-1">
                <li><strong>Momentum (25%):</strong> Recent form, confidence level, last 5 tournament results</li>
                <li><strong>Augusta Experience (20%):</strong> Number of appearances, familiarity with the course&apos;s unique challenges (Amen Corner, fast greens, elevation changes)</li>
                <li><strong>Major Clutch (20%):</strong> Performance under major championship pressure — scoring in final rounds, playoff record, ability to close</li>
                <li><strong>Weather Fit (15%):</strong> How a player&apos;s game translates in expected conditions — wind management, wet-weather ball flight, cold-weather scoring</li>
                <li><strong>Intangibles (20%):</strong> Narrative factors — defending champion momentum, career milestones in play, injury concerns, team changes, mental state</li>
              </ul>
              <p>
                <strong>Weight in consensus:</strong> 30% — captures the human elements that
                numbers alone can&apos;t quantify.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="analyst">
            <AccordionTrigger className="px-5 py-4 text-sm font-semibold hover:no-underline">
              <span className="flex items-center gap-2">
                <span className="text-lg">🧠</span> The Analyst — AI Narrative Engine
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              <p className="mb-3">
                The Analyst takes a <strong>holistic, narrative-driven approach</strong>,
                synthesizing the complete picture the way an expert golf columnist would.
                It considers everything: statistics, form, course history, injuries, weather,
                betting market signals, and the intangible &ldquo;it factor.&rdquo;
              </p>
              <p className="mb-3">
                <strong>Key inputs:</strong> Top 30 player profiles with comprehensive data,
                Augusta weather forecast, recent news and injury updates, historical Masters
                patterns, and betting market positioning.
              </p>
              <p className="mb-3">
                Unlike the other two models, The Analyst produces <strong>narrative
                rationales</strong> for each prediction — explaining not just who will
                contend, but <em>why</em>. This makes it the most interpretable model and
                often the best at identifying dark horses whose circumstances create a
                perfect storm for an upset.
              </p>
              <p>
                <strong>Weight in consensus:</strong> 30% — provides the contextual
                intelligence that bridges pure data and human intuition.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Consensus Methodology */}
      <div className="rounded-lg border border-[var(--border-color)] bg-white p-5">
        <h3 className="mb-3 font-heading text-base font-bold text-[var(--text-primary)]">
          Consensus Methodology
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg bg-[var(--bg-primary)] p-4 font-mono text-sm">
          <span className="rounded bg-masters-green-light px-2 py-1 text-masters-green font-semibold">
            40% Simulator
          </span>
          <span className="text-[var(--text-muted)]">+</span>
          <span className="rounded bg-masters-green-light px-2 py-1 text-masters-green font-semibold">
            30% Scout
          </span>
          <span className="text-[var(--text-muted)]">+</span>
          <span className="rounded bg-masters-green-light px-2 py-1 text-masters-green font-semibold">
            30% Analyst
          </span>
          <span className="text-[var(--text-muted)]">=</span>
          <span className="rounded bg-masters-gold-light px-2 py-1 text-masters-gold font-bold">
            Consensus
          </span>
        </div>
        <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed">
          Each model independently generates win probabilities, top 5/10/cut
          percentages, and rankings. The consensus combines these using a weighted
          average, then normalizes to ensure probabilities sum to 100%. The Simulator
          receives the highest weight (40%) due to its statistical rigor, while the
          Scout and Analyst each contribute 30% to balance quantitative and
          qualitative factors.
        </p>
      </div>

      {/* Data Sources */}
      <div className="rounded-lg border border-[var(--border-color)] bg-white p-5">
        <h3 className="mb-3 font-heading text-base font-bold text-[var(--text-primary)]">
          Data Sources & Transparency
        </h3>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-masters-green">•</span>
            <span>
              <strong>Masters Historical Results:</strong> Complete tournament data 2005–2025
              including round-by-round scores and final positions
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-masters-green">•</span>
            <span>
              <strong>PGA Tour Statistics:</strong> Strokes gained data, scoring averages,
              and performance metrics for the 2025–2026 season
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-masters-green">•</span>
            <span>
              <strong>Weather Data:</strong> Live forecast from Open-Meteo for Augusta, GA
              (tournament dates April 9–12)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-masters-green">•</span>
            <span>
              <strong>AI Analysis:</strong> Narrative predictions generated by advanced
              language models analyzing the complete data picture
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-[var(--bg-primary)] p-4 text-center">
        <p className="text-xs italic text-[var(--text-muted)]">
          For entertainment purposes only. AI predictions are probabilistic —
          that&apos;s what makes The Masters fun. Past performance does not guarantee
          future results. Please gamble responsibly.
        </p>
      </div>
    </section>
  );
}
