/* =========================================================
 * SchoolSafe BD — English Translations
 *
 * HOW TO EDIT:
 *   All user-facing English text lives here.
 *   To add or change any label, button, heading, or message
 *   shown to English-speaking users, edit the values below.
 *   The matching Bangla strings live in translations/bn.ts.
 *
 * KEY GROUPS:
 *   Branding, Header, Prototype Notice, Location Selector,
 *   Dashboard, Weather Metrics, Risk Cards (7 types),
 *   Overall Safety Badge, Triggered Rules, Recommendations,
 *   Comparison, Chart, Methodology, Limitations, Footer.
 * ========================================================= */

const en = {
  /* ── Branding ─────────────────────────────────────────── */
  siteName: "SchoolSafe BD",
  siteTagline: "Environmental School Safety — Bangladesh",
  siteDescription:
    "A bilingual environmental safety tool for schools across Bangladesh. Search your district and upazila to see live weather, air quality, and safety recommendations.",

  /* ── Navigation / Header ─────────────────────────────── */
  langToggleLabel: "বাংলা",
  langToggleTitle: "Switch to Bangla",

  /* ── Prototype Notice ────────────────────────────────── */
  prototypeNotice:
    "Prototype: currently demonstrates selected pilot upazilas in Kishoreganj district.",

  /* ── Location Selector ───────────────────────────────── */
  selectDistrict: "Select District",
  selectUpazila: "Select Upazila",
  districtLabel: "District",
  upazilaLabel: "Upazila",
  pilotBadge: "Pilot",
  comingSoon: "Coming Soon",
  searchDistrict: "Search district…",
  searchUpazila: "Search upazila…",
  noResults: "No results found.",

  /* ── Dashboard Section ───────────────────────────────── */
  dashboardTitle: "Current Environmental Conditions",
  dashboardSubtitle: "Live data for the selected location",
  selectLocationPrompt: "Select a district and upazila to view live data.",
  lastUpdated: "Last updated",
  dataSource: "Data: Open-Meteo",
  loadingData: "Fetching live data…",
  errorFetchingData: "Could not load environmental data. Please try again.",
  retryButton: "Retry",

  /* ── Weather Metrics ─────────────────────────────────── */
  temperature: "Temperature",
  humidity: "Relative Humidity",
  apparentTemperature: "Feels Like",
  precipitationProbability: "Precipitation Probability",
  rain: "Rain",
  windSpeed: "Wind Speed",
  uvIndex: "UV Index",
  visibility: "Visibility",
  pm25Label: "PM2.5 (µg/m³)",
  pm10Label: "PM10 (µg/m³)",

  /* ── Risk Cards ──────────────────────────────────────── */
  riskBreakdownTitle: "Risk Breakdown",
  heatRisk: "Heat Risk",
  rainRisk: "Rain Risk",
  airQualityRisk: "Air Quality Risk",
  coldRisk: "Cold Risk",
  /* Standalone "Cold Wave" term — used in triggered-rule explanations
   * and winter recommendation cards. Bengali: শৈত্য প্রবাহ */
  coldWave: "Cold Wave",
  heavyRainRisk: "Heavy Rain Risk",
  floodRisk: "Flood Risk",
  stormRisk: "Storm / Cyclone Risk",

  /* ── Overall Safety Badge ────────────────────────────── */
  overallSafetyTitle: "Overall School Safety",
  safetyLow: "Low Risk",
  safetyModerate: "Moderate Risk",
  safetyHigh: "High Risk",

  /* ── Triggered Rules (Why This Advice?) ─────────────── */
  whyThisAdviceTitle: "Why This Advice?",
  noRisksTriggered: "No significant risks detected at this time.",

  /* Risk rule explanation keys — Phase 3 will set real text */
  ruleHighTemp: "High temperature detected (≥ 35°C).",
  ruleHighApparentTemp: "Heat index / feels-like temperature is very high (≥ 38°C).",
  ruleHighHumidity: "High humidity combined with high temperature increases discomfort.",
  ruleHighPrecipProb: "High probability of rain (≥ 60%).",
  ruleNotableRain: "Notable rain forecast.",
  ruleHighPM25: "PM2.5 air quality is at an elevated level.",
  ruleHighPM10: "PM10 particulate level is elevated.",
  ruleColdTemp: "Low temperature detected — cold risk for outdoor activities.",
  ruleVeryColdTemp: "Very low temperature — high cold risk.",
  ruleColdWind: "Cold temperature combined with strong wind increases cold discomfort.",
  ruleHeavyRain: "Heavy rain forecast — high precipitation probability with notable rain amount.",
  ruleFloodRisk: "Sustained heavy precipitation may lead to waterlogging or flooding.",
  ruleStormWind: "Strong wind detected — storm or cyclone risk.",
  ruleSevereStorm: "Very strong wind detected — severe storm or cyclone conditions.",

  /* ── Recommendations ─────────────────────────────────── */
  recommendationsTitle: "Recommendations",
  recOutdoorAssembly: "Outdoor Assembly",
  recOutdoorAssemblyText: "Postpone outdoor assembly during high heat or heavy rain.",
  recOutdoorSports: "Outdoor Sports",
  recOutdoorSportsText: "Limit outdoor physical activities when heat or storm risk is high.",
  recHydration: "Hydration",
  recHydrationText: "Ensure students have access to clean drinking water.",
  recRainCaution: "Rain Caution",
  recRainCautionText: "Students should carry rain protection. School may consider early dismissal.",
  recAirQuality: "Air Quality",
  recAirQualityText: "Keep windows closed and limit outdoor time when air quality is poor.",
  recWarmClothing: "Warm Clothing",
  recWarmClothingText: "Students should wear warm clothing. Cold wave conditions are possible.",
  recDelayMorningAssembly: "Delay Morning Assembly",
  recDelayMorningAssemblyText: "Consider delaying morning assembly during very cold early hours.",
  recLimitEarlyMorning: "Limit Early Morning Outdoor Activity",
  recLimitEarlyMorningText: "Avoid outdoor activities in the early morning during cold conditions.",
  recPostponeHeavyRain: "Postpone Outdoor Assembly",
  recPostponeHeavyRainText: "Postpone outdoor assembly and activities during heavy rain.",
  recAvoidFloodedAreas: "Avoid Flooded Areas",
  recAvoidFloodedAreasText: "Avoid movement through flooded or waterlogged school access areas.",
  recStormRestriction: "Restrict Outdoor Activity",
  recStormRestrictionText: "Restrict all outdoor activities during strong wind or storm conditions.",
  recSevereWeatherCaution: "Severe Weather Caution",
  recSevereWeatherCautionText: "Exercise extra caution. Monitor official alerts in severe weather.",

  /* ── Comparison Section ──────────────────────────────── */
  comparisonTitle: "Pilot Upazila Comparison",
  comparisonSubtitle: "Live conditions across all pilot locations in Kishoreganj",
  comparisonLocation: "Location",
  comparisonOverall: "Overall Safety",
  comparisonTemp: "Temp",
  comparisonPM25: "PM2.5",
  comparisonColdRisk: "Cold Risk",
  comparisonFloodRisk: "Flood Risk",
  comparisonStormRisk: "Storm Risk",
  comparisonLoading: "Loading comparison data…",
  comparisonError: "Could not load comparison data.",

  /* ── 24-Hour Chart ───────────────────────────────────── */
  chartTitle: "24-Hour Forecast",
  chartTemp: "Temperature (°C)",
  chartPrecipProb: "Precip. Probability (%)",
  chartHour: "Hour",
  chartLoading: "Loading forecast chart…",
  chartError: "Could not load forecast data.",

  /* ── Methodology ─────────────────────────────────────── */
  methodologyTitle: "Methodology",
  methodologyText:
    "SchoolSafe BD uses a transparent rule-based system to assess environmental risks. " +
    "Data is fetched from Open-Meteo's free weather and air quality APIs. " +
    "All thresholds are based on publicly available environmental health guidance and are fully editable in the project source code.",
  methodologyRulesTitle: "Risk Rule Summary",
  methodologyHeatRule:
    "Temp ≥ 32°C → Moderate; ≥ 35°C or feels-like ≥ 38°C → High. " +
    "Humidity above 80% combined with high temperature raises risk further.",
  methodologyRainRule:
    "Precipitation probability ≥ 40% → Moderate; ≥ 60% → High. " +
    "Notable rainfall forecast also raises rain risk.",
  methodologyAQRule:
    "PM2.5 ≥ 15 µg/m³ → Moderate; ≥ 35 µg/m³ → High. " +
    "PM10 ≥ 45 µg/m³ → Moderate; ≥ 100 µg/m³ → High. Worst of the two is used.",
  methodologyColdRule:
    "Temp ≤ 15°C → Moderate; ≤ 10°C → High (Cold Wave conditions). " +
    "Wind speed ≥ 20 km/h during cold conditions bumps risk up one level.",
  methodologyHeavyRainRule:
    "Precipitation probability ≥ 60% AND hourly rain ≥ 5 mm → Moderate; ≥ 15 mm → High. " +
    "Indicates risk to outdoor school activities.",
  methodologyFloodRule:
    "Precipitation probability ≥ 70% AND hourly rain ≥ 20 mm → Moderate; ≥ 40 mm → High. " +
    "Indicates potential waterlogging at school access areas.",
  methodologyStormRule:
    "Wind speed ≥ 40 km/h → Moderate; ≥ 65 km/h → High. " +
    "Indicates risk from strong wind or cyclone conditions.",
  methodologyOverallBadge:
    "The Overall School Safety badge reflects the worst-case risk across all seven types. " +
    "If any single risk is High, the overall badge shows High.",

  /* ── Limitations ─────────────────────────────────────── */
  limitationsTitle: "Limitations & Disclaimer",
  limitationsText:
    "This tool is a student science fair prototype and does not replace official government warnings, " +
    "emergency alerts, or medical advice. Flood and cyclone guidance does not replace advisories from the " +
    "Bangladesh Meteorological Department or Bangladesh Water Development Board. " +
    "Cold wave guidance does not replace official cold wave alerts. " +
    "Always follow your school's official safety procedures.",

  /* ── Footer ─────────────────────────────────────────── */
  footerPurpose: "SchoolSafe BD — A science fair project for environmental school safety awareness in Bangladesh.",
  footerDataSource: "Weather & Air Quality Data: Open-Meteo (open-meteo.com)",
  footerDisclaimer: "This prototype is for educational purposes only.",
};

export default en;
export type TranslationKeys = keyof typeof en;
