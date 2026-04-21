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
import { siteSettingsTable, adminSessionsTable } from "@workspace/db/schema";
import { inArray, eq, lt } from "drizzle-orm";
import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { comparePassword, hashPassword, isBcryptHash } from "./password";
import { logger } from "./logger";

/* ── Session config ─────────────────────────────────────── */
export const SESSION_COOKIE = "ss_admin";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

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

/* ── Credential verification (raw values) ───────────────── */

export interface VerifyResult {
  ok: boolean;
  username: string;
}

/* Verifies a raw username + password pair against DB-then-env
 * credentials. Returns the canonical stored username on success
 * (so the caller can persist it on the session). Used by the
 * /admin/login endpoint and as the inner check for the legacy
 * Bearer-token fallback in `checkAdminAuth`. */
export async function verifyCredentials(
  submittedUsername: string,
  submittedPassword: string,
): Promise<VerifyResult> {
  const u = submittedUsername.trim();
  const p = submittedPassword;

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
  const storedUsername = dbCreds["admin_username"] ?? envFallbackUsername();

  if (!storedPassword || !p) return { ok: false, username: "" };

  const passwordOk = await comparePassword(p, storedPassword);
  // Username check is "open" when no admin username is configured
  // anywhere (DB or env) OR no username was submitted (legacy
  // Bearer flow). Otherwise both must match (constant-time).
  const usernameOk =
    !u || !storedUsername || timingSafeStringEqual(u, storedUsername);

  if (!passwordOk || !usernameOk) return { ok: false, username: "" };

  // Auto-migrate legacy plain-text DB password to bcrypt hash.
  if (passwordSource === "db" && !isBcryptHash(storedPassword)) {
    try {
      const hash = await hashPassword(p);
      await persistHashedPassword(hash);
      logger.info("Migrated legacy admin password to bcrypt hash");
    } catch (err) {
      logger.warn({ err }, "Failed to migrate admin password to bcrypt");
    }
  }

  return { ok: true, username: storedUsername || u };
}

/* ── Cookie session helpers ─────────────────────────────── */

function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(username: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(adminSessionsTable).values({ token, username, expiresAt });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  if (!token) return;
  await db.delete(adminSessionsTable).where(eq(adminSessionsTable.token, token));
}

/* Delete every active admin session. Called after a password
 * change to force re-authentication everywhere. */
export async function destroyAllSessions(): Promise<void> {
  await db.delete(adminSessionsTable);
}

export async function lookupSession(
  token: string,
): Promise<{ username: string } | null> {
  if (!token) return null;
  const rows = await db
    .select()
    .from(adminSessionsTable)
    .where(eq(adminSessionsTable.token, token))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    // Expired — best-effort cleanup
    db.delete(adminSessionsTable)
      .where(eq(adminSessionsTable.token, token))
      .catch(() => {});
    return null;
  }
  return { username: row.username };
}

/* Best-effort periodic cleanup of expired sessions. Called
 * opportunistically from the login route. Errors are swallowed. */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await db.delete(adminSessionsTable).where(lt(adminSessionsTable.expiresAt, new Date()));
  } catch {
    /* ignore */
  }
}

/* Cookie is scoped to /api so it is never sent to other paths
 * (least privilege). Both set + clear must use the same path
 * or browsers will silently keep the old cookie. */
const SESSION_COOKIE_PATH = "/api";

export function setSessionCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: SESSION_COOKIE_PATH,
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSessionCookie(res: Response): void {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: SESSION_COOKIE_PATH,
  });
}

/* ── Main check (cookie session only) ───────────────────── */

interface ReqWithCookies extends Request {
  cookies: Record<string, string>;
}

export async function checkAdminAuth(req: Request): Promise<boolean> {
  const cookieToken = (req as ReqWithCookies).cookies?.[SESSION_COOKIE] ?? "";
  if (!cookieToken) return false;
  const session = await lookupSession(cookieToken);
  return session !== null;
}

/* Returns the username associated with the current request's
 * cookie session, OR — if there's no cookie session — the
 * canonical stored admin username. Used by GET /me and GET
 * /admin/session. */
export async function getCurrentUsername(req?: Request): Promise<string> {
  if (req) {
    const cookieToken = (req as ReqWithCookies).cookies?.[SESSION_COOKIE] ?? "";
    if (cookieToken) {
      const session = await lookupSession(cookieToken);
      if (session) return session.username;
    }
  }
  const rows = await db
    .select()
    .from(siteSettingsTable)
    .where(inArray(siteSettingsTable.key, ["admin_username"]));
  return rows[0]?.value ?? envFallbackUsername();
}
