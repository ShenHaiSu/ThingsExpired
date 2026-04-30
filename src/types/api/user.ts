/**
 * 用户相关类型定义
 * @module types/api/user
 */

/**
 * 用户信息
 * @description ThingsExpired系统中的用户实体，包含用户基本信息和账户状态
 */
export interface User {
  /** 用户ID（主键） */
  user_id: number
  /** 用户名（唯一） */
  username: string
  /** 邮箱（唯一） */
  email: string
  /** 账户状态（1: 正常） */
  status: number
  /** 创建时间，UTC时间格式: "2026-05-31T00:00:00.000Z" */
  created_at: string
}

/**
 * 登录请求参数
 * @description 用户登录时需要提供的凭证
 */
export interface LoginParams {
  /** 邮箱地址，有效的邮箱格式 */
  email: string
  /** 密码，6-20个字符 */
  password: string
}

/**
 * 注册请求参数
 * @description 用户注册时需要提供的信息
 */
export interface RegisterParams {
  /** 用户名，3-50个字符 */
  username: string
  /** 邮箱地址，有效的邮箱格式 */
  email: string
  /** 密码，6-20个字符 */
  password: string
}

/**
 * 更新用户请求参数
 * @description 更新用户信息时需要提供的参数，username为可选参数
 */
export interface UpdateUserParams {
  /** 用户名，3-50个字符，不传则不修改 */
  username?: string
}

/**
 * 登录响应
 * @description 用户登录成功后的响应数据
 */
export interface LoginResponse {
  /** 用户ID */
  user_id: number
  /** JWT Token，用于后续请求认证，格式: Bearer {token} */
  token: string
  /** Token过期时间，UTC时间格式: "2026-05-31T00:00:00.000Z" */
  expired: string
}

/**
 * 会话信息
 * @description 用户登录会话的详细信息
 */
export interface Session {
  /** 会话ID（主键） */
  session_id: number
  /** 所属用户ID */
  user_id: number
  /** 登录设备信息 */
  device_info: string
  /** 登录IP地址 */
  ip_address: string
  /** 会话创建时间，UTC时间格式: "2026-05-31T00:00:00.000Z" */
  created_at: string
  /** 会话过期时间，UTC时间格式: "2026-05-31T00:00:00.000Z" */
  expires_at: string
  /** 是否已撤销 */
  is_revoked: boolean
}

/**
 * 会话列表响应
 * @description 获取用户所有会话的响应结构
 */
export interface SessionsResponse {
  /** 会话列表 */
  sessions: Session[]
  /** 总数量 */
  total: number
}