/* =========================================================
 * SchoolSafe BD — Location Data
 *
 * HOW TO EXTEND:
 *   1. Add a new district object to the DISTRICTS array.
 *   2. Add its upazilas to the district's `upazilas` array.
 *   3. For pilot (live data) upazilas, set isPilot: true and
 *      provide lat/lon coordinates.
 *   4. Non-pilot upazilas can be added with isPilot: false
 *      and no coordinates — they show as "coming soon."
 *
 * PILOT SCOPE (Phase 1 scaffold):
 *   Only Kishoreganj district with 3 pilot upazilas is
 *   included. The structure supports all 64 Bangladesh
 *   districts in the future.
 * ========================================================= */

import type { District } from "@/types";

export const DISTRICTS: District[] = [
  {
    id: "kishoreganj",
    nameEn: "Kishoreganj",
    nameBn: "কিশোরগঞ্জ",
    upazilas: [
      {
        id: "kishoreganj-sadar",
        nameEn: "Kishoreganj Sadar",
        nameBn: "কিশোরগঞ্জ সদর",
        districtId: "kishoreganj",
        lat: 24.426,
        lon: 90.782,
        isPilot: true,
      },
      {
        id: "bhairab",
        nameEn: "Bhairab",
        nameBn: "ভৈরব",
        districtId: "kishoreganj",
        lat: 24.052,
        lon: 90.990,
        isPilot: true,
      },
      {
        id: "itna",
        nameEn: "Itna",
        nameBn: "ইটনা",
        districtId: "kishoreganj",
        lat: 24.184,
        lon: 91.001,
        isPilot: true,
      },
    ],
  },
  /* ── Future districts can be added here ──────────────────
   * Example:
   * {
   *   id: "dhaka",
   *   nameEn: "Dhaka",
   *   nameBn: "ঢাকা",
   *   upazilas: [
   *     {
   *       id: "dhanmondi",
   *       nameEn: "Dhanmondi",
   *       nameBn: "ধানমন্ডি",
   *       districtId: "dhaka",
   *       lat: 23.7461,
   *       lon: 90.3742,
   *       isPilot: false,
   *     },
   *   ],
   * },
   * ─────────────────────────────────────────────────────── */
];

/* Helper: get a district by ID */
export function getDistrictById(id: string): District | undefined {
  return DISTRICTS.find((d) => d.id === id);
}
