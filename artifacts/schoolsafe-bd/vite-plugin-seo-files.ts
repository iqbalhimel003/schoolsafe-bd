/* =========================================================
 * Vite Plugin — SEO Static Files
 *
 * Generates /robots.txt and /sitemap.xml from VITE_SITE_URL
 * at build time AND serves them in dev so the production
 * domain never needs to be hardcoded in source files.
 * ========================================================= */

import type { Plugin } from "vite";

export function seoFilesPlugin(): Plugin {
  function build() {
    const site = (process.env.VITE_SITE_URL ?? "").replace(/\/$/, "");
    const robots =
      `User-agent: *\n` +
      `Allow: /\n` +
      `Disallow: /admin\n` +
      `Disallow: /api/\n` +
      `\n` +
      `Sitemap: ${site}/sitemap.xml\n`;
    const sitemap =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
      `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      `  <url>\n` +
      `    <loc>${site}/</loc>\n` +
      `    <xhtml:link rel="alternate" hreflang="en" href="${site}/"/>\n` +
      `    <xhtml:link rel="alternate" hreflang="bn" href="${site}/?lang=bn"/>\n` +
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${site}/"/>\n` +
      `    <changefreq>daily</changefreq>\n` +
      `    <priority>1.0</priority>\n` +
      `  </url>\n` +
      `</urlset>\n`;
    return { robots, sitemap };
  }

  return {
    name: "schoolsafe-seo-files",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        const { robots, sitemap } = build();
        if (url === "/robots.txt") {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(robots);
          return;
        }
        if (url === "/sitemap.xml") {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(sitemap);
          return;
        }
        next();
      });
    },
    generateBundle() {
      const { robots, sitemap } = build();
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
    },
  };
}
