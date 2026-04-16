import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import express from "express";
import { db } from "@workspace/db";
import { visitorLogsTable } from "@workspace/db/schema";
import { desc, sql, count, countDistinct, gte, isNotNull } from "drizzle-orm";
import { UAParser } from "ua-parser-js";

const router: IRouter = Router();

/* ── Simple in-memory rate limiter ───────────────────────
 * Per-IP sliding window. Prevents flooding /track endpoint.
 * Cap: 60 requests per 60s per IP.
 * ────────────────────────────────────────────────────── */

const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 60;
const rateBuckets = new Map<string, number[]>();

function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = extractIp(req) || "unknown";
  const now = Date.now();
  const arr = rateBuckets.get(key) ?? [];
  const recent = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    res.status(429).json({ error: "Too many requests" });
    return;
  }
  recent.push(now);
  rateBuckets.set(key, recent);
  // Occasional cleanup to prevent unbounded growth
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) rateBuckets.delete(k);
    }
  }
  next();
}

/* ── Helpers ──────────────────────────────────────────── */

function maskIp(ip: string | undefined): string {
  if (!ip) return "unknown";
  const v4 = ip.match(/^::ffff:(\d+\.\d+\.\d+)\.\d+$/);
  if (v4) return v4[1] + ".x";
  const v4plain = ip.match(/^(\d+\.\d+\.\d+)\.\d+$/);
  if (v4plain) return v4plain[1] + ".x";
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + ":x:x:x:x:x";
  }
  return "unknown";
}

function extractIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? "";
}

function classifyDevice(uaResult: ReturnType<UAParser["getResult"]>): string {
  const dt = uaResult.device.type;
  if (dt === "mobile") return "mobile";
  if (dt === "tablet") return "tablet";
  if (dt === "smarttv" || dt === "console" || dt === "wearable") return dt;
  return "desktop";
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || token !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

function truncate(s: unknown, max: number): string | null {
  if (typeof s !== "string") return null;
  const t = s.slice(0, max);
  return t.length ? t : null;
}

/* ── Public: POST /api/analytics/track ────────────────── */

router.post("/analytics/track", rateLimit, express.json({ limit: "4kb" }), async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    if (!body || typeof body !== "object") {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const page = typeof body.page === "string" && body.page.length ? body.page.slice(0, 500) : "/";
    const sessionId = typeof body.sessionId === "string" && body.sessionId.length
      ? body.sessionId.slice(0, 64)
      : "anon";
    const userAgent = typeof body.userAgent === "string" ? body.userAgent : "";

    const ua = new UAParser(userAgent).getResult();
    const browser = ua.browser.name ? `${ua.browser.name}${ua.browser.version ? " " + ua.browser.version.split(".")[0] : ""}` : null;
    const os = ua.os.name ? `${ua.os.name}${ua.os.version ? " " + ua.os.version : ""}` : null;
    const deviceType = classifyDevice(ua);

    const ipMasked = maskIp(extractIp(req));

    await db.insert(visitorLogsTable).values({
      sessionId,
      page,
      ipMasked,
      browser: browser ? browser.slice(0, 100) : null,
      os: os ? os.slice(0, 100) : null,
      deviceType,
      referrer: truncate(body.referrer, 500),
      district: truncate(body.district, 100),
      upazila: truncate(body.upazila, 100),
      lang: truncate(body.lang, 10),
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to track visit" });
  }
});

/* ── Admin: GET /api/analytics/summary ────────────────── */

router.get("/analytics/summary", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [[totalRow], [todayRow], [last7Row], [last30Row], [uniqueRow]] = await Promise.all([
      db.select({ c: count() }).from(visitorLogsTable),
      db.select({ c: count() }).from(visitorLogsTable).where(gte(visitorLogsTable.visitedAt, startOfToday)),
      db.select({ c: count() }).from(visitorLogsTable).where(gte(visitorLogsTable.visitedAt, sevenDaysAgo)),
      db.select({ c: count() }).from(visitorLogsTable).where(gte(visitorLogsTable.visitedAt, thirtyDaysAgo)),
      db.select({ c: countDistinct(visitorLogsTable.sessionId) }).from(visitorLogsTable),
    ]);

    res.json({
      total: totalRow?.c ?? 0,
      today: todayRow?.c ?? 0,
      last7days: last7Row?.c ?? 0,
      last30days: last30Row?.c ?? 0,
      uniqueSessions: uniqueRow?.c ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to compute summary" });
  }
});

/* ── Admin: GET /api/analytics/recent ─────────────────── */

router.get("/analytics/recent", requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const rows = await db
      .select()
      .from(visitorLogsTable)
      .orderBy(desc(visitorLogsTable.visitedAt))
      .limit(limit)
      .offset(offset);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent visits" });
  }
});

/* ── Admin: GET /api/analytics/top-pages ──────────────── */

router.get("/analytics/top-pages", requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const rows = await db
      .select({ page: visitorLogsTable.page, count: count() })
      .from(visitorLogsTable)
      .groupBy(visitorLogsTable.page)
      .orderBy(desc(count()))
      .limit(limit);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top pages" });
  }
});

/* ── Admin: GET /api/analytics/top-districts ──────────── */

router.get("/analytics/top-districts", requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const rows = await db
      .select({ district: visitorLogsTable.district, count: count() })
      .from(visitorLogsTable)
      .where(isNotNull(visitorLogsTable.district))
      .groupBy(visitorLogsTable.district)
      .orderBy(desc(count()))
      .limit(limit);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top districts" });
  }
});

/* ── Admin: GET /api/analytics/top-upazilas ───────────── */

router.get("/analytics/top-upazilas", requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const rows = await db
      .select({ upazila: visitorLogsTable.upazila, count: count() })
      .from(visitorLogsTable)
      .where(isNotNull(visitorLogsTable.upazila))
      .groupBy(visitorLogsTable.upazila)
      .orderBy(desc(count()))
      .limit(limit);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top upazilas" });
  }
});

/* ── Admin: GET /api/analytics/by-device ──────────────── */

router.get("/analytics/by-device", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select({ deviceType: visitorLogsTable.deviceType, count: count() })
      .from(visitorLogsTable)
      .groupBy(visitorLogsTable.deviceType)
      .orderBy(desc(count()));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch device breakdown" });
  }
});

/* ── Admin: GET /api/analytics/daily?days=30 ──────────── */

router.get("/analytics/daily", requireAdmin, async (req: Request, res: Response) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const rows = await db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${visitorLogsTable.visitedAt}), 'YYYY-MM-DD')`,
        count: count(),
      })
      .from(visitorLogsTable)
      .where(gte(visitorLogsTable.visitedAt, since))
      .groupBy(sql`date_trunc('day', ${visitorLogsTable.visitedAt})`)
      .orderBy(sql`date_trunc('day', ${visitorLogsTable.visitedAt})`);

    // Fill missing days with 0
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.date, r.count);
    const out: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({ date: key, count: map.get(key) ?? 0 });
    }
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch daily visits" });
  }
});

export default router;
