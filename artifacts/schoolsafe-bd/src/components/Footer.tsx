/* =========================================================
 * SchoolSafe BD — Footer
 * Project purpose, data source credit, and disclaimer.
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="no-print bg-primary/8 border-t border-border mt-8">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-1 text-center">
        <p className="text-sm text-foreground font-medium">{t("footerPurpose")}</p>
        <p className="text-xs text-muted-foreground">{t("footerDataSource")}</p>
        <p className="text-xs text-muted-foreground">{t("footerDisclaimer")}</p>
      </div>
    </footer>
  );
}
