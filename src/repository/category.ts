import { eq, and, like, sql } from "drizzle-orm";
import type { DBInstance } from "@/repository/db";
import { categories } from "@/model/category";
import type { ICategoryRepository } from "@/repository/interfaces";
import type { InsertCategory, Category } from "@/model/category";

export class CategoryRepository implements ICategoryRepository {
  constructor(private db: DBInstance) {}

  async findById(id: number): Promise<Category | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByUserIdAndName(
    userId: number,
    name: string,
  ): Promise<Category | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(
        and(eq(categories.userId, userId), eq(categories.name, name)),
      )
      .limit(1);
    return result[0] || null;
  }

  async create(data: InsertCategory): Promise<Category> {
    const result = await this.db
      .insert(categories)
      .values(data)
      .returning();
    return result[0] as Category;
  }

  async update(
    id: number,
    data: Partial<InsertCategory>,
  ): Promise<Category | null> {
    const result = await this.db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id)).run();
  }

  async list(params: {
    userId: number;
    page: number;
    pageSize: number;
    keyword?: string;
  }): Promise<{ items: Category[]; total: number }> {
    const { userId, page, pageSize, keyword } = params;
    const offset = (page - 1) * pageSize;

    const conditions = [eq(categories.userId, userId)];
    if (keyword) {
      conditions.push(like(categories.name, `%${keyword}%`));
    }

    const items = await this.db
      .select()
      .from(categories)
      .where(and(...conditions))
      .limit(pageSize)
      .offset(offset)
      .orderBy(categories.sortOrder);

    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(and(...conditions));

    const count = countResult[0]?.count ?? 0;

    return { items, total: count };
  }
}
