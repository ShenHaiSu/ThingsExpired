import type { IItemRepository } from "@/repository/interfaces";
import type { IItemExpirationService } from "@/service/interfaces";
import type { ExpirationConfig } from "@/config";
import type { SimpleLogger } from "@/utils/logger";

// 物品状态常量
export const ItemStatus = {
  Normal: 1,
  Expired: 2,
  Used: 3,
} as const;

/**
 * ItemExpirationService 物品过期检查服务
 *
 * 遵循分层架构原则，属于 Service 层组件。
 * 使用 setInterval 实现定时任务，支持优雅启动/停止。
 */
export class ItemExpirationService implements IItemExpirationService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(
    private itemRepo: IItemRepository,
    private config: ExpirationConfig,
    private logger: SimpleLogger,
  ) {
    // 设置默认值
    if (this.config.intervalSec <= 0) {
      this.config.intervalSec = 3600; // 默认1小时
    }
    if (this.config.batchSize <= 0) {
      this.config.batchSize = 100; // 默认每次处理100条
    }
  }

  /**
   * 启动过期检查任务
   * 启动时立即执行一次，之后按配置间隔定时执行
   */
  start(): void {
    if (this.running) {
      this.logger.warn("[Expiration] 过期检查任务已在运行中");
      return;
    }

    if (!this.config.enabled) {
      this.logger.info("[Expiration] 过期检查任务已禁用");
      return;
    }

    this.running = true;

    // 启动时先执行一次
    this.checkExpiredItems().catch((err) => {
      this.logger.error({ err }, "[Expiration] 启动时执行过期检查失败");
    });

    // 定时触发
    this.intervalId = setInterval(() => {
      this.checkExpiredItems().catch((err) => {
        this.logger.error({ err }, "[Expiration] 定时过期检查失败");
      });
    }, this.config.intervalSec * 1000);

    this.logger.info(
      {
        intervalSec: this.config.intervalSec,
        batchSize: this.config.batchSize,
      },
      "[Expiration] 过期检查任务已启动",
    );
  }

  /**
   * 执行一次过期检查
   * @returns 更新的物品数量
   */
  async checkExpiredItems(): Promise<number> {
    // 1. 获取已过期但状态仍为正常的物品
    const expiredItems = await this.itemRepo.getExpiredItems(
      this.config.batchSize,
    );

    if (expiredItems.length === 0) {
      return 0;
    }

    // 2. 收集需要更新的 ID
    const ids = expiredItems.map((item) => item.id);

    // 3. 批量更新状态为已过期
    await this.itemRepo.batchUpdateStatus(ids, ItemStatus.Expired);

    this.logger.info(
      { updatedCount: expiredItems.length },
      "[Expiration] 过期检查完成",
    );

    return expiredItems.length;
  }

  /**
   * 停止过期检查任务
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    // 清除定时器
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.running = false;
    this.logger.info("[Expiration] 过期检查任务已停止");
  }
}
