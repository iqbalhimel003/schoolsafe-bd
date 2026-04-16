/* =========================================================
 * SchoolSafe BD — Home Page
 *
 * Orchestrates all page sections:
 *   - Hero (title, description, prototype notice)
 *   - Location selector (district + upazila)
 *   - Dashboard (live weather, air quality, risk cards)
 *   - ForecastChart (24-hour temp + precip, when location selected)
 *   - ComparisonSection (all 3 pilot upazilas side-by-side, live)
 *   - MethodologySection (all 7 risk rules explained)
 *   - LimitationsSection (disclaimer + official advisory notes)
 * ========================================================= */

import { useState } from "react";
import Hero from "@/components/Hero";
import LocationSelector from "@/components/LocationSelector";
import Dashboard from "@/components/Dashboard";
import TomorrowSection from "@/components/TomorrowSection";
import WeeklySection from "@/components/WeeklySection";
import ForecastChart from "@/components/ForecastChart";
import ComparisonSection from "@/components/ComparisonSection";
import MethodologySection from "@/components/MethodologySection";
import LimitationsSection from "@/components/LimitationsSection";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Upazila } from "@/types";

export default function Home() {
  const [selectedUpazila, setSelectedUpazila] = useState<Upazila | null>(null);
  const { t } = useLanguage();

  return (
    <main>
      <div className="no-print">
        <Hero />
      </div>

      {/* Introduction — two info cards explaining purpose and usage */}
      <section className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Card 1: What this website does */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg" aria-hidden="true">📋</span>
              <h3 className="text-sm font-semibold text-foreground">
                {t("introWhatTitle")}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("introWhatText")}
            </p>
          </div>

          {/* Card 2: How to use */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg" aria-hidden="true">🗺️</span>
              <h3 className="text-sm font-semibold text-foreground">
                {t("introHowTitle")}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("introHowText")}
            </p>
          </div>
        </div>
      </section>

      {/* Location Search */}
      <div className="no-print">
        <LocationSelector onUpazilaSelect={setSelectedUpazila} />
      </div>

      {/* Divider */}
      <div className="no-print max-w-5xl mx-auto px-4">
        <hr className="border-border" />
      </div>

      {/* Environmental Dashboard — shown when a location is selected */}
      {selectedUpazila ? (
        <Dashboard selectedUpazila={selectedUpazila} />
      ) : (
        <section className="no-print max-w-5xl mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4" aria-hidden="true">🌤</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t("dashboardTitle")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("selectLocationPrompt")}
            </p>
          </div>
        </section>
      )}

      {/* Tomorrow's Forecast & Preparedness — shown when a location is selected */}
      {selectedUpazila && (
        <TomorrowSection selectedUpazila={selectedUpazila} />
      )}

      {/* Week Ahead — 7-day planning outlook, shown when a location is selected */}
      {selectedUpazila && (
        <div className="no-print">
          <WeeklySection selectedUpazila={selectedUpazila} />
        </div>
      )}

      {/* 24-Hour Forecast Chart — shown when a location is selected */}
      {selectedUpazila && (
        <div className="no-print">
          <ForecastChart selectedUpazila={selectedUpazila} />
        </div>
      )}

      {/* Divider */}
      <div className="no-print max-w-5xl mx-auto px-4">
        <hr className="border-border" />
      </div>

      {/* Pilot Upazila Comparison — live data for all 3 upazilas */}
      <div className="no-print">
        <ComparisonSection />
      </div>

      {/* Divider */}
      <div className="no-print max-w-5xl mx-auto px-4">
        <hr className="border-border" />
      </div>

      {/* Methodology — all 7 risk rules with thresholds */}
      <div className="no-print">
        <MethodologySection />
      </div>

      {/* Limitations & Disclaimer */}
      <div className="no-print">
        <LimitationsSection />
      </div>
    </main>
  );
}
