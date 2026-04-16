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
  return t("weekPrepLow");
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

/** Return today's YYYY-MM-DD string in local time. */
function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* ── Main component ─────────────────────────────────────── */

interface Props {
  days: WeeklyForecastDay[];
}

export default function WeeklyOutlook({ days }: Props) {
  const { t, lang } = useLanguage();
  const today = todayString();

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
            {days.map((day) => {
              const isToday = day.date === today;
              return (
                <tr
                  key={day.date}
                  className={isToday ? "bg-primary/5 font-semibold" : "bg-card hover:bg-muted/30 transition-colors"}
                >
                  {/* Day name */}
                  <td className="px-3 py-2.5 whitespace-nowrap text-foreground">
                    {isToday
                      ? t("weekToday")
                      : formatDayName(day.date, lang)}
                  </td>

                  {/* Weather icon */}
                  <td className="px-3 py-2.5 text-xl" aria-label={`weather code ${day.weatherCode}`}>
                    {weatherIcon(day.weatherCode)}
                  </td>

                  {/* Max / Min temp */}
                  <td className="px-3 py-2.5 text-right whitespace-nowrap text-foreground tabular-nums">
                    <span className="text-red-500 dark:text-red-400">{day.tempMax.toFixed(0)}°C</span>
                    {" / "}
                    <span className="text-blue-500 dark:text-blue-400">{day.tempMin.toFixed(0)}°C</span>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
