/* =========================================================
 * SchoolSafe BD — Header
 * Site title, subtitle, and language toggle button.
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const { lang, setLang, t } = useLanguage();

  function toggleLang() {
    setLang(lang === "en" ? "bn" : "en");
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Branding */}
        <div>
          <div className="flex items-center gap-2">
            {/* Simple leaf/shield icon using text for Phase 1 */}
            <span className="text-2xl" aria-hidden="true">🌿</span>
            <h1 className="text-xl font-bold tracking-tight leading-none">
              {t("siteName")}
            </h1>
          </div>
          <p className="text-sm opacity-85 mt-0.5 ml-9">
            {t("siteTagline")}
          </p>
        </div>

        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          title={t("langToggleTitle")}
          aria-label={t("langToggleTitle")}
          className="
            shrink-0 px-4 py-2 rounded-lg border border-white/30
            bg-white/10 hover:bg-white/20 active:bg-white/30
            text-sm font-semibold transition-colors
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60
          "
        >
          {t("langToggleLabel")}
        </button>
      </div>
    </header>
  );
}
