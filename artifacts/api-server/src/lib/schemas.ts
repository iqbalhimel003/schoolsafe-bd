/* =========================================================
 * Zod schemas for all write endpoints.
 *
 * Goals:
 *  - Reject unknown keys (`.strict()`).
 *  - Enforce field length limits to prevent oversized payloads
 *    from reaching the DB even within the global 100 KB JSON cap.
 *  - For `PUT /settings`, restrict keys to a known whitelist of
 *    site-content keys. Bilingual fields are stored as
 *    `<base>_en` / `<base>_bn`.
 * ========================================================= */

import { z } from "zod";

/* Bilingual base keys edited from the admin panel. The actual
 * stored key is `<base>_en` or `<base>_bn`. */
const BILINGUAL_BASE_KEYS = [
  "siteName",
  "siteTagline",
  "siteDescription",
  "prototypeNotice",
  "introWhatTitle",
  "introWhatText",
  "introHowTitle",
  "introHowText",
  "footerPurpose",
  "footerDataSource",
  "footerDisclaimer",
  "footerCreditBefore",
  "footerCreditAfter",
] as const;

const BILINGUAL_KEYS = BILINGUAL_BASE_KEYS.flatMap((k) => [
  `${k}_en`,
  `${k}_bn`,
]);

/* Single-language contact / public keys. */
const CONTACT_KEYS = [
  "contact_email",
  "contact_phone",
  "contact_facebook",
  "contact_telegram",
  "contact_x",
] as const;

export const ALLOWED_SETTING_KEYS = new Set<string>([
  ...BILINGUAL_KEYS,
  ...CONTACT_KEYS,
]);

const MAX_SETTING_VALUE_LEN = 8000;
const MAX_SETTING_KEYS_PER_REQUEST = 200;

/* PUT /settings body: object whose keys are all in the whitelist
 * and whose values are bounded strings. Empty object is allowed
 * (used by the login probe). */
export const SettingsUpdateSchema = z
  .record(z.string(), z.string().max(MAX_SETTING_VALUE_LEN))
  .refine((obj) => Object.keys(obj).length <= MAX_SETTING_KEYS_PER_REQUEST, {
    message: `Too many keys (max ${MAX_SETTING_KEYS_PER_REQUEST})`,
  })
  .refine(
    (obj) => Object.keys(obj).every((k) => ALLOWED_SETTING_KEYS.has(k)),
    {
      message: "Unknown setting key",
    },
  );

/* PUT /credentials body. At least one field required; both bounded. */
export const CredentialsUpdateSchema = z
  .object({
    newUsername: z.string().trim().min(1).max(200).optional(),
    newPassword: z.string().min(6).max(200).optional(),
  })
  .strict()
  .refine((b) => b.newUsername !== undefined || b.newPassword !== undefined, {
    message: "No changes provided",
  });

/* POST /analytics/track body. All fields optional & bounded. */
export const AnalyticsTrackSchema = z
  .object({
    page: z.string().max(500).optional(),
    sessionId: z.string().max(64).optional(),
    userAgent: z.string().max(1000).optional(),
    referrer: z.string().max(500).optional(),
    district: z.string().max(100).optional(),
    upazila: z.string().max(100).optional(),
    lang: z.string().max(10).optional(),
  })
  .strict();
