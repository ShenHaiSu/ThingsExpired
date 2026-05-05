import { eq, and, like, gt, lt, gte, lte, sql, inArray } from "drizzle-orm";
import type { DBInstance } from "./db";
import { items } from "../model/item";
import type { IItemRepository } from "./interfaces";
import type { InsertItem, Item } from "../model/item";

export class ItemRepository implements IItemRepository {
  constructor(private db: DBInstance) {}

  async findById(id: number): Promise<Item | null> {
    const result = await this.db
      .select()
      .from(items)
      .where(eq(items.id, id))
      .limit(1);
    return result[0] || null;
  }

  async create(data: InsertItem): Promise<Item> {
    const result = await this.db.insert(items).values(data).returning();
    return result[0] as Item;
  }

  async update(
    id: number,
    data: Partial<InsertItem>,
  ): Promise<Item | null> {
    const result = await this.db
      .update(items)
      .set(data)
      .where(eq(items.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(items).where(eq(items.id, id)).run();
  }

  async deleteByCategoryId(categoryId: number): Promise<void> {
    await this.db
      .delete(items)
      .where(eq(items.categoryId, categoryId))
      .run();
  }

  async list(params: {
    userId: number;
    page: number;
    pageSize: number;
    categoryId?: number;
    name?: string;
    description?: string;
    unit?: string;
    status?: number;
    quantityMin?: number;
    quantityMax?: number;
    remindDaysMin?: number;
    remindDaysMax?: number;
    expiredAtFrom?: string;
    expiredAtTo?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    orderBy?: string;
    order?: string;
  }): Promise<{ items: Item[]; total: number }> {
    const {
      userId,
      page,
      pageSize,
      categoryId,
      name,
      description,
      unit,
      status,
      quantityMin,
      quantityMax,
      remindDaysMin,
      remindDaysMax,
      expiredAtFrom,
      expiredAtTo,
      createdAtFrom,
      createdAtTo,
      orderBy,
      order,
    } = params;
    const offset = (page - 1) * pageSize;

    const conditions: any[] = [eq(items.userId, userId)];

    if (categoryId !== undefined) {
      conditions.push(eq(items.categoryId, categoryId));
    }
    if (name) {
      conditions.push(like(items.name, `%${name}%`));
    }
    if (description) {
      conditions.push(like(items.description, `%${description}%`));
    }
    if (unit) {
      conditions.push(eq(items.unit, unit));
    }
    if (status !== undefined && status !== 0) {
      conditions.push(eq(items.status, status));
    }
    if (quantityMin !== undefined) {
      conditions.push(gte(items.quantity, quantityMin));
    }
    if (quantityMax !== undefined) {
      conditions.push(lte(items.quantity, quantityMax));
    }
    if (remindDaysMin !== undefined) {
      conditions.push(gte(items.remindDays, remindDaysMin));
    }
    if (remindDaysMax !== undefined) {
      conditions.push(lte(items.remindDays, remindDaysMax));
    }
    if (expiredAtFrom) {
      conditions.push(gte(items.expiredAt, expiredAtFrom));
    }
    if (expiredAtTo) {
      conditions.push(lte(items.expiredAt, expiredAtTo));
    }
    if (createdAtFrom) {
      conditions.push(gte(items.createdAt, createdAtFrom));
    }
    if (createdAtTo) {
      conditions.push(lte(items.createdAt, createdAtTo));
    }

    // 构建排序
    let orderFn: any;
    if (orderBy === "name") {
      orderFn = order === "desc" ? sql`${items.name} DESC` : items.name;
    } else if (orderBy === "quantity") {
      orderFn = order === "desc" ? sql`${items.quantity} DESC` : items.quantity;
    } else if (orderBy === "updated_at") {
      orderFn = order === "desc" ? sql`${items.updatedAt} DESC` : items.updatedAt;
    } else if (orderBy === "expired_at") {
      orderFn = order === "desc" ? sql`${items.expiredAt} DESC` : items.expiredAt;
    } else {
      // 默认按 created_at 排序
      orderFn = order === "desc" ? sql`${items.createdAt} DESC` : items.createdAt;
    }

    const itemList = await this.db
      .select()
      .from(items)
      .where(and(...conditions))
      .limit(pageSize)
      .offset(offset)
      .orderBy(orderFn);

    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(and(...conditions));

    const total = countResult[0]?.count ?? 0;

    return { items: itemList, total };
  }

  async getExpiringItems(
    userId: number,
    withinDays: number,
  ): Promise<Item[]> {
    const now = new Date().toISOString();
    const future = new Date(
      Date.now() + withinDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    return await this.db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          eq(items.status, 1),
          gte(items.expiredAt, now),
          lte(items.expiredAt, future),
        ),
      )
      .orderBy(items.expiredAt)
      .all();
  }

  async getStats(userId: number): Promise<{
    total: number;
    expiringSoon: number;
    expired: number;
    used: number;
  }> {
    const now = new Date().toISOString();
    const future = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // 总物品数（status = 1, 2, 3）
    const totalResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(eq(items.userId, userId));
    const total = totalResult[0]?.count ?? 0;

    // 即将过期（status = 1 且 expired_at <= 当前时间+7天）
    const expiringSoonResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          eq(items.status, 1),
          lte(items.expiredAt, future),
        ),
      );
    const expiringSoon = expiringSoonResult[0]?.count ?? 0;

    // 已过期（status = 2）
    const expiredResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(
        and(eq(items.userId, userId), eq(items.status, 2)),
      );
    const expired = expiredResult[0]?.count ?? 0;

    // 已消耗（status = 3）
    const usedResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(
        and(eq(items.userId, userId), eq(items.status, 3)),
      );
    const used = usedResult[0]?.count ?? 0;

    return {
      total,
      expiringSoon,
      expired,
      used,
    };
  }

  /**
   * 获取已过期但状态仍为正常的物品
   * 用于后台定时任务检查
   */
  async getExpiredItems(limit: number): Promise<Item[]> {
    const now = new Date().toISOString();

    return await this.db
      .select()
      .from(items)
      .where(
        and(
          eq(items.status, 1), // 状态为正常
          lt(items.expiredAt, now), // 已过期
        ),
      )
      .limit(limit)
      .all();
  }

  /**
   * 批量更新物品状态
   */
  async batchUpdateStatus(ids: number[], status: number): Promise<void> {
    if (ids.length === 0) return;

    const now = new Date().toISOString();

    await this.db
      .update(items)
      .set({ status, updatedAt: now })
      .where(inArray(items.id, ids))
      .run();
  }
}
