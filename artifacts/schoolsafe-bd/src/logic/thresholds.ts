/* =========================================================
 * SchoolSafe BD — Risk Thresholds
 *
 * HOW TO EDIT:
 *   All numeric risk thresholds are defined here as named
 *   constants with explanatory comments. Change these values
 *   to adjust when risks are triggered (e.g., if you want to
 *   lower the heat threshold for a cooler region, change
 *   HEAT_TEMP_MODERATE from 32 to 30).
 *
 *   The risk engine (logic/riskEngine.ts) reads these
 *   constants — no other file needs changing when you
 *   adjust a threshold value.
 * ========================================================= */

/* ── Heat Risk Thresholds ──────────────────────────────── */

/** Temperature (°C) at or above which heat risk becomes Low */
export const HEAT_TEMP_LOW = 30;

/** Temperature (°C) at or above which heat risk becomes Moderate */
export const HEAT_TEMP_MODERATE = 32;

/** Temperature (°C) at or above which heat risk becomes High */
export const HEAT_TEMP_HIGH = 35;

/** Apparent/feels-like temperature (°C) at or above which heat risk becomes High */
export const HEAT_APPARENT_TEMP_HIGH = 38;

/** Humidity (%) that raises heat risk when combined with high temperature */
export const HEAT_HUMIDITY_BOOSTER = 80;

/* ── Rain Risk Thresholds ──────────────────────────────── */

/** Precipitation probability (%) at or above which rain risk becomes Low */
export const RAIN_PRECIP_PROB_LOW = 20;

/** Precipitation probability (%) at or above which rain risk becomes Moderate */
export const RAIN_PRECIP_PROB_MODERATE = 40;

/** Precipitation probability (%) at or above which rain risk becomes High */
export const RAIN_PRECIP_PROB_HIGH = 60;

/** Rain amount (mm) at or above which rain risk becomes at least Moderate */
export const RAIN_AMOUNT_MODERATE = 1.0;

/* ── Air Quality Thresholds (Bangladesh-calibrated) ─────────
 *
 * WHO 2021 annual guideline values (5 µg/m³ PM2.5, 15 µg/m³ PM10)
 * are far below Bangladesh's typical ambient baseline. Using WHO
 * strict limits as High triggers "High Risk" on routine school days
 * and erodes trust in the tool.
 *
 * Thresholds below are calibrated to Bangladesh's national 24-hour
 * standards and WHO Interim Targets so that:
 *   Low      = mild, awareness-only signal
 *   Moderate = noticeable; school caution warranted
 *   High     = genuinely severe; clear action required
 * ─────────────────────────────────────────────────────────── */

/** PM2.5 (µg/m³) at or above which AQ risk becomes Low
 *  (slight elevation above clean-air baseline) */
export const AQ_PM25_LOW = 10;

/** PM2.5 (µg/m³) at or above which AQ risk becomes Moderate
 *  (≈ WHO IT-1 interim target; noticeably elevated) */
export const AQ_PM25_MODERATE = 25;

/** PM2.5 (µg/m³) at or above which AQ risk becomes High
 *  (above Bangladesh national 24h standard of 65 µg/m³;
 *   genuinely severe for school operations) */
export const AQ_PM25_HIGH = 75;

/** PM10 (µg/m³) at or above which AQ risk becomes Low */
export const AQ_PM10_LOW = 25;

/** PM10 (µg/m³) at or above which AQ risk becomes Moderate */
export const AQ_PM10_MODERATE = 50;

/** PM10 (µg/m³) at or above which AQ risk becomes High
 *  (≈ Bangladesh national PM10 24h standard of 150 µg/m³) */
export const AQ_PM10_HIGH = 150;

/* ── Cold Risk Thresholds ──────────────────────────────── */

/** Temperature (°C) at or below which cold risk becomes Low */
export const COLD_TEMP_LOW = 18;

/** Temperature (°C) at or below which cold risk becomes Moderate */
export const COLD_TEMP_MODERATE = 15;

/** Temperature (°C) at or below which cold risk becomes High */
export const COLD_TEMP_HIGH = 10;

/** Wind speed (km/h) that raises cold risk when combined with low temperature */
export const COLD_WIND_BOOSTER = 20;

/* ── Heavy Rain Risk Thresholds ─────────────────────────── */

/** Precipitation probability (%) required together with notable rain for Heavy Rain risk */
export const HEAVY_RAIN_PRECIP_PROB = 60;

/** 3-hour rain accumulation (mm) at or above which Heavy Rain risk becomes Low */
export const HEAVY_RAIN_AMOUNT_LOW = 5;

/** 3-hour rain accumulation (mm) at or above which Heavy Rain risk becomes Moderate
 *  (equivalent to a sustained ~5 mm/h rate over 3 hours) */
export const HEAVY_RAIN_AMOUNT_MODERATE = 15;

/** 3-hour rain accumulation (mm) at or above which Heavy Rain risk becomes High
 *  (equivalent to a sustained ~15 mm/h rate over 3 hours) */
export const HEAVY_RAIN_AMOUNT_HIGH = 45;

/* ── Flood Risk Thresholds ───────────────────────────────── */

/** Precipitation probability (%) required for flood risk assessment */
export const FLOOD_PRECIP_PROB = 70;

/** 6-hour rain accumulation (mm) at or above which Flood risk becomes Low */
export const FLOOD_RAIN_AMOUNT_LOW = 10;

/** 6-hour rain accumulation (mm) at or above which Flood risk becomes Moderate
 *  (indicating potential waterlogging conditions) */
export const FLOOD_RAIN_AMOUNT_MODERATE = 20;

/** 6-hour rain accumulation (mm) at or above which Flood risk becomes High */
export const FLOOD_RAIN_AMOUNT_HIGH = 40;

/* ── Storm / Cyclone Risk Thresholds ────────────────────── */

/** Wind speed (km/h) at or above which Storm risk becomes Low */
export const STORM_WIND_LOW = 20;

/** Wind speed (km/h) at or above which Storm risk becomes Moderate */
export const STORM_WIND_MODERATE = 40;

/** Wind speed (km/h) at or above which Storm risk becomes High (near gale/storm force) */
export const STORM_WIND_HIGH = 65;
