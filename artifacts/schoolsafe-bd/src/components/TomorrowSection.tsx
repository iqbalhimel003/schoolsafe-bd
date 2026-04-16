/* =========================================================
 * SchoolSafe BD — Tomorrow's Forecast Section Wrapper
 *
 * Self-contained section that:
 *   1. Fetches tomorrow's daily forecast via useQuery
 *   2. Derives PrepLevel via assessTomorrowPrep()
 *   3. Renders <TomorrowOutlook> inside a card container
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

  if (query.isLoading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-3 text-muted-foreground text-sm">
          <span className="animate-spin" aria-hidden="true">⏳</span>
          {t("tomorrowLoadingLabel")}
        </div>
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-muted-foreground text-sm">
          {t("tomorrowNoData")}
        </div>
      </section>
    );
  }

  const forecast  = query.data;
  const prepLevel = assessTomorrowPrep(forecast);

  return (
    <section className="max-w-5xl mx-auto px-4 py-4">
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <TomorrowOutlook forecast={forecast} prepLevel={prepLevel} />
      </div>
    </section>
  );
}
