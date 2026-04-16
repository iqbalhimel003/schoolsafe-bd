/* =========================================================
 * SchoolSafe BD — Dashboard Placeholder
 *
 * Phase 1: Shows a prompt to select a location.
 * Phase 3 will replace this with live data and risk cards.
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";
import type { Upazila } from "@/types";

interface Props {
  selectedUpazila: Upazila | null;
}

export default function DashboardPlaceholder({ selectedUpazila }: Props) {
  const { t, lang } = useLanguage();

  if (!selectedUpazila) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-xl p-10 text-center shadow-sm">
          <div className="text-5xl mb-4" aria-hidden="true">🌤</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t("dashboardTitle")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("selectLocationPrompt")}
          </p>
        </div>
      </section>
    );
  }

  const locationName = lang === "bn" ? selectedUpazila.nameBn : selectedUpazila.nameEn;

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-foreground">{t("dashboardTitle")}</h2>
        <span className="text-sm text-muted-foreground">{locationName}</span>
      </div>

      {/* Placeholder grid — Phase 3 replaces with live metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: "🌡️", label: t("temperature"), value: "—" },
          { icon: "💧", label: t("humidity"), value: "—" },
          { icon: "🌡️", label: t("apparentTemperature"), value: "—" },
          { icon: "🌧️", label: t("precipitationProbability"), value: "—" },
        ].map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-1">{card.icon}</div>
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder risk cards — Phase 3 replaces */}
      <h3 className="text-lg font-semibold text-foreground mb-3">
        {t("riskBreakdownTitle")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          t("heatRisk"),
          t("rainRisk"),
          t("airQualityRisk"),
          t("coldRisk"),
          t("heavyRainRisk"),
          t("floodRisk"),
          t("stormRisk"),
        ].map((label) => (
          <div key={label} className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <span className="inline-block risk-low text-xs font-semibold px-2 py-1 rounded-full">
              —
            </span>
          </div>
        ))}
      </div>

      {/* Overall safety badge placeholder */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm mb-6">
        <h3 className="text-base font-semibold text-foreground mb-3">
          {t("overallSafetyTitle")}
        </h3>
        <span className="text-sm text-muted-foreground">
          {t("loadingData")}
        </span>
      </div>

      {/* Recommendations placeholder */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-3">
          {t("recommendationsTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("selectLocationPrompt")}
        </p>
      </div>
    </section>
  );
}
