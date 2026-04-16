/* =========================================================
 * SchoolSafe BD — API Utilities
 *
 * Fetches live weather and air quality data from Open-Meteo.
 * Both APIs are free and require no API key.
 *
 * Open-Meteo endpoints:
 *   Weather forecast: https://api.open-meteo.com/v1/forecast
 *   Air quality:      https://air-quality-api.open-meteo.com/v1/air-quality
 * ========================================================= */

import type { WeatherData, AirQualityData, HourlyForecast } from "@/types";

const WEATHER_BASE = "https://api.open-meteo.com/v1/forecast";
const AQ_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";

/**
 * Find the index in an array of ISO time strings that is closest
 * to the current moment. Used to extract the "current hour" value
 * from Open-Meteo's hourly response.
 */
function findCurrentHourIndex(times: string[]): number {
  const now = Date.now();
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Fetch current weather conditions for a given lat/lon.
 * Uses Open-Meteo's free forecast API with hourly resolution;
 * picks the entry closest to the current local time.
 */
export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: [
      "temperature_2m",
      "relativehumidity_2m",
      "apparent_temperature",
      "precipitation_probability",
      "rain",
      "windspeed_10m",
      "uv_index",
      "visibility",
      "weathercode",
    ].join(","),
    timezone: "auto",
    forecast_days: "2",
  });

  const res = await fetch(`${WEATHER_BASE}?${params}`);
  if (!res.ok) throw new Error(`Weather API error ${res.status}: ${res.statusText}`);
  const data = await res.json();

  const h = data.hourly;
  const idx = findCurrentHourIndex(h.time as string[]);

  /* Sum rain over the current hour and up to 2 preceding hours (3-hour window) */
  let rain3h = 0;
  const start3hIdx = Math.max(0, idx - 2);
  for (let i = start3hIdx; i <= idx; i++) {
    rain3h += h.rain[i] ?? 0;
  }

  /* Sum rain over the current hour and up to 5 preceding hours (6-hour window) */
  let rain6h = 0;
  const startIdx = Math.max(0, idx - 5);
  for (let i = startIdx; i <= idx; i++) {
    rain6h += h.rain[i] ?? 0;
  }

  return {
    temperature:              h.temperature_2m[idx]            ?? 0,
    humidity:                 h.relativehumidity_2m[idx]       ?? 0,
    apparentTemperature:      h.apparent_temperature[idx]      ?? 0,
    precipitationProbability: h.precipitation_probability[idx] ?? 0,
    rain:                     h.rain[idx]                      ?? 0,
    rain3h,
    rain6h,
    windSpeed:                h.windspeed_10m[idx]             ?? 0,
    uvIndex:                  h.uv_index[idx]                  ?? 0,
    visibility:               h.visibility[idx]                ?? 10000,
    weatherCode:              h.weathercode[idx]               ?? 0,
    fetchedAt:                new Date(),
  };
}

/**
 * Fetch current air quality data for a given lat/lon.
 * Uses Open-Meteo's free air quality API (hourly PM2.5 and PM10).
 */
export async function fetchAirQuality(
  lat: number,
  lon: number,
): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "pm2_5,pm10",
    timezone: "auto",
    forecast_days: "2",
  });

  const res = await fetch(`${AQ_BASE}?${params}`);
  if (!res.ok) throw new Error(`Air quality API error ${res.status}: ${res.statusText}`);
  const data = await res.json();

  const h = data.hourly;
  const idx = findCurrentHourIndex(h.time as string[]);

  return {
    pm25:      h.pm2_5[idx] ?? 0,
    pm10:      h.pm10[idx]  ?? 0,
    fetchedAt: new Date(),
  };
}

/**
 * Fetch 24-hour hourly forecast for temperature and precipitation probability.
 * Used by the chart in Phase 4.
 */
export async function fetchHourlyForecast(
  lat: number,
  lon: number,
): Promise<HourlyForecast[]> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "temperature_2m,precipitation_probability",
    timezone: "auto",
    forecast_days: "1",
  });

  const res = await fetch(`${WEATHER_BASE}?${params}`);
  if (!res.ok) throw new Error(`Forecast API error ${res.status}: ${res.statusText}`);
  const data = await res.json();

  const h = data.hourly;
  return (h.time as string[]).map((time, i) => ({
    time,
    temperature:              h.temperature_2m[i]            ?? 0,
    precipitationProbability: h.precipitation_probability[i] ?? 0,
  }));
}
