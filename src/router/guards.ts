/**
 * 路由守卫
 * 处理路由跳转时的权限验证、登录状态检查等
 */

import type { RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores'

/**
 * 路由守卫配置
 */
export function setupRouterGuards(router: any) {
  // 前置守卫
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    // 页面标题
    document.title = (to.meta.title as string) || 'Things Expired'

    // 定义不需要登录的路径（白名单）
    const publicPaths = ['/login', '/register', '/forgot-password', '/404', '/403']
    
    // 检查当前路径是否在白名单中
    const isPublicPath = publicPaths.some(path => to.path.startsWith(path))

    if (!isPublicPath) {
      // 不是白名单路径，需要检查登录状态
      const userStore = useUserStore()

      // 检查是否已登录
      if (!userStore.isLoggedIn) {
        // 未登录，跳转到登录页
        return {
          name: 'Login',
          query: { redirect: to.fullPath },
        }
      }

      // 检查权限（可选）
      const requiredPermissions = to.meta.permissions as string[] | undefined
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some((p) =>
          userStore.userInfo?.permissions?.includes(p),
        )
        if (!hasPermission) {
          // 无权限，跳转到403页面
          return { name: 'Forbidden' }
        }
      }
    }

    // 继续导航
    return true
  })

  // 后置守卫
  router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    // 滚动到页面顶部
    window.scrollTo(0, 0)
  })
}
