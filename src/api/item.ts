/**
 * 物品相关 API 接口
 * 包含物品的增删改查等操作
 * @module api/item
 */

import { post } from '@/api'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type {
  Item,
  ItemStatus,
  CreateItemParams,
  UpdateItemParams,
  ItemListParams,
  ItemSearchParams,
  ExpiringItem,
  ItemStats,
} from '@/types/api/item'
import { isUtcFormat, toUtcFormat } from '@/utils/date'

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
 * @param {string} data.expired_at - 过期时间，UTC时间格式: "2026-05-31T00:00:00.000Z"，必填
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
 *   expired_at: '2024-12-31T23:59:59.000Z',
 *   remind_days: 7
 * })
 * // 响应: { code: 0, message: 'success', data: { item_id: 1, name: '牛奶', ... } }
 * ```
 */
export function createItem(data: CreateItemParams) {
  // 检查并转换过期日期为UTC格式
  let expiredAt = data.expired_at
  if (expiredAt && !isUtcFormat(expiredAt)) {
    expiredAt = toUtcFormat(expiredAt)
  }

  return post<ApiResponse<Item>>('/item/create', {
    ...data,
    expired_at: expiredAt,
  })
}

/**
 * 获取物品列表
 * @description 获取当前用户的物品列表，支持分页、筛选和排序
 * @see {@link https://github.com/things-expired/docs#82-获取物品列表 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {ItemListParams} [params] - 查询参数
 * @param {number} [params.page] - 页码，最小值为1，默认为1
 * @param {number} [params.page_size] - 每页数量，1-100，默认为10
 * @param {number} [params.category_id] - 分类ID筛选，最小值为1
 * @param {ItemStatus} [params.status] - 状态筛选（0: 全部, 1: 正常, 2: 已过期, 3: 已消耗）
 * @param {string} [params.name] - 物品名称筛选，模糊搜索
 * @param {string} [params.description] - 物品描述筛选，模糊搜索
 * @param {string} [params.order_by] - 排序字段: created_at, updated_at, expired_at, name, quantity
 * @param {string} [params.order] - 排序方向: asc, desc，默认asc
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
 *   page_size: 10,
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
 * @param {string} [data.expired_at] - 过期时间，UTC时间格式: "2026-05-31T00:00:00.000Z"
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
  // 检查并转换过期日期为UTC格式
  let expiredAt = data.expired_at
  if (expiredAt && !isUtcFormat(expiredAt)) {
    expiredAt = toUtcFormat(expiredAt)
  }

  return post<ApiResponse<Item>>('/item/update', {
    ...data,
    expired_at: expiredAt,
  })
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
 * @returns {Promise<ApiResponse<ItemStats>>} 成功返回统计信息
 * @throws {Error} code=1002 未授权
 *
 * @example
 * ```typescript
 * const response = await getItemStats()
 * // 响应: { code: 0, message: 'success', data: { total: 10, expiring_soon: 3, expired: 2, used: 5 } }
 * ```
 */
export function getItemStats() {
  return post<ApiResponse<ItemStats>>('/item/stats')
}

// 导出类型供外部使用
export type {
  Item,
  ItemStatus,
  CreateItemParams,
  UpdateItemParams,
  ItemListParams,
  ItemSearchParams,
  ExpiringItem,
  ItemStats,
}