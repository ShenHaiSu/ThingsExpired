import { describe, expect, mock, test, beforeEach, afterEach } from "bun:test";
import type { IItemRepository } from "../../src/repository/interfaces";
import {
  ItemExpirationService,
  ItemStatus,
} from "../../src/service/item_expiration";

describe("ItemExpirationService", () => {
  let mockRepo: IItemRepository;
  let service: ItemExpirationService;

  beforeEach(() => {
    mockRepo = {
      getExpiredItems: mock(() => Promise.resolve([])),
      batchUpdateStatus: mock(() => Promise.resolve()),
    } as unknown as IItemRepository;

    service = new ItemExpirationService(
      mockRepo,
      { enabled: true, intervalSec: 60, batchSize: 100 },
      console as any,
    );
  });

  afterEach(() => {
    service.stop();
  });

  test("checkExpiredItems - 有过期物品时应更新状态并返回数量", async () => {
    mockRepo.getExpiredItems = mock(() =>
      Promise.resolve([
        {
          id: 1,
          userId: 1,
          categoryId: 1,
          name: "已过期物品1",
          description: null,
          quantity: 1,
          unit: null,
          expiredAt: new Date(Date.now() - 3600000).toISOString(),
          remindDays: 3,
          status: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 1,
          categoryId: 1,
          name: "已过期物品2",
          description: null,
          quantity: 1,
          unit: null,
          expiredAt: new Date(Date.now() - 7200000).toISOString(),
          remindDays: 3,
          status: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
    );

    const count = await service.checkExpiredItems();

    expect(count).toBe(2);
    expect(mockRepo.getExpiredItems).toHaveBeenCalledWith(100);
    expect(mockRepo.batchUpdateStatus).toHaveBeenCalledWith(
      [1, 2],
      ItemStatus.Expired,
    );
  });

  test("checkExpiredItems - 无过期物品时应返回0", async () => {
    const count = await service.checkExpiredItems();

    expect(count).toBe(0);
    expect(mockRepo.batchUpdateStatus).not.toHaveBeenCalled();
  });

  test("start - 配置禁用时不应启动定时任务", () => {
    const disabledService = new ItemExpirationService(
      mockRepo,
      { enabled: false, intervalSec: 60, batchSize: 100 },
      console as any,
    );

    disabledService.start();
    expect((disabledService as any).running).toBe(false);
  });

  test("start/stop - 启动和停止应正常执行", async () => {
    service.start();
    expect((service as any).running).toBe(true);

    // 等待一次检查
    await new Promise((resolve) => setTimeout(resolve, 100));

    service.stop();
    expect((service as any).running).toBe(false);
  });

  test("start - 重复启动不应创建多个定时器", () => {
    service.start();
    service.start(); // 第二次调用

    expect((service as any).running).toBe(true);
  });

  test("stop - 未启动时调用不应报错", () => {
    expect(() => service.stop()).not.toThrow();
  });
});
