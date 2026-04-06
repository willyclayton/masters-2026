"use client";

import { useEffect, useState } from "react";
import type { WeatherForecast, WeatherDay } from "@/lib/types";
import { Cloud, CloudRain, Sun, CloudSun, Zap } from "lucide-react";

function WeatherIcon({ code }: { code: number }) {
  if (code === 0) return <Sun className="h-8 w-8 text-yellow-500" />;
  if (code <= 2) return <CloudSun className="h-8 w-8 text-yellow-400" />;
  if (code <= 3) return <Cloud className="h-8 w-8 text-gray-400" />;
  if (code >= 95) return <Zap className="h-8 w-8 text-purple-500" />;
  if (code >= 51) return <CloudRain className="h-8 w-8 text-masters-blue" />;
  return <Cloud className="h-8 w-8 text-gray-400" />;
}

function DayCard({ day }: { day: WeatherDay }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-[var(--border-color)] bg-white p-3 text-center">
      <p className="text-xs font-medium text-masters-blue">{day.round}</p>
      <p className="text-xs text-[var(--text-muted)]">{day.dayLabel}</p>
      <div className="my-2">
        <WeatherIcon code={day.weatherCode} />
      </div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        {day.tempHigh}° / {day.tempLow}°
      </p>
      <p className="text-xs text-[var(--text-muted)]">{day.description}</p>
      <div className="mt-2 space-y-0.5 text-xs text-[var(--text-secondary)]">
        <p>
          💨 {day.windSpeed} mph {day.windDirection}
        </p>
        <p>🌧️ {day.precipProbability}%</p>
      </div>
    </div>
  );
}

export function WeatherWidget() {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setForecast)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-masters-blue/20 bg-blue-50 p-4">
        <p className="text-sm text-masters-blue">
          Weather data temporarily unavailable. Check back soon.
        </p>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="rounded-lg border border-[var(--border-color)] bg-white p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-l-4 border-masters-blue bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-heading text-base font-bold text-[var(--text-primary)]">
            Tournament Week Forecast
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            {forecast.location} · April 9–12, 2026
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {forecast.days.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>

      <p className="mt-3 text-xs italic text-[var(--text-muted)]">
        Weather data refreshes every 4 hours via Open-Meteo.
      </p>
    </div>
  );
}
