/* =========================================================
 * SchoolSafe BD — Limitations & Disclaimer Section
 * Phase 4 will expand with full bilingual detail including
 * flood, storm, and cold wave guidance notes.
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
