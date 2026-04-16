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

/** Format a Date as HH:MM local time. */
function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
  label,
  level,
  levelLabel,
}: {
  label: string;
  level: RiskLevel;
  levelLabel: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <p className="text-xs text-muted-foreground mb-2 leading-tight">{label}</p>
      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${riskClass(level)}`}>
        {levelLabel}
      </span>
    </div>
  );
}

/* ── Loading skeleton ───────────────────────────────────── */

function LoadingDashboard({ title }: { title: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-10 text-center shadow-sm animate-pulse">
      <div className="text-5xl mb-4">⏳</div>
      <p className="text-muted-foreground text-sm">{title}</p>
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
}: {
  weather: WeatherData;
  airQuality: AirQualityData;
  upazila: Upazila;
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

  /* Contextual recommendations to show */
  const activeRecs = RECOMMENDATIONS.filter((rec) => rec.show(risk));

  return (
    <div className="space-y-6">

      {/* Header: title + last updated */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("dashboardTitle")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{locationName}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{t("lastUpdated")}: {formatTime(weather.fetchedAt)}</p>
          <p className="mt-0.5">{t("dataSource")}</p>
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
        <MetricCard icon="🫧" label="PM2.5 (µg/m³)" value={airQuality.pm25.toFixed(1)} />
        <MetricCard icon="🌐" label="PM10 (µg/m³)"  value={airQuality.pm10.toFixed(1)} />
      </div>

      {/* Overall safety badge */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground mb-3">
          {t("overallSafetyTitle")}
        </h3>
        <span className={`inline-block text-sm font-bold px-4 py-2 rounded-full ${riskClass(risk.overall)}`}>
          {levelLabel(risk.overall)}
        </span>
      </div>

      {/* Risk breakdown — 7 cards */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">
          {t("riskBreakdownTitle")}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <RiskCard label={t("heatRisk")}       level={risk.heat}       levelLabel={levelLabel(risk.heat)} />
          <RiskCard label={t("rainRisk")}       level={risk.rain}       levelLabel={levelLabel(risk.rain)} />
          <RiskCard label={t("airQualityRisk")} level={risk.airQuality} levelLabel={levelLabel(risk.airQuality)} />
          <RiskCard label={t("coldRisk")}       level={risk.cold}       levelLabel={levelLabel(risk.cold)} />
          <RiskCard label={t("heavyRainRisk")}  level={risk.heavyRain}  levelLabel={levelLabel(risk.heavyRain)} />
          <RiskCard label={t("floodRisk")}      level={risk.flood}      levelLabel={levelLabel(risk.flood)} />
          <RiskCard label={t("stormRisk")}      level={risk.storm}      levelLabel={levelLabel(risk.storm)} />
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
    </div>
  );
}

/* ── Main export ────────────────────────────────────────── */

export default function Dashboard({ selectedUpazila }: Props) {
  const { t } = useLanguage();

  const weatherQuery = useQuery({
    queryKey: ["weather", selectedUpazila.id],
    queryFn: () => fetchWeather(selectedUpazila.lat!, selectedUpazila.lon!),
    enabled: !!selectedUpazila.lat && !!selectedUpazila.lon,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  const aqQuery = useQuery({
    queryKey: ["airQuality", selectedUpazila.id],
    queryFn: () => fetchAirQuality(selectedUpazila.lat!, selectedUpazila.lon!),
    enabled: !!selectedUpazila.lat && !!selectedUpazila.lon,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  const isLoading = weatherQuery.isLoading || aqQuery.isLoading;
  const isError   = weatherQuery.isError   || aqQuery.isError;

  function handleRetry() {
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
          onRetry={handleRetry}
        />
      ) : weatherQuery.data && aqQuery.data ? (
        <DashboardPanel
          weather={weatherQuery.data}
          airQuality={aqQuery.data}
          upazila={selectedUpazila}
        />
      ) : null}
    </section>
  );
}
