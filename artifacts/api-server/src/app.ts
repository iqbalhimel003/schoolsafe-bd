import express, { type Express, type Request } from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

/* Replit's edge proxy sits in front of this server on a private
 * network. Trust X-Forwarded-For *only* when the connection comes
 * from a loopback / link-local / RFC1918 private address — i.e. from
 * the Replit proxy itself. Any direct connection from a public IP
 * will have its X-Forwarded-For header ignored, so the admin
 * brute-force limiter cannot be bypassed by attackers spoofing
 * X-Forwarded-For. */
app.set("trust proxy", "loopback, linklocal, uniquelocal");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

/* ── Security headers (Helmet) ─────────────────────────────
 * The frontend is served by a separate Vite/static artifact, so
 * the CSP set here only applies to API JSON responses (and any
 * accidental HTML). We still set a conservative default-src so
 * an attacker who tricks a browser into rendering an API response
 * can't load extra resources. HSTS is enabled in production only
 * (Replit dev domains already use HTTPS but this avoids preload
 * surprises during local development). */
const isProd = process.env.NODE_ENV === "production";
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'none'"],
        "frame-ancestors": ["'none'"],
        "base-uri": ["'none'"],
        "form-action": ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer" },
    hsts: isProd
      ? { maxAge: 60 * 60 * 24 * 180, includeSubDomains: true }
      : false,
  }),
);
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  next();
});

/* ── CORS allowlist ────────────────────────────────────────
 * Allowed origins:
 *   • Production domain(s) from PUBLIC_SITE_ORIGIN (comma-separated)
 *   • Any *.replit.dev / *.repl.co / *.replit.app (dev preview)
 *   • localhost / 127.0.0.1 on any port (local dev)
 *   • Same-origin / non-browser clients (no Origin header) */
const PROD_ORIGINS = (process.env.PUBLIC_SITE_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const REPLIT_HOST_RE = /^https?:\/\/[^/]+\.(replit\.dev|repl\.co|replit\.app|janeway\.replit\.dev|kirk\.replit\.dev|picard\.replit\.dev|riker\.replit\.dev|sisko\.replit\.dev|spock\.replit\.dev|worf\.replit\.dev)(:\d+)?$/i;
const LOCALHOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function isAllowedOrigin(origin: string): boolean {
  if (PROD_ORIGINS.includes(origin)) return true;
  if (LOCALHOST_RE.test(origin)) return true;
  try {
    const u = new URL(origin);
    if (
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname.endsWith(".replit.dev") ||
      u.hostname.endsWith(".repl.co") ||
      u.hostname.endsWith(".replit.app")
    ) {
      return true;
    }
  } catch {
    /* fall through */
  }
  return REPLIT_HOST_RE.test(origin);
}

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    // Reject by NOT echoing the origin: the browser blocks the
    // response client-side. We don't throw, to avoid noisy 500s
    // and to keep the API surface unchanged for legitimate
    // server-to-server callers (which send no Origin header).
    callback(null, false);
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

/* ── Global rate limit ─────────────────────────────────────
 * Moderate per-IP limit applied to every /api/* route. Composes
 * with the stricter `adminAuthLimiter` (10 failed attempts /
 * 15 min) on auth-sensitive endpoints. */
const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip ?? "unknown",
  handler: (_req, res, _next, options) => {
    const retryAfterSec = Math.ceil(options.windowMs / 1000);
    res.setHeader("Retry-After", String(retryAfterSec));
    res.status(options.statusCode ?? 429).json({
      error: "Too many requests. Please slow down.",
      retryAfterSeconds: retryAfterSec,
    });
  },
});

app.use("/api", globalApiLimiter, router);

export default app;
