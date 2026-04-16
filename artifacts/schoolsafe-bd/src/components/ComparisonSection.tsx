/* =========================================================
 * SchoolSafe BD — Pilot Upazila Comparison Section
 *
 * Fetches live weather + air quality for all 3 pilot upazilas
 * in parallel and displays them in a comparison table with
 * overall safety badges and key risk indicators.
 * ========================================================= */

import { useQueries } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchWeather, fetchAirQuality } from "@/utils/api";
import { evaluateRisk } from "@/logic/riskEngine";
import { DISTRICTS } from "@/data/locations";
import type { RiskLevel, Upazila } from "@/types";

/* ── Pilot upazilas (static — from locations data) ──────── */
const PILOT_UPAZILAS: Upazila[] =
  DISTRICTS.find((d) => d.id === "kishoreganj")?.upazilas.filter(
    (u) => u.isPilot,
  ) ?? [];

/* ── Helpers ────────────────────────────────────────────── */

function riskClass(level: RiskLevel): string {
  if (level === "High") return "risk-high";
  if (level === "Moderate") return "risk-moderate";
  return "risk-low";
}

function RiskBadge({ level, label }: { level: RiskLevel; label: string }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${riskClass(level)}`}
    >
      {label}
    </span>
  );
}

/* ── Main component ─────────────────────────────────────── */

export default function ComparisonSection() {
  const { t, lang } = useLanguage();

  /* Fetch weather for all 3 pilot upazilas in parallel */
  const weatherResults = useQueries({
    queries: PILOT_UPAZILAS.map((u) => ({
      queryKey: ["weather", u.id],
      queryFn: () => fetchWeather(u.lat!, u.lon!),
      staleTime: 1000 * 60 * 10,
      retry: 2,
    })),
  });

  /* Fetch air quality for all 3 pilot upazilas in parallel */
  const aqResults = useQueries({
    queries: PILOT_UPAZILAS.map((u) => ({
      queryKey: ["airQuality", u.id],
      queryFn: () => fetchAirQuality(u.lat!, u.lon!),
      staleTime: 1000 * 60 * 10,
      retry: 2,
    })),
  });

  const isLoading =
    weatherResults.some((r) => r.isLoading) ||
    aqResults.some((r) => r.isLoading);
  const isError =
    weatherResults.some((r) => r.isError) || aqResults.some((r) => r.isError);

  function levelLabel(level: RiskLevel): string {
    if (level === "High") return t("safetyHigh");
    if (level === "Moderate") return t("safetyModerate");
    return t("safetyLow");
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-foreground mb-1">
        {t("comparisonTitle")}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {t("comparisonSubtitle")}
      </p>

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground animate-pulse">
          {t("comparisonLoading")}
        </div>
      ) : isError ? (
        <div className="bg-card border border-destructive/30 rounded-xl p-8 text-center text-sm text-destructive">
          {t("comparisonError")}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                  {t("comparisonLocation")}
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                  {t("comparisonOverall")}
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                  {t("comparisonTemp")}
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                  {t("comparisonPM25")}
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap hidden sm:table-cell">
                  {t("comparisonColdRisk")}
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap hidden sm:table-cell">
                  {t("comparisonFloodRisk")}
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap hidden sm:table-cell">
                  {t("comparisonStormRisk")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {PILOT_UPAZILAS.map((u, i) => {
                const weather = weatherResults[i].data;
                const aq = aqResults[i].data;

                if (!weather || !aq) {
                  return (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {lang === "bn" ? u.nameBn : u.nameEn}
                      </td>
                      <td colSpan={6} className="px-4 py-3 text-muted-foreground">
                        —
                      </td>
                    </tr>
                  );
                }

                const risk = evaluateRisk(weather, aq);

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {lang === "bn" ? u.nameBn : u.nameEn}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={risk.overall} label={levelLabel(risk.overall)} />
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {weather.temperature.toFixed(1)}°C
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {aq.pm25.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <RiskBadge level={risk.cold} label={levelLabel(risk.cold)} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <RiskBadge level={risk.flood} label={levelLabel(risk.flood)} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <RiskBadge level={risk.storm} label={levelLabel(risk.storm)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
