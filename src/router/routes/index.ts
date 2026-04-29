/**
 * 路由模块汇总
 * 统一导出所有路由配置
 */

import type { RouteRecordRaw } from 'vue-router'

// 导入各模块路由
import { defaultRoutes } from './default.routes'

// 合并所有路由
export const routes: RouteRecordRaw[] = [
  ...defaultRoutes,
  // 404 路由（放在最后）
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: {
      title: '404 Not Found',
      layout: 'BlankLayout',
      requiresAuth: false
    },
  },
]
