import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const adminSessionsTable = pgTable("admin_sessions", {
  token: varchar("token", { length: 64 }).primaryKey(),
  username: varchar("username", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type AdminSession = typeof adminSessionsTable.$inferSelect;
