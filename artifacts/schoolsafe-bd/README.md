# SafeSchool 🌿

**A bilingual environmental school safety tool for Bangladesh.**

SafeSchool is a science fair prototype that fetches live weather and air quality data for school locations in Bangladesh and displays safety recommendations in both **English and Bangla**. It covers 7 environmental risk types and currently pilots 3 upazilas in Kishoreganj district.

---

## Purpose

Schools in Bangladesh face real environmental risks — extreme heat, cold waves, heavy rain, flooding, poor air quality, and cyclones. SafeSchool gives teachers and administrators a fast, bilingual dashboard to assess conditions and act on safety guidance before the school day begins.

---

## Live Data Sources

| Data | API | Key Required? |
|------|-----|--------------|
| Weather forecast (temperature, humidity, wind, precipitation, UV, visibility) | [Open-Meteo Forecast API](https://api.open-meteo.com/v1/forecast) | No |
| Air quality (PM2.5, PM10) | [Open-Meteo Air Quality API](https://air-quality-api.open-meteo.com/v1/air-quality) | No |

Both APIs are completely free and open. No sign-up is needed.

---

## Features

- **7 risk types**: Heat, Rain, Air Quality, Cold Wave, Heavy Rain, Flood, Storm/Cyclone
- **Bilingual**: Full English/Bangla toggle — all labels, recommendations, and methodology text
- **Live data**: Fetches current-hour values from Open-Meteo every 10 minutes
- **Pilot coverage**: Kishoreganj Sadar, Bhairab, and Itna (Kishoreganj district)
- **Comparison table**: Side-by-side live conditions for all 3 pilot upazilas
- **24-hour forecast chart**: Temperature and precipitation probability
- **Contextual recommendations**: School-specific safety advice per active risk
- **Transparent methodology**: All 7 risk rules and exact thresholds explained in the UI

---

## How to Run Locally

**Prerequisites:** Node.js ≥ 18, pnpm ≥ 8

```bash
# From the repository root:
pnpm install

# Start the SafeSchool dev server:
pnpm --filter @workspace/schoolsafe-bd run dev
```

The app will be available at `http://localhost:<PORT>` (the port is set by the `PORT` environment variable, defaulting to the value configured in `vite.config.ts`).

---

## Project Structure

```
artifacts/schoolsafe-bd/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Site header with language toggle
│   │   ├── Hero.tsx            # Hero banner with prototype notice
│   │   ├── LocationSelector.tsx # District/upazila search dropdowns
│   │   ├── Dashboard.tsx       # Live data dashboard (weather + risk)
│   │   ├── ForecastChart.tsx   # 24-hour temperature/precipitation chart
│   │   ├── ComparisonSection.tsx # Side-by-side pilot upazila comparison
│   │   ├── MethodologySection.tsx # All 7 risk rules explained
│   │   ├── LimitationsSection.tsx # Disclaimer and advisory notice
│   │   └── Footer.tsx          # Footer with data source credit
│   ├── data/
│   │   └── locations.ts        # ← EDIT HERE to add districts/upazilas
│   ├── logic/
│   │   ├── thresholds.ts       # ← EDIT HERE to adjust risk thresholds
│   │   └── riskEngine.ts       # Computes risk levels from weather data
│   ├── translations/
│   │   ├── en.ts               # ← EDIT HERE for English text
│   │   └── bn.ts               # ← EDIT HERE for Bangla text
│   ├── utils/
│   │   └── api.ts              # Open-Meteo fetch functions
│   ├── contexts/
│   │   └── LanguageContext.tsx # Language state and t() translation hook
│   └── types/
│       └── index.ts            # Shared TypeScript types
├── README.md
└── package.json
```

---

## How to Edit District and Upazila Data

Open `src/data/locations.ts`. It contains the `DISTRICTS` array.

To **add a new upazila** to Kishoreganj:

```typescript
{
  id: "kuliarchar",           // unique slug (lowercase, hyphens)
  nameEn: "Kuliarchar",       // English name
  nameBn: "কুলিয়ারচর",        // Bangla name
  districtId: "kishoreganj",
  lat: 24.178,                // latitude (decimal degrees)
  lon: 90.864,                // longitude (decimal degrees)
  isPilot: true,              // true = live data; false = coming soon
},
```

To **add a new district**, add a new object to the `DISTRICTS` array following the same pattern. See the commented example at the bottom of `locations.ts`.

---

## How to Edit Bilingual Text

All English text lives in `src/translations/en.ts`.  
All Bangla text lives in `src/translations/bn.ts`.

To **change a label, heading, or message**, find the key in `en.ts` and change the value. Then update the matching key in `bn.ts` to keep them in sync.

```typescript
// en.ts
siteName: "SafeSchool",

// bn.ts
siteName: "স্কুলসেফ বিডি",
```

> **Type safety**: `bn.ts` uses `satisfies typeof en` at export, so TypeScript will show a compile error if any key is missing or misspelled in the Bangla file.

---

## How to Edit Risk Thresholds

Open `src/logic/thresholds.ts`. Every numeric threshold is a named constant with a JSDoc comment.

Example — lower the heat moderate threshold from 32°C to 30°C:

```typescript
// Before:
export const HEAT_TEMP_MODERATE = 32;

// After:
export const HEAT_TEMP_MODERATE = 30;
```

The risk engine (`src/logic/riskEngine.ts`) reads all thresholds from this file. No other file needs changing.

---

## How to Deploy from GitHub

### Option A: Replit Deployments (recommended)

1. Push this repository to GitHub.
2. Import the repo into Replit.
3. Click **Deploy** in the Replit toolbar.
4. Replit will build and host the app on a `.replit.app` domain.

### Option B: Vercel / Netlify

```bash
# Build the production bundle:
pnpm --filter @workspace/schoolsafe-bd run build

# The output is in artifacts/schoolsafe-bd/dist/public/
# Upload that folder to Vercel, Netlify, or any static host.
```

No environment variables or backend server are required — all data comes from the public Open-Meteo APIs.

---

## Risk Rule Reference

| Risk Type | Moderate Trigger | High Trigger |
|-----------|-----------------|--------------|
| 🌡️ Heat | Temp ≥ 32°C | Temp ≥ 35°C or feels-like ≥ 38°C |
| 🌧️ Rain | Precip prob ≥ 40% | Precip prob ≥ 60% |
| 🌫️ Air Quality | PM2.5 ≥ 15 µg/m³ | PM2.5 ≥ 35 µg/m³ |
| 🧥 Cold Wave | Temp ≤ 15°C | Temp ≤ 10°C |
| ⛈️ Heavy Rain | Prob ≥ 60% AND rain ≥ 5 mm/h | Rain ≥ 15 mm/h |
| 🌊 Flood | Prob ≥ 70% AND rain ≥ 20 mm/h | Rain ≥ 40 mm/h |
| 🌀 Storm/Cyclone | Wind ≥ 40 km/h | Wind ≥ 65 km/h |

The **Overall School Safety** badge shows the worst-case level across all seven types.

---

## Limitations

This tool is a **student science fair prototype** and does not replace:
- Official Bangladesh Meteorological Department (BMD) warnings
- Bangladesh Water Development Board (BWDB) flood advisories
- Official cold wave alerts
- Your school's own safety procedures

Always follow official guidance and your institution's safety protocols.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React + Vite (TypeScript) |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack React Query v5 |
| Charts | Recharts v2 |
| Build | pnpm monorepo |
| APIs | Open-Meteo (free, no key) |

---

*SafeSchool — Environmental School Safety Awareness, Kishoreganj Pilot, Bangladesh.*
