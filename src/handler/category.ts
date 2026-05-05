import type { Context } from "hono";
import type { ICategoryService } from "../service/interfaces";
import { success, failWithCode, fail } from "../utils/response";
import { CodeParamInvalid } from "../errors/code";
import {
  CreateCategoryRequestSchema,
  CategoryListRequestSchema,
  UpdateCategoryRequestSchema,
  DeleteCategoryRequestSchema,
} from "../model/dto/category";

export class CategoryHandler {
  constructor(private categoryService: ICategoryService) {}

  async create(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = CreateCategoryRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const data = await this.categoryService.create(userId, result.data);
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async list(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = CategoryListRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const data = await this.categoryService.list(userId, {
        page: result.data.page,
        pageSize: result.data.page_size,
        keyword: result.data.keyword,
      });
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async update(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = UpdateCategoryRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      const data = await this.categoryService.update(userId, result.data);
      return success(c, data);
    } catch (error) {
      return fail(c, error);
    }
  }

  async delete(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as number;
      const body = await c.req.json();
      const result = DeleteCategoryRequestSchema.safeParse(body);
      if (!result.success) {
        return failWithCode(c, CodeParamInvalid, result.error.message);
      }

      await this.categoryService.delete(userId, result.data.category_id);
      return success(c, null);
    } catch (error) {
      return fail(c, error);
    }
  }
}
