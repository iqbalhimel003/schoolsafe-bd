/* =========================================================
 * SchoolSafe BD — Admin Auth Helper
 *
 * Checks admin credentials against DB first (if set),
 * then falls back to ADMIN_PASSWORD / ADMIN_USERNAME env vars.
 *
 * Username is sent via X-Admin-Username header.
 * Password is sent via Authorization: Bearer <password>.
 *
 * Security:
 *  - Stored DB passwords are bcrypt-hashed.
 *  - Legacy plain-text passwords auto-migrate to bcrypt on
 *    the first successful login (transparent to admin).
 *  - Brute-force protection is provided by `adminAuthLimiter`
 *    (express-rate-limit, IP-keyed, 15 min / 10 failed
 *    attempts → 429). Successful responses (status < 400)
 *    don't count against the limit, so legitimate admins are
 *    not penalised for one mistyped password.
 *  - Rate-limit key uses `req.ip`, which is derived through
 *    `app.set('trust proxy', 'loopback, linklocal, uniquelocal')`
 *    in `app.ts`. `X-Forwarded-For` is honoured only when the
 *    connection comes from a private/internal address (the
 *    Replit edge proxy), so external clients cannot spoof it
 *    to evade the limiter.
 * ========================================================= */

import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";
import { inArray } from "drizzle-orm";
import type { Request } from "express";
import rateLimit from "express-rate-limit";
import { timingSafeEqual } from "node:crypto";
import { comparePassword, hashPassword, isBcryptHash } from "./password";
import { logger } from "./logger";

/* Constant-time string compare.
 *
 * `timingSafeEqual` requires equal-length buffers, so we have to handle
 * length mismatch ourselves without leaking the comparison through an
 * early return. When lengths differ we still run a same-length dummy
 * compare against a zero buffer of `bufA.length` and discard the result,
 * then return false. That keeps per-call work proportional to the
 * SUBMITTED value's length only — never the stored value's length —
 * so the stored username's length cannot be inferred from response time. */
function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    // Discard result; only purpose is to keep timing flat.
    timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/* No default admin email/username is hardcoded. The effective
 * username is resolved from (in order): DB `admin_username`,
 * env `ADMIN_EMAIL`, env `ADMIN_USERNAME`. If none are set, the
 * username check is treated as "open" (only the password matters)
 * and `getCurrentUsername` returns an empty string. */
function envFallbackUsername(): string {
  return (
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.ADMIN_USERNAME?.trim() ||
    ""
  );
}

/* ── Brute-force limiter ─────────────────────────────────
 * 15-minute window, 10 failed attempts per IP. Successful
 * responses do not count, so a legitimate admin who mistypes
 * once is not punished. */
export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  // Only HTTP 401 (auth failure) counts toward the limit. Validation
  // errors, server errors, and successful requests are all treated as
  // "successful" so they don't accidentally lock out a real admin.
  requestWasSuccessful: (_req, res) => res.statusCode !== 401,
  handler: (_req, res, _next, options) => {
    const retryAfterSec = Math.ceil(options.windowMs / 1000);
    res.setHeader("Retry-After", String(retryAfterSec));
    res.status(options.statusCode ?? 429).json({
      error: "Too many failed attempts. Please try again later.",
      retryAfterSeconds: retryAfterSec,
    });
  },
});

/* ── Persist a freshly-hashed password back to DB ───────── */

async function persistHashedPassword(hash: string): Promise<void> {
  await db
    .insert(siteSettingsTable)
    .values({ key: "admin_password", value: hash })
    .onConflictDoUpdate({
      target: siteSettingsTable.key,
      set: { value: hash, updatedAt: new Date() },
    });
}

/* ── Main check ─────────────────────────────────────────── */

export async function checkAdminAuth(req: Request): Promise<boolean> {
  const token = (req.headers.authorization ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  const usernameHeader = ((req.headers["x-admin-username"] as string) ?? "").trim();

  const dbRows = await db
    .select()
    .from(siteSettingsTable)
    .where(inArray(siteSettingsTable.key, ["admin_username", "admin_password"]));

  const dbCreds: Record<string, string> = {};
  for (const r of dbRows) dbCreds[r.key] = r.value;

  const storedPasswordRaw = dbCreds["admin_password"] ?? "";
  const fallbackPassword = process.env.ADMIN_PASSWORD ?? "";
  const passwordSource: "db" | "env" | "none" = storedPasswordRaw
    ? "db"
    : fallbackPassword
    ? "env"
    : "none";
  const storedPassword = storedPasswordRaw || fallbackPassword;
  const storedUsername =
    dbCreds["admin_username"] ?? envFallbackUsername();

  if (!storedPassword || !token) return false;

  const passwordOk = await comparePassword(token, storedPassword);
  // Username check is "open" when:
  //  - the client didn't send a username header (backward compat), OR
  //  - no admin username is configured anywhere (DB or env).
  // Otherwise both must match (constant-time compare).
  const usernameOk =
    !usernameHeader ||
    !storedUsername ||
    timingSafeStringEqual(usernameHeader, storedUsername);

  if (!passwordOk || !usernameOk) return false;

  // Auto-migrate legacy plain-text DB password to bcrypt hash.
  if (passwordSource === "db" && !isBcryptHash(storedPassword)) {
    try {
      const hash = await hashPassword(token);
      await persistHashedPassword(hash);
      logger.info("Migrated legacy admin password to bcrypt hash");
    } catch (err) {
      logger.warn({ err }, "Failed to migrate admin password to bcrypt");
    }
  }

  return true;
}

export async function getCurrentUsername(): Promise<string> {
  const rows = await db
    .select()
    .from(siteSettingsTable)
    .where(inArray(siteSettingsTable.key, ["admin_username"]));
  return rows[0]?.value ?? envFallbackUsername();
}
