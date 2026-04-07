"use client";

import { GolferSilhouette } from "./GolferSilhouette";

interface CategoryData {
  id: string;
  label: string;
  emoji: string;
  stats: { fraction: string; label: string; criteriaKey: string; inverted?: boolean }[];
}

interface LayoutProps {
  categories: CategoryData[];
}

export function Layout07Blueprint({ categories }: LayoutProps) {
  return (
    <div className="relative">
      {/* Blueprint background */}
      <div
        className="rounded-lg p-6 md:p-10 relative overflow-hidden"
        style={{
          background: "#0A2E24",
          backgroundImage: `
            linear-gradient(rgba(200,169,81,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,169,81,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      >
        {/* Title */}
        <div className="text-center mb-8 relative z-10">
          <h3
            className="text-2xl font-bold tracking-[0.2em] uppercase"
            style={{
              fontFamily: "monospace",
              color: "#C8A951",
              textShadow: "0 0 10px rgba(200,169,81,0.3)",
            }}
          >
            MASTERS CHAMPION SPEC
          </h3>
          <div className="w-32 h-px bg-[#C8A951] mx-auto mt-2 opacity-40" />
          <p
            className="text-xs mt-2 tracking-wider uppercase"
            style={{ color: "rgba(200,169,81,0.5)", fontFamily: "monospace" }}
          >
            REV. 10 · SAMPLE SIZE: 10 WINNERS · 2016–2025
          </p>
        </div>

        {/* Blueprint layout */}
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          {/* Silhouette */}
          <div className="shrink-0 relative">
            <GolferSilhouette size="lg" variant="outline" />
            {/* Dimension lines */}
            <div
              className="absolute -left-4 top-0 bottom-0 w-px"
              style={{ background: "rgba(200,169,81,0.2)" }}
            />
            <div
              className="absolute -bottom-4 left-0 right-0 h-px"
              style={{ background: "rgba(200,169,81,0.2)" }}
            />
          </div>

          {/* Annotations */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat, catIdx) => (
              <div key={cat.id} className="relative">
                {/* Leader line dot */}
                <div
                  className="absolute -left-2 top-3 w-1.5 h-1.5 rounded-full"
                  style={{ background: "#C8A951" }}
                />
                <div className="pl-2 border-l border-[#C8A951]/20">
                  <h4
                    className="text-xs font-bold tracking-wider uppercase mb-2"
                    style={{ color: "#C8A951", fontFamily: "monospace" }}
                  >
                    {cat.label}
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {cat.stats.map((stat) => (
                      <div key={stat.criteriaKey} className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold tabular-nums shrink-0 w-10 text-right"
                          style={{
                            color: stat.inverted
                              ? "#C0392B"
                              : "#C8A951",
                            fontFamily: "monospace",
                          }}
                        >
                          {stat.fraction}
                        </span>
                        <span
                          className="text-xs"
                          style={{
                            color: stat.inverted
                              ? "rgba(192,57,43,0.7)"
                              : "rgba(200,169,81,0.7)",
                          }}
                        >
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corner stamps */}
        <div
          className="absolute top-3 right-4 text-xs tracking-wider"
          style={{ color: "rgba(200,169,81,0.15)", fontFamily: "monospace" }}
        >
          CONFIDENTIAL
        </div>
        <div
          className="absolute bottom-3 left-4 text-xs tracking-wider"
          style={{ color: "rgba(200,169,81,0.15)", fontFamily: "monospace" }}
        >
          THE GREEN JACKET LAB
        </div>
      </div>
    </div>
  );
}
