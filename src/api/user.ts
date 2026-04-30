/**
 * 用户相关 API 接口
 * 包含用户注册、登录、信息获取、会话管理等
 * @module api/user
 */

import { post } from '@/api'
import type { ApiResponse } from '@/types'
import type {
  User,
  LoginParams,
  RegisterParams,
  UpdateUserParams,
  LoginResponse,
  Session,
  SessionsResponse,
} from '@/types/api/user'

// ============ API 接口 ============

/**
 * 用户注册
 * @description 创建新用户账户，注册成功后可直接登录
 * @see {@link https://github.com/things-expired/docs#61-用户注册 API文档}
 * @param {RegisterParams} data - 注册参数
 * @param {string} data.username - 用户名，3-50个字符
 * @param {string} data.email - 邮箱，有效的邮箱格式
 * @param {string} data.password - 密码，6-20个字符
 * @returns {Promise<ApiResponse<User>>} 成功返回用户信息
 * @throws {Error} code=2002 用户已存在（邮箱或用户名重复）
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await register({
 *   username: 'zhangsan',
 *   email: 'zhangsan@example.com',
 *   password: '123456'
 * })
 * // 响应: { code: 0, message: 'success', data: { user_id: 1, username: 'zhangsan', ... } }
 * ```
 */
export function register(data: RegisterParams) {
  return post<ApiResponse<User>>('/user/register', data)
}

/**
 * 用户登录
 * @description 用户登录系统，获取JWT Token用于后续接口认证
 * @see {@link https://github.com/things-expired/docs#62-用户登录 API文档}
 * @param {LoginParams} data - 登录参数
 * @param {string} data.email - 邮箱地址
 * @param {string} data.password - 密码
 * @returns {Promise<ApiResponse<LoginResponse>>} 成功返回用户ID、Token和过期时间
 * @throws {Error} code=2001 用户不存在
 * @throws {Error} code=2003 密码错误
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await login({
 *   email: 'zhangsan@example.com',
 *   password: '123456'
 * })
 * // 响应: { code: 0, message: 'success', data: { user_id: 1, token: 'eyJ...', expired: '2024-01-02 12:00:00' } }
 * ```
 *
 * @remarks
 * - 登录成功后会创建会话记录，记录设备信息和IP地址
 * - 返回的token需要在后续请求的Authorization头中使用: `Authorization: Bearer {token}`
 * - Token有效期24小时，可在配置中修改
 */
export function login(data: LoginParams) {
  return post<ApiResponse<LoginResponse>>('/user/login', data)
}

/**
 * 获取用户信息
 * @description 获取当前登录用户的详细信息，用户ID从Token中自动获取
 * @see {@link https://github.com/things-expired/docs#63-获取用户信息 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @returns {Promise<ApiResponse<User>>} 成功返回用户信息
 * @throws {Error} code=1002 未授权（未登录或token无效）
 *
 * @example
 * ```typescript
 * const response = await getUserInfo()
 * // 响应: { code: 0, message: 'success', data: { user_id: 1, username: 'zhangsan', email: '...', status: 1, created_at: '...' } }
 * ```
 */
export function getUserInfo() {
  return post<ApiResponse<User>>('/user/info')
}

/**
 * 更新用户信息
 * @description 更新当前登录用户的个人信息，目前仅支持更新用户名
 * @see {@link https://github.com/things-expired/docs#64-更新用户信息 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {UpdateUserParams} data - 更新参数
 * @param {string} [data.username] - 用户名，3-50个字符，不传则不修改
 * @returns {Promise<ApiResponse<User>>} 成功返回更新后的用户信息
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效（用户名格式不正确）
 *
 * @example
 * ```typescript
 * const response = await updateUser({ username: 'zhangsan_new' })
 * // 响应: { code: 0, message: 'success', data: { user_id: 1, username: 'zhangsan_new', ... } }
 * ```
 */
export function updateUser(data: UpdateUserParams) {
  return post<ApiResponse<User>>('/user/update', data)
}

/**
 * 用户登出
 * @description 退出当前登录状态，撤销当前会话
 * @see {@link https://github.com/things-expired/docs#65-用户登出 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @returns {Promise<ApiResponse<null>>} 成功返回null
 * @throws {Error} code=1002 未授权
 *
 * @example
 * ```typescript
 * const response = await logout()
 * // 响应: { code: 0, message: 'success', data: null }
 * ```
 *
 * @remarks
 * - 登出会撤销当前会话，之后该token将失效
 * - 需要重新登录才能继续使用系统
 */
export function logout() {
  return post<ApiResponse<null>>('/user/logout')
}

/**
 * 获取用户所有会话
 * @description 获取当前用户的所有登录会话列表，用于管理多设备登录
 * @see {@link https://github.com/things-expired/docs#66-获取用户所有会话 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @returns {Promise<ApiResponse<SessionsResponse>>} 成功返回会话列表和总数
 * @throws {Error} code=1002 未授权
 *
 * @example
 * ```typescript
 * const response = await getSessions()
 * // 响应: { code: 0, message: 'success', data: { sessions: [...], total: 1 } }
 * ```
 *
 * @remarks
 * - 支持多端登录，默认最多3个会话
 * - 可查看每个会话的设备信息、IP地址、创建时间和过期时间
 * - 可用于排查异常登录或手动撤销其他设备会话
 */
export function getSessions() {
  return post<ApiResponse<SessionsResponse>>('/user/sessions')
}

/**
 * 撤销指定会话
 * @description 撤销指定的登录会话，被撤销的会话将无法继续使用
 * @see {@link https://github.com/things-expired/docs#67-撤销指定会话 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @param {number} sessionId - 要撤销的会话ID
 * @returns {Promise<ApiResponse<null>>} 成功返回null
 * @throws {Error} code=1002 未授权
 * @throws {Error} code=1001 参数无效
 *
 * @example
 * ```typescript
 * const response = await revokeSession(2)
 * // 响应: { code: 0, message: 'success', data: null }
 * ```
 *
 * @remarks
 * - 可以撤销其他设备的会话，实现强制下线指定设备
 * - 撤销后该设备需要重新登录
 */
export function revokeSession(sessionId: number) {
  return post<ApiResponse<null>>('/user/revoke_session', { session_id: sessionId })
}

/**
 * 强制下线（撤销所有会话）
 * @description 撤销当前用户的所有会话，包括当前会话，执行后需要重新登录
 * @see {@link https://github.com/things-expired/docs#68-强制下线撤销所有会话 API文档}
 * @requires 认证 - 需要在请求头中携带Token: Authorization: Bearer {token}
 * @returns {Promise<ApiResponse<null>>} 成功返回null
 * @throws {Error} code=1002 未授权
 *
 * @example
 * ```typescript
 * const response = await forceLogout()
 * // 响应: { code: 0, message: 'success', data: null }
 * ```
 *
 * @remarks
 * - 执行后会撤销当前用户的所有会话，包括当前会话
 * - 执行后需要重新登录
 * - 常用于账号安全问题或找回密码后强制下线所有设备
 */
export function forceLogout() {
  return post<ApiResponse<null>>('/user/force_logout')
}

// 导出类型供外部使用
export type {
  User,
  LoginParams,
  RegisterParams,
  UpdateUserParams,
  LoginResponse,
  Session,
  SessionsResponse,
}