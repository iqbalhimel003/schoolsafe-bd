import express, { type Express } from "express";
import cors from "cors";
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
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api", router);

export default app;
