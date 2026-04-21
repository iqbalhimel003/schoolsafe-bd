/* =========================================================
 * SchoolSafe BD — Admin Auth Helper
 *
 * Checks admin credentials against DB first (if set),
 * then falls back to ADMIN_PASSWORD / ADMIN_USERNAME env vars.
 *
 * Username is sent via X-Admin-Username header.
 * Password is sent via Authorization: Bearer <password>.
 * ========================================================= */

import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";
import { inArray } from "drizzle-orm";
import type { Request } from "express";

const DEFAULT_USERNAME = "iqbal.himel003@gmail.com";

export async function checkAdminAuth(req: Request): Promise<boolean> {
  const token = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "").trim();
  const usernameHeader = ((req.headers["x-admin-username"] as string) ?? "").trim();

  const dbRows = await db
    .select()
    .from(siteSettingsTable)
    .where(inArray(siteSettingsTable.key, ["admin_username", "admin_password"]));

  const dbCreds: Record<string, string> = {};
  for (const r of dbRows) dbCreds[r.key] = r.value;

  const storedPassword =
    dbCreds["admin_password"] ?? process.env.ADMIN_PASSWORD ?? "";
  const storedUsername =
    dbCreds["admin_username"] ??
    process.env.ADMIN_USERNAME ??
    DEFAULT_USERNAME;

  if (!storedPassword || !token) return false;

  const passwordOk = token === storedPassword;
  const usernameOk = !usernameHeader || usernameHeader === storedUsername;

  return passwordOk && usernameOk;
}

export async function getCurrentUsername(): Promise<string> {
  const rows = await db
    .select()
    .from(siteSettingsTable)
    .where(inArray(siteSettingsTable.key, ["admin_username"]));
  return (
    rows[0]?.value ??
    process.env.ADMIN_USERNAME ??
    DEFAULT_USERNAME
  );
}
