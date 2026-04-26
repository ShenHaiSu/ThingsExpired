/**
 * API 统一封装模块
 * 负责与后端服务的通信，包含请求/响应拦截器配置
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { useUserStore } from '@/stores/user/userStore'

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从 Pinia store 获取 token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 统一处理成功响应
    const res = response.data
    if (res.code !== undefined && res.code !== 0) {
      console.error('API Error:', res.message)
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  (error) => {
    // 统一处理错误响应
    const message = error.response?.data?.message || error.message || '网络错误'
    console.error('API Error:', message)

    // 处理 401 未授权
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

/**
 * GET 请求
 */
export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.get(url, config)
}

/**
 * POST 请求
 * @description 针对 /api 的 POST 请求，如果 data 为 null、undefined 或不传，必须传输空对象 {}
 * @param url - 请求 URL
 * @param data - 请求体数据，如果为 null/undefined/不传，则使用空对象 {}
 * @param config - Axios 配置
 */
export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  // 兜底处理：确保 body 不为 null 或 undefined
  const safeData = data === null || data === undefined ? {} : data
  return apiClient.post(url, safeData, config)
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.put(url, data, config)
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.delete(url, config)
}

/**
 * PATCH 请求
 */
export function patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.patch(url, data, config)
}

export default apiClient

// 导出各模块 API
export * from './user'
export * from './category'
export * from './item'
