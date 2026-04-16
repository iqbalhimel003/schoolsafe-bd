/* =========================================================
 * SchoolSafe BD — Week Ahead Section Wrapper
 *
 * Self-contained section that:
 *   1. Fetches the 7-day weekly forecast via useQuery
 *   2. Shows a skeleton table while loading
 *   3. Renders <WeeklyOutlook> on success
 *
 * Mirrors the same query pattern as TomorrowSection.
 * ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { fetchWeeklyForecast } from "@/utils/api";
import WeeklyOutlook from "@/components/WeeklyOutlook";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Upazila } from "@/types";

const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

interface Props {
  selectedUpazila: Upazila;
}

/* ── Loading skeleton ─────────────────────────────────────
 * Mirrors the table structure of WeeklyOutlook: a header row
 * plus 7 data rows of shimmering placeholders.
 * ─────────────────────────────────────────────────────── */
function WeeklySkeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-hidden="true">
      {/* Heading row */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted rounded-full" />
        <div className="space-y-1">
          <div className="h-4 w-36 bg-muted rounded" />
          <div className="h-3 w-52 bg-muted rounded" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-muted/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-muted rounded" />
          ))}
        </div>
        {/* 7 rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-2 px-3 py-2.5 border-t border-border bg-card"
          >
            <div className="h-3.5 w-10 bg-muted rounded" />
            <div className="h-5 w-6 bg-muted rounded" />
            <div className="h-3.5 w-20 bg-muted rounded ml-auto" />
            <div className="h-3.5 w-8 bg-muted rounded ml-auto" />
            <div className="h-3 w-14 bg-muted rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeeklySection({ selectedUpazila }: Props) {
  const { t } = useLanguage();

  const query = useQuery({
    queryKey: ["weekly", selectedUpazila.id],
    queryFn: () => fetchWeeklyForecast(selectedUpazila.lat!, selectedUpazila.lon!),
    enabled: !!selectedUpazila.lat && !!selectedUpazila.lon,
    staleTime: REFETCH_INTERVAL_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    retry: 2,
  });

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        {query.isLoading ? (
          <WeeklySkeleton />
        ) : query.isError || !query.data ? (
          <p className="text-sm text-muted-foreground">{t("weekNoData")}</p>
        ) : (
          <WeeklyOutlook days={query.data} />
        )}
      </div>
    </section>
  );
}
