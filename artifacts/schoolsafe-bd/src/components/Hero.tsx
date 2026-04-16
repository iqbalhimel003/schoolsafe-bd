/* =========================================================
 * SchoolSafe BD — Hero Section
 * Homepage title, description, and prototype notice.
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-b from-primary/10 to-background pt-10 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Main heading */}
        <h2 className="text-3xl font-bold text-foreground leading-tight">
          {t("siteName")}
        </h2>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          {t("siteDescription")}
        </p>

        {/* Prototype Notice */}
        <div className="mt-5 inline-flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 max-w-2xl">
          <span className="shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
          <span>{t("prototypeNotice")}</span>
        </div>
      </div>
    </section>
  );
}
