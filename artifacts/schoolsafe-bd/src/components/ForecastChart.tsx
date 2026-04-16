/* =========================================================
 * SchoolSafe BD — 24-Hour Forecast Chart
 *
 * Renders a composed chart of temperature (area) and
 * precipitation probability (bar) for the next 24 hours
 * for the selected pilot upazila.
 *
 * Uses Recharts with two Y-axes and a bilingual legend.
 * Loading and error states include a retry affordance.
 * ========================================================= */

import { useQuery } from "@tanstack/react-query";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchHourlyForecast } from "@/utils/api";
import type { Upazila } from "@/types";

interface Props {
  selectedUpazila: Upazila;
}

/** Format an ISO time string ("2024-01-15T06:00") → "06:00" */
function formatHour(isoTime: string): string {
  const match = isoTime.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : isoTime;
}

export default function ForecastChart({ selectedUpazila }: Props) {
  const { t } = useLanguage();

  const forecastQuery = useQuery({
    queryKey: ["forecast", selectedUpazila.id],
    queryFn: () =>
      fetchHourlyForecast(selectedUpazila.lat!, selectedUpazila.lon!),
    enabled: !!selectedUpazila.lat && !!selectedUpazila.lon,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  /* Map raw data for recharts — include a display label for the X axis */
  const chartData = (forecastQuery.data ?? []).map((entry) => ({
    hour: formatHour(entry.time),
    temp: parseFloat(entry.temperature.toFixed(1)),
    precip: Math.round(entry.precipitationProbability),
  }));

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-foreground mb-1">
        {t("chartTitle")}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {t("chartSubtitle")}
      </p>

      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        {forecastQuery.isLoading ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground animate-pulse">
            {t("chartLoading")}
          </div>
        ) : forecastQuery.isError ? (
          <div className="h-48 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-destructive">{t("chartError")}</p>
            <button
              onClick={() => forecastQuery.refetch()}
              className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              {t("retryButton")}
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart
              data={chartData}
              margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />

              {/* X axis — show every 3 hours to avoid crowding */}
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                interval={2}
                tickLine={false}
              />

              {/* Left Y axis — temperature */}
              <YAxis
                yAxisId="temp"
                orientation="left"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                unit="°C"
                width={42}
              />

              {/* Right Y axis — precipitation probability */}
              <YAxis
                yAxisId="precip"
                orientation="right"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                unit="%"
                domain={[0, 100]}
                width={42}
              />

              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
                formatter={(value: number, name: string) => {
                  if (name === "temp") return [`${value}°C`, t("chartTemp")];
                  if (name === "precip") return [`${value}%`, t("chartPrecipProb")];
                  return [value, name];
                }}
                labelFormatter={(label) => `${t("chartHour")}: ${label}`}
              />

              <Legend
                formatter={(value) => {
                  if (value === "temp") return t("chartTemp");
                  if (value === "precip") return t("chartPrecipProb");
                  return value;
                }}
                wrapperStyle={{ fontSize: 12 }}
              />

              {/* Temperature area (filled) */}
              <Area
                yAxisId="temp"
                type="monotone"
                dataKey="temp"
                stroke="hsl(162 60% 38%)"
                fill="hsl(162 60% 38% / 0.15)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />

              {/* Precipitation probability bars */}
              <Bar
                yAxisId="precip"
                dataKey="precip"
                fill="hsl(201 80% 45% / 0.5)"
                radius={[2, 2, 0, 0]}
                maxBarSize={14}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
