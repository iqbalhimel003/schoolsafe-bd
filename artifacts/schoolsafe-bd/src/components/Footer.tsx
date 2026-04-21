/* =========================================================
 * SchoolSafe BD — Footer (Premium)
 *
 * Dark-green footer matching the Header's brand colour.
 * Three-column layout on desktop, stacked on mobile.
 * Contact info is read from site settings (DB-driven).
 * ========================================================= */

import { Mail, Phone, Facebook, MessageCircle, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function Footer() {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  const email    = settings["contact_email"]    ?? "";
  const phone    = settings["contact_phone"]    ?? "";
  const facebook = settings["contact_facebook"] ?? "";
  const telegram = settings["contact_telegram"] ?? "";
  const x        = settings["contact_x"]        ?? "";

  const hasContact = email || phone || facebook || telegram || x;
  const hasSocial  = facebook || telegram || x;

  return (
    <footer className="no-print bg-primary text-primary-foreground mt-8">

      {/* ── Main grid ──────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Column 1 — About */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50">
              {t("siteName")}
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              {t("footerPurpose")}
            </p>
            <p className="text-xs text-white/60 flex items-start gap-1.5">
              <span aria-hidden="true">📡</span>
              <span>{t("footerDataSource")}</span>
            </p>
            <p className="text-xs text-white/55 flex items-start gap-1.5 italic">
              <span aria-hidden="true">ℹ️</span>
              <span>{t("footerDisclaimer")}</span>
            </p>
          </div>

          {/* Column 3 — Contact */}
          {hasContact && (
            <div className="flex flex-col gap-3 md:border-l md:border-white/15 md:pl-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50">
                {t("footerContactTitle")}
              </h2>

              <div className="flex flex-col gap-2">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="
                      inline-flex items-center gap-2 self-start
                      rounded-full border border-white/25 bg-white/10
                      hover:bg-white/20 active:bg-white/30
                      px-4 py-1.5 text-sm text-white font-medium
                      transition-colors
                    "
                  >
                    <Mail size={14} strokeWidth={2} />
                    <span>{email}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="
                      inline-flex items-center gap-2 self-start
                      rounded-full border border-white/25 bg-white/10
                      hover:bg-white/20 active:bg-white/30
                      px-4 py-1.5 text-sm text-white font-medium
                      transition-colors
                    "
                  >
                    <Phone size={14} strokeWidth={2} />
                    <span>{phone}</span>
                  </a>
                )}
              </div>

              {/* Social icon buttons */}
              {hasSocial && (
                <div className="flex items-center gap-2 mt-1">
                  {facebook && (
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("footerContactFacebook")}
                      className="
                        flex items-center justify-center
                        h-9 w-9 rounded-full border border-white/25 bg-white/10
                        hover:bg-white/20 active:bg-white/30
                        text-white transition-colors
                      "
                    >
                      <Facebook size={16} strokeWidth={2} />
                    </a>
                  )}
                  {telegram && (
                    <a
                      href={telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("footerContactTelegram")}
                      className="
                        flex items-center justify-center
                        h-9 w-9 rounded-full border border-white/25 bg-white/10
                        hover:bg-white/20 active:bg-white/30
                        text-white transition-colors
                      "
                    >
                      <MessageCircle size={16} strokeWidth={2} />
                    </a>
                  )}
                  {x && (
                    <a
                      href={x}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("footerContactX")}
                      className="
                        flex items-center justify-center
                        h-9 w-9 rounded-full border border-white/25 bg-white/10
                        hover:bg-white/20 active:bg-white/30
                        text-white transition-colors
                      "
                    >
                      <Twitter size={16} strokeWidth={2} />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────── */}
      <div className="border-t border-white/15">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/55 text-center sm:text-left leading-relaxed">
            {t("footerCreditBefore")}
            <a
              href="https://iqbalsir.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/80 underline underline-offset-2 hover:text-white transition-colors"
            >
              MD. IQBAL HUSEN
            </a>
            {t("footerCreditAfter")}
          </p>
          <p className="text-xs text-white/40 shrink-0">
            © 2025 SafeSchool
          </p>
        </div>
      </div>

    </footer>
  );
}
