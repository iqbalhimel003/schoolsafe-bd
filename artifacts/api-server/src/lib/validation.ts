/* =========================================================
 * Reusable Zod request-body validation helper.
 *
 * Usage:
 *   const data = validateBody(req, res, MySchema);
 *   if (!data) return; // 400 already sent
 *
 * On failure: sends `400 { error: "Invalid request body", details: [...] }`.
 * `details` lists `{ path, message }` pairs but never echoes the offending
 * value, so we don't leak request data back through error messages.
 *
 * Schemas use `.strict()` so unknown keys are rejected instead of
 * silently dropped.
 * ========================================================= */

import type { Request, Response } from "express";
import type { ZodTypeAny, infer as ZodInfer } from "zod";

export function validateBody<S extends ZodTypeAny>(
  req: Request,
  res: Response,
  schema: S,
): ZodInfer<S> | null {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.slice(0, 20).map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    res.status(400).json({ error: "Invalid request body", details });
    return null;
  }
  return result.data;
}
