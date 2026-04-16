/* =========================================================
 * SchoolSafe BD — Core Types
 * Shared interfaces used throughout the application.
 * ========================================================= */

export type Language = "en" | "bn";

export type RiskLevel = "Low" | "Moderate" | "High";

export type RiskType =
  | "heat"
  | "rain"
  | "airQuality"
  | "cold"
  | "heavyRain"
  | "flood"
  | "storm";

/** All seven risk types — used to tag bullets that are relevant to any active risk */
export const ALL_RISK_TYPES: RiskType[] = [
  "heat", "rain", "airQuality", "cold", "heavyRain", "flood", "storm",
];

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
  /** Optional short label marking this as a representative climate-risk area */
  hotspotLabel?: string;
}

/* Raw weather data returned by Open-Meteo forecast API */
export interface WeatherData {
  temperature: number;         /* °C */
  humidity: number;            /* % */
  apparentTemperature: number; /* °C */
  precipitationProbability: number; /* % */
  rain: number;                /* mm — current hour */
  rain3h: number;              /* mm — 3-hour rolling accumulation (current + 2 preceding hours) */
  rain6h: number;              /* mm — 6-hour rolling accumulation (current + 5 preceding hours) */
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

/* Preparation level for the next-day outlook */
export type PrepLevel = "Low" | "Moderate" | "High";

/* Next-day (tomorrow) daily forecast summary */
export interface TomorrowForecast {
  tempMax: number;       /* °C — daily maximum temperature */
  tempMin: number;       /* °C — daily minimum temperature */
  rainSum: number;       /* mm — total daily precipitation */
  rainProbMax: number;   /* % — maximum precipitation probability during the day */
  windMax: number;       /* km/h — maximum wind speed */
  weatherCode: number;   /* WMO code representing the dominant condition */
  pm25Avg: number;       /* µg/m³ — average PM2.5 for tomorrow's hours */
  date: string;          /* YYYY-MM-DD */
}
