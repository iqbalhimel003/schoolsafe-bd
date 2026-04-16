/* =========================================================
 * SchoolSafe BD — Footer
 * Project purpose, data source credit, disclaimer, and contact.
 * Contact info is read from site settings (DB-driven).
 * ========================================================= */

import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function Footer() {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  const email = settings["contact_email"] ?? "";
  const phone = settings["contact_phone"] ?? "";
  const facebook = settings["contact_facebook"] ?? "";
  const telegram = settings["contact_telegram"] ?? "";
  const x = settings["contact_x"] ?? "";

  const hasContact = email || phone || facebook || telegram || x;

  return (
    <footer className="no-print bg-primary/8 border-t border-border mt-8">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-1 text-center">
        <p className="text-sm text-foreground font-medium">{t("footerPurpose")}</p>
        <p className="text-xs text-muted-foreground">{t("footerDataSource")}</p>
        <p className="text-xs text-muted-foreground">{t("footerDisclaimer")}</p>

        <div className="pt-3 mt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("footerCreditBefore")}
            <a
              href="https://iqbalsir.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              MD. IQBAL HUSEN
            </a>
            {t("footerCreditAfter")}
          </p>
        </div>

        {hasContact && (
          <div className="pt-3 mt-3 border-t border-border/50">
            <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-2">
              {t("footerContactTitle")}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                >
                  ✉ {email}
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                >
                  📞 {phone}
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                >
                  {t("footerContactFacebook")}
                </a>
              )}
              {telegram && (
                <a
                  href={telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                >
                  {t("footerContactTelegram")}
                </a>
              )}
              {x && (
                <a
                  href={x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                >
                  {t("footerContactX")}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
