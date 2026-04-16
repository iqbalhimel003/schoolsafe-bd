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

/* ── Helpers ────────────────────────────────────────────── */

/** Map a WMO code to a weather emoji — same logic as Dashboard. */
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
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-sm flex flex-col gap-1">
      <span className="text-xl" aria-hidden="true">{icon}</span>
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      <p className="text-base font-bold text-foreground">{value}</p>
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

  /* Priority 1 — Heat */
  if (forecast.tempMax >= T.HEAT_TEMP_MODERATE) tips.push(t("tomorrowTipHeat"));

  /* Priority 2 — Rain */
  if (forecast.rainProbMax >= T.RAIN_PRECIP_PROB_MODERATE) tips.push(t("tomorrowTipRain"));

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
        <span className="text-2xl" aria-hidden="true">
          {weatherIcon(forecast.weatherCode)}
        </span>
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
        <ForecastTile
          icon="🌡️"
          label={t("tomorrowMaxTemp")}
          value={`${forecast.tempMax.toFixed(1)}°C`}
        />
        <ForecastTile
          icon="🌡️"
          label={t("tomorrowMinTemp")}
          value={`${forecast.tempMin.toFixed(1)}°C`}
        />
        <ForecastTile
          icon="🌧️"
          label={t("tomorrowRainProb")}
          value={`${Math.round(forecast.rainProbMax)}%`}
        />
        <ForecastTile
          icon="💧"
          label={t("tomorrowRainAmount")}
          value={`${forecast.rainSum.toFixed(1)} mm`}
        />
        <ForecastTile
          icon="💨"
          label={t("tomorrowWindMax")}
          value={`${forecast.windMax.toFixed(1)} km/h`}
        />
        <ForecastTile
          icon="😷"
          label={t("tomorrowPM25")}
          value={`${forecast.pm25Avg.toFixed(1)} µg/m³`}
        />
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
