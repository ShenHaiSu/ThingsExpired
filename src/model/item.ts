import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const items = sqliteTable(
  "items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull(),
    categoryId: integer("category_id").notNull(),
    name: text("name", { length: 200 }).notNull(),
    description: text("description", { length: 500 }),
    quantity: integer("quantity").notNull().default(1),
    unit: text("unit", { length: 20 }),
    expiredAt: text("expired_at").notNull(),
    remindDays: integer("remind_days").notNull().default(3),
    status: integer("status").notNull().default(1),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_items_user_id").on(table.userId),
    categoryIdIdx: index("idx_items_category_id").on(table.categoryId),
    statusIdx: index("idx_items_status").on(table.status),
    expiredAtIdx: index("idx_items_expired_at").on(table.expiredAt),
    userStatusExpiredIdx: index("idx_items_user_status_expired").on(
      table.userId,
      table.status,
      table.expiredAt,
    ),
  }),
);

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;
