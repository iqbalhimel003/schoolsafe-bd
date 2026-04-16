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
  siteName: "SafeSchool",
  siteTagline: "Environmental School Safety — Bangladesh",
  siteDescription:
    "A bilingual environmental safety tool for schools across Bangladesh. Search your district and upazila to see live weather, air quality, and safety recommendations.",

  /* ── Navigation / Header ─────────────────────────────── */
  langToggleLabel: "বাংলা",
  langToggleTitle: "Switch to Bangla",

  /* ── Intro Cards ─────────────────────────────────────── */
  introWhatTitle: "What this website does",
  introWhatText:
    "This website helps schools understand environmental safety conditions using live data such as weather and air quality. " +
    "It provides simple safety guidance for school authorities, students, and guardians regarding heat, rain, air quality, cold, flood, and storm-related risks.",
  introHowTitle: "How to use",
  introHowText:
    "Select a district, then select an upazila, and view the live conditions, risk levels, and school safety recommendations for the selected location.",

  /* ── Prototype Notice ────────────────────────────────── */
  prototypeNotice:
    "Prototype: currently demonstrates selected pilot upazilas in Kishoreganj district.",

  /* ── Location Selector ───────────────────────────────── */
  selectDistrict: "Select District",
  selectUpazila: "Select Upazila",
  districtLabel: "District",
  upazilaLabel: "Upazila",
  pilotBadge: "Pilot",
  hotspotBadge: "Climate-risk Hotspot",
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
  refreshButton: "Refresh Data",
  refreshingLabel: "Refreshing…",

  /* ── Weather Metrics ─────────────────────────────────── */
  temperature: "Temperature",
  humidity: "Relative Humidity",
  apparentTemperature: "Feels Like",
  precipitationProbability: "Precipitation Probability",
  rain: "Rain",
  rain6hLabel: "6h Rain",
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
  safetyNone: "No Risk",
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

  /* ── Role-based Guidance ─────────────────────────────── */
  guidanceAuthoritiesTitle: "Guidance for School Authorities",
  guidanceAuthorities1: "Consider adjusting or delaying morning assembly during severe heat, cold, heavy rain, or storm conditions.",
  guidanceAuthorities2: "Reduce or suspend outdoor activities when environmental risk is high.",
  guidanceAuthorities3: "Communicate active safety alerts clearly to teachers and families.",
  guidanceAuthorities4: "Arrange extra supervision for vulnerable or unwell students.",
  guidanceAuthorities5: "Keep school entry, exit, and movement areas clear and safer during rain or flood-prone conditions.",

  guidanceTeachersTitle: "Guidance for Teachers",
  guidanceTeachers1: "Monitor students for signs of visible discomfort during heat, cold, poor air quality, or rain.",
  guidanceTeachers2: "Reduce outdoor class activities when environmental risk is active.",
  guidanceTeachers3: "Keep vulnerable or unwell students indoors when conditions are poor.",
  guidanceTeachers4: "Remind students to carry water, warm clothing, rain protection, or masks as conditions require.",
  guidanceTeachers5: "Follow school safety instructions and official guidance during severe weather.",

  guidanceGuardiansTitle: "Guidance for Guardians",
  guidanceGuardians1: "Send children prepared with water, warm clothing, rain protection, or masks as conditions require.",
  guidanceGuardians2: "Take extra care during travel in heavy rain, flood-prone, or stormy conditions.",
  guidanceGuardians3: "Avoid unnecessary outdoor exposure for children who are unwell or environmentally sensitive.",
  guidanceGuardians4: "Follow school notices and weather-related safety updates.",

  guidanceStudentsTitle: "Guidance for Students",
  guidanceStudents1: "Carry water and stay hydrated during hot conditions.",
  guidanceStudents2: "Wear warm clothing during cold or cold-wave conditions.",
  guidanceStudents3: "Use an umbrella or rain protection during rainy weather.",
  guidanceStudents4: "Reduce outdoor time during poor air quality, storm, or severe weather.",
  guidanceStudents5: "Follow teacher and school instructions carefully.",

  /* ── Condition-based Extra Precautions ───────────────── */
  guidanceLungTitle: "Extra Precautions for People with Lung Problems",
  guidanceLung1: "Reduce outdoor exposure during poor air quality, dusty, or smoke-like conditions.",
  guidanceLung2: "Avoid strenuous outdoor activity when air quality risk is active.",
  guidanceLung3: "Keep personal protective items nearby if already advised to do so.",
  guidanceLung4: "Consult a medical professional promptly if breathing discomfort increases.",

  guidanceColdSensitiveTitle: "Extra Precautions for People Sensitive to Cold",
  guidanceColdSensitive1: "Avoid prolonged outdoor exposure during cold mornings or cold-wave conditions.",
  guidanceColdSensitive2: "Wear sufficient warm clothing and cover extremities.",
  guidanceColdSensitive3: "Reduce early morning outdoor activity when cold risk is high.",

  guidanceHeatSensitiveTitle: "Extra Precautions for People Sensitive to Heat",
  guidanceHeatSensitive1: "Avoid prolonged outdoor exposure during hot periods.",
  guidanceHeatSensitive2: "Reduce strenuous outdoor activity when heat risk is active.",
  guidanceHeatSensitive3: "Stay hydrated and remain in shaded or cooler areas when possible.",

  guidanceRainSensitiveTitle: "Extra Precautions for People Sensitive to Rain or Damp Weather",
  guidanceRainSensitive1: "Avoid staying in wet or damp clothing.",
  guidanceRainSensitive2: "Use rain protection when moving outdoors.",
  guidanceRainSensitive3: "Take extra care on slippery or waterlogged paths.",
  guidanceRainSensitive4: "Reduce unnecessary outdoor movement during heavy rain.",

  guidanceAllergyTitle: "Extra Precautions for People with Heat, Cold, or Dust Allergy",
  guidanceAllergy1: "Reduce outdoor exposure during active heat, cold, or dusty conditions.",
  guidanceAllergy2: "Avoid unnecessary outdoor time when air quality or dust risk is active.",
  guidanceAllergy3: "Use any protective measures already personally recommended to you.",
  guidanceAllergy4: "Consult a medical professional if symptoms become severe.",

  guidanceVulnStudentsTitle: "Extra Precautions for Sick or Vulnerable Students",
  guidanceVulnStudents1: "Avoid prolonged outdoor exposure during high heat, cold, poor air quality, heavy rain, flood, or storm conditions.",
  guidanceVulnStudents2: "Remain under closer adult supervision when environmental conditions are poor.",
  guidanceVulnStudents3: "Rest indoors when conditions are unsafe.",
  guidanceVulnStudents4: "Follow professional medical guidance if health worsens.",

  guidanceVulnTeachersTitle: "Extra Precautions for Sick or Vulnerable Teachers",
  guidanceVulnTeachers1: "Reduce unnecessary outdoor exposure during adverse environmental conditions.",
  guidanceVulnTeachers2: "Take added care during travel and outdoor duty in severe weather.",
  guidanceVulnTeachers3: "Follow professional medical guidance if health worsens.",

  /* ── Guidance Disclaimer ─────────────────────────────── */
  guidanceDisclaimerTitle: "Important Notice",
  guidanceDisclaimerText:
    "These are general environmental safety precautions only. They do not replace professional medical advice, treatment, or official emergency instructions. " +
    "People with severe symptoms, breathing difficulty, or worsening health conditions should seek professional medical care and follow official guidance.",

  /* ── Comparison Section ──────────────────────────────── */
  comparisonTitle: "Pilot Upazila Comparison",
  comparisonSubtitle: "Pick any two pilot upazilas to compare live conditions side-by-side",
  comparisonLocation: "Location",
  comparisonMetric: "Metric",
  comparisonSelectA: "Location A",
  comparisonSelectB: "Location B",
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
  chartSubtitle: "Temperature and precipitation probability over the next 24 hours",

  /* ── Methodology ─────────────────────────────────────── */
  methodologyTitle: "Methodology",
  methodologyText:
    "SafeSchool uses a transparent rule-based system to assess environmental risks. " +
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
    "Precipitation probability ≥ 60% AND 3-hour rain accumulation ≥ 15 mm → Moderate; ≥ 45 mm → High. " +
    "Using a 3-hour rolling total captures sustained intense rainfall that poses risk to outdoor school activities.",
  methodologyFloodRule:
    "Precipitation probability ≥ 70% AND 6-hour rainfall accumulation ≥ 20 mm → Moderate; ≥ 40 mm → High. " +
    "Using a 6-hour rolling total captures sustained rain events that cause waterlogging at school access areas.",
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
  footerPurpose: "SafeSchool — A science fair project for environmental school safety awareness in Bangladesh.",
  footerDataSource: "Weather & Air Quality Data: Open-Meteo (open-meteo.com)",
  footerDisclaimer: "This prototype is for educational purposes only.",
  footerCreditBefore:
    "This service/project was developed by the students of Zilla Smarani Girls\u2019 High School, Kishoreganj, under the overall supervision of\u00a0",
  footerCreditAfter: ".",

  /* ── Contact ─────────────────────────────────────────── */
  footerContactTitle: "Contact",
  footerContactEmail: "Email",
  footerContactPhone: "Phone",
  footerContactFacebook: "Facebook",
  footerContactTelegram: "Telegram",
  footerContactX: "X (Twitter)",

  /* ── Tomorrow's Forecast ─────────────────────────── */
  tomorrowSectionTitle: "Tomorrow's Forecast",
  tomorrowMaxTemp: "Max Temp",
  tomorrowMinTemp: "Min Temp",
  tomorrowRainProb: "Rain Probability",
  tomorrowRainAmount: "Rain Amount",
  tomorrowWindMax: "Max Wind",
  tomorrowPM25: "PM2.5 (avg)",
  tomorrowPrepBadgeLabel: "Preparation Need",
  tomorrowPrepNone: "No Preparation Needed",
  tomorrowPrepLow: "Low Preparation Need",
  tomorrowPrepModerate: "Moderate Preparation Need",
  tomorrowPrepHigh: "High Preparation Need",
  tomorrowPrepTipsTitle: "Next-Day Preparedness Tips",
  tomorrowTipHeat: "High heat expected tomorrow — ensure students carry water and wear light clothing. Limit outdoor activities during the hottest hours.",
  tomorrowTipCold: "Cold conditions expected tomorrow — remind students to wear warm clothing and cover extremities. Avoid prolonged early-morning outdoor exposure.",
  tomorrowTipRain: "Rain is likely tomorrow — students should carry an umbrella or rain protection. School may consider sheltered assembly arrangements.",
  tomorrowTipRainStrong: "Heavy rain or thunderstorms are expected tomorrow — ensure students carry strong rain protection. School should prepare sheltered assembly and consider adjusting outdoor activities. Avoid low-lying or waterlogged areas.",
  tomorrowTipWind: "Strong wind is expected tomorrow — secure loose outdoor items and restrict exposed outdoor activities.",
  tomorrowTipAir: "Poor air quality is forecast for tomorrow — keep windows closed and limit prolonged outdoor time.",
  tomorrowTipAuthorities: "School authorities should consider adjusting outdoor assembly, morning exercises, or outdoor activities in advance given tomorrow's elevated conditions.",
  tomorrowNoData: "Tomorrow's forecast is unavailable for this location.",
  tomorrowTipLowRiskGeneral: "Conditions tomorrow are within normal ranges. Standard school activities can proceed — students should carry water and dress appropriately for the season.",
  tomorrowTipMonitor: "Keep monitoring conditions as tomorrow approaches. Situations may change in the hours ahead. Follow any updates from school authorities or official weather advisories.",

  /* ── Week Ahead ──────────────────────────────────── */
  weekSectionTitle: "Week Ahead",
  weekSectionSubtitle: "7-day school planning outlook",
  weekHeaderDay: "Day",
  weekHeaderCondition: "Condition",
  weekHeaderMaxMin: "Max / Min",
  weekHeaderRain: "Rain %",
  weekHeaderPrep: "Prep",
  weekPrepNone: "None",
  weekPrepLow: "Low",
  weekPrepModerate: "Moderate",
  weekPrepHigh: "High",
  weekNoData: "Weekly forecast is unavailable for this location.",
  weekToday: "Today",

  /* ── Print / Share Report ────────────────────────── */
  printButton: "Print / Share Report",
  printReportTitle: "Daily School Safety Report",
  printGeneratedOn: "Generated on",

  /* ── Share Button ────────────────────────────────── */
  shareButton: "Share / শেয়ার",
  shareToastCopied: "Link copied to clipboard!",
  shareToastFailed: "Could not share. Please copy the link manually.",
};

export default en;
export type TranslationKeys = keyof typeof en;
