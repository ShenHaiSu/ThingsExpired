/**
 * 默认路由配置
 * 包含登录、首页、错误页等基础路由
 */

import type { RouteRecordRaw } from 'vue-router'
import { DefaultLayout, BlankLayout } from '@/layouts'

export const defaultRoutes: RouteRecordRaw[] = [
  // 登录页 - 使用空白布局
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: {
      title: '登录',
      layout: BlankLayout,
      requiresAuth: false,
    },
  },
  // 首页 - 使用默认布局，需要登录
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/HomeView.vue'),
    meta: {
      title: '首页',
      layout: DefaultLayout,
      requiresAuth: true,
    },
  },
  // 404 页面
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: {
      title: '404 Not Found',
      layout: BlankLayout,
    },
  },
  // 403 页面
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/ForbiddenView.vue'),
    meta: {
      title: '403 Forbidden',
      layout: BlankLayout,
    },
  },
]
