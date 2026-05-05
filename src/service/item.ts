import type { IItemRepository } from "../repository/interfaces";
import type { IItemService } from "./interfaces";
import type { ItemVO, ExpiringItemVO, ItemStatsVO } from "../model/vo/item";
import type {
  CreateItemRequest,
  UpdateItemRequest,
} from "../model/dto/item";
import { toItemVO, toExpiringItemVO, toItemStatsVO } from "../model/vo/item";
import { AppError } from "../errors";
import {
  CodeItemNotFound,
  CodeDatabaseError,
  CodeForbidden,
} from "../errors/code";
import { nowUTC, daysUntil } from "../utils/time";

export class ItemService implements IItemService {
  constructor(private itemRepo: IItemRepository) {}

  async create(userId: number, req: CreateItemRequest): Promise<ItemVO> {
    const now = nowUTC();

    // 计算状态：如果过期时间早于当前时间，则初始状态为已过期
    const status =
      new Date(req.expired_at).getTime() < Date.now() ? 2 : 1;

    const item = await this.itemRepo.create({
      userId,
      categoryId: req.category_id,
      name: req.name,
      description: req.description || null,
      quantity: req.quantity ?? 1,
      unit: req.unit || null,
      expiredAt: req.expired_at,
      remindDays: req.remind_days ?? 3,
      status,
      createdAt: now,
      updatedAt: now,
    });

    return toItemVO(item);
  }

  async list(
    userId: number,
    params: any,
  ): Promise<{ list: ItemVO[]; total: number; page: number }> {
    const { items, total } = await this.itemRepo.list({
      userId,
      ...params,
    });

    return {
      list: items.map(toItemVO),
      total,
      page: params.page,
    };
  }

  async detail(userId: number, itemId: number): Promise<ItemVO> {
    const item = await this.itemRepo.findById(itemId);
    if (!item) {
      throw new AppError(CodeItemNotFound, "物品不存在");
    }
    if (item.userId !== userId) {
      throw new AppError(CodeForbidden, "无权查看此物品");
    }

    return toItemVO(item);
  }

  async update(userId: number, req: UpdateItemRequest): Promise<ItemVO> {
    const item = await this.itemRepo.findById(req.item_id);
    if (!item) {
      throw new AppError(CodeItemNotFound, "物品不存在");
    }
    if (item.userId !== userId) {
      throw new AppError(CodeForbidden, "无权操作此物品");
    }

    const updateData: Record<string, any> = {};
    if (req.category_id !== undefined) updateData.categoryId = req.category_id;
    if (req.name !== undefined) updateData.name = req.name;
    if (req.description !== undefined) updateData.description = req.description;
    if (req.quantity !== undefined) updateData.quantity = req.quantity;
    if (req.unit !== undefined) updateData.unit = req.unit;
    if (req.expired_at !== undefined) updateData.expiredAt = req.expired_at;
    if (req.remind_days !== undefined) updateData.remindDays = req.remind_days;
    updateData.updatedAt = nowUTC();

    // 如果更新了过期时间，重新计算状态
    if (req.expired_at) {
      updateData.status =
        new Date(req.expired_at).getTime() < Date.now() ? 2 : 1;
    }

    const updated = await this.itemRepo.update(req.item_id, updateData);
    if (!updated) {
      throw new AppError(CodeDatabaseError, "更新物品失败");
    }

    return toItemVO(updated);
  }

  async delete(userId: number, itemId: number): Promise<void> {
    const item = await this.itemRepo.findById(itemId);
    if (!item) {
      throw new AppError(CodeItemNotFound, "物品不存在");
    }
    if (item.userId !== userId) {
      throw new AppError(CodeForbidden, "无权删除此物品");
    }

    await this.itemRepo.delete(itemId);
  }

  async getExpiring(
    userId: number,
    days: number,
  ): Promise<ExpiringItemVO[]> {
    const items = await this.itemRepo.getExpiringItems(userId, days);

    return items.map((item) =>
      toExpiringItemVO(item, daysUntil(item.expiredAt)),
    );
  }

  async getStats(userId: number): Promise<ItemStatsVO> {
    const stats = await this.itemRepo.getStats(userId);
    return toItemStatsVO(stats);
  }

  async markUsed(userId: number, itemId: number): Promise<ItemVO> {
    const item = await this.itemRepo.findById(itemId);
    if (!item) {
      throw new AppError(CodeItemNotFound, "物品不存在");
    }
    if (item.userId !== userId) {
      throw new AppError(CodeForbidden, "无权操作此物品");
    }

    const now = nowUTC();
    const updated = await this.itemRepo.update(itemId, {
      status: 3,
      updatedAt: now,
    });

    if (!updated) {
      throw new AppError(CodeDatabaseError, "更新物品状态失败");
    }

    return toItemVO(updated);
  }
}
