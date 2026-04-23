/**
 * 认证相关组合式函数
 * 提供登录、登出、权限判断等功能
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user/userStore'

export function useAuth() {
  const router = useRouter()
  const userStore = useUserStore()

  const isLogging = ref(false)

  // 是否已登录
  const isAuthenticated = computed(() => !!userStore.token)

  // 当前用户信息
  const user = computed(() => userStore.userInfo)

  // 登录
  async function login(username: string, password: string) {
    isLogging.value = true
    try {
      await userStore.login({ username, password })
      // 登录成功后跳转到首页或之前的页面
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/')
    } finally {
      isLogging.value = false
    }
  }

  // 登出
  async function logout() {
    await userStore.logout()
    router.push('/login')
  }

  // 检查是否有某个权限
  function hasPermission(permission: string | string[]): boolean {
    if (!userStore.userInfo?.permissions) return false

    const permissions = Array.isArray(permission) ? permission : [permission]
    return permissions.some((p) => userStore.userInfo?.permissions?.includes(p))
  }

  // 检查是否有某个角色
  function hasRole(role: string | string[]): boolean {
    if (!userStore.userInfo?.roles) return false

    const roles = Array.isArray(role) ? role : [role]
    return roles.some((r) => userStore.userInfo?.roles?.includes(r))
  }

  return {
    isLogging,
    isAuthenticated,
    user,
    login,
    logout,
    hasPermission,
    hasRole,
  }
}
