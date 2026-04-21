/* =========================================================
 * SchoolSafe BD — <Seo> Component
 *
 * Centralised, reactive head management. Updates document
 * title, meta description, canonical, OG/Twitter tags,
 * hreflang alternates, html lang, and JSON-LD as the user
 * navigates and switches language.
 *
 * Usage:
 *   <Seo
 *     title="…"
 *     description="…"
 *     pathname="/"
 *     jsonLd={[...]}
 *   />
 *
 * Defaults come from translations + VITE_SITE_URL.
 * ========================================================= */

import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "";
const GSC_TOKEN =
  (import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string | undefined) ?? "";

export interface SeoProps {
  /** Page title — final document.title is "{title} | {siteName}" unless titleAsIs */
  title?: string;
  titleAsIs?: boolean;
  description?: string;
  /** Path including leading slash, no origin (e.g. "/", "/admin") */
  pathname?: string;
  /** Per-route robots override (default index,follow,max-image-preview:large) */
  noindex?: boolean;
  /** Optional OG image override (absolute or site-relative) */
  ogImage?: string;
  /** JSON-LD objects to inject as <script type="application/ld+json"> */
  jsonLd?: Array<Record<string, unknown>>;
}

function abs(path: string): string {
  if (!SITE_URL) return path;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function Seo({
  title,
  titleAsIs = false,
  description,
  pathname = "/",
  noindex = false,
  ogImage,
  jsonLd,
}: SeoProps) {
  const { lang, t } = useLanguage();

  const siteName = t("siteName");
  const finalTitle = title
    ? titleAsIs
      ? title
      : `${title} | ${siteName}`
    : `${siteName} — ${t("siteTagline")}`;
  const finalDescription = description ?? t("siteDescription");

  // English uses the clean URL; Bangla uses ?lang=bn. This keeps
  // canonical, hreflang, and the sitemap consistent.
  const enUrl = abs(pathname);
  const bnUrl = abs(`${pathname}?lang=bn`);
  const xDefaultUrl = enUrl;
  const canonical = lang === "bn" ? bnUrl : enUrl;

  const htmlLang = lang === "bn" ? "bn" : "en";

  return (
    <Helmet>
      <html lang={htmlLang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex,nofollow"
            : "index,follow,max-image-preview:large"
        }
      />

      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="bn" href={bnUrl} />
      <link rel="alternate" hrefLang="x-default" href={xDefaultUrl} />

      {/*
        Open Graph / Twitter tags are intentionally NOT emitted here.
        index.html already ships a static OG/Twitter baseline that social
        crawlers (Facebook, LinkedIn, Twitter/X) — which do not execute JS —
        can read. Emitting them again from Helmet would create duplicate
        meta entries in the hydrated DOM. Keep the static set authoritative.
      */}

      {/* Optional Google Search Console verification */}
      {GSC_TOKEN ? (
        <meta name="google-site-verification" content={GSC_TOKEN} />
      ) : null}

      {/* JSON-LD structured data */}
      {(jsonLd ?? []).map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}
