/* =========================================================
 * SchoolSafe BD — App Root
 *
 * Sets up routing, language context, and global providers.
 * ========================================================= */

import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";

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
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-lg">Page not found.</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <div className="flex-1">
              <Router />
            </div>
            <Footer />
            <Toaster position="bottom-center" richColors />
          </div>
        </WouterRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
