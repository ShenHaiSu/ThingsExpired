import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull(),
    name: text("name", { length: 100 }).notNull(),
    color: text("color", { length: 20 }),
    icon: text("icon", { length: 50 }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_categories_user_id").on(table.userId),
    nameIdx: index("idx_categories_name").on(table.name),
  }),
);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
