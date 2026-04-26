/**
 * 用户相关 API 接口
 * 包含用户注册、登录、信息获取、会话管理等
 */

import { post } from '@/api'
import type { ApiResponse } from '@/types'

// ============ 类型定义 ============

/** 用户信息 */
export interface User {
  user_id: number
  username: string
  email: string
  status: number
  created_at: string
}

/** 登录请求参数 */
export interface LoginParams {
  email: string
  password: string
}

/** 注册请求参数 */
export interface RegisterParams {
  username: string
  email: string
  password: string
}

/** 更新用户请求参数 */
export interface UpdateUserParams {
  username?: string
}

/** 会话信息 */
export interface Session {
  session_id: number
  user_id: number
  device_info: string
  ip_address: string
  created_at: string
  expires_at: string
  is_revoked: boolean
}

/** 会话列表响应 */
export interface SessionsResponse {
  sessions: Session[]
  total: number
}

/** 登录响应 */
export interface LoginResponse {
  user_id: number
  token: string
  expired: string
}

// ============ API 接口 ============

/**
 * 用户注册
 * @param data 注册参数
 */
export function register(data: RegisterParams) {
  return post<ApiResponse<User>>('/user/register', data)
}

/**
 * 用户登录
 * @param data 登录参数
 */
export function login(data: LoginParams) {
  return post<ApiResponse<LoginResponse>>('/user/login', data)
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return post<ApiResponse<User>>('/user/info')
}

/**
 * 更新用户信息
 * @param data 更新参数
 */
export function updateUser(data: UpdateUserParams) {
  return post<ApiResponse<User>>('/user/update', data)
}

/**
 * 用户登出
 */
export function logout() {
  return post<ApiResponse<null>>('/user/logout')
}

/**
 * 获取用户所有会话
 */
export function getSessions() {
  return post<ApiResponse<SessionsResponse>>('/user/sessions')
}

/**
 * 撤销指定会话
 * @param sessionId 会话ID
 */
export function revokeSession(sessionId: number) {
  return post<ApiResponse<null>>('/user/revoke_session', { session_id: sessionId })
}

/**
 * 强制下线（撤销所有会话）
 */
export function forceLogout() {
  return post<ApiResponse<null>>('/user/force_logout')
}
