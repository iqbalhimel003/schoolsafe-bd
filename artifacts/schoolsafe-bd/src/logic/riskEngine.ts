/* =========================================================
 * SchoolSafe BD — Risk Engine
 *
 * Evaluates all seven environmental risk rules against the
 * thresholds defined in logic/thresholds.ts and returns:
 *   - A RiskLevel for each of the seven hazard types
 *   - An overall badge (weighted aggregation with overrides)
 *   - A deduplicated list of triggered-rule translation keys
 *
 * Risk scale: None < Low < Moderate < High
 *   None     — no meaningful signal; school can operate normally
 *   Low      — mild signal; light awareness only, no action needed
 *   Moderate — notable hazard; consider precautions
 *   High     — significant hazard; action required
 *
 * Overall School Safety uses a weighted scoring model instead
 * of worst-case, with override rules for dangerous combinations.
 *
 * Rules (translation keys) are only pushed for Moderate or High
 * so the "Why This Advice?" section stays signal-free on calm days.
 * ========================================================= */

import type { WeatherData, AirQualityData, RiskResult, RiskLevel, TomorrowForecast, PrepLevel } from "@/types";
import type { TranslationKeys } from "@/translations/en";
import * as T from "./thresholds";

/* ── Utilities ──────────────────────────────────────────── */

export function worstCase(levels: RiskLevel[]): RiskLevel {
  if (levels.includes("High"))     return "High";
  if (levels.includes("Moderate")) return "Moderate";
  if (levels.includes("Low"))      return "Low";
  return "None";
}

const LEVEL_VALUE: Record<RiskLevel, number> = {
  None: 0, Low: 1, Moderate: 2, High: 3,
};

function scoreToLevel(score: number): RiskLevel {
  if (score >= T.OVERALL_HIGH_MIN)     return "High";
  if (score >= T.OVERALL_MODERATE_MIN) return "Moderate";
  if (score >= T.OVERALL_LOW_MIN)      return "Low";
  return "None";
}

type Evaluation = { level: RiskLevel; rules: TranslationKeys[] };

/* ── WMO weather code rain classifier ───────────────────── */

type RainCodeCategory = "none" | "light" | "continuous" | "thunderstorm";

function classifyRainCode(code: number): RainCodeCategory {
  if (code === 95 || code === 96 || code === 97 || code === 99) return "thunderstorm";
  if (code === 53 || code === 55 || code === 56 || code === 57 || code === 63 || code === 65 || code === 66 || code === 67 || code === 81 || code === 82) return "continuous";
  if (code === 51 || code === 61 || code === 80) return "light";
  return "none";
}

function rainCodeToLevel(category: RainCodeCategory): RiskLevel {
  if (category === "thunderstorm") return "High";
  if (category === "continuous")   return "Moderate";
  if (category === "light")        return "Low";
  return "None";
}

export function isThunderstormCode(code: number): boolean {
  return code === 95 || code === 96 || code === 97 || code === 99;
}

/* ── Per-risk evaluators ────────────────────────────────── */

function evaluateHeat(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let tempLevel: RiskLevel = "None";
  let feelsLevel: RiskLevel = "None";

  // Current-condition thresholds (CURRENT_HEAT_TEMP_*).
  // assessTomorrowPrep() uses the separate HEAT_TEMP_* constants — unchanged.
  if (w.temperature >= T.CURRENT_HEAT_TEMP_HIGH) {
    tempLevel = "High";
  } else if (w.temperature >= T.CURRENT_HEAT_TEMP_MODERATE) {
    tempLevel = "Moderate";
  } else if (w.temperature >= T.CURRENT_HEAT_TEMP_LOW) {
    tempLevel = "Low";
  }

  if (w.apparentTemperature >= T.CURRENT_HEAT_FEELS_HIGH) {
    feelsLevel = "High";
  } else if (w.apparentTemperature >= T.CURRENT_HEAT_FEELS_MODERATE) {
    feelsLevel = "Moderate";
  } else if (w.apparentTemperature >= T.CURRENT_HEAT_FEELS_LOW) {
    feelsLevel = "Low";
  }

  const level = worstCase([tempLevel, feelsLevel]);

  if (level === "Moderate" || level === "High") {
    if (tempLevel === level || LEVEL_VALUE[tempLevel] >= 2) rules.push("ruleHighTemp");
    if (feelsLevel === level || LEVEL_VALUE[feelsLevel] >= 2) {
      if (!rules.includes("ruleHighApparentTemp")) rules.push("ruleHighApparentTemp");
    }
  }

  return { level, rules };
}

function evaluateRain(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];

  // Current-condition probability thresholds (CURRENT_RAIN_PROB_*).
  // rain3h / rainNext6h / weatherCode sub-components keep their own bands.
  let currentProbLevel: RiskLevel = "None";
  if (w.precipitationProbability >= T.CURRENT_RAIN_PROB_HIGH) {
    currentProbLevel = "High";
  } else if (w.precipitationProbability >= T.CURRENT_RAIN_PROB_MODERATE) {
    currentProbLevel = "Moderate";
  } else if (w.precipitationProbability >= T.CURRENT_RAIN_PROB_LOW) {
    currentProbLevel = "Low";
  }

  let next3hProbLevel: RiskLevel = "None";
  if (w.precipProbNext3hMax >= T.CURRENT_RAIN_PROB_HIGH) {
    next3hProbLevel = "High";
  } else if (w.precipProbNext3hMax >= T.CURRENT_RAIN_PROB_MODERATE) {
    next3hProbLevel = "Moderate";
  } else if (w.precipProbNext3hMax >= T.CURRENT_RAIN_PROB_LOW) {
    next3hProbLevel = "Low";
  }

  let rain3hLevel: RiskLevel = "None";
  if (w.rain3h >= T.RAIN_3H_HIGH) {
    rain3hLevel = "High";
  } else if (w.rain3h >= T.RAIN_3H_MODERATE) {
    rain3hLevel = "Moderate";
  } else if (w.rain3h >= T.RAIN_3H_LOW) {
    rain3hLevel = "Low";
  }

  let next6hLevel: RiskLevel = "None";
  if (w.rainNext6h >= T.RAIN_NEXT6H_HIGH) {
    next6hLevel = "High";
  } else if (w.rainNext6h >= T.RAIN_NEXT6H_MODERATE) {
    next6hLevel = "Moderate";
  } else if (w.rainNext6h >= T.RAIN_NEXT6H_LOW) {
    next6hLevel = "Low";
  }

  const codeLevel = rainCodeToLevel(classifyRainCode(w.weatherCode));

  const level = worstCase([currentProbLevel, next3hProbLevel, rain3hLevel, next6hLevel, codeLevel]);

  if (level === "Moderate" || level === "High") {
    if (LEVEL_VALUE[currentProbLevel] >= 2 || LEVEL_VALUE[next3hProbLevel] >= 2) {
      rules.push("ruleHighPrecipProb");
    }
    if (LEVEL_VALUE[rain3hLevel] >= 2 || LEVEL_VALUE[next6hLevel] >= 2) {
      if (!rules.includes("ruleNotableRain")) rules.push("ruleNotableRain");
    }
  }

  return { level, rules };
}

function evaluateAirQuality(aq: AirQualityData): Evaluation {
  const rules: TranslationKeys[] = [];
  let pm25Level: RiskLevel = "None";
  let pm10Level: RiskLevel = "None";

  if (aq.pm25 >= T.AQ_PM25_HIGH) {
    pm25Level = "High";
  } else if (aq.pm25 >= T.AQ_PM25_MODERATE) {
    pm25Level = "Moderate";
  } else if (aq.pm25 >= T.AQ_PM25_LOW) {
    pm25Level = "Low";
  }

  if (aq.pm10 >= T.AQ_PM10_HIGH) {
    pm10Level = "High";
  } else if (aq.pm10 >= T.AQ_PM10_MODERATE) {
    pm10Level = "Moderate";
  } else if (aq.pm10 >= T.AQ_PM10_LOW) {
    pm10Level = "Low";
  }

  const level = worstCase([pm25Level, pm10Level]);

  if (level === "Moderate" || level === "High") {
    if (LEVEL_VALUE[pm25Level] >= 2) rules.push("ruleHighPM25");
    if (LEVEL_VALUE[pm10Level] >= 2) {
      if (!rules.includes("ruleHighPM10")) rules.push("ruleHighPM10");
    }
  }

  return { level, rules };
}

function evaluateCold(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level: RiskLevel = "None";

  if (w.temperature <= T.COLD_TEMP_HIGH) {
    level = "High";
    rules.push("ruleVeryColdTemp");
  } else if (w.temperature <= T.COLD_TEMP_MODERATE) {
    level = "Moderate";
    rules.push("ruleColdTemp");
  } else if (w.temperature <= T.COLD_TEMP_LOW) {
    level = "Low";
  }

  return { level, rules };
}

function evaluateHeavyRain(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level24h: RiskLevel = "None";
  let level3h: RiskLevel = "None";

  if (w.rain24h >= T.HEAVY_RAIN_24H_HIGH) {
    level24h = "High";
  } else if (w.rain24h >= T.HEAVY_RAIN_24H_MODERATE) {
    level24h = "Moderate";
  } else if (w.rain24h >= T.HEAVY_RAIN_24H_LOW) {
    level24h = "Low";
  }

  if (w.rain3h >= T.HEAVY_RAIN_3H_HIGH) {
    level3h = "High";
  } else if (w.rain3h >= T.HEAVY_RAIN_3H_MODERATE) {
    level3h = "Moderate";
  } else if (w.rain3h >= T.HEAVY_RAIN_3H_LOW) {
    level3h = "Low";
  }

  const level = worstCase([level24h, level3h]);

  if (level === "Moderate" || level === "High") {
    rules.push("ruleHeavyRain");
  }

  return { level, rules };
}

function evaluateFlood(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level6h: RiskLevel = "None";
  let level24h: RiskLevel = "None";

  if (w.rain6h >= T.FLOOD_6H_HIGH) {
    level6h = "High";
  } else if (w.rain6h >= T.FLOOD_6H_MODERATE) {
    level6h = "Moderate";
  } else if (w.rain6h >= T.FLOOD_6H_LOW) {
    level6h = "Low";
  }

  if (w.rain24h >= T.FLOOD_24H_HIGH) {
    level24h = "High";
  } else if (w.rain24h >= T.FLOOD_24H_MODERATE) {
    level24h = "Moderate";
  } else if (w.rain24h >= T.FLOOD_24H_LOW) {
    level24h = "Low";
  }

  const level = worstCase([level6h, level24h]);

  if (level === "Moderate" || level === "High") {
    rules.push("ruleFloodRisk");
  }

  return { level, rules };
}

function evaluateStorm(w: WeatherData): Evaluation {
  const rules: TranslationKeys[] = [];
  let level: RiskLevel = "None";

  if (w.windSpeed >= T.STORM_WIND_HIGH) {
    level = "High";
    rules.push("ruleSevereStorm");
  } else if (w.windSpeed >= T.STORM_WIND_MODERATE) {
    level = "Moderate";
    rules.push("ruleStormWind");
  } else if (w.windSpeed >= T.STORM_WIND_LOW) {
    level = "Low";
  }

  return { level, rules };
}

/* ── Weighted overall aggregation ──────────────────────── */

interface RiskLevels {
  heat: RiskLevel;
  rain: RiskLevel;
  airQuality: RiskLevel;
  cold: RiskLevel;
  heavyRain: RiskLevel;
  flood: RiskLevel;
  storm: RiskLevel;
}

function computeWeightedOverall(levels: RiskLevels): RiskLevel {
  const allNone = Object.values(levels).every(l => l === "None");
  if (allNone) return "None";

  if (levels.flood === "High" || levels.storm === "High") return "High";

  const highCount = Object.values(levels).filter(l => l === "High").length;
  if (highCount >= 2) return "High";

  if (highCount === 1) {
    const hasModerateOrHighOther = Object.values(levels).filter(
      l => l === "Moderate" || l === "High"
    ).length >= 2;
    if (hasModerateOrHighOther) return "High";
  }

  const score =
    LEVEL_VALUE[levels.airQuality] * T.WEIGHT_AIR_QUALITY +
    LEVEL_VALUE[levels.rain]       * T.WEIGHT_RAIN +
    LEVEL_VALUE[levels.heat]       * T.WEIGHT_HEAT +
    LEVEL_VALUE[levels.cold]       * T.WEIGHT_COLD +
    LEVEL_VALUE[levels.heavyRain]  * T.WEIGHT_HEAVY_RAIN +
    LEVEL_VALUE[levels.flood]      * T.WEIGHT_FLOOD +
    LEVEL_VALUE[levels.storm]      * T.WEIGHT_STORM;

  let overall = scoreToLevel(score);

  const nonNoneRisks = Object.entries(levels).filter(([, l]) => l !== "None");
  if (
    overall === "Moderate" &&
    nonNoneRisks.length === 1
  ) {
    const [onlyRisk] = nonNoneRisks[0];
    if (
      (onlyRisk === "airQuality" || onlyRisk === "rain") &&
      levels[onlyRisk as keyof RiskLevels] === "Moderate"
    ) {
      overall = "Low";
    }
  }

  return overall;
}

/* ── Main export ────────────────────────────────────────── */

export function evaluateRisk(
  weather: WeatherData,
  airQuality: AirQualityData,
): RiskResult {
  const heat      = evaluateHeat(weather);
  const rain      = evaluateRain(weather);
  const aq        = evaluateAirQuality(airQuality);
  const cold      = evaluateCold(weather);
  const heavyRain = evaluateHeavyRain(weather);
  const flood     = evaluateFlood(weather);
  const storm     = evaluateStorm(weather);

  const levels: RiskLevels = {
    heat:       heat.level,
    rain:       rain.level,
    airQuality: aq.level,
    cold:       cold.level,
    heavyRain:  heavyRain.level,
    flood:      flood.level,
    storm:      storm.level,
  };

  const overall = computeWeightedOverall(levels);

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
    ...levels,
    overall,
    triggeredRules,
  };
}

/* ── Tomorrow prep-level assessment ─────────────────────── */

export function assessTomorrowPrep(f: TomorrowForecast): PrepLevel {
  if (
    f.tempMax     >= T.HEAT_TEMP_HIGH              ||
    f.tempMin     <= T.COLD_TEMP_HIGH              ||
    f.windMax     >= T.STORM_WIND_HIGH             ||
    f.rainProbMax >= T.TOMORROW_RAIN_PROB_HIGH     ||
    f.rainSum     >= T.TOMORROW_RAIN_AMT_HIGH      ||
    isThunderstormCode(f.weatherCode)               ||
    f.pm25Avg     >= T.AQ_PM25_HIGH
  ) {
    return "High";
  }

  if (
    f.tempMax     >= T.HEAT_TEMP_MODERATE              ||
    f.tempMin     <= T.COLD_TEMP_MODERATE              ||
    f.windMax     >= T.STORM_WIND_MODERATE             ||
    f.rainProbMax >= T.TOMORROW_RAIN_PROB_MODERATE     ||
    f.rainSum     >= T.TOMORROW_RAIN_AMT_MODERATE      ||
    f.pm25Avg     >= T.AQ_PM25_MODERATE
  ) {
    return "Moderate";
  }

  if (
    f.tempMax     >= T.HEAT_TEMP_LOW              ||
    f.tempMin     <= T.COLD_TEMP_LOW              ||
    f.windMax     >= T.STORM_WIND_LOW             ||
    f.rainProbMax >= T.TOMORROW_RAIN_PROB_LOW     ||
    f.rainSum     >= T.TOMORROW_RAIN_AMT_LOW      ||
    f.pm25Avg     >= T.AQ_PM25_LOW
  ) {
    return "Low";
  }

  /* Advisory: warm day (>30°C) — lowest caution tier */
  if (f.tempMax > T.HEAT_TEMP_ADVISORY) {
    return "Low";
  }

  return "None";
}
