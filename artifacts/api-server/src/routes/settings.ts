import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/settings", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(siteSettingsTable);
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/settings", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || token !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const entries = Object.entries(body).filter(
      ([, v]) => typeof v === "string",
    ) as [string, string][];

    for (const [key, value] of entries) {
      await db
        .insert(siteSettingsTable)
        .values({ key, value })
        .onConflictDoUpdate({
          target: siteSettingsTable.key,
          set: { value, updatedAt: new Date() },
        });
    }

    res.json({ ok: true, updated: entries.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to save settings" });
  }
});

export default router;
