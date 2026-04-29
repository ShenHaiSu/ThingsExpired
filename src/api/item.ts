/**
 * 物品相关 API 接口
 * 包含物品的增删改查等操作
 * @module api/item
 */

import { post } from '@/api'
import type { ApiResponse, PaginatedResponse } from '@/types'

// ============ 类型定义 ============

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
  /** 过期时间，ISO 8601格式，如: "2024-12-31T23:59:59Z" */
  expired_at: string
  /** 提前提醒天数 */
  remind_days: number
  /** 物品状态（1: 正常, 2: 已过期, 3: 已消耗） */
  status: ItemStatus
  /** 创建时间，格式: YYYY-MM-DD HH:mm:ss */
  created_at: string
  /** 更新时间，格式: YYYY-MM-DD HH:mm:ss */
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
  /** 过期时间，ISO 8601格式，必填，如: "2024-12-31T23:59:59Z" */
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
  /** 过期时间，ISO 8601格式 */
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
 * 物品列表查询参数
 * @description 获取物品列表时支持的查询参数，支持复合搜索和分页
 */
export interface ItemListParams {
  /** 页码，最小值为1，默认为1 */
  page?: number
  /** 每页数量，1-100，默认为10 */
  pageSize?: number
  /** 分类ID筛选，最小值为1 */
  category_id?: number
  /** 状态筛选（0: 全部, 1: 正常, 2: 已过期, 3: 已消耗） */
  status?: ItemStatus
  /** 物品名称筛选，模糊搜索，最多200个字符 */
  keyword?: string
  /** 排序字段，可选值: created_at, updated_at, expired_at, name, quantity */
  sort_by?: 'expired_at' | 'created_at' | 'name' | 'updated_at' | 'quantity'
  /** 排序方向，可选值: asc, desc，默认asc */
  sort_order?: 'asc' | 'desc'
}

/**
 * 物品搜索参数
 * @description 支持复杂复合搜索的参数定义
 */
export interface ItemSearchParams {
  /** 页码，最小值为1，默认为1 */
  page?: number
  /** 每页数量，1-100，默认为10 */
  page_size?: number
  /** 分类ID筛选，最小值为1 */
  category_id?: number
  /** 物品名称筛选，模糊搜索 */
  name?: string
  /** 物品描述筛选，模糊搜索 */
  description?: string
  /** 单位筛选 */
  unit?: string
  /** 状态筛选（0: 全部, 1: 正常, 2: 已过期, 3: 已消耗） */
  status?: number
  /** 最小数量筛选 */
  quantity_min?: number
  /** 最大数量筛选 */
  quantity_max?: number
  /** 最小提前提醒天数筛选 */
  remind_days_min?: number
  /** 最大提前提醒天数筛选 */
  remind_days_max?: number
  /** 过期时间起始日期（YYYY-MM-DD） */
  expired_at_from?: string
  /** 过期时间结束日期（YYYY-MM-DD） */
  expired_at_to?: string
  /** 创建时间起始日期（YYYY-MM-DD） */
  created_at_from?: string
  /** 创建时间结束日期（YYYY-MM-DD） */
  created_at_to?: string
  /** 排序字段 */
  order_by?: 'created_at' | 'updated_at' | 'expired_at' | 'name' | 'quantity'
  /** 排序方向 */
  order?: 'asc' | 'desc'
}

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
  /** 每页数量 */
  pageSize: number
}

/**
 * 即将过期物品响应
 * @description 获取即将过期物品的响应结构，包含距离过期的天数
 */
export interface ExpiringItem extends Item {
  /** 距离过期的天数，负数表示已过期 */
  days_until_expired: number
}

// ============ API 接口 ============

/**
 * 创建物品
 * @description 创建一个新的物品记录，用于跟踪物品的过期时间
 * @see {@link https://github.com/things-expired/docs#81-创建物品 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {CreateItemParams} data - 创建参数
 * @param {number} data.category_id - 分类ID，最小值为1，必填
 * @param {string} data.name - 物品名称，1-200个字符，必填
 * @param {string} [data.description] - 物品描述，最多500个字符
 * @param {number} [data.quantity] - 数量，最小值为1，默认为1
 * @param {string} [data.unit] - 单位，最多20个字符，如: "个", "箱", "盒"
 * @param {string} data.expired_at - 过期时间，ISO 8601格式，必填，如: "2024-12-31T23:59:59Z"
 * @param {number} [data.remind_days] - 提前提醒天数，0-365，默认为3
 * @returns {Promise<ApiResponse<Item>>} 成功返回创建的物品信息
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await createItem({
 *   category_id: 1,
 *   name: '牛奶',
 *   description: '新鲜牛奶',
 *   quantity: 1,
 *   unit: '盒',
 *   expired_at: '2024-12-31T23:59:59Z',
 *   remind_days: 7
 * })
 * // 响应: { code: 0, message: 'success', data: { item_id: 1, name: '牛奶', ... } }
 * ```
 */
export function createItem(data: CreateItemParams) {
  return post<ApiResponse<Item>>('/item/create', data)
}

/**
 * 获取物品列表
 * @description 获取当前用户的物品列表，支持分页、筛选和排序
 * @see {@link https://github.com/things-expired/docs#82-获取物品列表 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {ItemListParams} [params] - 查询参数
 * @param {number} [params.page] - 页码，最小值为1，默认为1
 * @param {number} [params.pageSize] - 每页数量，1-100，默认为10
 * @param {number} [params.category_id] - 分类ID筛选，最小值为1
 * @param {ItemStatus} [params.status] - 状态筛选（0: 全部, 1: 正常, 2: 已过期, 3: 已消耗）
 * @param {string} [params.keyword] - 物品名称筛选，模糊搜索，最多200个字符
 * @param {string} [params.sort_by] - 排序字段: created_at, updated_at, expired_at, name, quantity
 * @param {string} [params.sort_order] - 排序方向: asc, desc，默认asc
 * @returns {Promise<ApiResponse<PaginatedResponse<Item>>>} 成功返回物品列表、总数量和当前页码
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * // 获取所有物品
 * const response = await getItemList()
 *
 * // 分页查询即将过期的物品
 * const response = await getItemList({
 *   page: 1,
 *   pageSize: 10,
 *   category_id: 1,
 *   status: 1,
 *   order_by: 'expired_at',
 *   order: 'asc'
 * })
 * // 响应: { code: 0, message: 'success', data: { list: [...], total: 1, page: 1 } }
 * ```
 */
export function getItemList(params?: ItemListParams) {
  return post<ApiResponse<PaginatedResponse<Item>>>('/item/list', params)
}

/**
 * 获取物品详情
 * @description 获取指定物品的详细信息
 * @see {@link https://github.com/things-expired/docs#83-获取物品详情 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {number} itemId - 物品ID，必填
 * @returns {Promise<ApiResponse<Item>>} 成功返回物品详细信息
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await getItemDetail(1)
 * // 响应: { code: 0, message: 'success', data: { item_id: 1, name: '牛奶', ... } }
 * ```
 */
export function getItemDetail(itemId: number) {
  return post<ApiResponse<Item>>('/item/detail', { item_id: itemId })
}

/**
 * 更新物品
 * @description 更新指定物品的信息，可更新分类、名称、描述、数量、单位、过期时间和提醒天数
 * @see {@link https://github.com/things-expired/docs#84-更新物品 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {UpdateItemParams} data - 更新参数
 * @param {number} data.item_id - 物品ID，最小值为1，必填
 * @param {number} [data.category_id] - 分类ID，最小值为1
 * @param {string} [data.name] - 物品名称，1-200个字符
 * @param {string} [data.description] - 物品描述，最多500个字符
 * @param {number} [data.quantity] - 数量，最小值为1
 * @param {string} [data.unit] - 单位，最多20个字符
 * @param {string} [data.expired_at] - 过期时间，ISO 8601格式
 * @param {number} [data.remind_days] - 提前提醒天数，0-365
 * @returns {Promise<ApiResponse<Item>>} 成功返回更新后的物品信息
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await updateItem({
 *   item_id: 1,
 *   name: '牛奶更新',
 *   quantity: 2
 * })
 * // 响应: { code: 0, message: 'success', data: { item_id: 1, name: '牛奶更新', quantity: 2, ... } }
 * ```
 */
export function updateItem(data: UpdateItemParams) {
  return post<ApiResponse<Item>>('/item/update', data)
}

/**
 * 删除物品
 * @description 删除指定的物品记录
 * @see {@link https://github.com/things-expired/docs#85-删除物品 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {number} itemId - 物品ID，必填
 * @returns {Promise<ApiResponse<null>>} 成功返回null
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await deleteItem(1)
 * // 响应: { code: 0, message: 'success', data: null }
 * ```
 */
export function deleteItem(itemId: number) {
  return post<ApiResponse<null>>('/item/delete', { item_id: itemId })
}

/**
 * 批量删除物品
 * @description 批量删除多个物品记录
 * @param {number[]} itemIds - 物品ID数组，必填
 * @returns {Promise<ApiResponse<null>>} 成功返回null
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await batchDeleteItems([1, 2, 3])
 * // 响应: { code: 0, message: 'success', data: null }
 * ```
 */
export function batchDeleteItems(itemIds: number[]) {
  return post<ApiResponse<null>>('/item/batch_delete', { item_ids: itemIds })
}

/**
 * 标记物品为已使用
 * @description 将物品状态标记为已消耗，用于记录物品已被使用
 * @param {number} itemId - 物品ID，必填
 * @returns {Promise<ApiResponse<Item>>} 成功返回更新后的物品信息
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await markItemAsUsed(1)
 * // 响应: { code: 0, message: 'success', data: { item_id: 1, status: 3, ... } }
 * ```
 */
export function markItemAsUsed(itemId: number) {
  return post<ApiResponse<Item>>('/item/mark_used', { item_id: itemId })
}

/**
 * 获取即将过期的物品
 * @description 获取指定天数内即将过期的物品列表，用于提醒用户
 * @see {@link https://github.com/things-expired/docs#86-获取即将过期物品 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {number} [days=7] - 未来天数，1-365，默认为7
 * @returns {Promise<ApiResponse<ExpiringItem[]>>} 成功返回即将过期的物品列表，包含距离过期天数
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * // 获取7天内即将过期的物品
 * const response = await getExpiringItems(7)
 * // 响应: { code: 0, message: 'success', data: [{ item_id: 1, name: '牛奶', days_until_expired: 5, ... }] }
 * ```
 *
 * @remarks
 * - 返回的物品列表会包含 days_until_expired 字段，表示距离过期的天数
 * - 负数表示已过期
 * - 常用于首页过期提醒功能
 */
export function getExpiringItems(days: number = 7) {
  return post<ApiResponse<ExpiringItem[]>>('/item/expiring', { days })
}

/**
 * 获取已过期的物品
 * @description 获取所有已过期的物品列表
 * @returns {Promise<ApiResponse<PaginatedResponse<Item>>>} 成功返回已过期物品列表
 * @throws {Error} code=1002 未授权
 *
 * @example
 * ```typescript
 * const response = await getExpiredItems()
 * // 响应: { code: 0, message: 'success', data: { list: [...], total: 1, page: 1 } }
 * ```
 */
export function getExpiredItems() {
  return post<ApiResponse<PaginatedResponse<Item>>>('/item/expired')
}

/**
 * 获取物品统计信息
 * @description 获取物品的统计信息，包括总数、即将过期数量、已过期数量、已使用数量
 * @returns {Promise<ApiResponse<{total: number, expiring_soon: number, expired: number, used: number}>>} 成功返回统计信息
 * @throws {Error} code=1002 未授权
 *
 * @example
 * ```typescript
 * const response = await getItemStats()
 * // 响应: { code: 0, message: 'success', data: { total: 10, expiring_soon: 3, expired: 2, used: 5 } }
 * ```
 */
export function getItemStats() {
  return post<ApiResponse<{
    total: number
    expiring_soon: number
    expired: number
    used: number
  }>>('/item/stats')
}
