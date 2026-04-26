/**
 * 分类相关 API 接口
 * 包含分类的增删改查等操作
 */

import { post } from '@/api'
import type { ApiResponse, PaginatedResponse } from '@/types'

// ============ 类型定义 ============

/** 分类信息 */
export interface Category {
  category_id: number
  user_id: number
  name: string
  color: string
  icon: string
  sort_order: number
  created_at: string
}

/** 创建分类请求参数 */
export interface CreateCategoryParams {
  name: string
  color?: string
  icon?: string
  sort_order?: number
}

/** 更新分类请求参数 */
export interface UpdateCategoryParams {
  category_id: number
  name?: string
  color?: string
  icon?: string
  sort_order?: number
}

/** 删除分类请求参数 */
export interface DeleteCategoryParams {
  category_id: number
}

// ============ API 接口 ============

/**
 * 创建分类
 * @param data 创建参数
 */
export function createCategory(data: CreateCategoryParams) {
  return post<ApiResponse<Category>>('/category/create', data)
}

/**
 * 获取分类列表
 */
export function getCategoryList() {
  return post<ApiResponse<PaginatedResponse<Category>>>('/category/list')
}

/**
 * 更新分类
 * @param data 更新参数
 */
export function updateCategory(data: UpdateCategoryParams) {
  return post<ApiResponse<Category>>('/category/update', data)
}

/**
 * 删除分类
 * @param categoryId 分类ID
 */
export function deleteCategory(categoryId: number) {
  return post<ApiResponse<null>>('/category/delete', { category_id: categoryId })
}
