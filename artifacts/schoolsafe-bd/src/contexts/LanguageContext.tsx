/* =========================================================
 * SchoolSafe BD — Language Context
 *
 * Provides the current language ("en" | "bn") and a t()
 * translation helper to all components. Wrap the app with
 * <LanguageProvider> and consume with useLanguage().
 * ========================================================= */

import React, { createContext, useContext, useState } from "react";
import type { Language } from "@/types";
import en from "@/translations/en";
import bn from "@/translations/bn";
import type { TranslationKeys } from "@/translations/en";

type Translations = typeof en;

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Translate a key to the current language */
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const translations: Record<Language, Translations> = { en, bn };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  function t(key: TranslationKeys): string {
    return translations[lang][key] ?? translations["en"][key] ?? key;
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
