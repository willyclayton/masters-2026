"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  BettingEdgeResult,
  Player,
  WeatherEdgeBet,
  WeatherForecast,
  WeatherDay,
} from "@/lib/types";
import { generateWeatherEdges } from "@/lib/edge-calculations";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { MarketBadge } from "@/components/ui/MarketBadge";
import { Badge } from "@/components/ui/badge";
import {
  CloudRain,
  Wind,
  Thermometer,
  Sun,
  CloudSun,
  Cloud,
  Zap,
} from "lucide-react";

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

function ForecastIcon({ code }: { code: number }) {
  if (code === 0) return <Sun className="h-6 w-6 text-yellow-500" />;
  if (code <= 2) return <CloudSun className="h-6 w-6 text-yellow-400" />;
  if (code <= 3) return <Cloud className="h-6 w-6 text-gray-400" />;
  if (code >= 95) return <Zap className="h-6 w-6 text-purple-500" />;
  if (code >= 51) return <CloudRain className="h-6 w-6 text-masters-blue" />;
  return <Cloud className="h-6 w-6 text-gray-400" />;
}

function buildWeatherAlert(days: WeatherDay[]): {
  title: string;
  description: string;
} | null {
  const alerts: string[] = [];
  const conditions: string[] = [];

  for (const day of days) {
    if (day.windSpeed >= 15) {
      alerts.push(`${day.dayLabel} (${day.round})`);
      conditions.push("wind");
    }
    if (day.precipProbability >= 40) {
      alerts.push(`${day.dayLabel} (${day.round})`);
      conditions.push("rain");
    }
  }

  if (conditions.length === 0) return null;

  const uniqueConditions = [...new Set(conditions)];
  const uniqueDays = [...new Set(alerts)];
  const condStr = uniqueConditions
    .map((c) => (c === "wind" ? "Wind" : "Rain"))
    .join(" + ");

  return {
    title: `Weather Edge: ${condStr} — ${uniqueDays.join(", ")}`,
    description: uniqueConditions.includes("wind")
      ? "Gusty conditions favor wind-hardy players with low ball flights. " +
        (uniqueConditions.includes("rain")
          ? "Rain softens greens and rewards high-trajectory iron play. DK often doesn't adjust quickly for weather — these players gain an edge."
          : "DK often doesn't adjust quickly for weather — players who thrive in wind gain an edge.")
      : "Rain softens greens and rewards precision iron play with high trajectory. DK often doesn't adjust quickly — these players gain an edge.",
  };
}

export function WeatherEdge({ edges, players }: WeatherEdgeProps) {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setForecast)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const weatherBets = useMemo(
    () => generateWeatherEdges(edges, players),
    [edges, players]
  );

  const alert = forecast ? buildWeatherAlert(forecast.days) : null;

  return (
    <div className="space-y-6">
      {/* Forecast from /api/weather — same source as Methodology */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            Weather Intel
          </Badge>
          <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
            Augusta Forecast
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        ) : forecast ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {forecast.days.map((day) => {
              const hasRain = day.precipProbability >= 40;
              const hasWind = day.windSpeed >= 15;
              const highlighted = hasRain || hasWind;
              return (
                <div
                  key={day.date}
                  className={`rounded-lg border p-3 text-center ${
                    highlighted
                      ? "border-blue-200 bg-blue-50"
                      : "border-[var(--border-color)] bg-white"
                  }`}
                >
                  <div className="text-[10px] font-medium text-masters-blue">
                    {day.round}
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    {day.dayLabel}
                  </div>
                  <div className="my-1.5 flex justify-center">
                    <ForecastIcon code={day.weatherCode} />
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {day.tempHigh}° / {day.tempLow}°
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {day.description}
                  </div>
                  <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                        hasWind
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-50 text-[var(--text-muted)]"
                      }`}
                    >
                      {day.windSpeed} mph {day.windDirection}
                    </span>
                    {day.precipProbability > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                          hasRain
                            ? "bg-sky-100 text-sky-700"
                            : "bg-gray-50 text-[var(--text-muted)]"
                        }`}
                      >
                        {day.precipProbability}% rain
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-masters-blue/20 bg-blue-50 p-4">
            <p className="text-sm text-masters-blue">
              Weather data temporarily unavailable.
            </p>
          </div>
        )}

        {forecast && (
          <p className="mt-2 text-[10px] italic text-[var(--text-muted)]">
            Live forecast via Open-Meteo · {forecast.location} · Refreshes every
            4 hours
          </p>
        )}
      </div>

      {/* Dynamic weather alert */}
      {alert && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 shrink-0 text-blue-700" />
            <span className="text-sm font-bold text-blue-800">
              {alert.title}
            </span>
          </div>
          <p className="mt-1 text-xs text-blue-700">{alert.description}</p>
        </div>
      )}

      {/* Weather-boosted bets */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">
          Weather-Boosted Value Bets
        </h3>
        {weatherBets.length === 0 ? (
          <div className="rounded-lg border border-[var(--border-color)] bg-white p-6 text-center text-sm text-[var(--text-muted)]">
            No weather-boosted edges found. Weather data may not favor any
            current value bets.
          </div>
        ) : (
          <div className="space-y-2">
            {weatherBets.slice(0, 15).map((wb) => {
              const Icon = WEATHER_ICONS[wb.weatherTag];
              const tagColor = WEATHER_COLORS[wb.weatherTag];
              return (
                <div
                  key={`${wb.playerName}-${wb.market}`}
                  className="flex items-start gap-3 rounded-lg border border-[var(--border-color)] bg-white p-3 transition-shadow hover:shadow-sm"
                >
                  <InitialsAvatar initials={wb.initials} size="sm" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
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
                    <div className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-2">
                      {wb.weatherReason}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-[var(--text-muted)]">
                      {wb.americanOdds}
                    </div>
                    <span className="text-sm font-bold text-masters-green">
                      +{wb.weatherAdjustedEdge.toFixed(1)}%
                    </span>
                    <div className="text-[10px] font-semibold tabular-nums text-masters-green">
                      EV: +${wb.ev100.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      base +{wb.baseEdge.toFixed(1)}% · wx +
                      {wb.weatherBoost.toFixed(1)}%
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
