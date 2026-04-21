/* =========================================================
 * SchoolSafe BD — Hero Section (Premium)
 *
 * Aurora gradient background, word-by-word headline entrance,
 * feature chips, CTA button, animated icon cluster, and a
 * quiet prototype notice. Honors prefers-reduced-motion.
 * ========================================================= */

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedWeatherIcon from "@/components/animated/AnimatedWeatherIcon";

const CHIPS = [
  { keyName: "heroFeature1" as const, icon: "🛡", delay: 0.0 },
  { keyName: "heroFeature2" as const, icon: "📡", delay: 0.08 },
  { keyName: "heroFeature3" as const, icon: "🌐", delay: 0.16 },
] as const;

function scrollToLocation() {
  const el = document.getElementById("location-selector");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Hero() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();

  const headline = t("siteName");
  const words = headline.split(" ");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.05 },
    },
  };
  const wordVariants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-10 sm:pt-14 sm:pb-12 px-4">
      {/* Layered gradient backdrop */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, hsl(162 60% 96%) 0%, hsl(201 90% 97%) 55%, hsl(0 0% 100%) 100%)",
        }}
      />
      {/* Animated aurora blobs */}
      <div className="aurora -z-10" aria-hidden="true">
        <div className="aurora-c" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Text-first on mobile, side-by-side on desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">

          {/* ── Text column ─────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              {CHIPS.map(({ keyName, icon, delay }) => (
                <motion.span
                  key={keyName}
                  initial={{ opacity: 0, y: reduce ? 0 : -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: reduce ? 0 : delay, ease: "easeOut" }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/70 backdrop-blur px-3 py-1 text-xs font-semibold text-primary shadow-sm select-none"
                >
                  <span aria-hidden="true">{icon}</span>
                  <span>{t(keyName)}</span>
                </motion.span>
              ))}
            </div>

            {/* Animated headline */}
            <motion.h1
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-3xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight bg-gradient-to-br from-foreground via-primary to-accent bg-clip-text text-transparent"
            >
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  variants={wordVariants}
                  className="inline-block mr-[0.25em]"
                >
                  {w}
                </motion.span>
              ))}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduce ? 0 : 0.45, ease: "easeOut" }}
              className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl"
            >
              {t("siteDescription")}
            </motion.p>

            {/* CTA button */}
            <motion.button
              type="button"
              onClick={scrollToLocation}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduce ? 0 : 0.55, ease: "easeOut" }}
              className="
                mt-6 inline-flex items-center gap-2
                rounded-full bg-primary text-primary-foreground
                px-6 py-2.5 text-sm font-semibold
                shadow-md hover:shadow-lg
                btn-shine lift-on-hover
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60
                transition-colors
              "
            >
              {t("heroCtaLabel")}
              <span aria-hidden="true" className="text-base leading-none">→</span>
            </motion.button>

            {/* Prototype notice — quiet */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: reduce ? 0 : 0.75 }}
              className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground max-w-lg"
            >
              <span className="shrink-0 mt-px" aria-hidden="true">ℹ️</span>
              <span>{t("prototypeNotice")}</span>
            </motion.p>
          </div>

          {/* ── Animated icon cluster ────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="shrink-0 mx-auto sm:mx-0"
            aria-hidden="true"
          >
            <div className="relative h-32 w-32 sm:h-40 sm:w-40">
              {/* Soft halo ring behind the cluster */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at center, hsl(162 60% 75% / .55), transparent 65%)",
                  filter: "blur(8px)",
                }}
              />
              <div className="absolute inset-2 rounded-full bg-white/70 backdrop-blur shadow-lg border border-white/70 flex items-center justify-center">
                <AnimatedWeatherIcon kind="sun" size={88} />
              </div>
              {/* Floating mini-icons */}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={reduce ? undefined : { y: [0, -4, 0] }}
                transition={reduce ? undefined : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <AnimatedWeatherIcon kind="cloud" size={36} />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-2"
                animate={reduce ? undefined : { y: [0, 4, 0] }}
                transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              >
                <AnimatedWeatherIcon kind="leaf" size={34} />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 right-0"
                animate={reduce ? undefined : { y: [0, -3, 0] }}
                transition={reduce ? undefined : { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              >
                <AnimatedWeatherIcon kind="humidity" size={28} />
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
