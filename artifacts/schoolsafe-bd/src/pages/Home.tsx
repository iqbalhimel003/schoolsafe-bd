/* =========================================================
 * SchoolSafe BD — Home Page
 *
 * Orchestrates all page sections:
 *   - Hero (animated headline + aurora background)
 *   - Intro cards (premium glass treatment)
 *   - Location selector (district + upazila)
 *   - Dashboard (live weather, air quality, risk cards)
 *   - Tomorrow / Weekly / 24h chart (when location selected)
 *   - Comparison, Methodology, Limitations
 *
 * Each section is wrapped in <Reveal> so it fades + slides
 * in as it scrolls into view, honoring reduced-motion users.
 * ========================================================= */

import { Suspense, lazy, useState } from "react";
import Seo from "@/components/Seo";
import Hero from "@/components/Hero";
import LocationSelector from "@/components/LocationSelector";
import Dashboard from "@/components/Dashboard";
import TomorrowSection from "@/components/TomorrowSection";
import WeeklySection from "@/components/WeeklySection";
import ComparisonSection from "@/components/ComparisonSection";
import MethodologySection from "@/components/MethodologySection";
import LimitationsSection from "@/components/LimitationsSection";
import Reveal from "@/components/animated/Reveal";
import AnimatedWeatherIcon from "@/components/animated/AnimatedWeatherIcon";

import { useLanguage } from "@/contexts/LanguageContext";
import type { Upazila } from "@/types";

const ForecastChart = lazy(() => import("@/components/ForecastChart"));

export default function Home() {
  const [selectedUpazila, setSelectedUpazila] = useState<Upazila | null>(null);
  const { t } = useLanguage();

  const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "";

  const jsonLd: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: t("siteName"),
      alternateName: "SafeSchool BD",
      url: SITE_URL || "/",
      inLanguage: ["en", "bn"],
      description: t("siteDescription"),
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: t("siteName"),
      url: SITE_URL || "/",
      logo: `${SITE_URL}/favicon.svg`,
      description: t("siteTagline"),
      areaServed: { "@type": "Country", name: "Bangladesh" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: t("siteName"),
          item: SITE_URL || "/",
        },
      ],
    },
  ];

  return (
    <main>
      <Seo
        pathname="/"
        title={t("seoHomeTitle")}
        description={t("seoHomeDescription")}
        jsonLd={jsonLd}
      />
      <div className="no-print">
        <Hero />
      </div>

      {/* Introduction — two premium glass cards */}
      <Reveal as="section" className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="grid sm:grid-cols-2 gap-4">
          <Reveal delay={0.05} className="glass-card lift-on-hover rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AnimatedWeatherIcon kind="leaf" size={22} />
              <h3 className="text-sm font-semibold text-foreground">
                {t("introWhatTitle")}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("introWhatText")}
            </p>
          </Reveal>

          <Reveal delay={0.12} className="glass-card lift-on-hover rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AnimatedWeatherIcon kind="visibility" size={22} />
              <h3 className="text-sm font-semibold text-foreground">
                {t("introHowTitle")}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("introHowText")}
            </p>
          </Reveal>
        </div>
      </Reveal>

      {/* Location Search */}
      <div id="location-selector" className="no-print">
        <Reveal>
          <LocationSelector onUpazilaSelect={setSelectedUpazila} />
        </Reveal>
      </div>

      {/* Divider */}
      <div className="no-print max-w-5xl mx-auto px-4">
        <hr className="border-border" />
      </div>

      {/* Environmental Dashboard — shown when a location is selected */}
      {selectedUpazila ? (
        <Reveal>
          <Dashboard selectedUpazila={selectedUpazila} />
        </Reveal>
      ) : (
        <Reveal as="section" className="no-print max-w-5xl mx-auto px-4 py-8">
          <div className="glass-card gradient-border rounded-xl p-10 text-center">
            <div className="flex justify-center mb-3">
              <AnimatedWeatherIcon kind="partlyCloudy" size={64} />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t("dashboardTitle")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("selectLocationPrompt")}
            </p>
          </div>
        </Reveal>
      )}

      {/* Tomorrow's Forecast & Preparedness */}
      {selectedUpazila && (
        <Reveal>
          <TomorrowSection selectedUpazila={selectedUpazila} />
        </Reveal>
      )}

      {/* Week Ahead — 7-day planning outlook */}
      {selectedUpazila && (
        <div className="no-print">
          <Reveal>
            <WeeklySection selectedUpazila={selectedUpazila} />
          </Reveal>
        </div>
      )}

      {/* 24-Hour Forecast Chart */}
      {selectedUpazila && (
        <div className="no-print">
          <Reveal>
            <Suspense fallback={null}>
              <ForecastChart selectedUpazila={selectedUpazila} />
            </Suspense>
          </Reveal>
        </div>
      )}

      {/* Pilot Upazila Comparison */}
      {selectedUpazila && (
        <>
          <div className="no-print max-w-5xl mx-auto px-4">
            <hr className="border-border" />
          </div>
          <div className="no-print">
            <Reveal>
              <ComparisonSection />
            </Reveal>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="no-print max-w-5xl mx-auto px-4">
        <hr className="border-border" />
      </div>

      {/* Methodology */}
      <div className="no-print">
        <Reveal>
          <MethodologySection />
        </Reveal>
      </div>

      {/* Limitations & Disclaimer */}
      <div className="no-print">
        <Reveal>
          <LimitationsSection />
        </Reveal>
      </div>
    </main>
  );
}
