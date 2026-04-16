/* =========================================================
 * SchoolSafe BD — Home Page
 *
 * Orchestrates all page sections:
 *   - Hero (title, description, prototype notice)
 *   - Location selector (district + upazila)
 *   - Dashboard (live data — Phase 3)
 *   - Comparison (pilot upazilas — Phase 4)
 *   - Methodology (Phase 4)
 *   - Limitations (Phase 4)
 * ========================================================= */

import { useState } from "react";
import Hero from "@/components/Hero";
import LocationSelector from "@/components/LocationSelector";
import DashboardPlaceholder from "@/components/DashboardPlaceholder";
import ComparisonPlaceholder from "@/components/ComparisonPlaceholder";
import MethodologySection from "@/components/MethodologySection";
import LimitationsSection from "@/components/LimitationsSection";
import type { Upazila } from "@/types";

export default function Home() {
  const [selectedUpazila, setSelectedUpazila] = useState<Upazila | null>(null);

  return (
    <main>
      <Hero />

      {/* Location Search */}
      <LocationSelector onUpazilaSelect={setSelectedUpazila} />

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <hr className="border-border" />
      </div>

      {/* Environmental Dashboard (Phase 3 will populate with live data) */}
      <DashboardPlaceholder selectedUpazila={selectedUpazila} />

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
