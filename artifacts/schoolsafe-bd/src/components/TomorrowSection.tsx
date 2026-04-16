/* =========================================================
 * SchoolSafe BD — Tomorrow's Forecast Section Wrapper
 *
 * Self-contained section that:
 *   1. Fetches tomorrow's daily forecast via useQuery
 *   2. Derives PrepLevel via assessTomorrowPrep()
 *   3. Shows a skeleton matching the card/tile structure while loading
 *   4. Renders <TomorrowOutlook> on success
 *
 * Mirrors the same query pattern as ForecastChart.
 * ========================================================= */

import { useQuery } from "@tanstack/react-query";
import { fetchTomorrowForecast } from "@/utils/api";
import { assessTomorrowPrep } from "@/logic/riskEngine";
import TomorrowOutlook from "@/components/TomorrowOutlook";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Upazila } from "@/types";

const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

interface Props {
  selectedUpazila: Upazila;
}

/* ── Loading skeleton ─────────────────────────────────────
 * Mirrors the card structure of TomorrowOutlook:
 *   - Heading + date row
 *   - Prep badge row
 *   - 6 metric tiles (2×3 grid)
 *   - Tips card
 * ─────────────────────────────────────────────────────── */
function TomorrowSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden="true">
      {/* Heading row */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted rounded-full" />
        <div className="space-y-1">
          <div className="h-4 w-44 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>

      {/* Prep badge row */}
      <div className="flex items-center gap-3">
        <div className="h-3 w-28 bg-muted rounded" />
        <div className="h-6 w-36 bg-muted rounded-full" />
      </div>

      {/* 6 metric tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-3 shadow-sm space-y-1.5"
          >
            <div className="w-6 h-6 bg-muted rounded" />
            <div className="h-2.5 w-20 bg-muted rounded" />
            <div className="h-4 w-14 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Tips card skeleton */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-2">
        <div className="h-3.5 w-40 bg-muted rounded mb-3" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-3 h-3 bg-muted rounded shrink-0 mt-0.5" />
            <div className="h-3 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TomorrowSection({ selectedUpazila }: Props) {
  const { t } = useLanguage();

  const query = useQuery({
    queryKey: ["tomorrow", selectedUpazila.id],
    queryFn: () => fetchTomorrowForecast(selectedUpazila.lat!, selectedUpazila.lon!),
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
          <TomorrowSkeleton />
        ) : query.isError || !query.data ? (
          <p className="text-sm text-muted-foreground">{t("tomorrowNoData")}</p>
        ) : (
          <TomorrowOutlook
            forecast={query.data}
            prepLevel={assessTomorrowPrep(query.data)}
          />
        )}
      </div>
    </section>
  );
}
