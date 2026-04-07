"use client";

import { useMemo } from "react";
import type { BettingEdgeResult, Player, WeatherEdgeBet } from "@/lib/types";
import { generateWeatherEdges } from "@/lib/edge-calculations";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Wind, Thermometer, Sun } from "lucide-react";

interface WeatherEdgeProps {
  edges: BettingEdgeResult[];
  players: Player[];
}

const WEATHER_ICONS: Record<string, React.ElementType> = {
  wind: Wind,
  rain: CloudRain,
  cold: Thermometer,
  calm: Sun,
};

const WEATHER_COLORS: Record<string, string> = {
  wind: "bg-blue-50 text-blue-700 border-blue-200",
  rain: "bg-sky-50 text-sky-700 border-sky-200",
  cold: "bg-slate-50 text-slate-700 border-slate-200",
  calm: "bg-amber-50 text-amber-700 border-amber-200",
};

const FORECAST = [
  { day: "Thu R1", temp: "72° / 58°", icon: "☀️", wind: "12 mph W", condition: "Clear, moderate wind" },
  { day: "Fri R2", temp: "68° / 54°", icon: "⛅", wind: "18 mph NW", condition: "Gusty, partly cloudy" },
  { day: "Sat R3", temp: "62° / 48°", icon: "🌧️", wind: "10 mph S", condition: "Rain likely, soft conditions" },
  { day: "Sun R4", temp: "74° / 60°", icon: "☀️", wind: "8 mph S", condition: "Clear and warm" },
];

export function WeatherEdge({ edges, players }: WeatherEdgeProps) {
  const weatherBets = useMemo(
    () => generateWeatherEdges(edges, players),
    [edges, players]
  );

  return (
    <div className="space-y-6">
      {/* Forecast */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            Weather Intel
          </Badge>
          <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
            4-Day Augusta Forecast
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FORECAST.map((f) => (
            <div
              key={f.day}
              className={`rounded-lg border p-3 text-center ${
                f.day === "Sat R3"
                  ? "border-blue-200 bg-blue-50"
                  : "border-[var(--border-color)] bg-white"
              }`}
            >
              <div className="text-xs font-bold text-[var(--text-primary)]">
                {f.day}
              </div>
              <div className="my-1 text-2xl">{f.icon}</div>
              <div className="text-xs text-[var(--text-secondary)]">{f.temp}</div>
              <div className="mt-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                {f.wind}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather alert */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <CloudRain className="h-4 w-4 text-blue-700" />
          <span className="text-sm font-bold text-blue-800">
            Weather Edge: Saturday Rain + Friday Wind
          </span>
        </div>
        <p className="mt-1 text-xs text-blue-700">
          Friday&apos;s 18 mph gusts favor wind-hardy players. Saturday&apos;s rain
          softens greens and rewards high-trajectory iron play. DK often
          doesn&apos;t adjust for weather — these players gain an edge.
        </p>
      </div>

      {/* Weather-boosted bets */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">
          Weather-Boosted Value Bets
        </h3>
        {weatherBets.length === 0 ? (
          <div className="rounded-lg border border-[var(--border-color)] bg-white p-6 text-center text-sm text-[var(--text-muted)]">
            No weather-boosted edges found. Weather data may not favor any current value bets.
          </div>
        ) : (
          <div className="space-y-2">
            {weatherBets.slice(0, 15).map((wb) => {
              const Icon = WEATHER_ICONS[wb.weatherTag];
              const tagColor = WEATHER_COLORS[wb.weatherTag];
              return (
                <div
                  key={`${wb.playerName}-${wb.market}`}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border-color)] bg-white p-3 transition-shadow hover:shadow-sm"
                >
                  <InitialsAvatar initials={wb.initials} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {wb.playerName}
                      </span>
                      <MarketBadge market={wb.market} />
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tagColor}`}
                      >
                        <Icon className="h-3 w-3" />
                        {wb.weatherTag}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">
                      {wb.weatherReason}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-[var(--text-muted)]">
                      {wb.americanOdds}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-masters-green">
                        +{wb.weatherAdjustedEdge.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[10px] font-semibold tabular-nums text-masters-green">
                      EV: +${wb.ev100.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      base +{wb.baseEdge.toFixed(1)}% &middot; weather +{wb.weatherBoost.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
