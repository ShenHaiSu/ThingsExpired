import { z } from "zod";

export const CreateCategoryRequestSchema = z.object({
  name: z
    .string()
    .min(1, "分类名称至少1个字符")
    .max(100, "分类名称最多100个字符"),
  color: z.string().max(20, "颜色最多20个字符").optional(),
  icon: z.string().max(50, "图标最多50个字符").optional(),
  sort_order: z.number().optional().default(0),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;

export const CategoryListRequestSchema = z.object({
  page: z.number().min(1, "页码最小值为1").optional().default(1),
  page_size: z
    .number()
    .min(1, "每页数量最小值为1")
    .max(100, "每页数量最大值为100")
    .optional()
    .default(10),
  keyword: z.string().max(100, "关键词最多100个字符").optional(),
});

export type CategoryListRequest = z.infer<typeof CategoryListRequestSchema>;

export const UpdateCategoryRequestSchema = z.object({
  category_id: z.number().min(1, "分类ID必须大于0"),
  name: z
    .string()
    .min(1, "分类名称至少1个字符")
    .max(100, "分类名称最多100个字符")
    .optional(),
  color: z.string().max(20, "颜色最多20个字符").optional(),
  icon: z.string().max(50, "图标最多50个字符").optional(),
  sort_order: z.number().optional(),
});

export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;

export const DeleteCategoryRequestSchema = z.object({
  category_id: z.number().min(1, "分类ID必须大于0"),
});

export type DeleteCategoryRequest = z.infer<typeof DeleteCategoryRequestSchema>;
