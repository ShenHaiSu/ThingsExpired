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
  // 注册页 - 使用空白布局
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/login/RegisterView.vue'),
    meta: {
      title: '注册',
      layout: BlankLayout,
      requiresAuth: false,
    },
  },
  // 忘记密码页 - 使用空白布局
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/login/ForgotPasswordView.vue'),
    meta: {
      title: '忘记密码',
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
  // 分类管理页
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/category/CategoryView.vue'),
    meta: {
      title: '分类管理',
      layout: DefaultLayout,
      requiresAuth: true,
    },
  },
  // 物品管理页
  {
    path: '/items',
    name: 'Items',
    component: () => import('@/views/items/ItemsView.vue'),
    meta: {
      title: '物品管理',
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
      requiresAuth: false,
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
      requiresAuth: false,
    },
  },
]
