/* =========================================================
 * SchoolSafe BD — Tomorrow's Forecast & Preparedness Section
 *
 * Displays:
 *   - 6 metric tiles (max temp, min temp, rain prob, rain
 *     amount, max wind, avg PM2.5)
 *   - A PrepLevel badge (Low / Moderate / High preparation need)
 *   - 2–4 context-sensitive preparedness tips, priority-ordered
 *     and capped at 4. Tips are selected by threshold relevance;
 *     "authorities" tip is always included to ensure minimum 2.
 *
 * All text is bilingual via useLanguage().
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";
import type { TomorrowForecast, PrepLevel } from "@/types";

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
  if (level === "High") return "risk-high";
  if (level === "Moderate") return "risk-moderate";
  return "risk-low";
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

export default function TomorrowOutlook({ forecast, prepLevel }: Props) {
  const { t, lang } = useLanguage();

  const prepLabel =
    prepLevel === "High"
      ? t("tomorrowPrepHigh")
      : prepLevel === "Moderate"
      ? t("tomorrowPrepModerate")
      : t("tomorrowPrepLow");

  /* ── Context-sensitive tips — priority-ordered, capped at 4 ─
   *
   * Steps:
   *  1. Collect relevant condition tips in priority order.
   *  2. The "school authorities" tip is always appended last —
   *     it ensures a minimum of 2 tips when ≥ 1 condition fires,
   *     and guarantees the list is never empty.
   *  3. The list is capped at MAX_TIPS (4) by keeping the first
   *     (MAX_TIPS − 1) condition tips and always keeping the
   *     authorities tip.
   *
   * Thresholds match those used in assessTomorrowPrep():
   *   Heat:  tempMax  ≥ HEAT_TEMP_MODERATE (32°C)
   *   Rain:  rainProbMax ≥ RAIN_PRECIP_PROB_MODERATE (40%)
   *   Wind:  windMax  ≥ STORM_WIND_MODERATE (40 km/h)
   *   Cold:  tempMin  ≤ COLD_TEMP_MODERATE (15°C)
   *   Air:   pm25Avg  ≥ AQ_PM25_MODERATE (15 µg/m³)
   * ─────────────────────────────────────────────────────── */
  const MAX_TIPS = 4;

  /* Ordered condition tips */
  const conditionTips: string[] = [];
  if (forecast.tempMax    >= 32) conditionTips.push(t("tomorrowTipHeat"));
  if (forecast.rainProbMax >= 40) conditionTips.push(t("tomorrowTipRain"));
  if (forecast.windMax    >= 40) conditionTips.push(t("tomorrowTipWind"));
  if (forecast.tempMin    <= 15) conditionTips.push(t("tomorrowTipCold"));
  if (forecast.pm25Avg    >= 15) conditionTips.push(t("tomorrowTipAir"));

  /* Keep at most (MAX_TIPS − 1) condition tips to leave room for the
   * authorities tip which is always appended as the final entry. */
  const visibleConditionTips = conditionTips.slice(0, MAX_TIPS - 1);
  const tips = [...visibleConditionTips, t("tomorrowTipAuthorities")];

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

      {/* Preparedness tips — always 2–4 tips */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          {t("tomorrowPrepTipsTitle")}
        </h4>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
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
