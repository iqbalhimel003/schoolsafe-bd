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
 * PILOT SCOPE:
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
      {
        id: "karimganj",
        nameEn: "Karimganj",
        nameBn: "করিমগঞ্জ",
        districtId: "kishoreganj",
        lat: 24.465,
        lon: 90.975,
        isPilot: false,
      },
      {
        id: "katiadi",
        nameEn: "Katiadi",
        nameBn: "কটিয়াদী",
        districtId: "kishoreganj",
        lat: 24.453,
        lon: 90.782,
        isPilot: false,
      },
      {
        id: "bajitpur",
        nameEn: "Bajitpur",
        nameBn: "বাজিতপুর",
        districtId: "kishoreganj",
        lat: 24.213,
        lon: 90.943,
        isPilot: false,
      },
      {
        id: "kuliarchar",
        nameEn: "Kuliarchar",
        nameBn: "কুলিয়ারচর",
        districtId: "kishoreganj",
        lat: 24.197,
        lon: 90.853,
        isPilot: false,
      },
      {
        id: "nikli",
        nameEn: "Nikli",
        nameBn: "নিকলী",
        districtId: "kishoreganj",
        lat: 24.283,
        lon: 90.977,
        isPilot: false,
      },
      {
        id: "mithamain",
        nameEn: "Mithamain",
        nameBn: "মিঠামইন",
        districtId: "kishoreganj",
        lat: 24.330,
        lon: 90.921,
        isPilot: false,
      },
      {
        id: "austagram",
        nameEn: "Austagram",
        nameBn: "অষ্টগ্রাম",
        districtId: "kishoreganj",
        lat: 24.368,
        lon: 90.948,
        isPilot: false,
      },
      {
        id: "tarail",
        nameEn: "Tarail",
        nameBn: "তাড়াইল",
        districtId: "kishoreganj",
        lat: 24.361,
        lon: 90.584,
        isPilot: false,
      },
      {
        id: "hossainpur",
        nameEn: "Hossainpur",
        nameBn: "হোসেনপুর",
        districtId: "kishoreganj",
        lat: 24.368,
        lon: 90.614,
        isPilot: false,
      },
      {
        id: "pakundia",
        nameEn: "Pakundia",
        nameBn: "পাকুন্দিয়া",
        districtId: "kishoreganj",
        lat: 24.363,
        lon: 90.665,
        isPilot: false,
      },
    ],
  },
  /* ── Representative climate-risk hotspot districts ────── */

  {
    id: "sylhet",
    nameEn: "Sylhet",
    nameBn: "সিলেট",
    upazilas: [
      {
        id: "jaintiapur",
        nameEn: "Jaintiapur",
        nameBn: "জৈন্তাপুর",
        districtId: "sylhet",
        lat: 25.114,
        lon: 92.118,
        isPilot: true,
        hotspotLabel: "Heavy Rain Representative Area",
      },
      {
        id: "goainghat",
        nameEn: "Goainghat",
        nameBn: "গোয়াইনঘাট",
        districtId: "sylhet",
        lat: 25.055,
        lon: 91.986,
        isPilot: true,
        hotspotLabel: "Heavy Rain Representative Area",
      },
    ],
  },

  {
    id: "chuadanga",
    nameEn: "Chuadanga",
    nameBn: "চুয়াডাঙ্গা",
    upazilas: [
      {
        id: "chuadanga-sadar",
        nameEn: "Chuadanga Sadar",
        nameBn: "চুয়াডাঙ্গা সদর",
        districtId: "chuadanga",
        lat: 23.646,
        lon: 88.842,
        isPilot: true,
        hotspotLabel: "Heat Risk Representative Area",
      },
    ],
  },

  {
    id: "rajshahi",
    nameEn: "Rajshahi",
    nameBn: "রাজশাহী",
    upazilas: [
      {
        id: "paba",
        nameEn: "Paba",
        nameBn: "পবা",
        districtId: "rajshahi",
        lat: 24.375,
        lon: 88.647,
        isPilot: true,
        hotspotLabel: "Heat Risk Representative Area",
      },
      {
        id: "godagari",
        nameEn: "Godagari",
        nameBn: "গোদাগাড়ী",
        districtId: "rajshahi",
        lat: 24.507,
        lon: 88.366,
        isPilot: true,
        hotspotLabel: "Heat Risk Representative Area",
      },
    ],
  },

  {
    id: "panchagarh",
    nameEn: "Panchagarh",
    nameBn: "পঞ্চগড়",
    upazilas: [
      {
        id: "tetulia",
        nameEn: "Tetulia",
        nameBn: "তেঁতুলিয়া",
        districtId: "panchagarh",
        lat: 26.327,
        lon: 88.628,
        isPilot: true,
        hotspotLabel: "Cold Risk Representative Area",
      },
    ],
  },

  {
    id: "patuakhali",
    nameEn: "Patuakhali",
    nameBn: "পটুয়াখালী",
    upazilas: [
      {
        id: "kalapara",
        nameEn: "Kalapara",
        nameBn: "কলাপাড়া",
        districtId: "patuakhali",
        lat: 21.970,
        lon: 90.174,
        isPilot: true,
        hotspotLabel: "Storm/Cyclone Representative Area",
      },
    ],
  },

  {
    id: "khulna",
    nameEn: "Khulna",
    nameBn: "খুলনা",
    upazilas: [
      {
        id: "koyra",
        nameEn: "Koyra",
        nameBn: "কয়রা",
        districtId: "khulna",
        lat: 22.370,
        lon: 89.301,
        isPilot: true,
        hotspotLabel: "Storm/Cyclone Representative Area",
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
