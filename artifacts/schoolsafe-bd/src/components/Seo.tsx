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

  const finalOgImage = ogImage ? abs(ogImage) : abs("/opengraph.jpg");
  const ogLocale = lang === "bn" ? "bn_BD" : "en_US";
  const ogLocaleAlt = lang === "bn" ? "en_US" : "bn_BD";
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
        Per-route, per-language Open Graph + Twitter tags. The static set
        in index.html acts as a baseline fallback for non-JS social crawlers;
        these dynamic tags localize and route-scope the metadata for crawlers
        and tools that execute JavaScript.
      */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={ogLocaleAlt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />
      <meta name="twitter:image:alt" content={finalTitle} />

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
