/* =========================================================
 * SchoolSafe BD — Methodology Section
 * Explains the transparent rule-based risk system.
 * Phase 4 will expand this with full bilingual detail.
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";

export default function MethodologySection() {
  const { t } = useLanguage();

  return (
    <section className="max-w-5xl mx-auto px-4 py-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-3">{t("methodologyTitle")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("methodologyText")}
        </p>
      </div>
    </section>
  );
}
