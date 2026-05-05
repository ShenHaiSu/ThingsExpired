import { describe, expect, mock, test } from "bun:test";
import type { ICategoryRepository, IItemRepository } from "../../src/repository/interfaces";
import { CategoryService } from "../../src/service/category";
import { AppError } from "../../src/errors";
import { CodeCategoryNotFound, CodeForbidden } from "../../src/errors/code";

describe("CategoryService", () => {
  test("create - 成功创建分类", async () => {
    const mockCategoryRepo: ICategoryRepository = {
      findByUserIdAndName: mock(() => Promise.resolve(null)),
      create: mock(() =>
        Promise.resolve({
          id: 1,
          userId: 1,
          name: "食品",
          color: "#FF5733",
          icon: "food",
          sortOrder: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
      ),
    } as ICategoryRepository;

    const service = new CategoryService(mockCategoryRepo, {} as IItemRepository);
    const result = await service.create(1, {
      name: "食品",
      color: "#FF5733",
      icon: "food",
      sort_order: 1,
    });

    expect(result.category_id).toBe(1);
    expect(result.name).toBe("食品");
  });

  test("delete - 分类不存在时抛出异常", async () => {
    const mockCategoryRepo: ICategoryRepository = {
      findById: mock(() => Promise.resolve(null)),
    } as ICategoryRepository;

    const service = new CategoryService(mockCategoryRepo, {} as IItemRepository);

    await expect(service.delete(1, 999)).rejects.toMatchObject({
      code: CodeCategoryNotFound,
    });
  });

  test("delete - 非本人分类时抛出异常", async () => {
    const mockCategoryRepo: ICategoryRepository = {
      findById: mock(() =>
        Promise.resolve({
          id: 1,
          userId: 2, // 不属于当前用户
          name: "食品",
          color: null,
          icon: null,
          sortOrder: 0,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
      ),
    } as ICategoryRepository;

    const service = new CategoryService(mockCategoryRepo, {} as IItemRepository);

    await expect(service.delete(1, 1)).rejects.toMatchObject({
      code: CodeForbidden,
    });
  });
});
