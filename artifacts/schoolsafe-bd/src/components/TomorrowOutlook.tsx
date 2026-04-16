/* =========================================================
 * SchoolSafe BD — Tomorrow's Forecast & Preparedness Section
 *
 * Displays:
 *   - 6 metric tiles (max temp, min temp, rain prob, rain
 *     amount, max wind, avg PM2.5)
 *   - A PrepLevel badge (Low / Moderate / High preparation need)
 *   - Context-sensitive preparedness tips (only tips relevant
 *     to the actual forecast values are shown)
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

  /* ── Context-sensitive tips ─────────────────────────── */
  const tips: string[] = [];

  /* Heat tip — max temp at or above moderate heat threshold (32°C) */
  if (forecast.tempMax >= 32) tips.push(t("tomorrowTipHeat"));

  /* Cold tip — min temp at or below moderate cold threshold (15°C) */
  if (forecast.tempMin <= 15) tips.push(t("tomorrowTipCold"));

  /* Rain tip — rain probability at or above 40% */
  if (forecast.rainProbMax >= 40) tips.push(t("tomorrowTipRain"));

  /* Wind tip — max wind at or above moderate storm threshold (40 km/h) */
  if (forecast.windMax >= 40) tips.push(t("tomorrowTipWind"));

  /* Air quality tip — avg PM2.5 at or above moderate AQ threshold (15 µg/m³) */
  if (forecast.pm25Avg >= 15) tips.push(t("tomorrowTipAir"));

  /* School-authorities tip — shown whenever prep level is High */
  if (prepLevel === "High") tips.push(t("tomorrowTipAuthorities"));

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

      {/* Preparedness tips — only shown when at least one tip is relevant */}
      {tips.length > 0 && (
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
      )}
    </section>
  );
}
