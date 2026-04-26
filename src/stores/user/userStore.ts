/**
 * 用户状态管理
 * 管理用户信息、Token、权限等
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getUserInfo as getUserInfoApi } from '@/api'
import type { LoginParams, User, LoginResponse } from '@/api/user'
import { localCache } from '@/utils/storage'

export interface UserInfo {
  id: number
  name: string
  email: string
  avatar?: string
  roles?: string[]
  permissions?: string[]
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
        const res = await loginApi(params)
        if (res.code === 0 && res.data) {
          token.value = res.data.token
          localCache.set('token', res.data.token)
          // 获取用户信息
          await fetchUserInfo()
        }
        return res
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    }

    async function logout() {
      try {
        await logoutApi()
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
        const res = await getUserInfoApi()
        if (res.code === 0 && res.data) {
          userInfo.value = {
            id: res.data.user_id,
            name: res.data.username,
            email: res.data.email,
          }
          localCache.set('userInfo', userInfo.value)
        }
        return userInfo.value
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
