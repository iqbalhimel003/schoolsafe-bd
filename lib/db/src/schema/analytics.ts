import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const visitorLogsTable = pgTable("visitor_logs", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  visitedAt: timestamp("visited_at").defaultNow().notNull(),
  page: text("page").notNull(),
  ipMasked: text("ip_masked"),
  browser: text("browser"),
  os: text("os"),
  deviceType: text("device_type"),
  referrer: text("referrer"),
  district: text("district"),
  upazila: text("upazila"),
  lang: text("lang"),
});

export type VisitorLog = typeof visitorLogsTable.$inferSelect;
