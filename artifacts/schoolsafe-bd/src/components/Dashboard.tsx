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

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchWeather, fetchAirQuality } from "@/utils/api";
import { evaluateRisk } from "@/logic/riskEngine";
import type { Upazila, RiskLevel, WeatherData, AirQualityData, RiskResult } from "@/types";
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
  if (level === "High") return "risk-high";
  if (level === "Moderate") return "risk-moderate";
  return "risk-low";
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

function GuidanceSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-foreground mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-primary shrink-0 mt-0.5" aria-hidden="true">▸</span>
            <span className="leading-snug">{item}</span>
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

const RECOMMENDATIONS: Rec[] = [
  {
    titleKey: "recHydration",
    textKey: "recHydrationText",
    show: (r) => r.heat !== "Low",
  },
  {
    titleKey: "recOutdoorAssembly",
    textKey: "recOutdoorAssemblyText",
    show: (r) => r.heat !== "Low" || r.heavyRain !== "Low",
  },
  {
    titleKey: "recOutdoorSports",
    textKey: "recOutdoorSportsText",
    show: (r) => r.heat !== "Low" || r.storm !== "Low",
  },
  {
    titleKey: "recRainCaution",
    textKey: "recRainCautionText",
    show: (r) => r.rain !== "Low",
  },
  {
    titleKey: "recAirQuality",
    textKey: "recAirQualityText",
    show: (r) => r.airQuality !== "Low",
  },
  {
    titleKey: "recWarmClothing",
    textKey: "recWarmClothingText",
    show: (r) => r.cold !== "Low",
  },
  {
    titleKey: "recDelayMorningAssembly",
    textKey: "recDelayMorningAssemblyText",
    show: (r) => r.cold === "High",
  },
  {
    titleKey: "recLimitEarlyMorning",
    textKey: "recLimitEarlyMorningText",
    show: (r) => r.cold !== "Low",
  },
  {
    titleKey: "recPostponeHeavyRain",
    textKey: "recPostponeHeavyRainText",
    show: (r) => r.heavyRain !== "Low",
  },
  {
    titleKey: "recAvoidFloodedAreas",
    textKey: "recAvoidFloodedAreasText",
    show: (r) => r.flood !== "Low",
  },
  {
    titleKey: "recStormRestriction",
    textKey: "recStormRestrictionText",
    show: (r) => r.storm !== "Low",
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

  /* Translation helpers for risk levels */
  function levelLabel(level: RiskLevel): string {
    if (level === "High") return t("safetyHigh");
    if (level === "Moderate") return t("safetyModerate");
    return t("safetyLow");
  }

  /* Share handler — native share sheet on mobile, clipboard fallback on desktop */
  async function handleShare() {
    const overall = levelLabel(risk.overall);
    const shareTitle = `SchoolSafe BD — ${locationName}`;
    const shareText =
      `SchoolSafe BD | ${locationName}\n` +
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

  /* Risk presence flags for conditional guidance sections */
  const anyRisk       = risk.overall !== "Low";
  const hasAirRisk    = risk.airQuality !== "Low";
  const hasColdRisk   = risk.cold !== "Low";
  const hasHeatRisk   = risk.heat !== "Low";
  const hasRainRisk   = risk.rain !== "Low" || risk.heavyRain !== "Low" || risk.flood !== "Low" || risk.storm !== "Low";
  const hasAllergyRisk = risk.heat !== "Low" || risk.cold !== "Low" || risk.airQuality !== "Low";

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
          <span className="text-lg font-bold">SchoolSafe BD</span>
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

      {/* Overall safety badge — prominent, color-coded box */}
      <div className={`border rounded-xl p-5 shadow-sm ${
        risk.overall === "High"
          ? "bg-red-50 border-red-300"
          : risk.overall === "Moderate"
          ? "bg-amber-50 border-amber-300"
          : "bg-green-50 border-green-200"
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

      {/* Why this advice? */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-3">
          {t("whyThisAdviceTitle")}
        </h3>
        {risk.triggeredRules.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noRisksTriggered")}</p>
        ) : (
          <ul className="space-y-1.5">
            {risk.triggeredRules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true">▸</span>
                <span>{t(rule as TranslationKeys)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

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
          {/* Section 1: Role-based guidance */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">
              {lang === "bn" ? "ভূমিকা-ভিত্তিক নির্দেশনা" : "Guidance by Role"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <GuidanceSection
                title={t("guidanceAuthoritiesTitle")}
                items={[
                  t("guidanceAuthorities1"),
                  t("guidanceAuthorities2"),
                  t("guidanceAuthorities3"),
                  t("guidanceAuthorities4"),
                  t("guidanceAuthorities5"),
                ]}
              />
              <GuidanceSection
                title={t("guidanceTeachersTitle")}
                items={[
                  t("guidanceTeachers1"),
                  t("guidanceTeachers2"),
                  t("guidanceTeachers3"),
                  t("guidanceTeachers4"),
                  t("guidanceTeachers5"),
                ]}
              />
              <GuidanceSection
                title={t("guidanceGuardiansTitle")}
                items={[
                  t("guidanceGuardians1"),
                  t("guidanceGuardians2"),
                  t("guidanceGuardians3"),
                  t("guidanceGuardians4"),
                ]}
              />
              <GuidanceSection
                title={t("guidanceStudentsTitle")}
                items={[
                  t("guidanceStudents1"),
                  t("guidanceStudents2"),
                  t("guidanceStudents3"),
                  t("guidanceStudents4"),
                  t("guidanceStudents5"),
                ]}
              />
            </div>
          </div>

          {/* Section 2: Condition-based extra precautions (conditional per risk) */}
          {(hasAirRisk || hasColdRisk || hasHeatRisk || hasRainRisk || hasAllergyRisk) && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">
                {lang === "bn" ? "অবস্থা-ভিত্তিক অতিরিক্ত সতর্কতা" : "Extra Precautions"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {hasAirRisk && (
                  <GuidanceSection
                    title={t("guidanceLungTitle")}
                    items={[
                      t("guidanceLung1"),
                      t("guidanceLung2"),
                      t("guidanceLung3"),
                      t("guidanceLung4"),
                    ]}
                  />
                )}
                {hasColdRisk && (
                  <GuidanceSection
                    title={t("guidanceColdSensitiveTitle")}
                    items={[
                      t("guidanceColdSensitive1"),
                      t("guidanceColdSensitive2"),
                      t("guidanceColdSensitive3"),
                    ]}
                  />
                )}
                {hasHeatRisk && (
                  <GuidanceSection
                    title={t("guidanceHeatSensitiveTitle")}
                    items={[
                      t("guidanceHeatSensitive1"),
                      t("guidanceHeatSensitive2"),
                      t("guidanceHeatSensitive3"),
                    ]}
                  />
                )}
                {hasRainRisk && (
                  <GuidanceSection
                    title={t("guidanceRainSensitiveTitle")}
                    items={[
                      t("guidanceRainSensitive1"),
                      t("guidanceRainSensitive2"),
                      t("guidanceRainSensitive3"),
                      t("guidanceRainSensitive4"),
                    ]}
                  />
                )}
                {hasAllergyRisk && (
                  <GuidanceSection
                    title={t("guidanceAllergyTitle")}
                    items={[
                      t("guidanceAllergy1"),
                      t("guidanceAllergy2"),
                      t("guidanceAllergy3"),
                      t("guidanceAllergy4"),
                    ]}
                  />
                )}
                <GuidanceSection
                  title={t("guidanceVulnStudentsTitle")}
                  items={[
                    t("guidanceVulnStudents1"),
                    t("guidanceVulnStudents2"),
                    t("guidanceVulnStudents3"),
                    t("guidanceVulnStudents4"),
                  ]}
                />
                <GuidanceSection
                  title={t("guidanceVulnTeachersTitle")}
                  items={[
                    t("guidanceVulnTeachers1"),
                    t("guidanceVulnTeachers2"),
                    t("guidanceVulnTeachers3"),
                  ]}
                />
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
