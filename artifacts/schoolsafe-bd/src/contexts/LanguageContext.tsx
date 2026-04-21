/* =========================================================
 * SchoolSafe BD — Language Context
 *
 * Provides the current language ("en" | "bn") and a t()
 * translation helper to all components. Wrap the app with
 * <LanguageProvider> and consume with useLanguage().
 *
 * The t() function checks site settings overrides first
 * (keyed as `<key>_en` / `<key>_bn`), then falls back to
 * the built-in translations.
 * ========================================================= */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Language } from "@/types";
import en from "@/translations/en";
import bn from "@/translations/bn";
import type { TranslationKeys } from "@/translations/en";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

type Translations = typeof en;

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Translate a key to the current language, optionally interpolating {placeholder} tokens */
  t: (key: TranslationKeys, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const translations: Record<Language, Translations> = { en, bn };

function readInitialLang(): Language {
  if (typeof window === "undefined") return "en";
  const q = new URLSearchParams(window.location.search).get("lang");
  if (q === "bn" || q === "en") return q;
  const stored = window.localStorage.getItem("safeschool_lang");
  if (stored === "bn" || stored === "en") return stored;
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(readInitialLang);
  const { settings } = useSiteSettings();

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("safeschool_lang", next);
    } catch {
      /* ignore quota / private mode */
    }
    // Reflect language in the URL for shareable / canonical links.
    const url = new URL(window.location.href);
    if (next === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", next);
    }
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Keep <html lang> in sync as a fallback (Seo also handles this via Helmet).
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  function formatVar(value: string | number): string {
    if (typeof value === "number" && lang === "bn") {
      return new Intl.NumberFormat("bn-BD").format(value);
    }
    return String(value);
  }

  function t(key: TranslationKeys, vars?: Record<string, string | number>): string {
    const overrideKey = `${key}_${lang}`;
    let str: string = settings[overrideKey] !== undefined
      ? settings[overrideKey]
      : translations[lang][key] ?? translations["en"][key] ?? key;
    if (vars) {
      str = str.replace(/\{(\w+)\}/g, (_, k) =>
        k in vars ? formatVar(vars[k]) : `{${k}}`
      );
    }
    return str;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
