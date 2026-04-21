/* =========================================================
 * SchoolSafe BD — Scroll Reveal Wrapper
 *
 * Fades + slides children into view when scrolled to.
 * Honors `prefers-reduced-motion` via framer-motion's
 * useReducedMotion(): reduced-motion users see the content
 * statically with no animation.
 * ========================================================= */

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Delay before this element starts animating (seconds). */
  delay?: number;
  /** Pixels to translate from on entry. */
  y?: number;
  className?: string;
  /** Use as="div" by default; set to "section" etc. when needed. */
  as?: "div" | "section" | "header" | "article";
}

export default function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = "div",
}: Props) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    visible: { opacity: 1, y: 0 },
  };

  const MOTION_TAGS = {
    div: motion.div,
    section: motion.section,
    header: motion.header,
    article: motion.article,
  } as const;
  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      className={className}
      initial={reduce ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reduce ? 0 : 0.55,
        ease: "easeOut",
        delay: reduce ? 0 : delay,
      }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
