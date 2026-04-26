# Things Expired 前端开发架构指南

> 本文档基于 API 交接文档进行深度架构分析，为前端开发人员提供完整的技术指导和实现方案。

---

## 目录

1. [项目业务分析](#1-项目业务分析)
2. [技术架构概览](#2-技术架构概览)
3. [核心模块设计](#3-核心模块设计)
4. [API 接口映射](#4-api-接口映射)
5. [数据类型定义](#5-数据类型定义)
6. [搜索与筛选设计](#6-搜索与筛选设计)
7. [表格展示设计](#7-表格展示设计)
8. [过期计算逻辑](#8-过期计算逻辑)
9. [状态管理设计](#9-状态管理设计)
10. [组件开发指南](#10-组件开发指南)

---

## 1. 项目业务分析

### 1.1 核心业务场景

ThingsExpired 是一个物品过期管理平台，主要服务于以下场景：

| 场景 | 描述 | 用户价值 |
|------|------|----------|
| 食品管理 | 记录食品生产日期和保质期 | 避免食用过期食品 |
| 药品管理 | 记录药品有效期 | 确保用药安全 |
| 物品库存 | 管理有使用期限的物品 | 合理安排使用计划 |
| 生产物料 | 记录生产原料保质期 | 优化库存周转 |

### 1.2 用户交互流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户交互流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │  注册/登录 │ -> │  创建分类 │ -> │  创建物品 │ -> │  查看过期 │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│       │              │              │              │            │
│       v              v              v              v            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │  用户管理 │    │  分类管理 │    │  物品管理 │    │  过期提醒 │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 数据隔离策略

- **用户级别隔离**：每个用户只能查看自己创建的分类和物品
- **会话级别管理**：支持多端登录，最多 3 个会话
- **Token 认证**：所有需认证接口必须携带 JWT Token

---

## 2. 技术架构概览

### 2.1 技术栈选型

| 类别 | 技术选型 | 版本 | 说明 |
|------|----------|------|------|
| 框架 | Vue | ^3.5.0 | 响应式前端框架 |
| 语言 | TypeScript | ~6.0.0 | 类型安全 |
| 构建工具 | Vite | ^7.0.0 | 快速开发体验 |
| 状态管理 | Pinia | ^3.0.0 | 轻量级状态管理 |
| 路由 | Vue Router | ^5.0.0 | SPA 路由 |
| UI 组件库 | PrimeVue | ^4.5.0 | 丰富组件库 |
| 样式 | Tailwind CSS | ^4.2.0 | 原子化 CSS |
| 网络请求 | Axios | ^1.15.0 | HTTP 客户端 |
| 日期处理 | Day.js | - | 轻量级日期库 |
| 国际化 | Vue-i18n | ^11.0.0 | 多语言支持 |

### 2.2 项目目录结构

```
src/
├── api/                      # 🌐 API 层
│   ├── index.ts              # axios 实例 + 拦截器
│   ├── auth.ts               # 认证接口
│   ├── user.ts               # 用户接口
│   ├── category.ts           # 分类接口
│   └── item.ts               # 物品接口
│
├── components/               # 🧩 组件层
│   ├── common/               # 通用组件
│   │   ├── SearchPanel.vue   # 搜索面板
│   │   ├── DataTable.vue     # 数据表格
│   │   └── StatusTag.vue     # 状态标签
│   └── business/             # 业务组件
│       ├── ItemCard.vue      # 物品卡片
│       ├── CategorySelect.vue # 分类选择
│       └── ExpireAlert.vue   # 过期提醒
│
├── composables/              # 🔄 组合式函数
│   ├── useAuth.ts            # 认证逻辑
│   ├── useItem.ts            # 物品业务逻辑
│   └── useSearch.ts          # 搜索逻辑
│
├── stores/                   # 📦 状态管理
│   ├── user/                 # 用户状态
│   │   └── userStore.ts
│   ├── category/             # 分类状态
│   │   └── categoryStore.ts
│   └── item/                 # 物品状态
│       └── itemStore.ts
│
├── types/                    # 📝 类型定义
│   ├── api.d.ts              # API 响应类型
│   ├── user.d.ts             # 用户类型
│   ├── category.d.ts         # 分类类型
│   └── item.d.ts             # 物品类型
│
├── utils/                    # 🛠️ 工具函数
│   ├── format.ts             # 格式化工具
│   ├── date.ts               # 日期计算工具
│   └── storage.ts            # 存储工具
│
└── views/                    # 📄 页面
    ├── login/                # 登录模块
    ├── home/                 # 首页
    ├── category/             # 分类管理
    │   ├── CategoryListView.vue
    │   └── CategoryEditView.vue
    └── item/                  # 物品管理
        ├── ItemListView.vue
        ├── ItemDetailView.vue
        └── ItemEditView.vue
```

---

## 3. 核心模块设计

### 3.1 认证模块

**功能需求**：
- 用户注册（用户名、邮箱、密码）
- 用户登录（邮箱 + 密码）
- Token 管理和刷新
- 会话管理（查看、撤销、强制下线）

**模块划分**：

| 模块 | 文件 | 职责 |
|------|------|------|
| API | `api/auth.ts` | 封装认证接口 |
| Store | `stores/user/userStore.ts` | 管理用户状态和 Token |
| Composable | `composables/useAuth.ts` | 提供认证逻辑 |
| View | `views/login/` | 登录/注册页面 |

### 3.2 分类模块

**功能需求**：
- 创建分类（名称、颜色、图标、排序）
- 获取分类列表
- 更新分类信息
- 删除分类（级联删除物品）

**模块划分**：

| 模块 | 文件 | 职责 |
|------|------|------|
| API | `api/category.ts` | 封装分类接口 |
| Store | `stores/category/categoryStore.ts` | 管理分类状态 |
| View | `views/category/` | 分类管理页面 |

### 3.3 物品模块

**功能需求**：
- 创建物品（分类、名称、描述、数量、单位、过期时间、提醒天数）
- 获取物品列表（支持丰富筛选条件）
- 获取物品详情
- 更新物品信息
- 删除物品
- 获取即将过期物品

**模块划分**：

| 模块 | 文件 | 职责 |
|------|------|------|
| API | `api/item.ts` | 封装物品接口 |
| Store | `stores/item/itemStore.ts` | 管理物品状态 |
| Composable | `composables/useItem.ts` | 物品业务逻辑 |
| View | `views/item/` | 物品管理页面 |

---

## 4. API 接口映射

### 4.1 认证接口

| 接口 | 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|------|
| 注册 | POST | `/api/user/register` | 否 | 用户注册 |
| 登录 | POST | `/api/user/login` | 否 | 用户登录 |
| 获取用户信息 | POST | `/api/user/info` | 是 | 获取当前用户信息 |
| 更新用户信息 | POST | `/api/user/update` | 是 | 更新用户名 |
| 登出 | POST | `/api/user/logout` | 是 | 退出登录 |
| 获取会话列表 | POST | `/api/user/sessions` | 是 | 获取所有会话 |
| 撤销会话 | POST | `/api/user/revoke_session` | 是 | 撤销指定会话 |
| 强制下线 | POST | `/api/user/force_logout` | 是 | 撤销所有会话 |

### 4.2 分类接口

| 接口 | 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|------|
| 创建分类 | POST | `/api/category/create` | 是 | 创建新分类 |
| 获取分类列表 | POST | `/api/category/list` | 是 | 获取分类列表 |
| 更新分类 | POST | `/api/category/update` | 是 | 更新分类信息 |
| 删除分类 | POST | `/api/category/delete` | 是 | 删除分类 |

### 4.3 物品接口

| 接口 | 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|------|
| 创建物品 | POST | `/api/item/create` | 是 | 创建新物品 |
| 获取物品列表 | POST | `/api/item/list` | 是 | 获取物品列表（支持筛选） |
| 获取物品详情 | POST | `/api/item/detail` | 是 | 获取物品详情 |
| 更新物品 | POST | `/api/item/update` | 是 | 更新物品信息 |
| 删除物品 | POST | `/api/item/delete` | 是 | 删除物品 |
| 获取即将过期物品 | POST | `/api/item/expiring` | 是 | 获取即将过期物品 |

---

## 5. 数据类型定义

### 5.1 用户类型

```typescript
// types/user.d.ts

export interface User {
  user_id: number
  username: string
  email: string
  status: number      // 1: 正常
  created_at: string  // "YYYY-MM-DD HH:mm:ss"
}

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  user_id: number
  token: string
  expired: string
}

export interface Session {
  session_id: number
  user_id: number
  device_info: string
  ip_address: string
  created_at: string
  expires_at: string
  is_revoked: boolean
}
```

### 5.2 分类类型

```typescript
// types/category.d.ts

export interface Category {
  category_id: number
  user_id: number
  name: string
  color: string       // 十六进制颜色，如 "#FF5733"
  icon: string
  sort_order: number
  created_at: string
}

export interface CreateCategoryParams {
  name: string
  color?: string
  icon?: string
  sort_order?: number
}

export interface UpdateCategoryParams {
  category_id: number
  name?: string
  color?: string
  icon?: string
  sort_order?: number
}
```

### 5.3 物品类型

```typescript
// types/item.d.ts

// 物品状态枚举
export enum ItemStatus {
  NORMAL = 1,      // 正常
  EXPIRED = 2,    // 已过期
  CONSUMED = 3    // 已消耗
}

export interface Item {
  item_id: number
  user_id: number
  category_id: number
  name: string
  description?: string
  quantity: number
  unit: string
  expired_at: string   // ISO 8601 格式，如 "2024-12-31T23:59:59Z"
  remind_days: number   // 提前提醒天数
  status: ItemStatus
  created_at: string
}

export interface CreateItemParams {
  category_id: number
  name: string
  description?: string
  quantity?: number
  unit?: string
  expired_at: string
  remind_days?: number
}

export interface UpdateItemParams {
  item_id: number
  category_id?: number
  name?: string
  description?: string
  quantity?: number
  unit?: string
  expired_at?: string
  remind_days?: number
}

export interface ItemSearchParams {
  page?: number
  page_size?: number
  category_id?: number
  name?: string
  description?: string
  unit?: string
  status?: number        // 0: 全部, 1: 正常, 2: 已过期, 3: 已消耗
  quantity_min?: number
  quantity_max?: number
  remind_days_min?: number
  remind_days_max?: number
  expired_at_from?: string   // "YYYY-MM-DD"
  expired_at_to?: string    // "YYYY-MM-DD"
  created_at_from?: string  // "YYYY-MM-DD"
  created_at_to?: string    // "YYYY-MM-DD"
  order_by?: 'created_at' | 'updated_at' | 'expired_at' | 'name' | 'quantity'
  order?: 'asc' | 'desc'
}

export interface ExpiringItem extends Item {
  days_until_expired: number  // 距离过期的天数，负数表示已过期
}
```

### 5.4 API 响应类型

```typescript
// types/api.d.ts

export interface ApiResponse<T = any> {
  code: number       // 0: 成功，非 0: 失败
  message: string
  data: T | null
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
}

// 通用错误码
export enum ErrorCode {
  SUCCESS = 0,
  INVALID_PARAMS = 1001,
  UNAUTHORIZED = 1002,
  FORBIDDEN = 1003,
  USER_NOT_FOUND = 2001,
  USER_EXISTS = 2002,
  PASSWORD_ERROR = 2003,
  INTERNAL_ERROR = 5001,
  DATABASE_ERROR = 5002
}
```

---

## 6. 搜索与筛选设计

### 6.1 搜索面板设计

根据 API 文档，物品列表接口支持丰富的筛选条件，需要设计一个紧凑、信息密度高的搜索面板。

**筛选条件分组**：

| 分组 | 筛选字段 | 组件类型 | 说明 |
|------|----------|----------|------|
| 基础信息 | name, description, unit | 文本输入 | 支持模糊搜索 |
| 分类筛选 | category_id | 下拉选择 | 关联分类列表 |
| 状态筛选 | status | 单选按钮组 | 全部/正常/已过期/已消耗 |
| 数量范围 | quantity_min, quantity_max | 数字输入 | 范围筛选 |
| 提醒天数 | remind_days_min, remind_days_max | 数字输入 | 范围筛选 |
| 过期时间 | expired_at_from, expired_at_to | 日期选择器 | 范围筛选 |
| 创建时间 | created_at_from, created_at_to | 日期选择器 | 范围筛选 |
| 排序 | order_by, order | 下拉选择 + 排序方向 | 排序配置 |

**搜索面板布局建议**：

```
┌─────────────────────────────────────────────────────────────────┐
│  搜索面板                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  物品名称   │ │  物品描述   │ │    单位    │ │  分类     │ │
│  │  [输入框]   │ │  [输入框]   │ │  [输入框]  │ │ [下拉框]  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
│  状态: ○ 全部  ● 正常  ○ 已过期  ○ 已消耗                        │
│                                                                 │
│  数量范围: [最小] ~ [最大]     提醒天数: [最小] ~ [最大]         │
│                                                                 │
│  过期时间: [开始日期] ~ [结束日期]                               │
│  创建时间: [开始日期] ~ [结束日期]                               │
│                                                                 │
│  排序: [按过期时间 ▼]  方向: ● 升序  ○ 降序                     │
│                                                                 │
│              [重置]                    [搜索]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 搜索参数处理

```typescript
// composables/useSearch.ts

import { ref, computed } from 'vue'
import type { ItemSearchParams } from '@/types'

export function useSearch() {
  const searchParams = ref<ItemSearchParams>({
    page: 1,
    page_size: 10,
    order_by: 'expired_at',
    order: 'asc'
  })

  // 构建搜索参数，过滤空值
  const buildSearchParams = computed(() => {
    const params: ItemSearchParams = {}
    
    for (const [key, value] of Object.entries(searchParams.value)) {
      if (value !== undefined && value !== '' && value !== null) {
        // 数字类型特殊处理
        if (key.includes('min') || key.includes('max') || key === 'page' || key === 'page_size' || key === 'category_id' || key === 'status') {
          if (value !== 0 && key !== 'status') {
            (params as any)[key] = value
          } else if (key === 'status' && value !== 0) {
            (params as any)[key] = value
          }
        } else if (typeof value === 'string' && value.trim() !== '') {
          (params as any)[key] = value
        }
      }
    }
    
    return params
  })

  // 重置搜索条件
  function resetSearch() {
    searchParams.value = {
      page: 1,
      page_size: 10,
      order_by: 'expired_at',
      order: 'asc'
    }
  }

  // 设置分页
  function setPage(page: number) {
    searchParams.value.page = page
  }

  function setPageSize(size: number) {
    searchParams.value.page_size = size
    searchParams.value.page = 1
  }

  return {
    searchParams,
    buildSearchParams,
    resetSearch,
    setPage,
    setPageSize
  }
}
```

---

## 7. 表格展示设计

### 7.1 表格列设计

根据物品数据模型，表格需要展示以下信息：

| 列名 | 字段 | 宽度 | 对齐 | 渲染方式 |
|------|------|------|------|----------|
| 物品名称 | name | 15% | 左 | 文本 |
| 分类 | category_id | 10% | 左 | 关联显示 |
| 描述 | description | 15% | 左 | 文本（截断） |
| 数量/单位 | quantity, unit | 8% | 右 | 组合显示 |
| 过期时间 | expired_at | 12% | 左 | 日期格式化 |
| 状态 | status | 8% | 居中 | 状态标签 |
| 提醒天数 | remind_days | 8% | 右 | 数字 |
| 创建时间 | created_at | 10% | 左 | 日期格式化 |
| 操作 | - | 14% | 居中 | 操作按钮组 |

### 7.2 状态标签设计

```typescript
// 状态显示映射
const statusMap = {
  1: { label: '正常', color: 'success', icon: 'pi pi-check-circle' },
  2: { label: '已过期', color: 'danger', icon: 'pi pi-exclamation-triangle' },
  3: { label: '已消耗', color: 'info', icon: 'pi pi-check' }
}

// 过期提醒显示
const getExpireDisplay = (expiredAt: string, remindDays: number) => {
  const now = new Date()
  const expired = new Date(expiredAt)
  const diffDays = Math.ceil((expired.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return { text: `已过期 ${Math.abs(diffDays)} 天`, color: 'danger' }
  } else if (diffDays <= remindDays) {
    return { text: `还有 ${diffDays} 天过期`, color: 'warning' }
  } else {
    return { text: `${diffDays} 天`, color: 'success' }
  }
}
```

### 7.3 表格组件示例

```vue
<template>
  <div class="item-table">
    <!-- 搜索面板 -->
    <SearchPanel v-model="searchParams" @search="handleSearch" @reset="handleReset" />
    
    <!-- 数据表格 -->
    <DataTable
      :data="itemList"
      :loading="loading"
      :total="total"
      :page="searchParams.page"
      :pageSize="searchParams.page_size"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <Column field="name" header="物品名称" :width="150">
        <template #body="{ row }">
          <span class="font-medium">{{ row.name }}</span>
        </template>
      </Column>
      
      <Column field="category_id" header="分类" :width="100">
        <template #body="{ row }">
          <CategoryTag :category-id="row.category_id" />
        </template>
      </Column>
      
      <Column field="description" header="描述" :width="150">
        <template #body="{ row }">
          <EllipsisText :text="row.description" :max-length="50" />
        </template>
      </Column>
      
      <Column field="quantity" header="数量" :width="80" align="right">
        <template #body="{ row }">
          {{ row.quantity }} {{ row.unit }}
        </template>
      </Column>
      
      <Column field="expired_at" header="过期时间" :width="120">
        <template #body="{ row }">
          <ExpireDisplay :expired-at="row.expired_at" :remind-days="row.remind_days" />
        </template>
      </Column>
      
      <Column field="status" header="状态" :width="80" align="center">
        <template #body="{ row }">
          <StatusTag :status="row.status" />
        </template>
      </Column>
      
      <Column field="created_at" header="创建时间" :width="140">
        <template #body="{ row }">
          {{ formatDate(row.created_at, 'YYYY-MM-DD HH:mm') }}
        </template>
      </Column>
      
      <Column header="操作" :width="140" align="center">
        <template #body="{ row }">
          <ActionButtons :item="row" @edit="handleEdit" @delete="handleDelete" @consume="handleConsume" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
```

---

## 8. 过期计算逻辑

### 8.1 前端过期计算

```typescript
// utils/date.ts

import dayjs from 'dayjs'

/**
 * 计算距离过期的天数
 * @param expiredAt 过期时间 (ISO 8601 格式)
 * @returns 距离过期的天数，负数表示已过期
 */
export function getDaysUntilExpired(expiredAt: string): number {
  const now = dayjs()
  const expired = dayjs(expiredAt)
  return expired.diff(now, 'day')
}

/**
 * 计算过期时间
 * @param startDate 起始日期
 * @param validityDays 可用天数
 * @returns 过期时间 (ISO 8601 格式)
 */
export function calculateExpiredAt(startDate: string | Date, validityDays: number): string {
  return dayjs(startDate).add(validityDays, 'day').toISOString()
}

/**
 * 格式化过期时间显示
 * @param expiredAt 过期时间
 * @returns 格式化后的显示文本
 */
export function formatExpiredDisplay(expiredAt: string): string {
  const days = getDaysUntilExpired(expiredAt)
  
  if (days < 0) {
    return `已过期 ${Math.abs(days)} 天`
  } else if (days === 0) {
    return '今天过期'
  } else if (days === 1) {
    return '明天过期'
  } else {
    return `还有 ${days} 天过期`
  }
}

/**
 * 判断是否即将过期
 * @param expiredAt 过期时间
 * @param remindDays 提前提醒天数
 * @returns 是否即将过期
 */
export function isExpiringSoon(expiredAt: string, remindDays: number = 3): boolean {
  const days = getDaysUntilExpired(expiredAt)
  return days >= 0 && days <= remindDays
}

/**
 * 判断是否已过期
 * @param expiredAt 过期时间
 * @returns 是否已过期
 */
export function isExpired(expiredAt: string): boolean {
  return getDaysUntilExpired(expiredAt) < 0
}

/**
 * 获取物品状态
 * @param expiredAt 过期时间
 * @returns 状态码 (1: 正常, 2: 已过期)
 */
export function getItemStatus(expiredAt: string): number {
  return isExpired(expiredAt) ? 2 : 1
}
```

### 8.2 创建物品时的日期计算

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { calculateExpiredAt, formatDate } from '@/utils'

// 表单数据
const form = ref({
  name: '',
  category_id: null as number | null,
  production_date: '',      // 生产日期/起始日期
  validity_days: 0,          // 可用天数
  expired_at: '',            // 过期时间（计算得出）
  remind_days: 3,
  quantity: 1,
  unit: '',
  description: ''
})

// 自动计算过期时间
watch([() => form.value.production_date, () => form.value.validity_days], ([date, days]) => {
  if (date && days > 0) {
    form.value.expired_at = calculateExpiredAt(date, days)
  }
})

// 过期时间显示
const expiredDisplay = computed(() => {
  if (!form.value.expired_at) return '请选择生产日期和可用天数'
  return formatDate(form.value.expired_at, 'YYYY-MM-DD HH:mm:ss')
})
</script>
```

---

## 9. 状态管理设计

### 9.1 用户状态 Store

```typescript
// stores/user/userStore.ts

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { post } from '@/api'
import { localCache } from '@/utils/storage'
import type { User, LoginParams, LoginResponse, Session } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>(localCache.get('token') || '')
  const userInfo = ref<User | null>(localCache.get('userInfo') || null)
  const sessions = ref<Session[]>([])
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.username || '')
  const userId = computed(() => userInfo.value?.user_id)
  
  // Actions
  async function login(params: LoginParams) {
    const res = await post<LoginResponse>('/api/user/login', params)
    token.value = res.data.token
    localCache.set('token', res.data.token)
    await fetchUserInfo()
    return res.data
  }
  
  async function register(params: { username: string; email: string; password: string }) {
    return post<User>('/api/user/register', params)
  }
  
  async function fetchUserInfo() {
    const res = await post<User>('/api/user/info')
    userInfo.value = res.data
    localCache.set('userInfo', res.data)
    return res.data
  }
  
  async function updateUserInfo(params: { username?: string }) {
    const res = await post<User>('/api/user/update', params)
    userInfo.value = res.data
    localCache.set('userInfo', res.data)
    return res.data
  }
  
  async function logout() {
    try {
      await post('/api/user/logout')
    } finally {
      token.value = ''
      userInfo.value = null
      sessions.value = []
      localCache.remove('token')
      localCache.remove('userInfo')
    }
  }
  
  async function fetchSessions() {
    const res = await post<{ sessions: Session[]; total: number }>('/api/user/sessions')
    sessions.value = res.data.sessions
    return res.data
  }
  
  async function revokeSession(sessionId: number) {
    await post('/api/user/revoke_session', { session_id: sessionId })
    await fetchSessions()
  }
  
  async function forceLogout() {
    await post('/api/user/force_logout')
    logout()
  }
  
  return {
    // State
    token,
    userInfo,
    sessions,
    // Getters
    isLoggedIn,
    userName,
    userId,
    // Actions
    login,
    register,
    fetchUserInfo,
    updateUserInfo,
    logout,
    fetchSessions,
    revokeSession,
    forceLogout
  }
})
```

### 9.2 分类状态 Store

```typescript
// stores/category/categoryStore.ts

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { post } from '@/api'
import type { Category, CreateCategoryParams, UpdateCategoryParams } from '@/types'

export const useCategoryStore = defineStore('category', () => {
  // State
  const categories = ref<Category[]>([])
  const loading = ref(false)
  
  // Getters
  const categoryMap = computed(() => {
    const map = new Map<number, Category>()
    categories.value.forEach(c => map.set(c.category_id, c))
    return map
  })
  
  const getCategoryById = (id: number) => categoryMap.value.get(id)
  
  // Actions
  async function fetchCategories() {
    loading.value = true
    try {
      const res = await post<{ list: Category[]; total: number }>('/api/category/list')
      categories.value = res.data.list
      return res.data
    } finally {
      loading.value = false
    }
  }
  
  async function createCategory(params: CreateCategoryParams) {
    const res = await post<Category>('/api/category/create', params)
    categories.value.push(res.data)
    return res.data
  }
  
  async function updateCategory(params: UpdateCategoryParams) {
    const res = await post<Category>('/api/category/update', params)
    const index = categories.value.findIndex(c => c.category_id === params.category_id)
    if (index !== -1) {
      categories.value[index] = res.data
    }
    return res.data
  }
  
  async function deleteCategory(categoryId: number) {
    await post('/api/category/delete', { category_id: categoryId })
    categories.value = categories.value.filter(c => c.category_id !== categoryId)
  }
  
  return {
    // State
    categories,
    loading,
    // Getters
    categoryMap,
    getCategoryById,
    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
})
```

### 9.3 物品状态 Store

```typescript
// stores/item/itemStore.ts

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { post } from '@/api'
import type { Item, ItemSearchParams, CreateItemParams, UpdateItemParams, ExpiringItem } from '@/types'

export const useItemStore = defineStore('item', () => {
  // State
  const items = ref<Item[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentItem = ref<Item | null>(null)
  const expiringItems = ref<ExpiringItem[]>([])
  
  // Actions
  async function fetchItems(params: ItemSearchParams) {
    loading.value = true
    try {
      const res = await post<{ list: Item[]; total: number; page: number }>('/api/item/list', params)
      items.value = res.data.list
      total.value = res.data.total
      return res.data
    } finally {
      loading.value = false
    }
  }
  
  async function fetchItemDetail(itemId: number) {
    const res = await post<Item>('/api/item/detail', { item_id: itemId })
    currentItem.value = res.data
    return res.data
  }
  
  async function createItem(params: CreateItemParams) {
    const res = await post<Item>('/api/item/create', params)
    items.value.unshift(res.data)
    total.value++
    return res.data
  }
  
  async function updateItem(params: UpdateItemParams) {
    const res = await post<Item>('/api/item/update', params)
    const index = items.value.findIndex(i => i.item_id === params.item_id)
    if (index !== -1) {
      items.value[index] = res.data
    }
    if (currentItem.value?.item_id === params.item_id) {
      currentItem.value = res.data
    }
    return res.data
  }
  
  async function deleteItem(itemId: number) {
    await post('/api/item/delete', { item_id: itemId })
    items.value = items.value.filter(i => i.item_id !== itemId)
    total.value--
  }
  
  async function fetchExpiringItems(days: number = 7) {
    const res = await post<ExpiringItem[]>('/api/item/expiring', { days })
    expiringItems.value = res.data
    return res.data
  }
  
  return {
    // State
    items,
    total,
    loading,
    currentItem,
    expiringItems,
    // Actions
    fetchItems,
    fetchItemDetail,
    createItem,
    updateItem,
    deleteItem,
    fetchExpiringItems
  }
})
```

---

## 10. 组件开发指南

### 10.1 搜索面板组件

```vue
<!-- components/common/SearchPanel.vue -->

<template>
  <div class="search-panel">
    <div class="search-grid">
      <!-- 基础信息 -->
      <div class="search-row">
        <div class="search-field">
          <label>物品名称</label>
          <InputText v-model="localParams.name" placeholder="请输入物品名称" />
        </div>
        <div class="search-field">
          <label>物品描述</label>
          <InputText v-model="localParams.description" placeholder="请输入物品描述" />
        </div>
        <div class="search-field">
          <label>单位</label>
          <InputText v-model="localParams.unit" placeholder="如：个、箱、盒" />
        </div>
        <div class="search-field">
          <label>分类</label>
          <Select
            v-model="localParams.category_id"
            :options="categoryOptions"
            option-label="name"
            option-value="category_id"
            placeholder="请选择分类"
            clearable
          />
        </div>
      </div>
      
      <!-- 状态筛选 -->
      <div class="search-row">
        <div class="search-field full-width">
          <label>状态</label>
          <SelectButton
            v-model="localParams.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
          />
        </div>
      </div>
      
      <!-- 范围筛选 -->
      <div class="search-row">
        <div class="search-field">
          <label>数量范围</label>
          <div class="range-inputs">
            <InputNumber v-model="localParams.quantity_min" placeholder="最小" :min="0" />
            <span>~</span>
            <InputNumber v-model="localParams.quantity_max" placeholder="最大" :min="0" />
          </div>
        </div>
        <div class="search-field">
          <label>提醒天数</label>
          <div class="range-inputs">
            <InputNumber v-model="localParams.remind_days_min" placeholder="最小" :min="0" />
            <span>~</span>
            <InputNumber v-model="localParams.remind_days_max" placeholder="最大" :min="0" />
          </div>
        </div>
      </div>
      
      <!-- 日期范围 -->
      <div class="search-row">
        <div class="search-field">
          <label>过期时间</label>
          <div class="range-inputs">
            <DatePicker v-model="localParams.expired_at_from" placeholder="开始日期" />
            <span>~</span>
            <DatePicker v-model="localParams.expired_at_to" placeholder="结束日期" />
          </div>
        </div>
        <div class="search-field">
          <label>创建时间</label>
          <div class="range-inputs">
            <DatePicker v-model="localParams.created_at_from" placeholder="开始日期" />
            <span>~</span>
            <DatePicker v-model="localParams.created_at_to" placeholder="结束日期" />
          </div>
        </div>
      </div>
      
      <!-- 排序 -->
      <div class="search-row">
        <div class="search-field">
          <label>排序字段</label>
          <Select
            v-model="localParams.order_by"
            :options="orderByOptions"
            option-label="label"
            option-value="value"
          />
        </div>
        <div class="search-field">
          <label>排序方向</label>
          <SelectButton
            v-model="localParams.order"
            :options="orderOptions"
            option-label="label"
            option-value="value"
          />
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="search-actions">
      <Button label="重置" severity="secondary" @click="handleReset" />
      <Button label="搜索" icon="pi pi-search" @click="handleSearch" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/stores'
import type { ItemSearchParams } from '@/types'

const props = defineProps<{
  modelValue: ItemSearchParams
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ItemSearchParams]
  'search': []
  'reset': []
}>()

const categoryStore = useCategoryStore()
const { categories } = storeToRefs(categoryStore)

// 本地参数
const localParams = ref({ ...props.modelValue })

// 分类选项
const categoryOptions = computed(() => categories.value)

// 状态选项
const statusOptions = [
  { label: '全部', value: 0 },
  { label: '正常', value: 1 },
  { label: '已过期', value: 2 },
  { label: '已消耗', value: 3 }
]

// 排序字段选项
const orderByOptions = [
  { label: '创建时间', value: 'created_at' },
  { label: '更新时间', value: 'updated_at' },
  { label: '过期时间', value: 'expired_at' },
  { label: '物品名称', value: 'name' },
  { label: '数量', value: 'quantity' }
]

// 排序方向选项
const orderOptions = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' }
]

// 监听参数变化
watch(localParams, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// 搜索
function handleSearch() {
  emit('search')
}

// 重置
function handleReset() {
  localParams.value = {
    page: 1,
    page_size: 10,
    order_by: 'expired_at',
    order: 'asc'
  }
  emit('reset')
}
</script>

<style scoped>
.search-panel {
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.search-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-field {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-field.full-width {
  flex-basis: 100%;
}

.search-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-inputs span {
  color: var(--text-color-secondary);
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}
</style>
```

### 10.2 状态标签组件

```vue
<!-- components/common/StatusTag.vue -->

<template>
  <Tag :value="statusConfig.label" :severity="statusConfig.color" :icon="statusConfig.icon" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ItemStatus } from '@/types'

const props = defineProps<{
  status: ItemStatus | number
}>()

const statusConfig = computed(() => {
  const map: Record<number, { label: string; color: string; icon: string }> = {
    1: { label: '正常', color: 'success', icon: 'pi pi-check-circle' },
    2: { label: '已过期', color: 'danger', icon: 'pi pi-exclamation-triangle' },
    3: { label: '已消耗', color: 'info', icon: 'pi pi-check' }
  }
  return map[props.status] || { label: '未知', color: 'secondary', icon: 'pi pi-question' }
})
</script>
```

### 10.3 过期显示组件

```vue
<!-- components/common/ExpireDisplay.vue -->

<template>
  <div class="expire-display" :class="displayConfig.class">
    <i :class="displayConfig.icon"></i>
    <span>{{ displayConfig.text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getDaysUntilExpired } from '@/utils'

const props = defineProps<{
  expiredAt: string
  remindDays: number
}>()

const displayConfig = computed(() => {
  const days = getDaysUntilExpired(props.expiredAt)
  
  if (days < 0) {
    return {
      text: `已过期 ${Math.abs(days)} 天`,
      class: 'expired',
      icon: 'pi pi-exclamation-triangle'
    }
  } else if (days === 0) {
    return {
      text: '今天过期',
      class: 'critical',
      icon: 'pi pi-exclamation-circle'
    }
  } else if (days <= props.remindDays) {
    return {
      text: `还有 ${days} 天过期`,
      class: 'warning',
      icon: 'pi pi-clock'
    }
  } else {
    return {
      text: `${days} 天`,
      class: 'normal',
      icon: 'pi pi-calendar'
    }
  }
})
</script>

<style scoped>
.expire-display {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.expire-display.expired {
  color: var(--red-500);
  font-weight: 600;
}

.expire-display.critical {
  color: var(--red-600);
  font-weight: 600;
}

.expire-display.warning {
  color: var(--orange-500);
}

.expire-display.normal {
  color: var(--green-500);
}
</style>
```

---

## 附录

### A. API 错误处理

```typescript
// 错误处理映射
const errorMessages: Record<number, string> = {
  1001: '参数错误，请检查输入',
  1002: '登录已过期，请重新登录',
  1003: '无权访问该资源',
  2001: '用户不存在',
  2002: '用户已存在',
  2003: '密码错误',
  5001: '服务器内部错误',
  5002: '数据库错误'
}

// 全局错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const code = error.response?.data?.code
    const message = errorMessages[code] || error.response?.data?.message || '网络错误'
    
    // 显示错误提示
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: message,
      life: 3000
    })
    
    // 处理 401 未授权
    if (code === 1002) {
      userStore.logout()
      router.push('/login')
    }
    
    return Promise.reject(error)
  }
)
```

### B. 时间格式参考

| 场景 | 格式 | 示例 |
|------|------|------|
| 后端返回时间 | `YYYY-MM-DD HH:mm:ss` | `2024-01-01 12:00:00` |
| 前端提交过期时间 | ISO 8601 | `2024-12-31T23:59:59Z` |
| 日期筛选 | `YYYY-MM-DD` | `2024-12-31` |
| 显示格式 | `YYYY-MM-DD HH:mm` | `2024-12-31 23:59` |

---

> 本文档将随项目迭代持续更新，如有问题请联系技术负责人。
