/* =========================================================
 * SchoolSafe BD — Home Page
 *
 * Orchestrates all page sections:
 *   - Hero (title, description, prototype notice)
 *   - Location selector (district + upazila)
 *   - Dashboard (live weather, air quality, risk cards)
 *   - Comparison (pilot upazilas — Phase 4)
 *   - Methodology
 *   - Limitations
 * ========================================================= */

import { useState } from "react";
import Hero from "@/components/Hero";
import LocationSelector from "@/components/LocationSelector";
import Dashboard from "@/components/Dashboard";
import ComparisonPlaceholder from "@/components/ComparisonPlaceholder";
import MethodologySection from "@/components/MethodologySection";
import LimitationsSection from "@/components/LimitationsSection";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Upazila } from "@/types";

export default function Home() {
  const [selectedUpazila, setSelectedUpazila] = useState<Upazila | null>(null);
  const { t } = useLanguage();

  return (
    <main>
      <Hero />

      {/* Location Search */}
      <LocationSelector onUpazilaSelect={setSelectedUpazila} />

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <hr className="border-border" />
      </div>

      {/* Environmental Dashboard */}
      {selectedUpazila ? (
        <Dashboard selectedUpazila={selectedUpazila} />
      ) : (
        <section className="max-w-5xl mx-auto px-4 py-8">
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

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <hr className="border-border" />
      </div>

      {/* Pilot Upazila Comparison (Phase 4) */}
      <ComparisonPlaceholder />

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <hr className="border-border" />
      </div>

      {/* Methodology */}
      <MethodologySection />

      {/* Limitations */}
      <LimitationsSection />
    </main>
  );
}
