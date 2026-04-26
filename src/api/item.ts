/**
 * 物品相关 API 接口
 * 包含物品的增删改查等操作
 */

import { post } from '@/api'
import type { ApiResponse, PaginatedResponse } from '@/types'

// ============ 类型定义 ============

/** 物品状态 */
export type ItemStatus = 1 | 2 | 3 | 4 // 1: 正常, 2: 即将过期, 3: 已过期, 4: 已使用

/** 物品信息 */
export interface Item {
  item_id: number
  user_id: number
  category_id: number
  name: string
  description: string
  quantity: number
  unit: string
  expired_at: string
  remind_days: number
  status: ItemStatus
  created_at: string
  updated_at: string
}

/** 创建物品请求参数 */
export interface CreateItemParams {
  category_id: number
  name: string
  description?: string
  quantity?: number
  unit?: string
  expired_at: string
  remind_days?: number
}

/** 更新物品请求参数 */
export interface UpdateItemParams {
  item_id: number
  category_id?: number
  name?: string
  description?: string
  quantity?: number
  unit?: string
  expired_at?: string
  remind_days?: number
}

/** 删除物品请求参数 */
export interface DeleteItemParams {
  item_id: number
}

/** 物品列表查询参数 */
export interface ItemListParams {
  page?: number
  pageSize?: number
  category_id?: number
  status?: ItemStatus
  keyword?: string
  sort_by?: 'expired_at' | 'created_at' | 'name'
  sort_order?: 'asc' | 'desc'
}

/** 物品列表响应 */
export interface ItemListResponse {
  list: Item[]
  total: number
  page: number
  pageSize: number
}

// ============ API 接口 ============

/**
 * 创建物品
 * @param data 创建参数
 */
export function createItem(data: CreateItemParams) {
  return post<ApiResponse<Item>>('/item/create', data)
}

/**
 * 获取物品列表
 * @param params 查询参数
 */
export function getItemList(params?: ItemListParams) {
  return post<ApiResponse<PaginatedResponse<Item>>>('/item/list', params)
}

/**
 * 获取物品详情
 * @param itemId 物品ID
 */
export function getItemDetail(itemId: number) {
  return post<ApiResponse<Item>>('/item/detail', { item_id: itemId })
}

/**
 * 更新物品
 * @param data 更新参数
 */
export function updateItem(data: UpdateItemParams) {
  return post<ApiResponse<Item>>('/item/update', data)
}

/**
 * 删除物品
 * @param itemId 物品ID
 */
export function deleteItem(itemId: number) {
  return post<ApiResponse<null>>('/item/delete', { item_id: itemId })
}

/**
 * 批量删除物品
 * @param itemIds 物品ID数组
 */
export function batchDeleteItems(itemIds: number[]) {
  return post<ApiResponse<null>>('/item/batch_delete', { item_ids: itemIds })
}

/**
 * 标记物品为已使用
 * @param itemId 物品ID
 */
export function markItemAsUsed(itemId: number) {
  return post<ApiResponse<Item>>('/item/mark_used', { item_id: itemId })
}

/**
 * 获取即将过期的物品
 * @param days 提前天数，默认7天
 */
export function getExpiringItems(days: number = 7) {
  return post<ApiResponse<PaginatedResponse<Item>>>('/item/expiring', { days })
}

/**
 * 获取已过期的物品
 */
export function getExpiredItems() {
  return post<ApiResponse<PaginatedResponse<Item>>>('/item/expired')
}

/**
 * 获取物品统计信息
 */
export function getItemStats() {
  return post<ApiResponse<{
    total: number
    expiring_soon: number
    expired: number
    used: number
  }>>('/item/stats')
}
