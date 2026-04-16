/* =========================================================
 * SchoolSafe BD — Risk Engine (Stub)
 *
 * Phase 1: This file exports the type signature and a stub
 * function. Phase 3 will implement the full rule logic.
 * ========================================================= */

import type { WeatherData, AirQualityData, RiskResult, RiskLevel } from "@/types";

/** Placeholder risk level until Phase 3 wires real logic */
function stub(): RiskLevel {
  return "Low";
}

/**
 * Evaluate all environmental risk rules for a given location's
 * weather and air quality data.
 *
 * Returns per-risk levels (Low/Moderate/High), an overall badge,
 * and a list of translation keys for the "Why this advice?" section.
 *
 * Phase 3 will replace this stub with full rule evaluation.
 */
export function evaluateRisk(
  _weather: WeatherData,
  _airQuality: AirQualityData,
): RiskResult {
  return {
    heat: stub(),
    rain: stub(),
    airQuality: stub(),
    cold: stub(),
    heavyRain: stub(),
    flood: stub(),
    storm: stub(),
    overall: stub(),
    triggeredRules: [],
  };
}

/**
 * Determine the highest risk level from a list of risk levels.
 * "High" > "Moderate" > "Low"
 */
export function worstCase(levels: RiskLevel[]): RiskLevel {
  if (levels.includes("High")) return "High";
  if (levels.includes("Moderate")) return "Moderate";
  return "Low";
}
