import type { ICategoryRepository, IItemRepository } from "@/repository/interfaces";
import type { ICategoryService } from "@/service/interfaces";
import type { CategoryVO } from "@/model/vo/category";
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/model/dto/category";
import { toCategoryVO } from "@/model/vo/category";
import { AppError } from "@/errors";
import {
  CodeCategoryNotFound,
  CodeDatabaseError,
  CodeForbidden,
  CodeUserExists,
} from "@/errors/code";
import { nowUTC } from "@/utils/time";

export class CategoryService implements ICategoryService {
  constructor(
    private categoryRepo: ICategoryRepository,
    private itemRepo: IItemRepository,
  ) {}

  async create(
    userId: number,
    req: CreateCategoryRequest,
  ): Promise<CategoryVO> {
    // 检查同名分类
    const existing = await this.categoryRepo.findByUserIdAndName(
      userId,
      req.name,
    );
    if (existing) {
      throw new AppError(CodeUserExists, "分类名称已存在");
    }

    const now = nowUTC();
    const category = await this.categoryRepo.create({
      userId,
      name: req.name,
      color: req.color || null,
      icon: req.icon || null,
      sortOrder: req.sort_order ?? 0,
      createdAt: now,
      updatedAt: now,
    });

    return toCategoryVO(category);
  }

  async list(
    userId: number,
    params: { page: number; pageSize: number; keyword?: string },
  ): Promise<{ list: CategoryVO[]; total: number; page: number }> {
    const { items, total } = await this.categoryRepo.list({
      userId,
      ...params,
    });

    return {
      list: items.map(toCategoryVO),
      total,
      page: params.page,
    };
  }

  async update(
    userId: number,
    req: UpdateCategoryRequest,
  ): Promise<CategoryVO> {
    const category = await this.categoryRepo.findById(req.category_id);
    if (!category) {
      throw new AppError(CodeCategoryNotFound, "分类不存在");
    }
    if (category.userId !== userId) {
      throw new AppError(CodeForbidden, "无权操作此分类");
    }

    // 检查分类名是否重复
    if (req.name && req.name !== category.name) {
      const existing = await this.categoryRepo.findByUserIdAndName(
        userId,
        req.name,
      );
      if (existing && existing.id !== req.category_id) {
        throw new AppError(CodeUserExists, "分类名称已存在");
      }
    }

    const updateData: Record<string, any> = {};
    if (req.name !== undefined) updateData.name = req.name;
    if (req.color !== undefined) updateData.color = req.color;
    if (req.icon !== undefined) updateData.icon = req.icon;
    if (req.sort_order !== undefined) updateData.sortOrder = req.sort_order;
    updateData.updatedAt = nowUTC();

    const updated = await this.categoryRepo.update(req.category_id, updateData);
    if (!updated) {
      throw new AppError(CodeDatabaseError, "更新分类失败");
    }

    return toCategoryVO(updated);
  }

  async delete(userId: number, categoryId: number): Promise<void> {
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) {
      throw new AppError(CodeCategoryNotFound, "分类不存在");
    }
    if (category.userId !== userId) {
      throw new AppError(CodeForbidden, "无权操作此分类");
    }

    // 先删除分类下的所有物品
    await this.itemRepo.deleteByCategoryId(categoryId);
    // 再删除分类
    await this.categoryRepo.delete(categoryId);
  }
}
