/* =========================================================
 * SchoolSafe BD — Live Environmental Dashboard
 *
 * Fetches live weather + air quality data from Open-Meteo,
 * runs the risk engine, and displays:
 *   - 8 weather metric cards
 *   - 7 risk breakdown cards (Low / Moderate / High)
 *   - Overall School Safety badge
 *   - "Why this advice?" triggered rules list
 *   - Contextual recommendation cards
 *
 * Loading and error states are handled gracefully.
 * All text is bilingual via useLanguage().
 * ========================================================= */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchWeather, fetchAirQuality } from "@/utils/api";
import { evaluateRisk } from "@/logic/riskEngine";
import { HEAT_TEMP_ADVISORY } from "@/logic/thresholds";
import type { Upazila, RiskLevel, RiskType, WeatherData, AirQualityData, RiskResult } from "@/types";
import { ALL_RISK_TYPES } from "@/types";
import type { TranslationKeys } from "@/translations/en";

/* ── Types ──────────────────────────────────────────────── */

interface Props {
  selectedUpazila: Upazila;
}

/* ── Helpers ────────────────────────────────────────────── */

/** Map a WMO weather code to a representative emoji. */
function weatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 49) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌦️";
  if (code <= 99) return "⛈️";
  return "🌤️";
}

/** CSS class for a risk badge. */
function riskClass(level: RiskLevel): string {
  if (level === "High")     return "risk-high";
  if (level === "Moderate") return "risk-moderate";
  if (level === "Low")      return "risk-low";
  return "risk-none";
}

/** Format a Date as h:MM AM/PM Bangladesh Standard Time (UTC+6). */
function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  });
}

/** Format visibility: ≥1000m → km, else m. */
function formatVisibility(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

/* ── Sub-components ─────────────────────────────────────── */

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col gap-1">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function RiskCard({
  icon,
  label,
  level,
  levelLabel,
  subValue,
}: {
  icon: string;
  label: string;
  level: RiskLevel;
  levelLabel: string;
  subValue?: string;
}) {
  return (
    <div className={`bg-card border rounded-lg p-4 shadow-sm transition-colors ${
      level === "High" ? "border-red-300 bg-red-50/40" : "border-border"
    }`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-base" aria-hidden="true">{icon}</span>
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      </div>
      <span className={`inline-block text-xs px-2.5 py-1 rounded-full ${riskClass(level)}`}>
        {levelLabel}
      </span>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-1.5">{subValue}</p>
      )}
    </div>
  );
}

/* ── Guidance section ───────────────────────────────────── */

/** A guidance bullet tagged with the risk types it applies to */
interface GuidanceBullet {
  key: TranslationKeys;
  /** Active risk types that make this bullet relevant */
  risks: RiskType[];
}

/**
 * Renders a guidance card whose bullets are filtered by the active risk set.
 * If no bullets survive the filter, the entire card is hidden (returns null).
 */
function FilteredGuidanceSection({
  title,
  bullets,
  activeRisks,
}: {
  title: string;
  bullets: GuidanceBullet[];
  activeRisks: Set<RiskType>;
}) {
  const { t } = useLanguage();
  const visible = bullets.filter((b) => b.risks.some((r) => activeRisks.has(r)));
  if (visible.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-foreground mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {visible.map((b) => (
          <li key={b.key} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-primary shrink-0 mt-0.5" aria-hidden="true">▸</span>
            <span className="leading-snug">{t(b.key)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Loading skeleton ───────────────────────────────────── */

function LoadingDashboard({ title }: { title: string }) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
        <div className="h-3 w-28 bg-muted rounded" />
      </div>

      {/* Weather icon + subtitle skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-muted rounded-full" />
        <div className="h-3 w-40 bg-muted rounded" />
      </div>

      {/* Metric cards skeleton — 8 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-2">
            <div className="h-6 w-6 bg-muted rounded" />
            <div className="h-2.5 w-16 bg-muted rounded" />
            <div className="h-5 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Air quality skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-2">
            <div className="h-6 w-6 bg-muted rounded" />
            <div className="h-2.5 w-16 bg-muted rounded" />
            <div className="h-5 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Overall badge skeleton */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-8 w-24 bg-muted rounded-full" />
        <p className="text-xs text-muted-foreground">{title}</p>
      </div>

      {/* Risk cards skeleton — 7 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-2">
            <div className="h-2.5 w-20 bg-muted rounded" />
            <div className="h-5 w-14 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Error state ────────────────────────────────────────── */

function ErrorDashboard({
  message,
  retryLabel,
  onRetry,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <div className="bg-card border border-destructive/30 rounded-xl p-10 text-center shadow-sm">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-destructive text-sm mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
      >
        {retryLabel}
      </button>
    </div>
  );
}

/* ── Recommendations config ─────────────────────────────── */

interface Rec {
  titleKey: TranslationKeys;
  textKey: TranslationKeys;
  show: (r: RiskResult) => boolean;
}

/* Helper: true when a level is Moderate or High (not None or Low).
 * Recommendations only appear for meaningful risk levels. */
function atLeastModerate(level: RiskLevel): boolean {
  return level === "Moderate" || level === "High";
}

const RECOMMENDATIONS: Rec[] = [
  {
    titleKey: "recHydration",
    textKey: "recHydrationText",
    show: (r) => atLeastModerate(r.heat),
  },
  {
    titleKey: "recOutdoorAssembly",
    textKey: "recOutdoorAssemblyText",
    show: (r) => atLeastModerate(r.heat) || atLeastModerate(r.heavyRain),
  },
  {
    titleKey: "recOutdoorSports",
    textKey: "recOutdoorSportsText",
    show: (r) => atLeastModerate(r.heat) || atLeastModerate(r.storm),
  },
  {
    titleKey: "recRainCaution",
    textKey: "recRainCautionText",
    show: (r) => atLeastModerate(r.rain),
  },
  {
    titleKey: "recAirQuality",
    textKey: "recAirQualityText",
    show: (r) => atLeastModerate(r.airQuality),
  },
  {
    titleKey: "recWarmClothing",
    textKey: "recWarmClothingText",
    show: (r) => atLeastModerate(r.cold),
  },
  {
    titleKey: "recDelayMorningAssembly",
    textKey: "recDelayMorningAssemblyText",
    show: (r) => r.cold === "High",
  },
  {
    titleKey: "recLimitEarlyMorning",
    textKey: "recLimitEarlyMorningText",
    show: (r) => atLeastModerate(r.cold),
  },
  {
    titleKey: "recPostponeHeavyRain",
    textKey: "recPostponeHeavyRainText",
    show: (r) => atLeastModerate(r.heavyRain),
  },
  {
    titleKey: "recAvoidFloodedAreas",
    textKey: "recAvoidFloodedAreasText",
    show: (r) => atLeastModerate(r.flood),
  },
  {
    titleKey: "recStormRestriction",
    textKey: "recStormRestrictionText",
    show: (r) => atLeastModerate(r.storm),
  },
  {
    titleKey: "recSevereWeatherCaution",
    textKey: "recSevereWeatherCautionText",
    show: (r) => r.storm === "High",
  },
];

/* ── Main dashboard panel ───────────────────────────────── */

function DashboardPanel({
  weather,
  airQuality,
  upazila,
  isFetching,
  onRefresh,
}: {
  weather: WeatherData;
  airQuality: AirQualityData;
  upazila: Upazila;
  isFetching: boolean;
  onRefresh: () => void;
}) {
  const { t, lang } = useLanguage();
  const risk = evaluateRisk(weather, airQuality);
  const locationName = lang === "bn" ? upazila.nameBn : upazila.nameEn;
  const [showExtraPrecautions, setShowExtraPrecautions] = useState(false);

  /* Set of risk types that are currently above None — used for guidance bullet filtering */
  const activeRisks = new Set<RiskType>(
    ALL_RISK_TYPES.filter((k) => risk[k] !== "None")
  );

  /* ── Tagged bullet arrays ─────────────────────────────── */

  const authoritiesBullets: GuidanceBullet[] = [
    { key: "guidanceAuthorities1", risks: ["heat", "cold", "heavyRain", "storm"] },
    { key: "guidanceAuthorities2", risks: ALL_RISK_TYPES },
    { key: "guidanceAuthorities3", risks: ALL_RISK_TYPES },
    { key: "guidanceAuthorities4", risks: ["heat", "cold", "airQuality", "heavyRain", "flood", "storm"] },
    { key: "guidanceAuthorities5", risks: ["rain", "heavyRain", "flood", "storm"] },
  ];

  const teachersBullets: GuidanceBullet[] = [
    { key: "guidanceTeachers1", risks: ["heat", "cold", "airQuality", "rain", "heavyRain"] },
    { key: "guidanceTeachers2", risks: ALL_RISK_TYPES },
    { key: "guidanceTeachers3", risks: ["heat", "cold", "airQuality", "heavyRain", "flood", "storm"] },
    { key: "guidanceTeachers4", risks: ["heat", "cold", "rain", "airQuality", "heavyRain", "storm"] },
    { key: "guidanceTeachers5", risks: ["heavyRain", "flood", "storm"] },
  ];

  const guardiansBullets: GuidanceBullet[] = [
    { key: "guidanceGuardians1", risks: ["heat", "cold", "rain", "airQuality", "heavyRain", "storm"] },
    { key: "guidanceGuardians2", risks: ["rain", "heavyRain", "flood", "storm"] },
    { key: "guidanceGuardians3", risks: ["heat", "cold", "airQuality", "heavyRain", "flood", "storm"] },
    { key: "guidanceGuardians4", risks: ALL_RISK_TYPES },
  ];

  const studentsBullets: GuidanceBullet[] = [
    { key: "guidanceStudents1", risks: ["heat"] },
    { key: "guidanceStudents2", risks: ["cold"] },
    { key: "guidanceStudents3", risks: ["rain", "heavyRain", "flood", "storm"] },
    { key: "guidanceStudents4", risks: ["airQuality", "storm", "heavyRain", "flood"] },
    { key: "guidanceStudents5", risks: ALL_RISK_TYPES },
  ];

  const vulnStudentsBullets: GuidanceBullet[] = [
    { key: "guidanceVulnStudents1", risks: ["heat", "cold", "airQuality", "heavyRain", "flood", "storm"] },
    { key: "guidanceVulnStudents2", risks: ALL_RISK_TYPES },
    { key: "guidanceVulnStudents3", risks: ["heat", "cold", "airQuality", "heavyRain", "flood", "storm"] },
    { key: "guidanceVulnStudents4", risks: ["heat", "cold", "airQuality", "heavyRain", "flood", "storm"] },
  ];

  const vulnTeachersBullets: GuidanceBullet[] = [
    { key: "guidanceVulnTeachers1", risks: ["heat", "cold", "airQuality", "heavyRain", "flood", "storm"] },
    { key: "guidanceVulnTeachers2", risks: ["heavyRain", "flood", "storm"] },
    { key: "guidanceVulnTeachers3", risks: ["heat", "cold", "airQuality", "heavyRain", "flood", "storm"] },
  ];

  /* Translation helpers for risk levels */
  function levelLabel(level: RiskLevel): string {
    if (level === "High")     return t("safetyHigh");
    if (level === "Moderate") return t("safetyModerate");
    if (level === "Low")      return t("safetyLow");
    return t("safetyNone");
  }

  /* Share handler — native share sheet on mobile, clipboard fallback on desktop */
  async function handleShare() {
    const overall = levelLabel(risk.overall);
    const shareTitle = `SafeSchool — ${locationName}`;
    const shareText =
      `SafeSchool | ${locationName}\n` +
      `${t("overallSafetyTitle")}: ${overall}\n` +
      `${t("temperature")}: ${weather.temperature.toFixed(1)}°C  ` +
      `${t("humidity")}: ${Math.round(weather.humidity)}%\n` +
      `${t("windSpeed")}: ${weather.windSpeed.toFixed(1)} km/h  ` +
      `${t("rain")}: ${weather.rain.toFixed(1)} mm\n` +
      window.location.href;
    const shareUrl = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (err) {
        /* User cancelled → AbortError — ignore silently.
           Any other failure falls through to clipboard copy. */
        if (err instanceof Error && err.name !== "AbortError") {
          try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success(t("shareToastCopied"));
          } catch {
            toast.error(t("shareToastFailed"));
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(t("shareToastCopied"));
      } catch {
        toast.error(t("shareToastFailed"));
      }
    }
  }

  /* Contextual recommendations to show */
  const activeRecs = RECOMMENDATIONS.filter((rec) => rec.show(risk));

  /* Risk presence flags for condition-based section guards.
   * anyRisk: hide all guidance when overall risk is None.
   * activeRisks includes Low so guidance bullets still show on mild days. */
  const anyRisk        = risk.overall !== "None";
  const hasAirRisk     = activeRisks.has("airQuality");
  const hasColdRisk    = activeRisks.has("cold");
  const hasHeatRisk    = activeRisks.has("heat");
  const hasRainRisk    = activeRisks.has("rain") || activeRisks.has("heavyRain") || activeRisks.has("flood") || activeRisks.has("storm");
  const hasAllergyRisk = activeRisks.has("heat") || activeRisks.has("cold") || activeRisks.has("airQuality");

  const today = new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">

      {/* Print-only report header — hidden on screen, visible when printing */}
      <div className="print-only border-b-2 border-black pb-4 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span aria-hidden="true">🌿</span>
          <span className="text-lg font-bold">SafeSchool</span>
        </div>
        <h1 className="text-2xl font-bold">{t("printReportTitle")}</h1>
        <p className="text-base font-semibold mt-1">{locationName}</p>
        <p className="text-sm mt-0.5">{t("printGeneratedOn")}: {today} — {t("lastUpdated")}: {formatTime(weather.fetchedAt)}</p>
      </div>

      {/* Header: title + last updated + Refresh + Print buttons */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("dashboardTitle")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{locationName}</p>
        </div>
        <div className="flex items-start gap-3 flex-wrap justify-end">
          <div className="text-right text-xs text-muted-foreground">
            {isFetching ? (
              <p className="flex items-center justify-end gap-1 text-primary animate-pulse">
                <span className="inline-block h-2 w-2 rounded-full bg-primary animate-ping" aria-hidden="true" />
                {t("refreshingLabel")}
              </p>
            ) : (
              <p>{t("lastUpdated")}: {formatTime(weather.fetchedAt)}</p>
            )}
            <p className="mt-0.5">{t("dataSource")}</p>
          </div>
          {/* Manual refresh button */}
          <button
            onClick={onRefresh}
            disabled={isFetching}
            className="no-print shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted active:bg-muted/80 text-foreground text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t("refreshButton")}
          >
            <span
              aria-hidden="true"
              className={isFetching ? "animate-spin inline-block" : "inline-block"}
            >
              🔄
            </span>
            {t("refreshButton")}
          </button>
          <button
            onClick={() => window.print()}
            className="no-print shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary text-xs font-semibold transition-colors"
            aria-label={t("printButton")}
          >
            <span aria-hidden="true">🖨️</span>
            {t("printButton")}
          </button>
          <button
            onClick={handleShare}
            className="no-print shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-400/50 bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-700 text-xs font-semibold transition-colors"
            aria-label={t("shareButton")}
          >
            <span aria-hidden="true">📤</span>
            {t("shareButton")}
          </button>
        </div>
      </div>

      {/* Weather icon + subtitle */}
      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden="true">{weatherIcon(weather.weatherCode)}</span>
        <p className="text-sm text-muted-foreground">{t("dashboardSubtitle")}</p>
      </div>

      {/* Weather metrics grid — 8 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard icon="🌡️" label={t("temperature")}              value={`${weather.temperature.toFixed(1)}°C`} />
        <MetricCard icon="💧" label={t("humidity")}                  value={`${Math.round(weather.humidity)}%`} />
        <MetricCard icon="🤔" label={t("apparentTemperature")}       value={`${weather.apparentTemperature.toFixed(1)}°C`} />
        <MetricCard icon="🌧️" label={t("precipitationProbability")} value={`${Math.round(weather.precipitationProbability)}%`} />
        <MetricCard icon="🌂" label={t("rain")}                      value={`${weather.rain.toFixed(1)} mm`} />
        <MetricCard icon="💨" label={t("windSpeed")}                 value={`${weather.windSpeed.toFixed(1)} km/h`} />
        <MetricCard icon="🔆" label={t("uvIndex")}                   value={weather.uvIndex.toFixed(1)} />
        <MetricCard icon="👁️" label={t("visibility")}               value={formatVisibility(weather.visibility)} />
      </div>

      {/* Air quality mini-row */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon="🫧" label={t("pm25Label")} value={airQuality.pm25.toFixed(1)} />
        <MetricCard icon="🌐" label={t("pm10Label")} value={airQuality.pm10.toFixed(1)} />
      </div>

      {/* Heat advisory badge — shown when temp ≥ 30°C but below Moderate/High heat risk */}
      {(risk.heat === "None" || risk.heat === "Low") &&
        Math.max(weather.temperature, weather.apparentTemperature) >= HEAT_TEMP_ADVISORY && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 shadow-sm">
          <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">🌤️</span>
          <div>
            <span className="inline-block text-xs font-semibold text-orange-700 bg-orange-100 border border-orange-300 rounded-full px-2.5 py-0.5 mb-1">
              {t("heatAdvisoryLabel")}
            </span>
            <p className="text-xs text-orange-900 leading-snug">{t("heatAdvisoryDesc")}</p>
          </div>
        </div>
      )}

      {/* Overall safety badge — prominent, color-coded box */}
      <div className={`border rounded-xl p-5 shadow-sm ${
        risk.overall === "High"
          ? "bg-red-50 border-red-300"
          : risk.overall === "Moderate"
          ? "bg-amber-50 border-amber-300"
          : risk.overall === "Low"
          ? "bg-green-50 border-green-200"
          : "bg-slate-50 border-slate-200"
      }`}>
        <h3 className="text-base font-semibold text-foreground mb-3">
          {t("overallSafetyTitle")}
        </h3>
        <div className="flex items-center gap-3">
          <span
            className={`inline-block text-base font-bold px-5 py-2 rounded-full ${riskClass(risk.overall)}`}
          >
            {levelLabel(risk.overall)}
          </span>
          {risk.overall === "High" && (
            <span className="text-sm text-red-700 font-medium">
              ⚠ {t("whyThisAdviceTitle")}
            </span>
          )}
        </div>
      </div>

      {/* Risk breakdown — 7 cards */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">
          {t("riskBreakdownTitle")}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <RiskCard icon="🌡️" label={t("heatRisk")}       level={risk.heat}       levelLabel={levelLabel(risk.heat)} />
          <RiskCard icon="🌧️" label={t("rainRisk")}       level={risk.rain}       levelLabel={levelLabel(risk.rain)} />
          <RiskCard icon="🌫️" label={t("airQualityRisk")} level={risk.airQuality} levelLabel={levelLabel(risk.airQuality)} />
          <RiskCard icon="🧥" label={t("coldRisk")}       level={risk.cold}       levelLabel={levelLabel(risk.cold)} />
          <RiskCard icon="⛈️" label={t("heavyRainRisk")}  level={risk.heavyRain}  levelLabel={levelLabel(risk.heavyRain)} />
          <RiskCard icon="🌊" label={t("floodRisk")}      level={risk.flood}      levelLabel={levelLabel(risk.flood)} subValue={`${t("rain6hLabel")}: ${weather.rain6h.toFixed(1)} mm`} />
          <RiskCard icon="🌀" label={t("stormRisk")}      level={risk.storm}      levelLabel={levelLabel(risk.storm)} />
        </div>
      </div>

      {/* Why this advice? — only visible when at least one Moderate/High risk is present.
           Since rules are only pushed for Moderate/High evaluators, triggeredRules.length > 0
           is equivalent to "any Moderate or High risk exists". */}
      {risk.triggeredRules.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-3">
            {t("whyThisAdviceTitle")}
          </h3>
          <ul className="space-y-1.5">
            {risk.triggeredRules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true">▸</span>
                <span>{t(rule as TranslationKeys)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {activeRecs.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">
            {t("recommendationsTitle")}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {activeRecs.map((rec) => (
              <div
                key={rec.titleKey}
                className="bg-primary/5 border border-primary/20 rounded-lg p-4"
              >
                <p className="text-sm font-semibold text-primary mb-1">
                  {t(rec.titleKey)}
                </p>
                <p className="text-sm text-foreground leading-snug">
                  {t(rec.textKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Role-based & condition-based guidance (only when any risk is active) ── */}
      {anyRisk && (
        <>
          {/* Section 1: Role-based guidance — bullets filtered by active risks */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">
              {lang === "bn" ? "ভূমিকা-ভিত্তিক নির্দেশনা" : "Guidance by Role"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <FilteredGuidanceSection
                title={t("guidanceAuthoritiesTitle")}
                bullets={authoritiesBullets}
                activeRisks={activeRisks}
              />
              <FilteredGuidanceSection
                title={t("guidanceTeachersTitle")}
                bullets={teachersBullets}
                activeRisks={activeRisks}
              />
              <FilteredGuidanceSection
                title={t("guidanceGuardiansTitle")}
                bullets={guardiansBullets}
                activeRisks={activeRisks}
              />
              <FilteredGuidanceSection
                title={t("guidanceStudentsTitle")}
                bullets={studentsBullets}
                activeRisks={activeRisks}
              />
            </div>
          </div>

          {/* Section 2: Condition-based extra precautions (collapsible, conditional per risk) */}
          {(hasAirRisk || hasColdRisk || hasHeatRisk || hasRainRisk || hasAllergyRisk) && (
            <div>
              {/* Always-visible heading */}
              <h3 className="text-base font-semibold text-foreground mb-2">
                {t("extraPrecautionsTitle")}
              </h3>

              {/* High-risk badge — visible when overall risk is High and section is collapsed */}
              {risk.overall === "High" && !showExtraPrecautions && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 border border-red-300 rounded-full px-3 py-1">
                    <span aria-hidden="true">⚠</span>
                    {t("extraPrecautionsHighRiskNote")}
                  </span>
                </div>
              )}

              {/* Hint line — visible only while collapsed */}
              {!showExtraPrecautions && (
                <p className="text-xs text-muted-foreground mb-3 leading-snug">
                  {t("extraPrecautionsHint")}
                </p>
              )}

              {/* Toggle button */}
              <button
                onClick={() => setShowExtraPrecautions((v) => !v)}
                className="mb-3 flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted active:bg-muted/80 text-foreground text-sm font-medium transition-colors shadow-sm"
                aria-expanded={showExtraPrecautions}
                aria-controls="extra-precautions-cards"
              >
                {showExtraPrecautions ? t("extraPrecautionsToggleHide") : t("extraPrecautionsToggleShow")}
              </button>

              {/* Collapsible cards — smooth fade/slide via CSS transition on max-height */}
              <div
                id="extra-precautions-cards"
                style={{
                  maxHeight: showExtraPrecautions ? "2000px" : "0px",
                  opacity: showExtraPrecautions ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.4s ease, opacity 0.3s ease",
                }}
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  {hasAirRisk && (
                    <FilteredGuidanceSection
                      title={t("guidanceLungTitle")}
                      bullets={[
                        { key: "guidanceLung1", risks: ["airQuality"] },
                        { key: "guidanceLung2", risks: ["airQuality"] },
                        { key: "guidanceLung3", risks: ["airQuality"] },
                        { key: "guidanceLung4", risks: ["airQuality"] },
                      ]}
                      activeRisks={activeRisks}
                    />
                  )}
                  {hasColdRisk && (
                    <FilteredGuidanceSection
                      title={t("guidanceColdSensitiveTitle")}
                      bullets={[
                        { key: "guidanceColdSensitive1", risks: ["cold"] },
                        { key: "guidanceColdSensitive2", risks: ["cold"] },
                        { key: "guidanceColdSensitive3", risks: ["cold"] },
                      ]}
                      activeRisks={activeRisks}
                    />
                  )}
                  {hasHeatRisk && (
                    <FilteredGuidanceSection
                      title={t("guidanceHeatSensitiveTitle")}
                      bullets={[
                        { key: "guidanceHeatSensitive1", risks: ["heat"] },
                        { key: "guidanceHeatSensitive2", risks: ["heat"] },
                        { key: "guidanceHeatSensitive3", risks: ["heat"] },
                      ]}
                      activeRisks={activeRisks}
                    />
                  )}
                  {hasRainRisk && (
                    <FilteredGuidanceSection
                      title={t("guidanceRainSensitiveTitle")}
                      bullets={[
                        { key: "guidanceRainSensitive1", risks: ["rain", "heavyRain", "flood", "storm"] },
                        { key: "guidanceRainSensitive2", risks: ["rain", "heavyRain", "flood", "storm"] },
                        { key: "guidanceRainSensitive3", risks: ["rain", "heavyRain", "flood", "storm"] },
                        { key: "guidanceRainSensitive4", risks: ["rain", "heavyRain", "flood", "storm"] },
                      ]}
                      activeRisks={activeRisks}
                    />
                  )}
                  {hasAllergyRisk && (
                    <FilteredGuidanceSection
                      title={t("guidanceAllergyTitle")}
                      bullets={[
                        { key: "guidanceAllergy1", risks: ["heat", "cold", "airQuality"] },
                        { key: "guidanceAllergy2", risks: ["heat", "cold", "airQuality"] },
                        { key: "guidanceAllergy3", risks: ["heat", "cold", "airQuality"] },
                        { key: "guidanceAllergy4", risks: ["heat", "cold", "airQuality"] },
                      ]}
                      activeRisks={activeRisks}
                    />
                  )}
                  <FilteredGuidanceSection
                    title={t("guidanceVulnStudentsTitle")}
                    bullets={vulnStudentsBullets}
                    activeRisks={activeRisks}
                  />
                  <FilteredGuidanceSection
                    title={t("guidanceVulnTeachersTitle")}
                    bullets={vulnTeachersBullets}
                    activeRisks={activeRisks}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer — always shown when any guidance is visible */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              ⚠ {t("guidanceDisclaimerTitle")}
            </p>
            <p className="text-sm text-amber-900 leading-relaxed">
              {t("guidanceDisclaimerText")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main export ────────────────────────────────────────── */

/* Auto-refresh interval: every 5 minutes */
const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

export default function Dashboard({ selectedUpazila }: Props) {
  const { t } = useLanguage();

  const weatherQuery = useQuery({
    queryKey: ["weather", selectedUpazila.id],
    queryFn: () => fetchWeather(selectedUpazila.lat!, selectedUpazila.lon!),
    enabled: !!selectedUpazila.lat && !!selectedUpazila.lon,
    staleTime: REFETCH_INTERVAL_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    retry: 2,
  });

  const aqQuery = useQuery({
    queryKey: ["airQuality", selectedUpazila.id],
    queryFn: () => fetchAirQuality(selectedUpazila.lat!, selectedUpazila.lon!),
    enabled: !!selectedUpazila.lat && !!selectedUpazila.lon,
    staleTime: REFETCH_INTERVAL_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    retry: 2,
  });

  const isLoading   = weatherQuery.isLoading || aqQuery.isLoading;
  const isError     = weatherQuery.isError   || aqQuery.isError;
  const isFetching  = weatherQuery.isFetching || aqQuery.isFetching;

  function handleRefresh() {
    weatherQuery.refetch();
    aqQuery.refetch();
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      {isLoading ? (
        <LoadingDashboard title={t("loadingData")} />
      ) : isError ? (
        <ErrorDashboard
          message={t("errorFetchingData")}
          retryLabel={t("retryButton")}
          onRetry={handleRefresh}
        />
      ) : weatherQuery.data && aqQuery.data ? (
        <DashboardPanel
          weather={weatherQuery.data}
          airQuality={aqQuery.data}
          upazila={selectedUpazila}
          isFetching={isFetching}
          onRefresh={handleRefresh}
        />
      ) : null}
    </section>
  );
}
