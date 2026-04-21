/* =========================================================
 * SchoolSafe BD — App Root
 *
 * Sets up routing, language context, and global providers.
 * ========================================================= */

import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import Home from "@/pages/Home";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageTracking } from "@/hooks/usePageTracking";

const AdminPage = lazy(() => import("@/pages/Admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /* Refetch environmental data every 10 minutes */
      staleTime: 1000 * 60 * 10,
      retry: 2,
    },
  },
});

function NotFound() {
  const { t } = useLanguage();
  return (
    <>
      <Seo
        title={t("seoNotFoundTitle")}
        description={t("seoNotFoundDescription")}
        pathname="/404"
        noindex
      />
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-lg">{t("seoNotFoundTitle")}</p>
      </div>
    </>
  );
}

function AppShell() {
  const [location] = useLocation();
  const isAdmin = location === "/admin";

  usePageTracking();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAdmin && <Header />}
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/admin">
            {() => (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground text-sm">Loading…</span></div>}>
                <AdminPage />
              </Suspense>
            )}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </div>
      {!isAdmin && <Footer />}
      <Toaster position="bottom-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <SiteSettingsProvider>
          <LanguageProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppShell />
            </WouterRouter>
          </LanguageProvider>
        </SiteSettingsProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
