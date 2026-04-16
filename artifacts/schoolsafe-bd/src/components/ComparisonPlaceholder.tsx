/* =========================================================
 * SchoolSafe BD — Comparison Section Placeholder
 *
 * Phase 1: Shows the section heading and placeholder rows
 * for the 3 pilot upazilas.
 * Phase 4 will replace this with live comparison data.
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";
import { DISTRICTS } from "@/data/locations";

export default function ComparisonPlaceholder() {
  const { t, lang } = useLanguage();

  /* Get pilot upazilas from Kishoreganj */
  const pilotUpazilas =
    DISTRICTS.find((d) => d.id === "kishoreganj")?.upazilas.filter((u) => u.isPilot) ?? [];

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-foreground mb-1">{t("comparisonTitle")}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t("comparisonSubtitle")}</p>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 font-semibold text-foreground">{t("comparisonLocation")}</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">{t("comparisonOverall")}</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">{t("comparisonTemp")}</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">{t("comparisonPM25")}</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground hidden sm:table-cell">{t("comparisonColdRisk")}</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground hidden sm:table-cell">{t("comparisonStormRisk")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {pilotUpazilas.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  {lang === "bn" ? u.nameBn : u.nameEn}
                </td>
                <td className="px-4 py-3 text-muted-foreground">—</td>
                <td className="px-4 py-3 text-muted-foreground">—</td>
                <td className="px-4 py-3 text-muted-foreground">—</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">—</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
