/* =========================================================
 * SchoolSafe BD — Limitations & Disclaimer Section
 *
 * Displays the bilingual limitations disclaimer, noting that:
 *  - This tool does not replace official government warnings
 *  - Flood/cyclone guidance does not replace Bangladesh
 *    Meteorological Department or BWDB advisories
 *  - Cold wave guidance does not replace official alerts
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";

export default function LimitationsSection() {
  const { t } = useLanguage();

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-amber-900 mb-3">
          {t("limitationsTitle")}
        </h2>
        <p className="text-sm text-amber-800 leading-relaxed">
          {t("limitationsText")}
        </p>
      </div>
    </section>
  );
}
