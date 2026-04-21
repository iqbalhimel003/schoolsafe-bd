/* =========================================================
 * SchoolSafe BD — Tomorrow's Forecast & Preparedness Section
 *
 * Displays:
 *   - 6 metric tiles (max temp, min temp, rain prob, rain
 *     amount, max wind, avg PM2.5)
 *   - A PrepLevel badge (Low / Moderate / High preparation need)
 *   - 2–4 context-sensitive preparedness tips
 *
 * Tips selection strategy (always 2–4):
 *   1. Collect relevant condition tips in priority order using
 *      shared threshold constants from logic/thresholds.ts.
 *   2. Add "school authorities" tip when prepLevel === "High".
 *   3. If total tips < 2, append fallback tips (low-risk general
 *      + monitor) until minimum 2 is met.
 *   4. Cap at 4.
 *
 * All text is bilingual via useLanguage().
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";
import type { TomorrowForecast, PrepLevel } from "@/types";
import * as T from "@/logic/thresholds";
import { isThunderstormCode } from "@/logic/riskEngine";
import AnimatedWeatherIcon, {
  weatherCodeToIconKind,
  type AnimatedIconKind,
} from "@/components/animated/AnimatedWeatherIcon";
import AnimatedNumber from "@/components/animated/AnimatedNumber";

/* ── Helpers ────────────────────────────────────────────── */

/** CSS class for the prep-level badge — reuses existing risk colour classes. */
function prepClass(level: PrepLevel): string {
  if (level === "High")     return "risk-high";
  if (level === "Moderate") return "risk-moderate";
  if (level === "Low")      return "risk-low";
  return "risk-none";
}

/** Format a YYYY-MM-DD date string for display in the current locale. */
function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(
      locale === "bn" ? "bn-BD" : "en-GB",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );
  } catch {
    return dateStr;
  }
}

/* ── Small metric tile ───────────────────────────────────── */

function ForecastTile({
  iconKind,
  label,
  numericValue,
  decimals = 0,
  suffix = "",
}: {
  iconKind: AnimatedIconKind;
  label: string;
  numericValue: number;
  decimals?: number;
  suffix?: string;
}) {
  return (
    <div className="glass-card lift-on-hover rounded-lg p-3 flex flex-col gap-1">
      <AnimatedWeatherIcon kind={iconKind} size={24} />
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      <p className="text-base font-bold text-foreground tabular-nums">
        <AnimatedNumber value={numericValue} decimals={decimals} suffix={suffix} />
      </p>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

interface Props {
  forecast: TomorrowForecast;
  prepLevel: PrepLevel;
}

const MIN_TIPS = 2;
const MAX_TIPS = 4;

export default function TomorrowOutlook({ forecast, prepLevel }: Props) {
  const { t, lang } = useLanguage();

  const prepLabel =
    prepLevel === "High"
      ? t("tomorrowPrepHigh")
      : prepLevel === "Moderate"
      ? t("tomorrowPrepModerate")
      : prepLevel === "Low"
      ? t("tomorrowPrepLow")
      : t("tomorrowPrepNone");

  /* ── Build tips list ─────────────────────────────────────
   *
   * Step 1: Condition tips — priority-ordered, threshold-gated.
   *   Uses the same threshold constants as assessTomorrowPrep()
   *   and evaluateRisk() so behaviour is always consistent.
   *
   * Step 2: Authorities tip — only when prepLevel === "High".
   *
   * Step 3: Fallback tips — appended when total tips < MIN_TIPS
   *   to satisfy the 2–4 floor on low-risk days.
   *
   * Step 4: Slice to MAX_TIPS (4).
   * ─────────────────────────────────────────────────────── */
  const tips: string[] = [];

  /* Priority 1 — Heat (two-tier) */
  if (forecast.tempMax >= T.HEAT_TEMP_MODERATE) {
    tips.push(t("tomorrowTipHeat"));
  } else if (forecast.tempMax > T.HEAT_TEMP_ADVISORY) {
    tips.push(t("tomorrowTipHeatBasic"));
  }

  /* Priority 2 — Rain (two-tier umbrella advice) */
  const strongRain =
    forecast.rainProbMax >= T.TOMORROW_UMBRELLA_STRONG_PROB ||
    forecast.rainSum >= T.TOMORROW_UMBRELLA_STRONG_RAIN ||
    isThunderstormCode(forecast.weatherCode);
  const basicRain =
    forecast.rainProbMax >= T.TOMORROW_UMBRELLA_PROB ||
    forecast.rainSum >= T.TOMORROW_UMBRELLA_RAIN;

  if (strongRain) {
    tips.push(t("tomorrowTipRainStrong"));
  } else if (basicRain) {
    tips.push(t("tomorrowTipRain"));
  }

  /* Priority 3 — Wind */
  if (forecast.windMax >= T.STORM_WIND_MODERATE) tips.push(t("tomorrowTipWind"));

  /* Priority 4 — Cold */
  if (forecast.tempMin <= T.COLD_TEMP_MODERATE) tips.push(t("tomorrowTipCold"));

  /* Priority 5 — Air quality */
  if (forecast.pm25Avg >= T.AQ_PM25_MODERATE) tips.push(t("tomorrowTipAir"));

  /* Step 2: School authorities tip — High prep days only */
  if (prepLevel === "High") tips.push(t("tomorrowTipAuthorities"));

  /* Step 3: Fallbacks — ensures minimum MIN_TIPS on calm days */
  const fallbacks = [t("tomorrowTipLowRiskGeneral"), t("tomorrowTipMonitor")];
  for (const fb of fallbacks) {
    if (tips.length >= MIN_TIPS) break;
    tips.push(fb);
  }

  /* Step 4: Cap at MAX_TIPS */
  const visibleTips = tips.slice(0, MAX_TIPS);

  return (
    <section className="space-y-4">
      {/* Section heading */}
      <div className="flex items-center gap-2">
        <AnimatedWeatherIcon kind={weatherCodeToIconKind(forecast.weatherCode)} size={32} />
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {t("tomorrowSectionTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formatDate(forecast.date, lang)}
          </p>
        </div>
      </div>

      {/* PrepLevel badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">
          {t("tomorrowPrepBadgeLabel")}:
        </span>
        <span
          className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${prepClass(prepLevel)}`}
        >
          {prepLabel}
        </span>
      </div>

      {/* 6 metric tiles — 3 columns on sm+, 2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ForecastTile iconKind="thermometerHot"  label={t("tomorrowMaxTemp")}    numericValue={forecast.tempMax}     decimals={1} suffix="°C" />
        <ForecastTile iconKind="thermometerCold" label={t("tomorrowMinTemp")}    numericValue={forecast.tempMin}     decimals={1} suffix="°C" />
        <ForecastTile iconKind="rain"            label={t("tomorrowRainProb")}   numericValue={Math.round(forecast.rainProbMax)} decimals={0} suffix="%" />
        <ForecastTile iconKind="humidity"        label={t("tomorrowRainAmount")} numericValue={forecast.rainSum}     decimals={1} suffix=" mm" />
        <ForecastTile iconKind="wind"            label={t("tomorrowWindMax")}    numericValue={forecast.windMax}     decimals={1} suffix=" km/h" />
        <ForecastTile iconKind="mask"            label={t("tomorrowPM25")}       numericValue={forecast.pm25Avg}     decimals={1} suffix=" µg/m³" />
      </div>

      {/* Preparedness tips — always 2–4 */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          {t("tomorrowPrepTipsTitle")}
        </h4>
        <ul className="space-y-2">
          {visibleTips.map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <span
                className="text-primary shrink-0 mt-0.5"
                aria-hidden="true"
              >
                ▸
              </span>
              <span className="leading-snug">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
