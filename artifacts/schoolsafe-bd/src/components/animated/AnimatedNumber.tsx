/* =========================================================
 * SchoolSafe BD — Animated Number Counter
 *
 * Counts a numeric value up from 0 (or from its previous
 * value) when it enters the viewport. Honors prefers-
 * reduced-motion: those users see the final value rendered
 * immediately with no animation.
 * ========================================================= */

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface Props {
  value: number;
  /** Number of digits after the decimal point. */
  decimals?: number;
  /** Locale for formatting (digits grouping, Bengali numerals, etc.). */
  locale?: string;
  /** Suffix appended after the number (e.g. "°C", " mm", "%"). */
  suffix?: string;
  className?: string;
  /** Animation duration in ms. */
  durationMs?: number;
}

export default function AnimatedNumber({
  value,
  decimals = 0,
  locale,
  suffix = "",
  className,
  durationMs = 900,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [display, setDisplay] = useState(reduce ? value : 0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!inView || startedRef.current) return;
    startedRef.current = true;

    const start = performance.now();
    const from = 0;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      /* easeOutCubic */
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, durationMs, reduce]);

  /* When the upstream value changes after the initial reveal, snap
   * to the new value instead of re-animating from 0. */
  useEffect(() => {
    if (startedRef.current) setDisplay(value);
  }, [value]);

  const formatted = display.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}
