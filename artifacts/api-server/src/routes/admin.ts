import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import {
  verifyCredentials,
  createSession,
  destroySession,
  lookupSession,
  setSessionCookie,
  clearSessionCookie,
  cleanupExpiredSessions,
  adminAuthLimiter,
  SESSION_COOKIE,
} from "../lib/auth";
import { validateBody } from "../lib/validation";

const router: IRouter = Router();

const LoginSchema = z
  .object({
    username: z.string().trim().max(256).default(""),
    password: z.string().min(1).max(512),
  })
  .strict();

interface ReqWithCookies extends Request {
  cookies: Record<string, string>;
}

/* ── POST /admin/login ──────────────────────────────────── */

router.post("/admin/login", adminAuthLimiter, async (req: Request, res: Response) => {
  const body = validateBody(req, res, LoginSchema);
  if (!body) return;

  const result = await verifyCredentials(body.username, body.password);
  if (!result.ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Best-effort: prune expired sessions on each successful login.
  cleanupExpiredSessions().catch(() => {});

  try {
    const token = await createSession(result.username);
    setSessionCookie(res, token);
    res.json({ username: result.username });
  } catch {
    res.status(500).json({ error: "Failed to create session" });
  }
});

/* ── POST /admin/logout ─────────────────────────────────── */

router.post("/admin/logout", async (req: Request, res: Response) => {
  const cookieToken = (req as ReqWithCookies).cookies?.[SESSION_COOKIE] ?? "";
  if (cookieToken) {
    await destroySession(cookieToken).catch(() => {});
  }
  clearSessionCookie(res);
  res.json({ ok: true });
});

/* ── GET /admin/session ─────────────────────────────────── */

router.get("/admin/session", async (req: Request, res: Response) => {
  const cookieToken = (req as ReqWithCookies).cookies?.[SESSION_COOKIE] ?? "";
  if (!cookieToken) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const session = await lookupSession(cookieToken);
  if (!session) {
    clearSessionCookie(res);
    res.status(401).json({ error: "Session expired" });
    return;
  }
  res.json({ username: session.username });
});

export default router;
