import type { Context } from "hono";
import type { IItemService } from "../service/interfaces";
import { success, failWithCode, fail } from "../utils/response";
import { CodeParamInvalid } from "../errors/code";
import {
  CreateItemRequestSchema,
  ItemListRequestSchema,
  ItemDetailRequestSchema,
  UpdateItemRequestSchema,
  DeleteItemRequestSchema,
  ExpiringItemsRequestSchema,
  MarkUsedRequestSchema,
} from "../model/dto/item";

export class ItemHandler {
  constructor(private itemService: IItemService) {}

  async create(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = CreateItemRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const data = await this.itemService.create(userId, result.data);
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async list(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = ItemListRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const data = await this.itemService.list(userId, {
        page: result.data.page,
        pageSize: result.data.page_size,
        categoryId: result.data.category_id,
        name: result.data.name,
        description: result.data.description,
        unit: result.data.unit,
        status: result.data.status,
        quantityMin: result.data.quantity_min,
        quantityMax: result.data.quantity_max,
        remindDaysMin: result.data.remind_days_min,
        remindDaysMax: result.data.remind_days_max,
        expiredAtFrom: result.data.expired_at_from,
        expiredAtTo: result.data.expired_at_to,
        createdAtFrom: result.data.created_at_from,
        createdAtTo: result.data.created_at_to,
        orderBy: result.data.order_by,
        order: result.data.order,
      });
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async detail(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = ItemDetailRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const data = await this.itemService.detail(userId, result.data.item_id);
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async update(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = UpdateItemRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const data = await this.itemService.update(userId, result.data);
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async delete(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = DeleteItemRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      await this.itemService.delete(userId, result.data.item_id);
      return success(c, null);
    } catch (error) {
      return fail(c, error);
    }
  }

  async getExpiring(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = ExpiringItemsRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const data = await this.itemService.getExpiring(
        userId,
        result.data.days,
      );
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async getStats(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const data = await this.itemService.getStats(userId);
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async markUsed(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = MarkUsedRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const data = await this.itemService.markUsed(
        userId,
        result.data.item_id,
      );
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }
}
