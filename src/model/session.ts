import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable(
  "sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull(),
    jti: text("jti").notNull().unique(),
    deviceInfo: text("device_info"),
    ipAddress: text("ip_address"),
    createdAt: text("created_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    isRevoked: integer("is_revoked").notNull().default(0),
  },
  (table) => ({
    userIdIdx: index("idx_sessions_user_id").on(table.userId),
    jtiIdx: uniqueIndex("idx_sessions_jti").on(table.jti),
  }),
);

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
