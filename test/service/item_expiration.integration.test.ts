import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { ItemRepository } from "../../src/repository/item";
import {
  ItemExpirationService,
  ItemStatus,
} from "../../src/service/item_expiration";

describe("ItemExpirationService 集成测试", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database;

  beforeAll(() => {
    sqlite = new Database(":memory:");
    db = drizzle(sqlite);

    // 创建表
    sqlite.run(`
      CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        quantity INTEGER DEFAULT 1,
        unit TEXT,
        expired_at TEXT NOT NULL,
        remind_days INTEGER DEFAULT 3,
        status INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 插入测试数据
    const now = new Date().toISOString();
    const stmt = sqlite.prepare(`
      INSERT INTO items (user_id, category_id, name, description, quantity, unit, expired_at, remind_days, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 已过期物品1（1小时前过期）
    stmt.run(
      1, 1, "已过期物品1", null, 1, null,
      new Date(Date.now() - 3600000).toISOString(),
      3, 1, now, now,
    );

    // 已过期物品2（2小时前过期）
    stmt.run(
      1, 1, "已过期物品2", null, 1, null,
      new Date(Date.now() - 7200000).toISOString(),
      3, 1, now, now,
    );

    // 正常物品（1小时后过期）
    stmt.run(
      1, 1, "正常物品", null, 1, null,
      new Date(Date.now() + 3600000).toISOString(),
      3, 1, now, now,
    );

    // 已使用物品（已过期但已被标记为已使用）
    stmt.run(
      1, 1, "已使用过期物品", null, 1, null,
      new Date(Date.now() - 3600000).toISOString(),
      3, 3, now, now,
    );
  });

  afterAll(() => {
    sqlite.close();
  });

  test("checkExpiredItems 应更新过期物品状态（仅更新status=1的过期物品）", async () => {
    const itemRepo = new ItemRepository(db);
    const service = new ItemExpirationService(
      itemRepo,
      { enabled: true, intervalSec: 60, batchSize: 100 },
      console as any,
    );

    // 执行检查
    const count = await service.checkExpiredItems();

    expect(count).toBe(2); // 应该更新2条（已过期物品1和2）

    // 验证状态已更新
    const result = sqlite
      .prepare("SELECT id, name, status FROM items WHERE status = ?")
      .all(ItemStatus.Expired) as Array<{ id: number; name: string; status: number }>;

    expect(result.length).toBe(2);
    expect(result[0]!.name).toBe("已过期物品1");
    expect(result[1]!.name).toBe("已过期物品2");

    // 验证正常物品状态未改变
    const normalResult = sqlite
      .prepare("SELECT id, name, status FROM items WHERE id = ?")
      .get(3) as { id: number; name: string; status: number };
    expect(normalResult.status).toBe(1);

    // 验证已使用物品状态未改变
    const usedResult = sqlite
      .prepare("SELECT id, name, status FROM items WHERE id = ?")
      .get(4) as { id: number; name: string; status: number };
    expect(usedResult.status).toBe(3);
  });

  test("重复执行checkExpiredItems 应具有幂等性", async () => {
    const itemRepo = new ItemRepository(db);
    const service = new ItemExpirationService(
      itemRepo,
      { enabled: true, intervalSec: 60, batchSize: 100 },
      console as any,
    );

    // 第二次执行，应该没有可更新的物品了
    const count = await service.checkExpiredItems();
    expect(count).toBe(0);
  });
});
