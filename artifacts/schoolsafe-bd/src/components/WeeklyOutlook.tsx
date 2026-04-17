/* =========================================================
 * SchoolSafe BD — Weekly Outlook Table
 *
 * Displays a compact 7-row table showing the week ahead:
 *   Day name | Weather icon | Max / Min temp | Rain % | Prep level dot
 *
 * PrepLevel is derived per-day in fetchWeeklyForecast() using
 * assessTomorrowPrep() (PM2.5 omitted for the lightweight weekly call).
 *
 * All text is bilingual via useLanguage().
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";
import type { WeeklyForecastDay, PrepLevel } from "@/types";
import { HEAT_TEMP_ADVISORY, HEAT_TEMP_MODERATE } from "@/logic/thresholds";

/* ── Helpers ────────────────────────────────────────────── */

/** Map a WMO code to a weather emoji — same logic as TomorrowOutlook. */
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

/** Colour dot for the prep level column. */
function PrepDot({ level }: { level: PrepLevel }) {
  const colours: Record<PrepLevel, string> = {
    None:     "bg-slate-300",
    Low:      "bg-green-500",
    Moderate: "bg-amber-400",
    High:     "bg-red-500",
  };
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${colours[level]}`}
      aria-hidden="true"
    />
  );
}

/** Short label for the prep level used next to the dot. */
function prepLabel(level: PrepLevel, t: (k: string) => string): string {
  if (level === "High")     return t("weekPrepHigh");
  if (level === "Moderate") return t("weekPrepModerate");
  if (level === "Low")      return t("weekPrepLow");
  return t("weekPrepNone");
}

/**
 * Format a YYYY-MM-DD date string to a short weekday name
 * (e.g. "Mon", "মঙ্গল") in the current locale.
 */
function formatDayName(dateStr: string, locale: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(
      locale === "bn" ? "bn-BD" : "en-GB",
      { weekday: "short" },
    );
  } catch {
    return dateStr;
  }
}

/* ── Main component ─────────────────────────────────────── */

interface Props {
  days: WeeklyForecastDay[];
}

export default function WeeklyOutlook({ days }: Props) {
  const { t, lang } = useLanguage();

  return (
    <section className="space-y-3">
      {/* Section heading */}
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">📅</span>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {t("weekSectionTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("weekSectionSubtitle")}
          </p>
        </div>
      </div>

      {/* Compact table */}
      <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
              <th className="px-3 py-2 text-left font-medium">{t("weekHeaderDay")}</th>
              <th className="px-3 py-2 text-left font-medium">{t("weekHeaderCondition")}</th>
              <th className="px-3 py-2 text-right font-medium">{t("weekHeaderMaxMin")}</th>
              <th className="px-3 py-2 text-right font-medium">{t("weekHeaderRain")}</th>
              <th className="px-3 py-2 text-center font-medium">{t("weekHeaderPrep")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {days.map((day) => (
                <tr
                  key={day.date}
                  className="bg-card hover:bg-muted/30 transition-colors"
                >
                  {/* Day name */}
                  <td className="px-3 py-2.5 whitespace-nowrap text-foreground">
                    {formatDayName(day.date, lang)}
                  </td>

                  {/* Weather icon */}
                  <td className="px-3 py-2.5 text-xl" aria-label={`weather code ${day.weatherCode}`}>
                    {weatherIcon(day.weatherCode)}
                  </td>

                  {/* Max / Min temp — with two-tier heat indicator */}
                  <td className="px-3 py-2.5 text-right whitespace-nowrap text-foreground tabular-nums">
                    <span className="inline-flex items-center justify-end gap-1">
                      {day.tempMax >= HEAT_TEMP_MODERATE ? (
                        <span
                          className="text-[10px] font-bold px-1 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          title={t("weekHeatSevereTitle")}
                        >
                          🌡️ {t("weekHeatSevere")}
                        </span>
                      ) : day.tempMax > HEAT_TEMP_ADVISORY ? (
                        <span
                          className="text-[10px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          title={t("weekHeatWarmTitle")}
                        >
                          ☀️ {t("weekHeatWarm")}
                        </span>
                      ) : null}
                      <span>
                        <span className="text-red-500 dark:text-red-400">{day.tempMax.toFixed(0)}°C</span>
                        {" / "}
                        <span className="text-blue-500 dark:text-blue-400">{day.tempMin.toFixed(0)}°C</span>
                      </span>
                    </span>
                  </td>

                  {/* Rain probability */}
                  <td className="px-3 py-2.5 text-right whitespace-nowrap text-foreground tabular-nums">
                    {Math.round(day.rainProbMax)}%
                  </td>

                  {/* Prep level dot + label */}
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center gap-1.5 justify-center">
                      <PrepDot level={day.prepLevel} />
                      <span className="text-xs text-muted-foreground">
                        {prepLabel(day.prepLevel, t)}
                      </span>
                    </span>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
