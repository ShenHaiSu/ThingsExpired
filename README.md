# Things Expired Web App

> 一个基于 Vue 3 + TypeScript + Vite 构建的过期物品管理应用。

[![Vue.js](https://img.shields.io/badge/Vue-3.5+-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~6.0.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-^7.0.0-purple.svg)](https://vitejs.dev/)

## 📋 项目简介

Things Expired 是一个用于管理过期物品的应用，支持食品、药品、物品库存和生产物料的保质期管理。项目采用现代化的前端技术栈，遵循组件化和模块化设计原则，旨在提供一个可维护、可扩展的解决方案。

### 核心功能

- **用户管理**：注册、登录、用户信息管理、会话管理
- **分类管理**：创建、编辑、删除物品分类
- **物品管理**：创建、编辑、删除物品，支持丰富的筛选条件
- **过期提醒**：自动计算过期时间，提供过期提醒功能
- **多端适配**：支持移动端和桌面端，响应式设计

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 开发环境运行

```bash
pnpm dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist` 目录。

### 类型检查

```bash
pnpm type-check
```

## 🛠️ 技术栈

| 类别 | 技术选型 | 版本 | 说明 |
| --- | --- | --- | --- |
| 框架 | Vue | ^3.5.0 | 响应式前端框架 |
| 语言 | TypeScript | ~6.0.0 | 类型安全 |
| 构建工具 | Vite | ^7.0.0 | 快速开发体验 |
| 状态管理 | Pinia | ^3.0.0 | 轻量级状态管理 |
| 路由 | Vue Router | ^5.0.0 | SPA 路由 |
| UI 组件库 | PrimeVue | ^4.5.0 | 丰富组件库 |
| 样式 | Tailwind CSS | ^4.2.0 | 原子化 CSS |
| 网络请求 | Axios | ^1.15.0 | HTTP 客户端 |
| 国际化 | Vue-i18n | ^11.0.0 | 多语言支持 |

## 📂 项目结构

```
src/
├── api/                      # API 层 - 统一管理所有接口
│   ├── index.ts              # axios 实例配置 + 拦截器
│   ├── user.ts               # 用户接口
│   ├── category.ts           # 分类接口
│   └── item.ts               # 物品接口
├── assets/                   # 静态资源
│   └── styles/               # 全局样式
├── components/               # 公共组件
│   ├── common/               # 通用组件
│   └── index.ts              # 组件统一导出
├── composables/              # 组合式函数
│   ├── useAuth.ts            # 认证逻辑
│   ├── useFetch.ts           # 数据请求
│   └── index.ts              # 统一导出
├── layouts/                  # 布局组件
│   ├── DefaultLayout.vue     # 默认布局（带侧边栏）
│   ├── BlankLayout.vue       # 空白布局（登录页等）
│   └── index.ts              # 统一导出
├── locales/                  # 国际化
│   ├── en.json               # 英文翻译
│   ├── zh-CN.json            # 中文翻译
│   └── index.ts              # i18n 配置
├── router/                   # 路由管理
│   ├── index.ts              # 路由实例
│   ├── guards.ts             # 路由守卫
│   └── routes/               # 路由模块
├── stores/                   # 状态管理
│   ├── index.ts              # Pinia 配置
│   ├── user/userStore.ts     # 用户状态
│   └── app/appStore.ts       # 应用状态
├── types/                    # TypeScript 类型
│   ├── index.ts              # 全局类型导出
│   └── api.d.ts              # API 响应类型
├── utils/                    # 工具函数
│   ├── format.ts             # 格式化工具
│   ├── storage.ts            # 存储工具
│   └── index.ts              # 统一导出
├── views/                    # 页面组件
│   ├── home/                 # 首页模块
│   ├── login/                # 登录模块
│   ├── category/             # 分类管理
│   ├── items/                # 物品管理
│   └── error/                # 错误页面
├── App.vue                   # 根组件
└── main.ts                   # 入口文件
```

## 🌐 API 接口

项目使用 RESTful API 风格，主要接口如下：

### 认证接口

| 接口 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| 注册 | POST | `/api/user/register` | 用户注册 |
| 登录 | POST | `/api/user/login` | 用户登录 |
| 获取用户信息 | POST | `/api/user/info` | 获取当前用户信息 |
| 更新用户信息 | POST | `/api/user/update` | 更新用户名 |
| 登出 | POST | `/api/user/logout` | 退出登录 |

### 分类接口

| 接口 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| 创建分类 | POST | `/api/category/create` | 创建新分类 |
| 获取分类列表 | POST | `/api/category/list` | 获取分类列表 |
| 更新分类 | POST | `/api/category/update` | 更新分类信息 |
| 删除分类 | POST | `/api/category/delete` | 删除分类 |

### 物品接口

| 接口 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- |
| 创建物品 | POST | `/api/item/create` | 创建新物品 |
| 获取物品列表 | POST | `/api/item/list` | 获取物品列表（支持筛选） |
| 获取物品详情 | POST | `/api/item/detail` | 获取物品详情 |
| 更新物品 | POST | `/api/item/update` | 更新物品信息 |
| 删除物品 | POST | `/api/item/delete` | 删除物品 |
| 获取即将过期物品 | POST | `/api/item/expiring` | 获取即将过期物品 |

## 🧩 核心模块

### 认证模块

- 用户注册（用户名、邮箱、密码）
- 用户登录（邮箱 + 密码）
- Token 管理和刷新
- 会话管理（查看、撤销、强制下线）

### 分类模块

- 创建分类（名称、颜色、图标、排序）
- 获取分类列表
- 更新分类信息
- 删除分类（级联删除物品）

### 物品模块

- 创建物品（分类、名称、描述、数量、单位、过期时间、提醒天数）
- 获取物品列表（支持丰富筛选条件）
- 获取物品详情
- 更新物品信息
- 删除物品
- 获取即将过期物品

## 🎨 设计规范

### 颜色系统

项目使用绿色系作为主色调，禁止使用蓝色和紫色。

| 用途 | 颜色变量 | Hex 值 | 使用场景 |
| --- | --- | --- | --- |
| 主色 | `--color-primary` | `#16a34a` | 按钮、链接、选中状态 |
| 成功 | `--color-success` | `#16a34a` | 成功提示、正常状态 |
| 警告 | `--color-warning` | `#f59e0b` | 警告提示、即将过期 |
| 危险 | `--color-danger` | `#ef4444` | 错误提示、删除操作、已过期 |

### 多端适配

- **移动端**：单列布局，底部导航，触摸友好
- **桌面端**：多列布局，侧边栏导航，鼠标友好

## 📝 开发规范

### 命名规范

- 组件文件：PascalCase（如 `UserList.vue`）
- 组合式函数：camelCase，以 `use` 开头（如 `useAuth.ts`）
- 工具函数：camelCase（如 `format.ts`）
- Store 文件：camelCase，以 `Store` 结尾（如 `userStore.ts`）

### 代码规范

- 使用 TypeScript 类型定义
- Vue 组件使用 `<script setup>` 语法
- 遵循导入顺序规范
- 使用 scoped 样式避免污染

### Git 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

常用类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `refactor`: 重构

## 🌍 国际化

项目支持多语言，目前包含：

- 中文（zh-CN）
- 英文（en）

使用方式：
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <h1>{{ t('menu.home') }}</h1>
</template>
```

## 🔧 环境变量

项目使用 `.env` 文件管理环境变量，必须以 `VITE_` 开头：

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=Things Expired
```

使用方式：
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

## 📄 文档

- [前端开发规范](document/develop/前端开发规范.md)
- [前端设计规范](document/develop/前端设计规范.md)
- [API 交接文档](document/exchange/API交接文档.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [PrimeVue](https://primevue.org/) - 丰富的 Vue UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
