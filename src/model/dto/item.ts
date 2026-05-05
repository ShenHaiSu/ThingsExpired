import { z } from "zod";

export const CreateItemRequestSchema = z.object({
  category_id: z.number().min(1, "分类ID必须大于0"),
  name: z
    .string()
    .min(1, "物品名称至少1个字符")
    .max(200, "物品名称最多200个字符"),
  description: z.string().max(500, "描述最多500个字符").optional(),
  quantity: z.number().min(1, "数量最小值为1").optional().default(1),
  unit: z.string().max(20, "单位最多20个字符").optional(),
  expired_at: z.string().min(1, "过期时间不能为空"),
  remind_days: z
    .number()
    .min(0, "提醒天数最小值为0")
    .max(365, "提醒天数最大值为365")
    .optional()
    .default(3),
});

export type CreateItemRequest = z.infer<typeof CreateItemRequestSchema>;

export const ItemListRequestSchema = z.object({
  page: z.number().min(1).optional().default(1),
  page_size: z.number().min(1).max(100).optional().default(10),
  category_id: z.number().min(1).optional(),
  name: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  unit: z.string().max(20).optional(),
  status: z.number().min(0).max(3).optional(),
  quantity_min: z.number().min(0).optional(),
  quantity_max: z.number().min(0).optional(),
  remind_days_min: z.number().min(0).optional(),
  remind_days_max: z.number().min(0).optional(),
  expired_at_from: z.string().optional(),
  expired_at_to: z.string().optional(),
  created_at_from: z.string().optional(),
  created_at_to: z.string().optional(),
  order_by: z
    .enum(["created_at", "updated_at", "expired_at", "name", "quantity"])
    .optional(),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type ItemListRequest = z.infer<typeof ItemListRequestSchema>;

export const ItemDetailRequestSchema = z.object({
  item_id: z.number().min(1, "物品ID必须大于0"),
});

export type ItemDetailRequest = z.infer<typeof ItemDetailRequestSchema>;

export const UpdateItemRequestSchema = z.object({
  item_id: z.number().min(1, "物品ID必须大于0"),
  category_id: z.number().min(1).optional(),
  name: z
    .string()
    .min(1, "物品名称至少1个字符")
    .max(200, "物品名称最多200个字符")
    .optional(),
  description: z.string().max(500).optional(),
  quantity: z.number().min(1).optional(),
  unit: z.string().max(20).optional(),
  expired_at: z.string().optional(),
  remind_days: z.number().min(0).max(365).optional(),
});

export type UpdateItemRequest = z.infer<typeof UpdateItemRequestSchema>;

export const DeleteItemRequestSchema = z.object({
  item_id: z.number().min(1, "物品ID必须大于0"),
});

export type DeleteItemRequest = z.infer<typeof DeleteItemRequestSchema>;

export const ExpiringItemsRequestSchema = z.object({
  days: z.number().min(1).max(365).optional().default(7),
});

export type ExpiringItemsRequest = z.infer<typeof ExpiringItemsRequestSchema>;

export const MarkUsedRequestSchema = z.object({
  item_id: z.number().min(1, "物品ID必须大于0"),
});

export type MarkUsedRequest = z.infer<typeof MarkUsedRequestSchema>;
