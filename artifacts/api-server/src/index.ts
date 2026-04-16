import app from "./app";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/* ── Startup seed: ensure contact keys exist ──────────────
 * Uses ON CONFLICT DO NOTHING so existing admin-set values
 * are never overwritten. Social links start empty (hidden). */
async function seedContactDefaults() {
  const defaults: { key: string; value: string }[] = [
    { key: "contact_email", value: "admin@safeschool.live" },
    { key: "contact_phone", value: "+8801687476714" },
    { key: "contact_facebook", value: "" },
    { key: "contact_telegram", value: "" },
    { key: "contact_x", value: "" },
  ];
  try {
    for (const row of defaults) {
      await db
        .insert(siteSettingsTable)
        .values({ key: row.key, value: row.value })
        .onConflictDoNothing();
    }
    logger.info("Contact defaults seeded");
  } catch (err) {
    logger.warn({ err }, "Could not seed contact defaults");
  }
}

seedContactDefaults().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
});
