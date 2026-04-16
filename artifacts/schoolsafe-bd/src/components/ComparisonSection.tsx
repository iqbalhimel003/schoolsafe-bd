/* =========================================================
 * SchoolSafe BD — Pilot Upazila Comparison Section
 *
 * Lets the user pick any two pilot upazilas (from all districts)
 * via dropdowns. Fetches live weather + air quality for the
 * selected pair and renders a side-by-side metrics table.
 * Defaults to Kishoreganj Sadar vs Tetulia (heat ↔ cold contrast).
 * ========================================================= */

import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchWeather, fetchAirQuality } from "@/utils/api";
import { evaluateRisk } from "@/logic/riskEngine";
import { DISTRICTS } from "@/data/locations";
import type { RiskLevel } from "@/types";

/* ── All pilot upazilas with their district labels ──────── */
const ALL_PILOT_UPAZILAS = DISTRICTS.flatMap((d) =>
  d.upazilas
    .filter((u) => u.isPilot && u.lat != null && u.lon != null)
    .map((u) => ({ ...u, districtNameEn: d.nameEn, districtNameBn: d.nameBn })),
);

const DEFAULT_A = "kishoreganj-sadar";
const DEFAULT_B = "tetulia";

/* ── Helpers ────────────────────────────────────────────── */

function riskClass(level: RiskLevel): string {
  if (level === "High")     return "risk-high";
  if (level === "Moderate") return "risk-moderate";
  if (level === "Low")      return "risk-low";
  return "risk-none";
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

  const [selectedA, setSelectedA] = useState(DEFAULT_A);
  const [selectedB, setSelectedB] = useState(DEFAULT_B);

  const upazilaA = ALL_PILOT_UPAZILAS.find((u) => u.id === selectedA) ?? ALL_PILOT_UPAZILAS[0];
  const upazilaB = ALL_PILOT_UPAZILAS.find((u) => u.id === selectedB) ?? ALL_PILOT_UPAZILAS[1];

  const weatherResults = useQueries({
    queries: [upazilaA, upazilaB].map((u) => ({
      queryKey: ["weather", u.id],
      queryFn: () => fetchWeather(u.lat!, u.lon!),
      staleTime: 1000 * 60 * 10,
      retry: 2,
    })),
  });

  const aqResults = useQueries({
    queries: [upazilaA, upazilaB].map((u) => ({
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

  function handleRetry() {
    weatherResults.forEach((r) => r.isError && r.refetch());
    aqResults.forEach((r) => r.isError && r.refetch());
  }

  function levelLabel(level: RiskLevel): string {
    if (level === "High")     return t("safetyHigh");
    if (level === "Moderate") return t("safetyModerate");
    if (level === "Low")      return t("safetyLow");
    return t("safetyNone");
  }

  const cols = [upazilaA, upazilaB].map((u, i) => {
    const weather = weatherResults[i].data;
    const aq = aqResults[i].data;
    const risk = weather && aq ? evaluateRisk(weather, aq) : null;
    return { u, weather, aq, risk };
  });

  /* Dropdown options grouped by district.
   * excludeId: disable the option already selected in the opposite dropdown
   * so users cannot compare a location against itself. */
  function renderOptions(excludeId: string) {
    return DISTRICTS.map((d) => {
      const pilots = d.upazilas.filter(
        (u) => u.isPilot && u.lat != null && u.lon != null,
      );
      if (pilots.length === 0) return null;
      return (
        <optgroup key={d.id} label={lang === "bn" ? d.nameBn : d.nameEn}>
          {pilots.map((u) => (
            <option key={u.id} value={u.id} disabled={u.id === excludeId}>
              {lang === "bn" ? u.nameBn : u.nameEn}
            </option>
          ))}
        </optgroup>
      );
    });
  }

  const selectClass =
    "w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer";

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-foreground mb-1">
        {t("comparisonTitle")}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {t("comparisonSubtitle")}
      </p>

      {/* ── Location selectors ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">
            {t("comparisonSelectA")}
          </label>
          <select
            className={selectClass}
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
          >
            {renderOptions(selectedB)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">
            {t("comparisonSelectB")}
          </label>
          <select
            className={selectClass}
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
          >
            {renderOptions(selectedA)}
          </select>
        </div>
      </div>

      {/* ── Data table / states ─────────────────────────── */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground animate-pulse">
          {t("comparisonLoading")}
        </div>
      ) : isError ? (
        <div className="bg-card border border-destructive/30 rounded-xl p-8 flex flex-col items-center gap-3">
          <p className="text-sm text-destructive">{t("comparisonError")}</p>
          <button
            onClick={handleRetry}
            className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            {t("retryButton")}
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap w-1/3">
                  {t("comparisonMetric")}
                </th>
                {cols.map(({ u }) => (
                  <th
                    key={u.id}
                    className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap"
                  >
                    {lang === "bn" ? u.nameBn : u.nameEn}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {lang === "bn" ? u.districtNameBn : u.districtNameEn}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* Overall Safety */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {t("comparisonOverall")}
                </td>
                {cols.map(({ u, risk }) => (
                  <td key={u.id} className="px-4 py-3">
                    {risk ? (
                      <RiskBadge
                        level={risk.overall}
                        label={levelLabel(risk.overall)}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Temperature */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {t("comparisonTemp")}
                </td>
                {cols.map(({ u, weather }) => (
                  <td key={u.id} className="px-4 py-3 text-foreground">
                    {weather ? `${weather.temperature.toFixed(1)}°C` : "—"}
                  </td>
                ))}
              </tr>

              {/* PM2.5 */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {t("comparisonPM25")}
                </td>
                {cols.map(({ u, aq }) => (
                  <td key={u.id} className="px-4 py-3 text-foreground">
                    {aq ? `${aq.pm25.toFixed(1)} µg/m³` : "—"}
                  </td>
                ))}
              </tr>

              {/* Cold Risk */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {t("comparisonColdRisk")}
                </td>
                {cols.map(({ u, risk }) => (
                  <td key={u.id} className="px-4 py-3">
                    {risk ? (
                      <RiskBadge
                        level={risk.cold}
                        label={levelLabel(risk.cold)}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Flood Risk */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {t("comparisonFloodRisk")}
                </td>
                {cols.map(({ u, risk }) => (
                  <td key={u.id} className="px-4 py-3">
                    {risk ? (
                      <RiskBadge
                        level={risk.flood}
                        label={levelLabel(risk.flood)}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Storm Risk */}
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {t("comparisonStormRisk")}
                </td>
                {cols.map(({ u, risk }) => (
                  <td key={u.id} className="px-4 py-3">
                    {risk ? (
                      <RiskBadge
                        level={risk.storm}
                        label={levelLabel(risk.storm)}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
