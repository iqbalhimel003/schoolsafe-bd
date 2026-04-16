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

/** Temperature (°C) at or above which heat risk becomes Moderate */
export const HEAT_TEMP_MODERATE = 32;

/** Temperature (°C) at or above which heat risk becomes High */
export const HEAT_TEMP_HIGH = 35;

/** Apparent/feels-like temperature (°C) at or above which heat risk becomes High */
export const HEAT_APPARENT_TEMP_HIGH = 38;

/** Humidity (%) that raises heat risk when combined with high temperature */
export const HEAT_HUMIDITY_BOOSTER = 80;

/* ── Rain Risk Thresholds ──────────────────────────────── */

/** Precipitation probability (%) at or above which rain risk becomes Moderate */
export const RAIN_PRECIP_PROB_MODERATE = 40;

/** Precipitation probability (%) at or above which rain risk becomes High */
export const RAIN_PRECIP_PROB_HIGH = 60;

/** Rain amount (mm) at or above which rain risk becomes at least Moderate */
export const RAIN_AMOUNT_MODERATE = 1.0;

/* ── Air Quality Thresholds (WHO-based) ─────────────────── */

/** PM2.5 (µg/m³) at or above which AQ risk becomes Moderate */
export const AQ_PM25_MODERATE = 15;

/** PM2.5 (µg/m³) at or above which AQ risk becomes High */
export const AQ_PM25_HIGH = 35;

/** PM10 (µg/m³) at or above which AQ risk becomes Moderate */
export const AQ_PM10_MODERATE = 45;

/** PM10 (µg/m³) at or above which AQ risk becomes High */
export const AQ_PM10_HIGH = 100;

/* ── Cold Risk Thresholds ──────────────────────────────── */

/** Temperature (°C) at or below which cold risk becomes Moderate */
export const COLD_TEMP_MODERATE = 15;

/** Temperature (°C) at or below which cold risk becomes High */
export const COLD_TEMP_HIGH = 10;

/** Wind speed (km/h) that raises cold risk when combined with low temperature */
export const COLD_WIND_BOOSTER = 20;

/* ── Heavy Rain Risk Thresholds ─────────────────────────── */

/** Precipitation probability (%) required together with notable rain for Heavy Rain risk */
export const HEAVY_RAIN_PRECIP_PROB = 60;

/** Rain amount (mm/h) at or above which Heavy Rain risk becomes Moderate */
export const HEAVY_RAIN_AMOUNT_MODERATE = 5;

/** Rain amount (mm/h) at or above which Heavy Rain risk becomes High */
export const HEAVY_RAIN_AMOUNT_HIGH = 15;

/* ── Flood Risk Thresholds ───────────────────────────────── */

/** Precipitation probability (%) required for flood risk assessment */
export const FLOOD_PRECIP_PROB = 70;

/** Rain amount (mm/h) at or above which Flood risk becomes Moderate
 *  (indicating potential waterlogging conditions) */
export const FLOOD_RAIN_AMOUNT_MODERATE = 20;

/** Rain amount (mm/h) at or above which Flood risk becomes High */
export const FLOOD_RAIN_AMOUNT_HIGH = 40;

/* ── Storm / Cyclone Risk Thresholds ────────────────────── */

/** Wind speed (km/h) at or above which Storm risk becomes Moderate */
export const STORM_WIND_MODERATE = 40;

/** Wind speed (km/h) at or above which Storm risk becomes High (near gale/storm force) */
export const STORM_WIND_HIGH = 65;
