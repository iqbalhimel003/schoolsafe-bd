/* =========================================================
 * usePageTracking — fires a lightweight analytics event on
 * every route change. Completely anonymous. Never blocks UI.
 * ========================================================= */

import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

const API_BASE = `${import.meta.env.BASE_URL}api`;

function getOrCreateSessionId(): string {
  try {
    let id = localStorage.getItem("ssbd_session_id");
    if (!id) {
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("ssbd_session_id", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function usePageTracking(opts?: {
  district?: string | null;
  upazila?: string | null;
  lang?: string | null;
}) {
  const [location] = useLocation();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // Never track the admin panel itself
    if (location === "/admin" || location.startsWith("/admin/")) return;

    // StrictMode / remount dedupe: skip if we just tracked this path
    if (lastTracked.current === location) return;
    lastTracked.current = location;

    const sessionId = getOrCreateSessionId();
    fetch(`${API_BASE}/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: location || "/",
        sessionId,
        referrer: document.referrer || "",
        district: opts?.district ?? null,
        upazila: opts?.upazila ?? null,
        lang: opts?.lang ?? null,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
}
