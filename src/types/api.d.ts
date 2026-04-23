/**
 * API 响应类型定义
 */

/** 基础响应结构 */
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

/** 分页响应结构 */
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 分页请求参数 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  keyword?: string
}

/** 基础实体类型 */
export interface BaseEntity {
  id: number
  createdAt?: string
  updatedAt?: string
}

/** 请求结果类型 */
export type Result<T = any> = Promise<ApiResponse<T>>
export type PaginatedResult<T = any> = Promise<ApiResponse<PaginatedResponse<T>>>
