/**
 * 物品相关类型定义
 * @module types/api/item
 */

/**
 * 物品状态
 * @description 物品的生命周期状态
 * - 1: 正常 - 物品未过期
 * - 2: 已过期 - 物品已超过过期时间
 * - 3: 已消耗 - 物品已被使用/消耗
 */
export type ItemStatus = 1 | 2 | 3

/**
 * 物品信息
 * @description ThingsExpired系统中的物品实体，用于管理物品的过期时间
 */
export interface Item {
  /** 物品ID（主键） */
  item_id: number
  /** 所属用户ID */
  user_id: number
  /** 所属分类ID */
  category_id: number
  /** 物品名称 */
  name: string
  /** 物品描述 */
  description: string
  /** 数量 */
  quantity: number
  /** 单位，如: "个", "箱", "盒" */
  unit: string
  /** 过期时间，UTC时间格式: "2026-05-31T00:00:00.000Z" */
  expired_at: string
  /** 提前提醒天数 */
  remind_days: number
  /** 物品状态（1: 正常, 2: 已过期, 3: 已消耗） */
  status: ItemStatus
  /** 创建时间，UTC时间格式: "2026-05-31T00:00:00.000Z" */
  created_at: string
  /** 更新时间，UTC时间格式: "2026-05-31T00:00:00.000Z" */
  updated_at: string
}

/**
 * 创建物品请求参数
 * @description 创建新物品时需要提供的参数
 */
export interface CreateItemParams {
  /** 分类ID，最小值为1，必填 */
  category_id: number
  /** 物品名称，1-200个字符，必填 */
  name: string
  /** 物品描述，最多500个字符 */
  description?: string
  /** 数量，最小值为1，默认为1 */
  quantity?: number
  /** 单位，最多20个字符，如: "个", "箱", "盒" */
  unit?: string
  /** 过期时间，UTC时间格式: "2026-05-31T00:00:00.000Z"，必填 */
  expired_at: string
  /** 提前提醒天数，0-365，默认为3 */
  remind_days?: number
}

/**
 * 更新物品请求参数
 * @description 更新物品信息时需要提供的参数
 */
export interface UpdateItemParams {
  /** 物品ID，最小值为1，必填 */
  item_id: number
  /** 分类ID，最小值为1 */
  category_id?: number
  /** 物品名称，1-200个字符 */
  name?: string
  /** 物品描述，最多500个字符 */
  description?: string
  /** 数量，最小值为1 */
  quantity?: number
  /** 单位，最多20个字符 */
  unit?: string
  /** 过期时间，UTC时间格式: "2026-05-31T00:00:00.000Z" */
  expired_at?: string
  /** 提前提醒天数，0-365 */
  remind_days?: number
}

/**
 * 删除物品请求参数
 * @description 删除物品时需要提供的参数
 */
export interface DeleteItemParams {
  /** 物品ID，必填 */
  item_id: number
}

/**
 * 标记物品已使用请求参数
 * @description 将物品状态标记为"已消耗"（status = 3）时需要提供的参数
 */
export interface MarkItemAsUsedParams {
  /** 物品ID，最小值为1，必填 */
  item_id: number
}

/**
 * 物品列表查询参数
 * @description 获取物品列表时支持的查询参数，支持复合搜索和分页
 */
export interface ItemListParams {
  /** 页码，最小值为1，默认为1 */
  page?: number
  /** 每页数量，1-100，默认为10 */
  page_size?: number
  /** 分类ID筛选，最小值为1 */
  category_id?: number
  /** 物品名称筛选，模糊搜索，最多200个字符 */
  name?: string
  /** 物品描述筛选，模糊搜索，最多500个字符 */
  description?: string
  /** 单位筛选，最多20个字符 */
  unit?: string
  /** 状态筛选（0: 全部, 1: 正常, 2: 已过期, 3: 已消耗） */
  status?: ItemStatus | 0
  /** 最小数量筛选，最小值为0 */
  quantity_min?: number
  /** 最大数量筛选，最小值为0 */
  quantity_max?: number
  /** 最小提前提醒天数筛选，最小值为0 */
  remind_days_min?: number
  /** 最大提前提醒天数筛选，最小值为0 */
  remind_days_max?: number
  /** 过期时间起始日期，格式: "YYYY-MM-DD" */
  expired_at_from?: string
  /** 过期时间结束日期，格式: "YYYY-MM-DD" */
  expired_at_to?: string
  /** 创建时间起始日期，格式: "YYYY-MM-DD" */
  created_at_from?: string
  /** 创建时间结束日期，格式: "YYYY-MM-DD" */
  created_at_to?: string
  /** 排序字段，可选值: created_at, updated_at, expired_at, name, quantity */
  order_by?: 'expired_at' | 'created_at' | 'name' | 'updated_at' | 'quantity'
  /** 排序方向，可选值: asc, desc，默认asc */
  order?: 'asc' | 'desc'
}

/**
 * 物品搜索参数
 * @description 支持复杂复合搜索的参数定义（与ItemListParams相同，用于兼容）
 * @deprecated 请使用 ItemListParams，此类型将在未来版本中移除
 */
export type ItemSearchParams = ItemListParams

/**
 * 物品列表响应
 * @description 获取物品列表的响应结构
 */
export interface ItemListResponse {
  /** 物品列表 */
  list: Item[]
  /** 总数量 */
  total: number
  /** 当前页码 */
  page: number
}

/**
 * 即将过期物品响应
 * @description 获取即将过期物品的响应结构，包含距离过期的天数
 */
export interface ExpiringItem extends Item {
  /** 距离过期的天数，负数表示已过期 */
  days_until_expired: number
}

/**
 * 物品统计信息
 * @description 物品的统计数据结构
 */
export interface ItemStats {
  /** 物品总数 */
  total: number
  /** 即将过期数量 */
  expiring_soon: number
  /** 已过期数量 */
  expired: number
  /** 已使用数量 */
  used: number
}