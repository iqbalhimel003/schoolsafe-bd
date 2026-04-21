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
import { AlertTriangle } from "lucide-react";

export default function LimitationsSection() {
  const { t } = useLanguage();

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="relative overflow-hidden rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-50 via-amber-50/80 to-orange-50/70 p-6 shadow-sm lift-on-hover">
        {/* Soft glow accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl"
        />
        <div className="relative flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-amber-200/70 p-2.5 text-amber-800 ring-1 ring-amber-300/60">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-900 mb-2">
              {t("limitationsTitle")}
            </h2>
            <p className="text-sm text-amber-900/85 leading-relaxed">
              {t("limitationsText")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
