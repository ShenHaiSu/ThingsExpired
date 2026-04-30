/**
 * 分类相关类型定义
 * @module types/api/category
 */

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
  /** 创建时间，UTC时间格式: "2026-05-31T00:00:00.000Z" */
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