/* =========================================================
 * SchoolSafe BD — Site Settings Context
 *
 * Fetches content overrides from the API and provides them
 * to all components. The LanguageContext t() function checks
 * these overrides before falling back to built-in translations.
 * ========================================================= */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const API_BASE = `${import.meta.env.BASE_URL}api`;

interface SiteSettingsContextValue {
  settings: Record<string, string>;
  loading: boolean;
  reload: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: {},
  loading: true,
  reload: () => {},
});

export function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/settings`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Record<string, string>) => setSettings(data))
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, reload }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  return useContext(SiteSettingsContext);
}
