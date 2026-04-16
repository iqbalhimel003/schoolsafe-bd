/* =========================================================
 * SchoolSafe BD — Methodology Section
 *
 * Explains the transparent rule-based risk system with a
 * card for each of the seven risk types, showing the exact
 * thresholds used. Fully bilingual via useLanguage().
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKeys } from "@/translations/en";

/* One entry per risk type */
const RISK_RULES: Array<{
  icon: string;
  nameKey: TranslationKeys;
  ruleKey: TranslationKeys;
}> = [
  { icon: "🌡️", nameKey: "heatRisk",       ruleKey: "methodologyHeatRule" },
  { icon: "🌧️", nameKey: "rainRisk",       ruleKey: "methodologyRainRule" },
  { icon: "🌫️", nameKey: "airQualityRisk", ruleKey: "methodologyAQRule" },
  { icon: "🧥", nameKey: "coldRisk",       ruleKey: "methodologyColdRule" },
  { icon: "⛈️", nameKey: "heavyRainRisk",  ruleKey: "methodologyHeavyRainRule" },
  { icon: "🌊", nameKey: "floodRisk",      ruleKey: "methodologyFloodRule" },
  { icon: "🌀", nameKey: "stormRisk",      ruleKey: "methodologyStormRule" },
];

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
          {RISK_RULES.map(({ icon, nameKey, ruleKey }) => (
            <div
              key={nameKey}
              className="border border-border rounded-lg p-3 bg-muted/30"
            >
              <p className="text-sm font-semibold text-foreground mb-1">
                <span className="mr-1.5" aria-hidden="true">{icon}</span>
                {t(nameKey)}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(ruleKey)}
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
            {t("methodologyOverallBadge")}
          </p>
        </div>
      </div>
    </section>
  );
}
