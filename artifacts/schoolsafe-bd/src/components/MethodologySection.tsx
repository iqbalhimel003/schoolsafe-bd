/* =========================================================
 * SchoolSafe BD — Methodology Section
 *
 * Explains the transparent rule-based risk system with a
 * card for each of the seven risk types, showing the exact
 * thresholds used. Fully bilingual via useLanguage().
 *
 * Numeric threshold values are sourced directly from
 * logic/thresholds.ts at runtime, so any change there is
 * automatically reflected here with no manual text update.
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKeys } from "@/translations/en";
import {
  HEAT_TEMP_LOW, HEAT_TEMP_MODERATE, HEAT_TEMP_HIGH,
  HEAT_FEELS_LOW, HEAT_FEELS_MODERATE, HEAT_FEELS_HIGH,
  RAIN_PROB_LOW, RAIN_PROB_MODERATE, RAIN_PROB_HIGH,
  RAIN_3H_LOW, RAIN_3H_MODERATE, RAIN_3H_HIGH,
  RAIN_NEXT6H_LOW, RAIN_NEXT6H_MODERATE, RAIN_NEXT6H_HIGH,
  AQ_PM25_LOW, AQ_PM25_MODERATE, AQ_PM25_HIGH,
  AQ_PM10_LOW, AQ_PM10_MODERATE, AQ_PM10_HIGH,
  COLD_TEMP_LOW, COLD_TEMP_MODERATE, COLD_TEMP_HIGH,
  HEAVY_RAIN_24H_LOW, HEAVY_RAIN_24H_MODERATE, HEAVY_RAIN_24H_HIGH,
  HEAVY_RAIN_3H_LOW, HEAVY_RAIN_3H_MODERATE, HEAVY_RAIN_3H_HIGH,
  FLOOD_6H_LOW, FLOOD_6H_MODERATE, FLOOD_6H_HIGH,
  FLOOD_24H_LOW, FLOOD_24H_MODERATE, FLOOD_24H_HIGH,
  STORM_WIND_LOW, STORM_WIND_MODERATE, STORM_WIND_HIGH,
  OVERALL_LOW_MIN, OVERALL_MODERATE_MIN, OVERALL_HIGH_MIN,
} from "@/logic/thresholds";

type Vars = Record<string, string | number>;

/* One entry per risk type */
const RISK_RULES: Array<{
  icon: string;
  nameKey: TranslationKeys;
  ruleKey: TranslationKeys;
  vars: Vars;
}> = [
  {
    icon: "🌡️",
    nameKey: "heatRisk",
    ruleKey: "methodologyHeatRule",
    vars: {
      tempLow: HEAT_TEMP_LOW,
      tempMod: HEAT_TEMP_MODERATE,
      tempHigh: HEAT_TEMP_HIGH,
      feelsLow: HEAT_FEELS_LOW,
      feelsMod: HEAT_FEELS_MODERATE,
      feelsHigh: HEAT_FEELS_HIGH,
    },
  },
  {
    icon: "🌧️",
    nameKey: "rainRisk",
    ruleKey: "methodologyRainRule",
    vars: {
      probLow: RAIN_PROB_LOW,
      probMod: RAIN_PROB_MODERATE,
      probHigh: RAIN_PROB_HIGH,
      rain3hLow: RAIN_3H_LOW,
      rain3hMod: RAIN_3H_MODERATE,
      rain3hHigh: RAIN_3H_HIGH,
      next6hLow: RAIN_NEXT6H_LOW,
      next6hMod: RAIN_NEXT6H_MODERATE,
      next6hHigh: RAIN_NEXT6H_HIGH,
    },
  },
  {
    icon: "🌫️",
    nameKey: "airQualityRisk",
    ruleKey: "methodologyAQRule",
    vars: {
      pm25Low: AQ_PM25_LOW,
      pm25Mod: AQ_PM25_MODERATE,
      pm25High: AQ_PM25_HIGH,
      pm10Low: AQ_PM10_LOW,
      pm10Mod: AQ_PM10_MODERATE,
      pm10High: AQ_PM10_HIGH,
    },
  },
  {
    icon: "🧥",
    nameKey: "coldRisk",
    ruleKey: "methodologyColdRule",
    vars: {
      tempLow: COLD_TEMP_LOW,
      tempMod: COLD_TEMP_MODERATE,
      tempHigh: COLD_TEMP_HIGH,
    },
  },
  {
    icon: "⛈️",
    nameKey: "heavyRainRisk",
    ruleKey: "methodologyHeavyRainRule",
    vars: {
      h24Low: HEAVY_RAIN_24H_LOW,
      h24Mod: HEAVY_RAIN_24H_MODERATE,
      h24High: HEAVY_RAIN_24H_HIGH,
      h3Low: HEAVY_RAIN_3H_LOW,
      h3Mod: HEAVY_RAIN_3H_MODERATE,
      h3High: HEAVY_RAIN_3H_HIGH,
    },
  },
  {
    icon: "🌊",
    nameKey: "floodRisk",
    ruleKey: "methodologyFloodRule",
    vars: {
      h6Low: FLOOD_6H_LOW,
      h6Mod: FLOOD_6H_MODERATE,
      h6High: FLOOD_6H_HIGH,
      h24Low: FLOOD_24H_LOW,
      h24Mod: FLOOD_24H_MODERATE,
      h24High: FLOOD_24H_HIGH,
    },
  },
  {
    icon: "🌀",
    nameKey: "stormRisk",
    ruleKey: "methodologyStormRule",
    vars: {
      windLow: STORM_WIND_LOW,
      windMod: STORM_WIND_MODERATE,
      windHigh: STORM_WIND_HIGH,
    },
  },
];

const OVERALL_BADGE_VARS: Vars = {
  scoreLow: OVERALL_LOW_MIN,
  scoreMod: OVERALL_MODERATE_MIN,
  scoreHigh: OVERALL_HIGH_MIN,
};

export default function MethodologySection() {
  const { t } = useLanguage();

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">

        {/* Title + intro */}
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t("methodologyTitle")}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {t("methodologyText")}
        </p>

        {/* Seven-rule summary */}
        <h3 className="text-base font-semibold text-foreground mb-3">
          {t("methodologyRulesTitle")}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {RISK_RULES.map(({ icon, nameKey, ruleKey, vars }) => (
            <div
              key={nameKey}
              className="border border-border rounded-lg p-3 bg-muted/30"
            >
              <p className="text-sm font-semibold text-foreground mb-1">
                <span className="mr-1.5" aria-hidden="true">{icon}</span>
                {t(nameKey)}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(ruleKey, vars)}
              </p>
            </div>
          ))}
        </div>

        {/* Overall badge explanation */}
        <div className="border border-primary/20 bg-primary/5 rounded-lg p-3">
          <p className="text-sm font-semibold text-primary mb-1">
            🏅 {t("overallSafetyTitle")}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("methodologyOverallBadge", OVERALL_BADGE_VARS)}
          </p>
        </div>
      </div>
    </section>
  );
}
