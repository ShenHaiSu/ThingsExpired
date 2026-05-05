import type { User, InsertUser } from "../model/user";
import type { Category, InsertCategory } from "../model/category";
import type { Item, InsertItem } from "../model/item";
import type { Session, InsertSession } from "../model/session";

// ===== 用户 Repository 接口 =====
export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(data: InsertUser): Promise<User>;
  update(id: number, data: Partial<InsertUser>): Promise<User | null>;
}

// ===== 分类 Repository 接口 =====
export interface ICategoryRepository {
  findById(id: number): Promise<Category | null>;
  findByUserIdAndName(userId: number, name: string): Promise<Category | null>;
  create(data: InsertCategory): Promise<Category>;
  update(id: number, data: Partial<InsertCategory>): Promise<Category | null>;
  delete(id: number): Promise<void>;
  list(params: {
    userId: number;
    page: number;
    pageSize: number;
    keyword?: string;
  }): Promise<{ items: Category[]; total: number }>;
}

// ===== 物品 Repository 接口 =====
export interface IItemRepository {
  findById(id: number): Promise<Item | null>;
  create(data: InsertItem): Promise<Item>;
  update(id: number, data: Partial<InsertItem>): Promise<Item | null>;
  delete(id: number): Promise<void>;
  deleteByCategoryId(categoryId: number): Promise<void>;
  list(params: {
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
  }): Promise<{ items: Item[]; total: number }>;
  getExpiringItems(userId: number, withinDays: number): Promise<Item[]>;
  getStats(userId: number): Promise<{
    total: number;
    expiringSoon: number;
    expired: number;
    used: number;
  }>;
  /** 获取已过期但状态仍为正常的物品（用于后台定时任务） */
  getExpiredItems(limit: number): Promise<Item[]>;
  /** 批量更新物品状态 */
  batchUpdateStatus(ids: number[], status: number): Promise<void>;
}

// ===== 会话 Repository 接口 =====
export interface ISessionRepository {
  findById(id: number): Promise<Session | null>;
  findByJTI(jti: string): Promise<Session | null>;
  create(data: InsertSession): Promise<Session>;
  revoke(id: number): Promise<void>;
  revokeAllByUserId(userId: number): Promise<void>;
  listByUserId(userId: number): Promise<Session[]>;
  countActiveByUserId(userId: number): Promise<number>;
}
