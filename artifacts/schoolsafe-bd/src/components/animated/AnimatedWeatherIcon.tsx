/* =========================================================
 * SchoolSafe BD — Animated Weather / Risk Icon Set
 *
 * A small library of custom SVG icons that loop subtly using
 * Framer Motion. Used in Hero, Dashboard, Tomorrow, Weekly,
 * and Comparison sections to replace static emoji where it
 * meaningfully improves clarity and feel.
 *
 * All animations honor prefers-reduced-motion via the
 * useReducedMotion() hook from framer-motion: when reduced
 * motion is requested, the icon renders statically.
 * ========================================================= */

import { motion, useReducedMotion, type Transition } from "framer-motion";
import { useId } from "react";

export type AnimatedIconKind =
  | "sun"
  | "partlyCloudy"
  | "cloud"
  | "fog"
  | "rain"
  | "heavyRain"
  | "storm"
  | "snow"
  | "wind"
  | "thermometerHot"
  | "thermometerCold"
  | "humidity"
  | "uv"
  | "visibility"
  | "mask"
  | "flood"
  | "leaf"
  | "calendar"
  | "umbrella";

interface Props {
  kind: AnimatedIconKind;
  size?: number;
  className?: string;
  /** Extra label for screen readers. Icons are decorative by default. */
  title?: string;
}

/* ── Shared looping transitions ─────────────────────────── */
const loopSlow: Transition = { duration: 4, repeat: Infinity, ease: "easeInOut" };
const loopMed: Transition  = { duration: 2.4, repeat: Infinity, ease: "easeInOut" };
const loopFast: Transition = { duration: 1.4, repeat: Infinity, ease: "easeInOut" };
const spin: Transition     = { duration: 14, repeat: Infinity, ease: "linear" };

/* Map a WMO code to an animated icon kind. */
export function weatherCodeToIconKind(code: number): AnimatedIconKind {
  if (code === 0) return "sun";
  if (code <= 3) return "partlyCloudy";
  if (code <= 49) return "fog";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "heavyRain";
  if (code <= 99) return "storm";
  return "partlyCloudy";
}

export default function AnimatedWeatherIcon({
  kind,
  size = 32,
  className,
  title,
}: Props) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/[:]/g, "");
  const sunCoreId = `sunCore-${uid}`;
  const cloudFillId = `cloudFill-${uid}`;
  const dropFillId = `dropFill-${uid}`;
  const leafFillId = `leafFill-${uid}`;

  const props = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    className,
    role: title ? "img" : undefined,
    "aria-hidden": title ? undefined : true,
    "aria-label": title,
    fill: "none" as const,
  };

  switch (kind) {
    /* ── Sun: rotating rays + pulsing core ───────────── */
    case "sun":
      return (
        <svg {...props}>
          <motion.g
            style={{ transformOrigin: "24px 24px" }}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={reduce ? undefined : spin}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1="24" y1="4" x2="24" y2="10"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${i * 45} 24 24)`}
              />
            ))}
          </motion.g>
          <motion.circle
            cx="24" cy="24" r="8"
            fill={`url(#${sunCoreId})`}
            animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
            transition={reduce ? undefined : loopMed}
            style={{ transformOrigin: "24px 24px" }}
          />
          <defs>
            <radialGradient id={sunCoreId}>
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>
        </svg>
      );

    /* ── Partly cloudy: drifting cloud over sun ──────── */
    case "partlyCloudy":
      return (
        <svg {...props}>
          <circle cx="18" cy="18" r="7" fill="#fbbf24" />
          <motion.g
            animate={reduce ? undefined : { x: [0, 2, 0] }}
            transition={reduce ? undefined : { ...loopSlow, duration: 5 }}
          >
            <path
              d="M14 32 Q14 26 20 26 Q22 22 27 23 Q33 22 35 28 Q40 28 40 33 Q40 38 35 38 L18 38 Q14 38 14 32Z"
              fill="#cbd5e1"
              stroke="#94a3b8"
              strokeWidth="1"
            />
          </motion.g>
        </svg>
      );

    /* ── Cloud only ──────────────────────────────────── */
    case "cloud":
      return (
        <svg {...props}>
          <motion.path
            d="M10 30 Q10 22 18 22 Q21 17 27 18 Q35 17 38 25 Q44 25 44 31 Q44 37 38 37 L15 37 Q10 37 10 30Z"
            fill={`url(#${cloudFillId})`}
            stroke="#94a3b8"
            strokeWidth="1"
            animate={reduce ? undefined : { x: [0, 2, 0] }}
            transition={reduce ? undefined : loopSlow}
          />
          <defs>
            <linearGradient id={cloudFillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
        </svg>
      );

    /* ── Fog: drifting horizontal lines ──────────────── */
    case "fog":
      return (
        <svg {...props}>
          {[16, 22, 28, 34].map((y, i) => (
            <motion.line
              key={y}
              x1="6" y1={y} x2="42" y2={y}
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={reduce ? undefined : { x: [0, 4, 0] }}
              transition={reduce ? undefined : { ...loopSlow, delay: i * 0.3 }}
            />
          ))}
        </svg>
      );

    /* ── Rain: cloud + falling drops ─────────────────── */
    case "rain":
      return (
        <svg {...props}>
          <path
            d="M10 22 Q10 15 18 15 Q21 10 27 11 Q35 10 38 18 Q44 18 44 24 Q44 30 38 30 L15 30 Q10 30 10 22Z"
            fill="#94a3b8"
          />
          {[14, 22, 30].map((x, i) => (
            <motion.line
              key={x}
              x1={x} y1="32" x2={x - 2} y2="40"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={reduce ? undefined : { y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
              transition={reduce ? undefined : { ...loopFast, delay: i * 0.2 }}
            />
          ))}
        </svg>
      );

    /* ── Heavy rain: more drops, faster ──────────────── */
    case "heavyRain":
      return (
        <svg {...props}>
          <path
            d="M8 20 Q8 12 17 12 Q21 7 28 8 Q37 7 40 16 Q46 16 46 22 Q46 28 40 28 L13 28 Q8 28 8 20Z"
            fill="#64748b"
          />
          {[12, 18, 24, 30, 36].map((x, i) => (
            <motion.line
              key={x}
              x1={x} y1="30" x2={x - 3} y2="42"
              stroke="#1d4ed8"
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={reduce ? undefined : { y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
              transition={reduce ? undefined : { ...loopFast, duration: 1, delay: i * 0.15 }}
            />
          ))}
        </svg>
      );

    /* ── Storm: cloud + lightning bolt + drops ───────── */
    case "storm":
      return (
        <svg {...props}>
          <path
            d="M8 18 Q8 10 17 10 Q21 5 28 6 Q37 5 40 14 Q46 14 46 20 Q46 26 40 26 L13 26 Q8 26 8 18Z"
            fill="#475569"
          />
          <motion.path
            d="M24 26 L18 38 L23 38 L20 46 L30 32 L25 32 L28 26 Z"
            fill="#fbbf24"
            stroke="#d97706"
            strokeWidth="0.6"
            animate={reduce ? undefined : { opacity: [1, 0.3, 1, 0.5, 1] }}
            transition={reduce ? undefined : { duration: 1.6, repeat: Infinity }}
          />
          {[12, 36].map((x, i) => (
            <motion.line
              key={x}
              x1={x} y1="28" x2={x - 2} y2="36"
              stroke="#1d4ed8"
              strokeWidth="2"
              strokeLinecap="round"
              animate={reduce ? undefined : { y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
              transition={reduce ? undefined : { ...loopFast, delay: i * 0.25 }}
            />
          ))}
        </svg>
      );

    /* ── Snow ────────────────────────────────────────── */
    case "snow":
      return (
        <svg {...props}>
          <path
            d="M10 22 Q10 15 18 15 Q21 10 27 11 Q35 10 38 18 Q44 18 44 24 Q44 30 38 30 L15 30 Q10 30 10 22Z"
            fill="#cbd5e1"
          />
          {[14, 24, 34].map((x, i) => (
            <motion.text
              key={x}
              x={x} y="40"
              fontSize="9"
              fill="#3b82f6"
              animate={reduce ? undefined : { y: [38, 42, 38], opacity: [0.5, 1, 0.5] }}
              transition={reduce ? undefined : { ...loopMed, delay: i * 0.3 }}
            >
              ❄
            </motion.text>
          ))}
        </svg>
      );

    /* ── Wind: drifting horizontal curves ────────────── */
    case "wind":
      return (
        <svg {...props}>
          {[
            { d: "M6 16 H30 Q36 16 36 22 Q36 26 32 26", delay: 0 },
            { d: "M6 26 H22 Q28 26 28 32 Q28 36 24 36", delay: 0.3 },
            { d: "M6 36 H34", delay: 0.6 },
          ].map((p, i) => (
            <motion.path
              key={i}
              d={p.d}
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={reduce ? undefined : { x: [-2, 4, -2] }}
              transition={reduce ? undefined : { ...loopMed, delay: p.delay }}
            />
          ))}
        </svg>
      );

    /* ── Thermometer (hot): mercury rises ────────────── */
    case "thermometerHot":
      return (
        <svg {...props}>
          <rect x="20" y="6" width="8" height="28" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
          <motion.rect
            x="22" y="14" width="4" rx="2"
            fill="#dc2626"
            animate={reduce ? undefined : { height: [16, 20, 16], y: [14, 10, 14] }}
            transition={reduce ? undefined : loopMed}
          />
          <circle cx="24" cy="38" r="6" fill="#dc2626" />
        </svg>
      );

    /* ── Thermometer (cold): mercury low + snowflakes ── */
    case "thermometerCold":
      return (
        <svg {...props}>
          <rect x="20" y="6" width="8" height="28" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
          <motion.rect
            x="22" y="26" width="4" height="8" rx="2"
            fill="#2563eb"
            animate={reduce ? undefined : { height: [8, 6, 8], y: [26, 28, 26] }}
            transition={reduce ? undefined : loopMed}
          />
          <circle cx="24" cy="38" r="6" fill="#2563eb" />
        </svg>
      );

    /* ── Humidity drop ───────────────────────────────── */
    case "humidity":
      return (
        <svg {...props}>
          <motion.path
            d="M24 6 C30 16 36 22 36 30 C36 37 30 42 24 42 C18 42 12 37 12 30 C12 22 18 16 24 6Z"
            fill={`url(#${dropFillId})`}
            stroke="#0284c7"
            strokeWidth="1"
            animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
            transition={reduce ? undefined : loopMed}
            style={{ transformOrigin: "24px 30px" }}
          />
          <defs>
            <linearGradient id={dropFillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>
      );

    /* ── UV: sun with intensity halo ─────────────────── */
    case "uv":
      return (
        <svg {...props}>
          <motion.circle
            cx="24" cy="24" r="14"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="3 4"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={reduce ? undefined : spin}
            style={{ transformOrigin: "24px 24px" }}
          />
          <circle cx="24" cy="24" r="7" fill="#f59e0b" />
          <text x="24" y="28" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">UV</text>
        </svg>
      );

    /* ── Visibility / eye ────────────────────────────── */
    case "visibility":
      return (
        <svg {...props}>
          <path
            d="M4 24 Q14 12 24 12 Q34 12 44 24 Q34 36 24 36 Q14 36 4 24Z"
            fill="none"
            stroke="#0f766e"
            strokeWidth="2"
          />
          <motion.circle
            cx="24" cy="24" r="6"
            fill="#0d9488"
            animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
            transition={reduce ? undefined : loopMed}
            style={{ transformOrigin: "24px 24px" }}
          />
          <circle cx="24" cy="24" r="2.5" fill="#fff" />
        </svg>
      );

    /* ── Mask (PM2.5) ────────────────────────────────── */
    case "mask":
      return (
        <svg {...props}>
          <path
            d="M8 20 Q12 16 24 16 Q36 16 40 20 L40 30 Q36 36 24 36 Q12 36 8 30Z"
            fill="#e2e8f0"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <line x1="6" y1="22" x2="10" y2="22" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="6" y1="30" x2="10" y2="30" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="38" y1="22" x2="42" y2="22" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="38" y1="30" x2="42" y2="30" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          {[16, 24, 32].map((x, i) => (
            <motion.circle
              key={x}
              cx={x} cy="42" r="1.4"
              fill="#94a3b8"
              animate={reduce ? undefined : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={reduce ? undefined : { ...loopMed, delay: i * 0.25 }}
            />
          ))}
        </svg>
      );

    /* ── Flood: cloud + rising waves ─────────────────── */
    case "flood":
      return (
        <svg {...props}>
          <path
            d="M10 16 Q10 10 18 10 Q21 6 27 7 Q34 6 36 13 Q42 13 42 18 Q42 23 36 23 L15 23 Q10 23 10 16Z"
            fill="#94a3b8"
          />
          {[28, 34, 40].map((y, i) => (
            <motion.path
              key={y}
              d={`M2 ${y} Q12 ${y - 3} 24 ${y} T46 ${y}`}
              stroke="#0284c7"
              strokeWidth="2"
              fill="none"
              animate={reduce ? undefined : { x: [0, 3, 0] }}
              transition={reduce ? undefined : { ...loopSlow, delay: i * 0.4 }}
            />
          ))}
        </svg>
      );

    /* ── Leaf (brand mark) ───────────────────────────── */
    case "leaf":
      return (
        <svg {...props}>
          <motion.path
            d="M8 40 Q8 12 40 8 Q42 32 16 40 Q12 41 8 40Z"
            fill={`url(#${leafFillId})`}
            stroke="#15803d"
            strokeWidth="1"
            animate={reduce ? undefined : { rotate: [-3, 3, -3] }}
            transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "24px 24px" }}
          />
          <path d="M10 38 Q22 26 38 12" stroke="#166534" strokeWidth="1" fill="none" />
          <defs>
            <linearGradient id={leafFillId} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>
      );

    /* ── Calendar ────────────────────────────────────── */
    case "calendar":
      return (
        <svg {...props}>
          <rect x="6" y="10" width="36" height="32" rx="4" fill="#fff" stroke="#0f766e" strokeWidth="2" />
          <rect x="6" y="10" width="36" height="9" rx="4" fill="#0d9488" />
          <line x1="14" y1="6" x2="14" y2="14" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="6" x2="34" y2="14" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" />
          <motion.circle
            cx="24" cy="30" r="4"
            fill="#0d9488"
            animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
            transition={reduce ? undefined : loopMed}
            style={{ transformOrigin: "24px 30px" }}
          />
        </svg>
      );

    /* ── Umbrella ────────────────────────────────────── */
    case "umbrella":
      return (
        <svg {...props}>
          <path d="M6 24 Q24 4 42 24 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          <path d="M24 24 V40 Q24 44 28 44" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
          <motion.line
            x1="36" y1="28" x2="33" y2="38"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            animate={reduce ? undefined : { y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
            transition={reduce ? undefined : loopFast}
          />
        </svg>
      );

    default:
      return null;
  }
}
