import { NextResponse } from "next/server";

const AUGUSTA_LAT = 33.5;
const AUGUSTA_LON = -82.02;

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const ROUND_LABELS = ["Round 1", "Round 2", "Round 3", "Final Round"];
const DAY_LABELS = ["Thursday", "Friday", "Saturday", "Sunday"];

export async function GET() {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(AUGUSTA_LAT));
    url.searchParams.set("longitude", String(AUGUSTA_LON));
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,weather_code"
    );
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("wind_speed_unit", "mph");
    url.searchParams.set("timezone", "America/New_York");
    url.searchParams.set("start_date", "2026-04-09");
    url.searchParams.set("end_date", "2026-04-12");

    const res = await fetch(url.toString(), {
      next: { revalidate: 14400 }, // 4 hours
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo responded with ${res.status}`);
    }

    const data = await res.json();
    const daily = data.daily;

    const days = daily.time.map((date: string, i: number) => ({
      date,
      dayLabel: DAY_LABELS[i] || `Day ${i + 1}`,
      round: ROUND_LABELS[i] || `Round ${i + 1}`,
      tempHigh: Math.round(daily.temperature_2m_max[i]),
      tempLow: Math.round(daily.temperature_2m_min[i]),
      windSpeed: Math.round(daily.wind_speed_10m_max[i]),
      windDirection: degToCompass(daily.wind_direction_10m_dominant[i]),
      precipProbability: daily.precipitation_probability_max[i],
      weatherCode: daily.weather_code[i],
      description:
        WMO_DESCRIPTIONS[daily.weather_code[i]] || "Unknown",
    }));

    return NextResponse.json({
      location: "Augusta, GA",
      days,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

function degToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}
