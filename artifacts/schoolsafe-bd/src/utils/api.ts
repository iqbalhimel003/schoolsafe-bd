/* =========================================================
 * SchoolSafe BD — API Utilities (Stub)
 *
 * Phase 1: Exports stub functions that return placeholder data.
 * Phase 3 will replace these with real Open-Meteo API calls.
 *
 * Open-Meteo endpoints used:
 *   Weather forecast: https://api.open-meteo.com/v1/forecast
 *   Air quality:      https://air-quality-api.open-meteo.com/v1/air-quality
 * ========================================================= */

import type { WeatherData, AirQualityData, HourlyForecast } from "@/types";

/**
 * Fetch current weather data for a given lat/lon.
 * Phase 3 will call Open-Meteo forecast API.
 */
export async function fetchWeather(
  _lat: number,
  _lon: number,
): Promise<WeatherData> {
  /* Placeholder — Phase 3 replaces this */
  return {
    temperature: 0,
    humidity: 0,
    apparentTemperature: 0,
    precipitationProbability: 0,
    rain: 0,
    windSpeed: 0,
    uvIndex: 0,
    visibility: 10000,
    weatherCode: 0,
    fetchedAt: new Date(),
  };
}

/**
 * Fetch current air quality data for a given lat/lon.
 * Phase 3 will call Open-Meteo air quality API.
 */
export async function fetchAirQuality(
  _lat: number,
  _lon: number,
): Promise<AirQualityData> {
  /* Placeholder — Phase 3 replaces this */
  return {
    pm25: 0,
    pm10: 0,
    fetchedAt: new Date(),
  };
}

/**
 * Fetch 24-hour hourly forecast for temperature and
 * precipitation probability.
 * Phase 3/4 will call Open-Meteo forecast API (hourly).
 */
export async function fetchHourlyForecast(
  _lat: number,
  _lon: number,
): Promise<HourlyForecast[]> {
  /* Placeholder — Phase 4 replaces this */
  return [];
}
