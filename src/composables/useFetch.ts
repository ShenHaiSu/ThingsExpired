/**
 * 数据请求组合式函数
 * 封装常用的数据请求逻辑，提供加载状态、错误处理等功能
 */

import { ref, computed } from 'vue'
import { get, post, put, del, patch } from '@/api'

export interface UseFetchOptions<T = any> {
  immediate?: boolean
  initialParams?: any
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
}

export function useFetch<T = any>(url: string, options: UseFetchOptions<T> = {}) {
  const { immediate = false, initialParams = {}, onSuccess, onError } = options

  const data = ref<T | null>(null) as { value: T | null }
  const loading = ref(false)
  const error = ref<any>(null)

  const params = ref(initialParams)

  async function execute(fetchParams?: any) {
    loading.value = true
    error.value = null

    try {
      const mergedParams = { ...params.value, ...fetchParams }
      const result = await get<{ data: T }>(url, { params: mergedParams })
      data.value = result.data
      onSuccess?.(result.data)
      return result
    } catch (err) {
      error.value = err
      onError?.(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  if (immediate) {
    execute()
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    params,
    execute,
  }
}

export function useMutate<T = any>() {
  const loading = ref(false)
  const error = ref<any>(null)

  async function get<T = any>(url: string, config?: any) {
    loading.value = true
    error.value = null
    try {
      return await get<T>(url, config)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function postFn<T = any>(url: string, data?: any, config?: any) {
    loading.value = true
    error.value = null
    try {
      return await post<T>(url, data, config)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function putFn<T = any>(url: string, data?: any, config?: any) {
    loading.value = true
    error.value = null
    try {
      return await put<T>(url, data, config)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function delFn<T = any>(url: string, config?: any) {
    loading.value = true
    error.value = null
    try {
      return await del<T>(url, config)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function patchFn<T = any>(url: string, data?: any, config?: any) {
    loading.value = true
    error.value = null
    try {
      return await patch<T>(url, data, config)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    get,
    post: postFn,
    put: putFn,
    delete: delFn,
    patch: patchFn,
  }
}
