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
  siteTagline: "A bilingual environmental safety, preparedness, and school guidance platform for Bangladesh",
  siteDescription:
    "SafeSchool helps school authorities, teachers, students, and guardians understand both current and upcoming environmental conditions in their area. " +
    "By combining live weather data, air-quality information, rainfall outlook, and school-focused risk analysis, it provides practical safety recommendations, " +
    "preparedness advice, and situation-based precautions for safer school planning and daily decision-making.",

  /* ── Navigation / Header ─────────────────────────────── */
  langToggleLabel: "বাংলা",
  langToggleTitle: "Switch to Bangla",

  /* ── Intro Cards ─────────────────────────────────────── */
  introWhatTitle: "What this website does",
  introWhatText:
    "SafeSchool is a school-focused environmental safety platform designed to turn complex weather and environmental information into practical guidance for everyday school use. " +
    "It analyses current conditions, short-term rain trends, air-quality levels, and forecast-based risks to help users understand whether school activities can continue normally " +
    "or whether extra caution and preparation are needed. The platform also provides situation-based guidance for school authorities, teachers, students, guardians, " +
    "and sensitive or vulnerable groups whenever environmental risks become active.",
  introHowTitle: "How to use",
  introHowText:
    "Select a district first, then choose an upazila. SafeSchool will display the current environmental conditions, risk breakdown, overall school safety status, " +
    "practical recommendations, and forecast-based preparedness guidance for the selected location.",

  /* ── Prototype Notice ────────────────────────────────── */
  prototypeNotice:
    "Prototype: this version currently demonstrates selected pilot upazilas from Kishoreganj together with a few representative climate-risk locations from different regions of Bangladesh.",

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

  /* ── Heat Advisory (below formal risk threshold) ────── */
  heatAdvisoryLabel: "Warm",
  heatAdvisoryDesc: "Temperature is getting warm (≥ 30°C). Ensure students stay hydrated and limit strenuous outdoor activity.",

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
    "SchoolSafe BD uses a transparent rule-based system to assess environmental risks on a 4-level scale: No Risk, Low, Moderate, and High. " +
    "Data is fetched from Open-Meteo's free weather and air quality APIs. " +
    "All thresholds are Bangladesh-calibrated and fully editable in the project source code.",
  methodologyRulesTitle: "Risk Rule Summary",
  methodologyHeatRule:
    "Uses the worse of actual temperature and feels-like temperature. " +
    "Temp: Low ≥ {tempLow}°C, Moderate ≥ {tempMod}°C, High ≥ {tempHigh}°C. " +
    "Feels-like: Low ≥ {feelsLow}°C, Moderate ≥ {feelsMod}°C, High ≥ {feelsHigh}°C.",
  methodologyRainRule:
    "5-input model — current precipitation probability, next-3h max probability, recent 3h accumulation, next-6h forecast, and WMO weather code. " +
    "The worst level across all five inputs is used. " +
    "Probability: Low ≥ {probLow}%, Moderate ≥ {probMod}%, High ≥ {probHigh}%. " +
    "3h rain: Low ≥ {rain3hLow} mm, Moderate ≥ {rain3hMod} mm, High ≥ {rain3hHigh} mm. " +
    "Next-6h rain: Low ≥ {next6hLow} mm, Moderate ≥ {next6hMod} mm, High ≥ {next6hHigh} mm. " +
    "WMO code: light rain → Low, continuous rain → Moderate, thunderstorm → High.",
  methodologyAQRule:
    "PM2.5 (Bangladesh-calibrated): Low ≥ {pm25Low} µg/m³, Moderate ≥ {pm25Mod} µg/m³, High ≥ {pm25High} µg/m³. " +
    "PM10: Low ≥ {pm10Low} µg/m³, Moderate ≥ {pm10Mod} µg/m³, High ≥ {pm10High} µg/m³. " +
    "Worst of the two pollutants is used.",
  methodologyColdRule:
    "Based on actual temperature only. " +
    "Low ≤ {tempLow}°C, Moderate ≤ {tempMod}°C, High ≤ {tempHigh}°C.",
  methodologyHeavyRainRule:
    "Dual-input model — 24h accumulation and 3h rolling total. " +
    "24h: Low ≥ {h24Low} mm, Moderate ≥ {h24Mod} mm, High ≥ {h24High} mm. " +
    "3h: Low ≥ {h3Low} mm, Moderate ≥ {h3Mod} mm, High ≥ {h3High} mm. " +
    "Worst of the two inputs is used.",
  methodologyFloodRule:
    "Dual-input model — 6h accumulation and 24h total. " +
    "6h: Low ≥ {h6Low} mm, Moderate ≥ {h6Mod} mm, High ≥ {h6High} mm. " +
    "24h: Low ≥ {h24Low} mm, Moderate ≥ {h24Mod} mm, High ≥ {h24High} mm. " +
    "Worst of the two inputs is used.",
  methodologyStormRule:
    "Based on wind speed. Low ≥ {windLow} km/h, Moderate ≥ {windMod} km/h, High ≥ {windHigh} km/h.",
  methodologyOverallBadge:
    "Uses a weighted scoring model across all seven risk types. " +
    "Override rules: Flood or Storm at High → overall High; two or more individual Highs → overall High; one High combined with any other Moderate-or-above → overall High. " +
    "Otherwise a weighted score determines the level: Low ≥ {scoreLow}, Moderate ≥ {scoreMod}, High ≥ {scoreHigh}.",

  /* ── Limitations ─────────────────────────────────────── */
  limitationsTitle: "Limitations & Disclaimer",
  limitationsText:
    "SafeSchool is an educational and decision-support prototype designed for school safety awareness and preparedness. " +
    "It provides guidance based on live environmental data, forecast information, and rule-based risk analysis. " +
    "The platform does not replace official government warnings, emergency alerts, medical advice, or local administrative instructions. " +
    "Flood, storm, cyclone, cold-wave, and other hazard-related guidance should always be verified with relevant official sources such as " +
    "the Bangladesh Meteorological Department, Bangladesh Water Development Board, and local authorities. " +
    "In urgent situations, users should follow official instructions and professional advice.",

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
  tomorrowTipHeatBasic: "Warm day expected tomorrow — remind students to carry drinking water and take shade breaks. Avoid prolonged outdoor exposure during midday.",
  tomorrowTipHeat: "Severe heat expected tomorrow — limit all outdoor exposure and review outdoor activity plans. Take extra care of sensitive or vulnerable students and ensure everyone stays hydrated.",
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
  weekHeatSevere: "Heat",
  weekHeatWarm: "Warm",
  weekHeatSevereTitle: "Severe heat ≥36°C",
  weekHeatWarmTitle: "Warm day >30°C",

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
