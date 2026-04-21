/* =========================================================
 * SchoolSafe BD — Hero Section (Premium)
 *
 * Aurora gradient background, word-by-word headline entrance,
 * animated weather/leaf icon cluster, and a polished prototype
 * notice pill. Honors prefers-reduced-motion: animations are
 * suppressed for users with that preference.
 * ========================================================= */

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedWeatherIcon from "@/components/animated/AnimatedWeatherIcon";

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
        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-6 sm:gap-8">
          <div className="flex-1 min-w-0">
            {/* Brand pill */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 mb-4 rounded-full border border-primary/25 bg-white/70 backdrop-blur px-3 py-1 text-xs font-semibold text-primary shadow-sm"
            >
              <AnimatedWeatherIcon kind="leaf" size={16} />
              <span>{t("siteTagline")}</span>
            </motion.div>

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

            {/* Prototype notice pill */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduce ? 0 : 0.6, ease: "easeOut" }}
              className="mt-6 inline-flex items-start gap-2 rounded-full border border-amber-300/70 bg-amber-50/85 backdrop-blur px-4 py-2 text-sm text-amber-900 shadow-sm"
            >
              <span className="shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
              <span className="leading-snug">{t("prototypeNotice")}</span>
            </motion.div>
          </div>

          {/* Animated icon cluster */}
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
