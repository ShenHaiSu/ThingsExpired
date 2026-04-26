/**
 * 分类相关 API 接口
 * 包含分类的增删改查等操作
 * @module api/category
 */

import { post } from '@/api'
import type { ApiResponse, PaginatedResponse } from '@/types'

// ============ 类型定义 ============

/**
 * 分类信息
 * @description ThingsExpired系统中的分类实体，用于对物品进行分组管理
 */
export interface Category {
  /** 分类ID（主键） */
  category_id: number
  /** 所属用户ID */
  user_id: number
  /** 分类名称 */
  name: string
  /** 分类颜色（十六进制格式，如: "#FF0000"） */
  color: string
  /** 分类图标 */
  icon: string
  /** 排序顺序，数字越小越靠前 */
  sort_order: number
  /** 创建时间，格式: YYYY-MM-DD HH:mm:ss */
  created_at: string
}

/**
 * 创建分类请求参数
 * @description 创建新分类时需要提供的参数
 */
export interface CreateCategoryParams {
  /** 分类名称，1-100个字符，必填 */
  name: string
  /** 分类颜色，最多20个字符，如: "#FF0000" */
  color?: string
  /** 分类图标，最多50个字符 */
  icon?: string
  /** 排序顺序，数字，默认为0 */
  sort_order?: number
}

/**
 * 更新分类请求参数
 * @description 更新分类信息时需要提供的参数
 */
export interface UpdateCategoryParams {
  /** 分类ID，最小值为1，必填 */
  category_id: number
  /** 分类名称，1-100个字符 */
  name?: string
  /** 分类颜色，最多20个字符 */
  color?: string
  /** 分类图标，最多50个字符 */
  icon?: string
  /** 排序顺序，数字 */
  sort_order?: number
}

/**
 * 删除分类请求参数
 * @description 删除分类时需要提供的参数
 */
export interface DeleteCategoryParams {
  /** 分类ID，必填 */
  category_id: number
}

// ============ API 接口 ============

/**
 * 创建分类
 * @description 创建一个新的物品分类，用于对物品进行分组管理
 * @see {@link https://github.com/things-expired/docs#71-创建分类 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {CreateCategoryParams} data - 创建参数
 * @param {string} data.name - 分类名称，1-100个字符，必填
 * @param {string} [data.color] - 分类颜色，最多20个字符，如: "#FF0000"
 * @param {string} [data.icon] - 分类图标，最多50个字符
 * @param {number} [data.sort_order] - 排序顺序，数字，默认为0
 * @returns {Promise<ApiResponse<Category>>} 成功返回创建的分类信息
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await createCategory({
 *   name: '食品',
 *   color: '#FF5733',
 *   icon: 'food',
 *   sort_order: 1
 * })
 * // 响应: { code: 0, message: 'success', data: { category_id: 1, user_id: 1, name: '食品', ... } }
 * ```
 */
export function createCategory(data: CreateCategoryParams) {
  return post<ApiResponse<Category>>('/category/create', data)
}

/**
 * 获取分类列表
 * @description 获取当前用户的所有分类列表
 * @see {@link https://github.com/things-expired/docs#72-获取分类列表 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @returns {Promise<ApiResponse<PaginatedResponse<Category>>>} 成功返回分类列表和总数
 * @throws {Error} code=1002 未授权
 *
 * @example
 * ```typescript
 * const response = await getCategoryList()
 * // 响应: { code: 0, message: 'success', data: { list: [{ category_id: 1, name: '食品', ... }], total: 1 } }
 * ```
 *
 * @remarks
 * - 分页参数固定为 page=1, pageSize=10
 * - 返回的列表按 sort_order 字段排序
 */
export function getCategoryList() {
  return post<ApiResponse<PaginatedResponse<Category>>>('/category/list')
}

/**
 * 更新分类
 * @description 更新指定分类的信息，可更新名称、颜色、图标和排序顺序
 * @see {@link https://github.com/things-expired/docs#73-更新分类 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {UpdateCategoryParams} data - 更新参数
 * @param {number} data.category_id - 分类ID，最小值为1，必填
 * @param {string} [data.name] - 分类名称，1-100个字符
 * @param {string} [data.color] - 分类颜色，最多20个字符
 * @param {string} [data.icon] - 分类图标，最多50个字符
 * @param {number} [data.sort_order] - 排序顺序，数字
 * @returns {Promise<ApiResponse<Category>>} 成功返回更新后的分类信息
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await updateCategory({
 *   category_id: 1,
 *   name: '食品更新',
 *   color: '#00FF00'
 * })
 * // 响应: { code: 0, message: 'success', data: { category_id: 1, name: '食品更新', color: '#00FF00', ... } }
 * ```
 */
export function updateCategory(data: UpdateCategoryParams) {
  return post<ApiResponse<Category>>('/category/update', data)
}

/**
 * 删除分类
 * @description 删除指定的分类，删除分类会同时删除该分类下的所有物品
 * @see {@link https://github.com/things-expired/docs#74-删除分类 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {number} categoryId - 分类ID，必填
 * @returns {Promise<ApiResponse<null>>} 成功返回null
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await deleteCategory(1)
 * // 响应: { code: 0, message: 'success', data: null }
 * ```
 *
 * @warning 警告
 * - 删除分类会同时删除该分类下的所有物品
 * - 删除后无法恢复，请谨慎操作
 */
export function deleteCategory(categoryId: number) {
  return post<ApiResponse<null>>('/category/delete', { category_id: categoryId })
}
