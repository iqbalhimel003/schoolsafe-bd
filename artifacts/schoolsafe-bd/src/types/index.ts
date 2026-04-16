/* =========================================================
 * SchoolSafe BD — Core Types
 * Shared interfaces used throughout the application.
 * ========================================================= */

export type Language = "en" | "bn";

export type RiskLevel = "Low" | "Moderate" | "High";

/* A single district with its upazilas */
export interface District {
  id: string;
  nameEn: string;
  nameBn: string;
  upazilas: Upazila[];
}

/* A single upazila with pilot coordinates */
export interface Upazila {
  id: string;
  nameEn: string;
  nameBn: string;
  districtId: string;
  /* Pilot upazilas have coordinates; future upazilas will add them later */
  lat?: number;
  lon?: number;
  isPilot: boolean;
}

/* Raw weather data returned by Open-Meteo forecast API */
export interface WeatherData {
  temperature: number;         /* °C */
  humidity: number;            /* % */
  apparentTemperature: number; /* °C */
  precipitationProbability: number; /* % */
  rain: number;                /* mm */
  windSpeed: number;           /* km/h */
  uvIndex: number;
  visibility: number;          /* m */
  weatherCode: number;
  fetchedAt: Date;
}

/* Raw air quality data returned by Open-Meteo AQ API */
export interface AirQualityData {
  pm25: number;
  pm10: number;
  fetchedAt: Date;
}

/* Combined environmental data for one location */
export interface EnvironmentalData {
  weather: WeatherData;
  airQuality: AirQualityData;
}

/* Result of the risk engine for one location */
export interface RiskResult {
  heat: RiskLevel;
  rain: RiskLevel;
  airQuality: RiskLevel;
  cold: RiskLevel;
  heavyRain: RiskLevel;
  flood: RiskLevel;
  storm: RiskLevel;
  overall: RiskLevel;
  triggeredRules: string[];  /* Keys into the translation file */
}

/* Hourly forecast entry for the 24-hour chart */
export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitationProbability: number;
}
