import { describe, expect, mock, test } from "bun:test";
import type { IItemRepository } from "../../src/repository/interfaces";
import { ItemService } from "../../src/service/item";
import { AppError } from "../../src/errors";
import { CodeItemNotFound, CodeForbidden } from "../../src/errors/code";

describe("ItemService", () => {
  test("create - 成功创建正常物品（未过期）", async () => {
    const mockRepo: IItemRepository = {
      create: mock(() =>
        Promise.resolve({
          id: 1,
          userId: 1,
          categoryId: 1,
          name: "牛奶",
          description: "新鲜牛奶",
          quantity: 1,
          unit: "盒",
          expiredAt: "2026-12-31T23:59:59.000Z",
          remindDays: 7,
          status: 1,
          createdAt: "2026-05-05T00:00:00.000Z",
          updatedAt: "2026-05-05T00:00:00.000Z",
        }),
      ),
    } as IItemRepository;

    const service = new ItemService(mockRepo);
    const result = await service.create(1, {
      category_id: 1,
      name: "牛奶",
      description: "新鲜牛奶",
      quantity: 1,
      unit: "盒",
      expired_at: "2026-12-31T23:59:59.000Z",
      remind_days: 7,
    });

    expect(result.item_id).toBe(1);
    expect(result.name).toBe("牛奶");
    expect(result.status).toBe(1);
  });

  test("create - 已过期物品应初始状态为已过期", async () => {
    const mockRepo: IItemRepository = {
      create: mock(() =>
        Promise.resolve({
          id: 2,
          userId: 1,
          categoryId: 1,
          name: "过期牛奶",
          description: null,
          quantity: 1,
          unit: null,
          expiredAt: "2024-01-01T00:00:00.000Z",
          remindDays: 3,
          status: 2,
          createdAt: "2026-05-05T00:00:00.000Z",
          updatedAt: "2026-05-05T00:00:00.000Z",
        }),
      ),
    } as IItemRepository;

    const service = new ItemService(mockRepo);
    const result = await service.create(1, {
      category_id: 1,
      name: "过期牛奶",
      expired_at: "2024-01-01T00:00:00.000Z",
    });

    expect(result.status).toBe(2); // 已过期
  });

  test("detail - 物品不存在时抛出异常", async () => {
    const mockRepo: IItemRepository = {
      findById: mock(() => Promise.resolve(null)),
    } as IItemRepository;

    const service = new ItemService(mockRepo);
    await expect(service.detail(1, 999)).rejects.toMatchObject({
      code: CodeItemNotFound,
    });
  });

  test("detail - 非本人物品时抛出异常", async () => {
    const mockRepo: IItemRepository = {
      findById: mock(() =>
        Promise.resolve({
          id: 1,
          userId: 2, // 不属于当前用户
          categoryId: 1,
          name: "牛奶",
          description: null,
          quantity: 1,
          unit: null,
          expiredAt: "2026-12-31T23:59:59.000Z",
          remindDays: 3,
          status: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
      ),
    } as IItemRepository;

    const service = new ItemService(mockRepo);
    await expect(service.detail(1, 1)).rejects.toMatchObject({
      code: CodeForbidden,
    });
  });

  test("markUsed - 成功标记物品为已使用", async () => {
    const mockRepo: IItemRepository = {
      findById: mock(() =>
        Promise.resolve({
          id: 1,
          userId: 1,
          categoryId: 1,
          name: "牛奶",
          description: null,
          quantity: 1,
          unit: null,
          expiredAt: "2026-12-31T23:59:59.000Z",
          remindDays: 3,
          status: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
      ),
      update: mock(() =>
        Promise.resolve({
          id: 1,
          userId: 1,
          categoryId: 1,
          name: "牛奶",
          description: null,
          quantity: 1,
          unit: null,
          expiredAt: "2026-12-31T23:59:59.000Z",
          remindDays: 3,
          status: 3, // 已使用
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-05-05T00:00:00.000Z",
        }),
      ),
    } as IItemRepository;

    const service = new ItemService(mockRepo);
    const result = await service.markUsed(1, 1);

    expect(result.status).toBe(3);
    expect(result.item_id).toBe(1);
  });
});
