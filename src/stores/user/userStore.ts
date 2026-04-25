/**
 * 用户状态管理
 * 管理用户信息、Token、权限等
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { post } from '@/api'
import { localCache } from '@/utils/storage'

export interface UserInfo {
  id: number
  name: string
  email: string
  avatar?: string
  roles?: string[]
  permissions?: string[]
}

interface LoginParams {
  username: string
  password: string
}

export const useUserStore = defineStore(
  'user',
  () => {
    // State
    const token = ref<string>(localCache.get('token') || '')
    const userInfo = ref<UserInfo | null>(localCache.get('userInfo') || null)

    // Getters
    const isLoggedIn = computed(() => !!token.value)
    const userName = computed(() => userInfo.value?.name || '')

    // Actions
    async function login(params: LoginParams) {
      try {
        // 调用登录 API（根据实际后端接口调整）
        const res = await post<{ data: { token: string; user: UserInfo } }>('/auth/login', params)
        token.value = res.data.token
        userInfo.value = res.data.user

        // 持久化存储
        localCache.set('token', res.data.token)
        localCache.set('userInfo', res.data.user)

        return res
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    }

    async function logout() {
      try {
        // 调用退出登录 API（可选）
        await post('/auth/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // 清除状态
        token.value = ''
        userInfo.value = null

        // 清除本地存储
        localCache.remove('token')
        localCache.remove('userInfo')
      }
    }

    async function fetchUserInfo() {
      try {
        const res = await post<{ data: { user: UserInfo } }>('/auth/info')
        userInfo.value = res.data.user
        localCache.set('userInfo', res.data.user)
        return res.data.user
      } catch (error) {
        console.error('Fetch user info failed:', error)
        throw error
      }
    }

    function setToken(newToken: string) {
      token.value = newToken
      localCache.set('token', newToken)
    }

    return {
      // State
      token,
      userInfo,
      // Getters
      isLoggedIn,
      userName,
      // Actions
      login,
      logout,
      fetchUserInfo,
      setToken,
    }
  },
  {
    persist: {
      key: 'user-store',
    },
  }
)
