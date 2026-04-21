import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-admin-username']",
      "res.headers['set-cookie']",
      "req.body.password",
      "req.body.admin_password",
      "req.body.newPassword",
      "req.body.currentPassword",
      "password",
      "admin_password",
      "newPassword",
      "currentPassword",
      "*.password",
      "*.admin_password",
      "*.newPassword",
    ],
    censor: "[REDACTED]",
    remove: false,
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
