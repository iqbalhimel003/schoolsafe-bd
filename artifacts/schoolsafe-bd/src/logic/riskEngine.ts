/* =========================================================
 * SchoolSafe BD — Risk Engine
 *
 * Evaluates all seven environmental risk rules against the
 * thresholds defined in logic/thresholds.ts and returns:
 *   - A RiskLevel for each of the seven hazard types
 *   - An overall badge (worst-case across all seven)
 *   - A deduplicated list of triggered-rule translation keys
 *
 * HOW TO READ:
 *   Each evaluator is a pure function that takes weather or
 *   air quality data and returns { level, rules }. The main
 *   evaluateRisk() function combines all seven evaluators.
 *
 * HOW TO EXTEND:
 *   Add a new evaluator function, call it inside evaluateRisk(),
 *   and add the result to the spread in the return statement.
 * ========================================================= */

import type { WeatherData, AirQualityData, RiskResult, RiskLevel } from "@/types";
import type { TranslationKeys } from "@/translations/en";
import * as T from "./thresholds";

/* ── Utilities ──────────────────────────────────────────── */

/**
 * Return the highest risk level from a list.
 * "High" > "Moderate" > "Low"
 */
export function worstCase(levels: RiskLevel[]): RiskLevel {
  if (levels.includes("High")) return "High";
  if (levels.includes("Moderate")) return "Moderate";
  return "Low";
}

/** Bump a risk level up by one step (Low→Moderate, Moderate→High, High stays High). */
function bump(level: RiskLevel): RiskLevel {
  if (level === "Low") return "Moderate";
  if (level === "Moderate") return "High";
  return "High";
}

type Evaluation = { level: RiskLevel; rules: TranslationKeys[] };

/* ── Per-risk evaluators ────────────────────────────────── */

/** 1. Heat Risk — temperature and apparent temperature */
function evaluateHeat(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level: RiskLevel = "Low";

  if (w.temperature >= T.HEAT_TEMP_HIGH) {
    level = "High";
    rules.push("ruleHighTemp");
  } else if (w.temperature >= T.HEAT_TEMP_MODERATE) {
    level = "Moderate";
    rules.push("ruleHighTemp");
  }

  if (w.apparentTemperature >= T.HEAT_APPARENT_TEMP_HIGH) {
    level = "High";
    if (!rules.includes("ruleHighApparentTemp")) rules.push("ruleHighApparentTemp");
  }

  if (w.humidity >= T.HEAT_HUMIDITY_BOOSTER && w.temperature >= T.HEAT_TEMP_MODERATE) {
    level = worstCase([level, "Moderate"]);
    rules.push("ruleHighHumidity");
  }

  return { level, rules };
}

/** 2. Rain Risk — precipitation probability and rain amount */
function evaluateRain(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level: RiskLevel = "Low";

  if (w.precipitationProbability >= T.RAIN_PRECIP_PROB_HIGH) {
    level = "High";
    rules.push("ruleHighPrecipProb");
  } else if (w.precipitationProbability >= T.RAIN_PRECIP_PROB_MODERATE) {
    level = "Moderate";
    rules.push("ruleHighPrecipProb");
  }

  if (w.rain >= T.RAIN_AMOUNT_MODERATE) {
    level = worstCase([level, "Moderate"]);
    if (!rules.includes("ruleNotableRain")) rules.push("ruleNotableRain");
  }

  return { level, rules };
}

/** 3. Air Quality Risk — PM2.5 and PM10 (worst of the two) */
function evaluateAirQuality(aq: AirQualityData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level: RiskLevel = "Low";

  if (aq.pm25 >= T.AQ_PM25_HIGH) {
    level = "High";
    rules.push("ruleHighPM25");
  } else if (aq.pm25 >= T.AQ_PM25_MODERATE) {
    level = worstCase([level, "Moderate"]);
    rules.push("ruleHighPM25");
  }

  if (aq.pm10 >= T.AQ_PM10_HIGH) {
    level = "High";
    if (!rules.includes("ruleHighPM10")) rules.push("ruleHighPM10");
  } else if (aq.pm10 >= T.AQ_PM10_MODERATE) {
    level = worstCase([level, "Moderate"]);
    if (!rules.includes("ruleHighPM10")) rules.push("ruleHighPM10");
  }

  return { level, rules };
}

/** 4. Cold Risk — low temperature, with a wind-speed booster */
function evaluateCold(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level: RiskLevel = "Low";

  if (w.temperature <= T.COLD_TEMP_HIGH) {
    level = "High";
    rules.push("ruleVeryColdTemp");
  } else if (w.temperature <= T.COLD_TEMP_MODERATE) {
    level = "Moderate";
    rules.push("ruleColdTemp");
  }

  /* Strong wind makes cold feel significantly worse — bump level up */
  if (level !== "Low" && w.windSpeed >= T.COLD_WIND_BOOSTER) {
    level = bump(level);
    rules.push("ruleColdWind");
  }

  return { level, rules };
}

/** 5. Heavy Rain Risk — high precipitation probability AND notable rain rate */
function evaluateHeavyRain(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level: RiskLevel = "Low";

  if (w.precipitationProbability >= T.HEAVY_RAIN_PRECIP_PROB) {
    if (w.rain >= T.HEAVY_RAIN_AMOUNT_HIGH) {
      level = "High";
      rules.push("ruleHeavyRain");
    } else if (w.rain >= T.HEAVY_RAIN_AMOUNT_MODERATE) {
      level = "Moderate";
      rules.push("ruleHeavyRain");
    }
  }

  return { level, rules };
}

/** 6. Flood Risk — sustained high precipitation probability with high rain accumulation */
function evaluateFlood(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level: RiskLevel = "Low";

  if (w.precipitationProbability >= T.FLOOD_PRECIP_PROB) {
    if (w.rain >= T.FLOOD_RAIN_AMOUNT_HIGH) {
      level = "High";
      rules.push("ruleFloodRisk");
    } else if (w.rain >= T.FLOOD_RAIN_AMOUNT_MODERATE) {
      level = "Moderate";
      rules.push("ruleFloodRisk");
    }
  }

  return { level, rules };
}

/** 7. Storm / Cyclone Risk — wind speed thresholds */
function evaluateStorm(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level: RiskLevel = "Low";

  if (w.windSpeed >= T.STORM_WIND_HIGH) {
    level = "High";
    rules.push("ruleSevereStorm");
  } else if (w.windSpeed >= T.STORM_WIND_MODERATE) {
    level = "Moderate";
    rules.push("ruleStormWind");
  }

  return { level, rules };
}

/* ── Main export ────────────────────────────────────────── */

/**
 * Evaluate all seven environmental risk rules for a location's
 * current weather and air quality readings.
 *
 * Returns per-risk levels, an overall badge, and a deduplicated
 * list of triggered-rule translation keys for the "Why this
 * advice?" section.
 */
export function evaluateRisk(
  weather: WeatherData,
  airQuality: AirQualityData,
): RiskResult {
  const heat     = evaluateHeat(weather);
  const rain     = evaluateRain(weather);
  const aq       = evaluateAirQuality(airQuality);
  const cold     = evaluateCold(weather);
  const heavyRain = evaluateHeavyRain(weather);
  const flood    = evaluateFlood(weather);
  const storm    = evaluateStorm(weather);

  const overall = worstCase([
    heat.level, rain.level, aq.level, cold.level,
    heavyRain.level, flood.level, storm.level,
  ]);

  /* Merge triggered rules in order, deduplicating */
  const seen = new Set<string>();
  const triggeredRules: string[] = [];
  for (const rule of [
    ...heat.rules, ...rain.rules, ...aq.rules, ...cold.rules,
    ...heavyRain.rules, ...flood.rules, ...storm.rules,
  ]) {
    if (!seen.has(rule)) {
      seen.add(rule);
      triggeredRules.push(rule);
    }
  }

  return {
    heat:      heat.level,
    rain:      rain.level,
    airQuality: aq.level,
    cold:      cold.level,
    heavyRain: heavyRain.level,
    flood:     flood.level,
    storm:     storm.level,
    overall,
    triggeredRules,
  };
}
