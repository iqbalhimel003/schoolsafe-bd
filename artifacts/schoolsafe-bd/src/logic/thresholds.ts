/* =========================================================
 * SchoolSafe BD — Risk Thresholds
 *
 * Bangladesh-calibrated per-risk thresholds for the 4-level
 * risk scale (None / Low / Moderate / High).
 *
 * The risk engine (logic/riskEngine.ts) reads these constants.
 * To adjust when risks trigger, change values here — no other
 * file needs changing.
 * ========================================================= */

/* ── Heat Risk Thresholds ──────────────────────────────── *
 * Uses the worse of actual temperature and feels-like       *
 * temperature. Each dimension has its own band boundaries.  */

export const HEAT_TEMP_LOW = 35.0;
export const HEAT_TEMP_MODERATE = 36.0;
export const HEAT_TEMP_HIGH = 38.0;

export const HEAT_FEELS_LOW = 38.0;
export const HEAT_FEELS_MODERATE = 41.0;
export const HEAT_FEELS_HIGH = 44.0;

/* ── Rain Risk Thresholds ──────────────────────────────── *
 * 5-input model: current prob, next-3h max prob, recent 3h *
 * rain, next 6h rain, and WMO weather code.                 */

export const RAIN_PROB_LOW = 40;
export const RAIN_PROB_MODERATE = 60;
export const RAIN_PROB_HIGH = 80;

export const RAIN_3H_LOW = 1;
export const RAIN_3H_MODERATE = 5;
export const RAIN_3H_HIGH = 15;

export const RAIN_NEXT6H_LOW = 2;
export const RAIN_NEXT6H_MODERATE = 10;
export const RAIN_NEXT6H_HIGH = 25;

/* ── Tomorrow Rain Prep Thresholds ─────────────────────── */

export const TOMORROW_RAIN_PROB_LOW = 40;
export const TOMORROW_RAIN_PROB_MODERATE = 60;
export const TOMORROW_RAIN_PROB_HIGH = 75;

export const TOMORROW_RAIN_AMT_LOW = 2;
export const TOMORROW_RAIN_AMT_MODERATE = 5;
export const TOMORROW_RAIN_AMT_HIGH = 10;

export const TOMORROW_UMBRELLA_PROB = 50;
export const TOMORROW_UMBRELLA_RAIN = 3;
export const TOMORROW_UMBRELLA_STRONG_PROB = 75;
export const TOMORROW_UMBRELLA_STRONG_RAIN = 10;

/* ── Air Quality Thresholds (Bangladesh-calibrated) ─────── *
 * PM2.5 and PM10 (µg/m³). Uses worst-of-two dimensions.    */

export const AQ_PM25_LOW = 25;
export const AQ_PM25_MODERATE = 55;
export const AQ_PM25_HIGH = 90;

export const AQ_PM10_LOW = 50;
export const AQ_PM10_MODERATE = 100;
export const AQ_PM10_HIGH = 150;

/* ── Cold Risk Thresholds ──────────────────────────────── *
 * Based on minimum temperature (°C).                        */

export const COLD_TEMP_LOW = 10;
export const COLD_TEMP_MODERATE = 8;
export const COLD_TEMP_HIGH = 6;

/* ── Heavy Rain Risk Thresholds ─────────────────────────── *
 * Uses 24-hour rain (mm) and 3-hour rain (mm).              */

export const HEAVY_RAIN_24H_LOW = 20;
export const HEAVY_RAIN_24H_MODERATE = 44;
export const HEAVY_RAIN_24H_HIGH = 89;

export const HEAVY_RAIN_3H_LOW = 15;
export const HEAVY_RAIN_3H_MODERATE = 30;
export const HEAVY_RAIN_3H_HIGH = 44;

/* ── Flood Risk Thresholds ───────────────────────────────── *
 * Uses 6-hour rain (mm) and 24-hour rain (mm).              */

export const FLOOD_6H_LOW = 30;
export const FLOOD_6H_MODERATE = 50;
export const FLOOD_6H_HIGH = 80;

export const FLOOD_24H_LOW = 50;
export const FLOOD_24H_MODERATE = 80;
export const FLOOD_24H_HIGH = 120;

/* ── Storm / Cyclone Risk Thresholds ────────────────────── *
 * Uses wind speed (km/h).                                    */

export const STORM_WIND_LOW = 30;
export const STORM_WIND_MODERATE = 40;
export const STORM_WIND_HIGH = 60;

/* ── Weighted Overall Aggregation ───────────────────────── *
 * Per-risk weights and score-to-level band boundaries.       */

export const WEIGHT_AIR_QUALITY = 0.75;
export const WEIGHT_RAIN = 0.75;
export const WEIGHT_HEAT = 1.0;
export const WEIGHT_COLD = 1.0;
export const WEIGHT_HEAVY_RAIN = 1.25;
export const WEIGHT_FLOOD = 1.5;
export const WEIGHT_STORM = 1.5;

export const OVERALL_LOW_MIN = 0.75;
export const OVERALL_MODERATE_MIN = 2.0;
export const OVERALL_HIGH_MIN = 4.25;
