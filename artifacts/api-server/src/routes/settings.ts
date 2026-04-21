import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { checkAdminAuth, getCurrentUsername, adminAuthLimiter } from "../lib/auth";
import { hashPassword } from "../lib/password";

const router: IRouter = Router();

/* ── GET /settings — public (admin_ keys filtered out) ── */

router.get("/settings", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(siteSettingsTable);
    const settings: Record<string, string> = {};
    for (const row of rows) {
      if (!row.key.startsWith("admin_")) {
        settings[row.key] = row.value;
      }
    }
    res.json(settings);
  } catch {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

/* ── PUT /settings — save site content (auth required) ── */

router.put("/settings", adminAuthLimiter, async (req: Request, res: Response) => {
  if (!(await checkAdminAuth(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    // Hard guard: admin_* keys (admin_username, admin_password) must
    // never be writable through the generic settings endpoint —
    // changing them goes through PUT /credentials, which hashes the
    // password before storage. Silently dropping them prevents any
    // path that could persist a plaintext admin password here.
    const entries = Object.entries(body).filter(
      ([k, v]) => typeof v === "string" && !k.startsWith("admin_"),
    ) as [string, string][];

    const toDelete = entries
      .filter(([, v]) => v.trim() === "")
      .map(([k]) => k);
    const toUpsert = entries.filter(([, v]) => v.trim() !== "");

    for (const key of toDelete) {
      await db.delete(siteSettingsTable).where(eq(siteSettingsTable.key, key));
    }

    for (const [key, value] of toUpsert) {
      await db
        .insert(siteSettingsTable)
        .values({ key, value })
        .onConflictDoUpdate({
          target: siteSettingsTable.key,
          set: { value, updatedAt: new Date() },
        });
    }

    res.json({ ok: true, updated: toUpsert.length, deleted: toDelete.length });
  } catch {
    res.status(500).json({ error: "Failed to save settings" });
  }
});

/* ── GET /me — current admin username (auth required) ── */

router.get("/me", adminAuthLimiter, async (req: Request, res: Response) => {
  if (!(await checkAdminAuth(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const username = await getCurrentUsername();
    res.json({ username });
  } catch {
    res.status(500).json({ error: "Failed to fetch admin info" });
  }
});

/* ── PUT /credentials — update username/password (auth required) ── */

router.put("/credentials", adminAuthLimiter, async (req: Request, res: Response) => {
  if (!(await checkAdminAuth(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body as { newUsername?: string; newPassword?: string };
  if (!body || (!body.newUsername && !body.newPassword)) {
    res.status(400).json({ error: "No changes provided" });
    return;
  }

  try {
    if (body.newUsername?.trim()) {
      await db
        .insert(siteSettingsTable)
        .values({ key: "admin_username", value: body.newUsername.trim() })
        .onConflictDoUpdate({
          target: siteSettingsTable.key,
          set: { value: body.newUsername.trim(), updatedAt: new Date() },
        });
    }

    if (body.newPassword?.trim()) {
      const hashed = await hashPassword(body.newPassword.trim());
      await db
        .insert(siteSettingsTable)
        .values({ key: "admin_password", value: hashed })
        .onConflictDoUpdate({
          target: siteSettingsTable.key,
          set: { value: hashed, updatedAt: new Date() },
        });
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to update credentials" });
  }
});

export default router;
