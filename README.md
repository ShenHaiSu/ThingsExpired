# ThingsExpired —— 物品过期管理平台

> **一个基于现代 Web 技术栈构建的、跨平台物品过期管理应用。**  
> 支持食品、药品、日用品的到期追踪与提醒，具备用户认证、分类管理、过期状态自动扫描等核心能力。

---

## 🚀 快速部署指引

> 本项目采用多分支并行开发模式，**`main` 分支用于项目介绍**，并不是服务端部署入口。

如需获取**可直接部署的服务端构建产物**，请切换到以下分支：

| 分支 | 内容 | 部署方式 |
|------|------|----------|
| [`release`](https://github.com/ShenHaiSu/ThingsExpired/tree/release) | **TS 后端 + Web 前端 构建产物**（推荐） | 下载 [`server-ts/`](https://github.com/ShenHaiSu/ThingsExpired/tree/release/server-ts) 目录，配置 `.env` 后运行 `bun run dist.js` |
| [`release`](https://github.com/ShenHaiSu/ThingsExpired/tree/release) **server-go/** | **Go 后端构建产物** | 下载 [`server-go/`](https://github.com/ShenHaiSu/ThingsExpired/tree/release/server-go) 目录，直接运行 `server.exe` |

> **💡 建议：** 新用户推荐使用 **TS 后端**（`server-ts/`），它是当前主力维护版本，功能最全、更新最频繁。
>
> 详细部署文档请参阅各分支内 `README.md`。

---

## 目录

1. [项目概述](#1-项目概述)
2. [分支体系总览](#2-分支体系总览)
3. [分支关系与协作方式](#3-分支关系与协作方式)
4. [`ThingsExpired_web-dev` —— Web 前端详解](#4-thingsexpired_web-dev--web-前端详解)
5. [`ThingsExpired_ServerTsDev` —— 主后端详解](#5-thingsexpired_servertsdev--主后端详解)
6. [`ThingsExpired_server-dev` —— Go 后端详解](#6-thingsexpired_server-dev--go-后端详解)
7. [`ThingsExpired_desktop-dev` —— 桌面端详解](#7-thingsexpired_desktop-dev--桌面端详解)
8. [`ThingsExpired_android-dev` —— 安卓端详解](#8-thingsexpired_android-dev--安卓端详解)
9. [`ThingsExpired_release` + `ReleaseScript` —— 发布体系](#9-thingsexpired_release--releasescript--发布体系)
10. [`document` —— 文档体系](#10-document--文档体系)
11. [开发路线图](#11-开发路线图)

---

## 1. 项目概述

### 1.1 目标与定位

ThingsExpired 旨在解决日常生活中物品过期管理的痛点，提供一套**轻量级、可私有化部署**的 SaaS 式管理工具。

### 1.2 核心功能

| 功能模块 | 说明 |
|----------|------|
| **用户认证** | 注册、登录、JWT Token 管理、多会话管理（支持查看/撤销/强制下线） |
| **分类管理** | 创建、编辑、删除物品分类（支持名称、颜色、图标、排序） |
| **物品管理** | 创建、编辑、删除物品，支持丰富筛选条件（状态、分类、时间范围、数量等） |
| **过期状态自动扫描** | 后台定时任务自动将已过期物品标记为「已过期」状态 |
| **即将过期提醒** | 查询指定天数内即将过期的物品 |
| **物品状态统计** | 统计总数、即将过期数、已过期数、已消耗数 |
| **多语言** | 简中 / 英文双语界面 |
| **响应式布局** | 桌面端与移动端自适应 |

### 1.3 整体架构

```
┌─────────────────────────────────────────────────┐
│                 客户端层                          │
├─────────────┬──────────────┬────────────────────┤
│  Web 前端    │  Windows 桌面  │   Android 安卓      │
│  (Vue 3)    │  (WPF+WebV2)  │   (Kotlin+WebV)    │
│  ThingsExpired_web-dev  │  desktop-dev  │  android-dev       │
└──────┬──────┴──────┬───────┴─────────┬──────────┘
       │             │                 │
       └─────────────┼─────────────────┘
                     │ HTTP API (统一接口)
                     ▼
┌──────────────────────────────────────────────────┐
│                 服务端层                           │
├──────────────────────┬───────────────────────────┤
│  主后端 (TypeScript) │  旧后端 (Go, 缓慢更新)      │
│  ThingsExpired_     │  ThingsExpired_           │
│  ServerTsDev        │  server-dev                │
│  Bun + Hono +       │  Gin + GORM + fx + SQLite  │
│  Drizzle ORM + SQLite│                          │
└──────────────────────┴───────────────────────────┘
                         │
                         ▼
                ┌──────────────────┐
                │     SQLite       │
                └──────────────────┘
```

---

## 2. 分支体系总览

本项目采用多分支并行开发模式，每个分支对应一个完整的独立项目。以下是所有分支的概览：

| 分支目录 | 技术栈 | 状态 | 核心定位 |
|----------|--------|------|----------|
| [`ThingsExpired_ServerTsDev`](https://github.com/ShenHaiSu/ThingsExpired/tree/ServerTsDev) | TypeScript + Bun + Hono + Drizzle ORM | **主维护** | 新一代后端服务，持续开发 |
| [`ThingsExpired_web-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/web-dev) | Vue 3 + TypeScript + Vite + PrimeVue | **主维护** | Web 前端 SPA 应用 |
| [`ThingsExpired_server-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/server-dev) | Go + Gin + GORM + fx | 缓慢更新 | 早期后端实现，功能与 server-ts 对齐 |
| [`ThingsExpired_desktop-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/desktop-dev) | C# WPF + WebView2 + .NET 8 | 探索中 | Windows 桌面端（WebView 壳） |
| [`ThingsExpired_android-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/android-dev) | Kotlin + WebView | 探索中 | Android 桌面端（仅方案文档） |
| [`ThingsExpired_release`](https://github.com/ShenHaiSu/ThingsExpired/tree/release) | 构建产物 | 发布 | 存放打包后的可发布文件 |
| [`ReleaseScript`](https://github.com/ShenHaiSu/ThingsExpired/tree/ReleaseScript) | TypeScript (Bun) | 工具 | 自动化打包发布脚本 |

---

## 3. 分支关系与协作方式

### 3.1 分支拓扑图

```
                     ThingsExpired_web-dev
                     (前端 SPA 应用)
                           │
                           │ HTTP API
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
ThingsExpired_    ThingsExpired_      ThingsExpired_
ServerTsDev       server-dev          release
(主后端，TS)       (旧后端，Go)        (发布产物)
        │
        │ 嵌入 WebView
        │
        └──────────────────┬──────────────────┐
                           │                  │
                           ▼                  ▼
              ThingsExpired_         ThingsExpired_
              desktop-dev            android-dev
              (Windows 桌面)           (Android 移动)
```

### 3.2 分支职责说明

- **[`ThingsExpired_web-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/web-dev)** 是**唯一的前端分支**，所有 UI 功能都在此开发。它通过 HTTP API 与后端通信。
- **[`ThingsExpired_ServerTsDev`](https://github.com/ShenHaiSu/ThingsExpired/tree/ServerTsDev)** 是**当前主力开发的后端分支**，使用 TypeScript + Bun 运行时 + Hono 框架。所有新功能、新优化优先在此分支实现。
- **[`ThingsExpired_server-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/server-dev)** 是**早期的 Go 后端分支**，功能与 `ServerTsDev` 对齐。此分支**后续会缓慢更新**，仅做关键 Bug 修复和兼容性维护。
- **[`ThingsExpired_desktop-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/desktop-dev)** 和 **[`ThingsExpired_android-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/android-dev)** 都采用 **WebView 壳** 模式——将 Web 前端嵌入原生容器，通过 **JS Bridge** 调用原生能力（如系统通知、后台任务）。它们目前处于**方案探索阶段**，尚未进入正式开发。
- **[`ThingsExpired_release`](https://github.com/ShenHaiSu/ThingsExpired/tree/release)** 是从上述分支构建产物汇聚而成的发布目录。
- **[`ReleaseScript`](https://github.com/ShenHaiSu/ThingsExpired/tree/ReleaseScript)** 是自动化发布脚本项目，串联构建、复制、清理的全流程。

### 3.3 数据流与 API 一致性

所有分支级别的 API 均遵循统一的接口规范。完整文档见 [`ThingsExpired_ServerTsDev/document/develop/API接口文档.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/document/develop/API接口文档.md)。关键约定：

- 所有请求使用 **POST** 方法，Content-Type: `application/json`
- 统一前缀：`/api/{模块}/{操作}`
- 统一响应格式：`{ "code": number, "message": string, "data": unknown }`
- 认证方式：`Authorization: Bearer {token}`

---

## 4. `ThingsExpired_web-dev` —— Web 前端详解

> **目录：** [`ThingsExpired_web-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/web-dev)  
> **技术栈：** Vue 3.5 + TypeScript 6.0 + Vite 7 + PrimeVue 4.5 + Pinia 3 + Tailwind CSS 4 + Vue Router 5  
> **包管理：** pnpm  
> **构建命令：** `pnpm dev` / `pnpm build`

### 4.1 项目结构

```
src/
├── api/                      # API 层 - 统一管理所有 HTTP 接口
│   ├── index.ts              # Axios 实例 + 请求/响应拦截器
│   ├── user.ts               # 用户相关 API
│   ├── category.ts           # 分类相关 API
│   └── item.ts               # 物品相关 API
├── assets/
│   └── styles/               # 全局样式（variables.css, public.css）
├── components/
│   └── common/               # 通用组件（BaseButton, Pagination）
├── composables/              # 组合式函数
│   ├── useAuth.ts            # 认证逻辑
│   ├── useFetch.ts           # 数据请求封装
│   └── useToast.ts           # 应用内通知
├── layouts/                  # 布局组件
│   ├── DefaultLayout.vue     # 带侧边栏的默认布局
│   └── BlankLayout.vue       # 空白布局（登录页等）
├── locales/                  # 国际化（zh-CN, en）
├── router/                   # 路由管理
│   ├── index.ts              # 路由实例
│   ├── guards.ts             # 路由守卫（登录校验）
│   └── routes/               # 路由模块定义
├── stores/                   # Pinia 状态管理
│   ├── user/userStore.ts     # 用户认证 + 信息（持久化）
│   └── app/appStore.ts       # 应用状态（主题、语言）
├── types/                    # TypeScript 类型定义
│   ├── api.d.ts              # API 响应类型
│   └── api/                  # 各模块接口类型
├── utils/                    # 工具函数
│   ├── format.ts             # 格式化工具
│   ├── storage.ts            # localStorage 封装
│   └── date.ts               # 日期处理
├── views/                    # 页面组件
│   ├── home/                 # 首页（仪表盘 + 快捷操作）
│   ├── login/                # 登录 / 注册 / 忘记密码
│   ├── category/             # 分类管理（Desktop + Mobile 两套布局）
│   ├── items/                # 物品管理（List + Search + Stats）
│   ├── setting/              # 设置（语言切换、主题切换、登出）
│   └── error/                # 404 / 403 页面
├── App.vue                   # 根组件
└── main.ts                   # 入口文件
```

### 4.2 核心实现细节

#### 4.2.1 认证体系

- **Token 存储：** 使用 Pinia + `pinia-plugin-persistedstate` 持久化 Token 到 `localStorage`。
- **请求拦截器：** 在 [`src/api/index.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/api/index.ts) 中自动注入 `Authorization: Bearer {token}` 请求头。
- **响应拦截器：** 统一处理业务错误码（如 Token 过期 1002），自动跳转登录页。
- **路由守卫：** 在 [`src/router/guards.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/router/guards.ts) 中检查认证状态，未登录重定向到 `/login`。

#### 4.2.2 路由体系

路由定义在 [`src/router/routes/default.routes.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/router/routes/default.routes.ts) 中：

| 路径 | 页面 | 布局 | 需认证 |
|------|------|------|--------|
| `/login` | 登录 | BlankLayout | ❌ |
| `/register` | 注册 | BlankLayout | ❌ |
| `/forgot-password` | 忘记密码 | BlankLayout | ❌ |
| `/` | 首页 | DefaultLayout | ✅ |
| `/categories` | 分类管理 | DefaultLayout | ✅ |
| `/items` | 物品管理 | DefaultLayout | ✅ |
| `/settings` | 设置 | DefaultLayout | ✅ |
| `/404` | 404 页面 | BlankLayout | ❌ |
| `/403` | 禁止访问 | BlankLayout | ❌ |

#### 4.2.3 响应式适配

每个列表页面都分为 **Desktop** 和 **Mobile** 两套组件实现：

- [`CategoryDataListDesktop.vue`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/views/category/components/CategoryDataListDesktop.vue) / [`CategoryDataListMobile.vue`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/views/category/components/CategoryDataListMobile.vue)
- [`CategorySearchDesktop.vue`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/views/category/components/CategorySearchDesktop.vue) / [`CategorySearchMobile.vue`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/views/category/components/CategorySearchMobile.vue)
- [`ItemListDesktop.vue`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/views/items/components/ItemListDesktop.vue) / [`ItemListMobile.vue`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/views/items/components/ItemListMobile.vue)
- [`ItemSearchDesktop.vue`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/views/items/components/ItemSearchDesktop.vue) / [`ItemSearchMobile.vue`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/src/views/items/components/ItemSearchMobile.vue)

#### 4.2.4 国际化和主题

- **国际化：** 使用 `vue-i18n`，支持简中和英文，配置位于 [`src/locales/`](https://github.com/ShenHaiSu/ThingsExpired/tree/web-dev/src/locales)。
- **主题切换：** 使用 PrimeVue 的主题系统，支持浅色 / 深色 / 跟随系统三种模式。
- **PrimeVue 组件国际化：** 覆盖 PrimeVue 组件自身文案（分页、日期选择器等）。

#### 4.2.5 开发代理配置

在 [`vite.config.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/vite.config.ts) 中配置了开发代理，将 `/api` 请求转发到 `http://localhost:8080`（后端服务默认端口）。

---

## 5. `ThingsExpired_ServerTsDev` —— 主后端详解

> **目录：** [`ThingsExpired_ServerTsDev`](https://github.com/ShenHaiSu/ThingsExpired/tree/ServerTsDev)  
> **技术栈：** TypeScript 5 + Bun 1.3 + Hono 4 + Drizzle ORM 0.45 + SQLite (Bun:sqlite) + Zod 4 + Pino  
> **运行命令：** `bun dev` / `bun run src/index.ts`  
> **测试命令：** `bun test`

### 5.1 为什么选择 TypeScript + Bun？

| 对比项 | TypeScript + Bun (当前) | Go (旧分支) |
|--------|------------------------|-------------|
| 开发效率 | 极高，热重载、类型安全 | 中等 |
| 运行时性能 | 接近原生（基于 JavaScriptCore） | 优异 |
| 单文件部署 | 支持（`bun build --target bun` 输出单文件） | 支持（Go 交叉编译） |
| 包体积 | 依赖 + 运行时 ≈ 30MB | 单二进制 ≈ 15MB |
| ORM 生态 | Drizzle ORM（类型安全的轻量级 ORM） | GORM（功能丰富） |
| 开发体验 | TypeScript 全链类型安全 | 强类型但泛型灵活性略弱 |

选择 TypeScript + Bun 的核心原因是：**前后端统一语言栈**，降低团队切换成本，且 Bun 运行时性能足以满足轻量级管理工具的后端需求。

### 5.2 架构分层

项目遵循经典的分层架构（四层架构），从入口到数据持久化逐层解耦：

```
src/index.ts          ← 入口：依赖注入 + 启动
    │
src/router/           ← 路由层：URL 映射，中间件注册
    │
src/handler/          ← 处理器层：请求解析、响应组装
    │
src/service/          ← 业务服务层：核心业务逻辑
    │
src/repository/       ← 数据访问层：数据库 CRUD 操作
    │
src/model/            ← 数据模型层：ORM Schema、DTO、VO
    │
src/model/            ← DTO / VO：数据校验与展示转换
(src/config,          ← 配置 / 错误码 / 工具函数
 src/middleware,
 src/utils,
 src/errors)
```

#### 5.2.1 入口文件：[`src/index.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/index.ts)

启动流程按 12 步执行：
1. 加载配置（`loadConfig()`）
2. 创建日志器（`createLogger()`）
3. 初始化 SQLite 数据库 + WAL 模式 + 索引
4. 创建所有 Repository 实例
5. 创建所有 Service 实例
6. 创建过期扫描后台任务
7. 创建中间件（认证、日志）
8. 创建 Handler 实例
9. 创建路由（`createRouter()`）
10. 启动定时任务（`expirationService.start()`）
11. 启动 HTTP 服务器（`Bun.serve()`）
12. 注册优雅关闭信号处理（SIGINT / SIGTERM）

#### 5.2.2 路由层：[`src/router/index.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/router/index.ts)

使用 Hono 框架，按模块分组注册路由：

| 路由路径 | 方法 | 认证 | 说明 |
|----------|------|------|------|
| `/api/user/register` | POST | ❌ | 用户注册 |
| `/api/user/login` | POST | ❌ | 用户登录 |
| `/api/user/info` | POST | ✅ | 获取用户信息 |
| `/api/user/update` | POST | ✅ | 更新用户名 |
| `/api/user/logout` | POST | ✅ | 退出登录（撤销会话） |
| `/api/user/sessions` | POST | ✅ | 查看所有会话 |
| `/api/user/revoke_session` | POST | ✅ | 撤销指定会话 |
| `/api/user/force_logout` | POST | ✅ | 强制下线（撤销所有会话） |
| `/api/category/create` | POST | ✅ | 创建分类 |
| `/api/category/list` | POST | ✅ | 获取分类列表（分页 + 搜索） |
| `/api/category/update` | POST | ✅ | 更新分类 |
| `/api/category/delete` | POST | ✅ | 删除分类（级联删除物品） |
| `/api/item/create` | POST | ✅ | 创建物品 |
| `/api/item/list` | POST | ✅ | 获取物品列表（丰富筛选） |
| `/api/item/detail` | POST | ✅ | 获取物品详情 |
| `/api/item/update` | POST | ✅ | 更新物品 |
| `/api/item/delete` | POST | ✅ | 删除物品 |
| `/api/item/expiring` | POST | ✅ | 获取即将过期物品 |
| `/api/item/stats` | POST | ✅ | 获取物品统计 |
| `/api/item/mark_used` | POST | ✅ | 标记物品为已消耗 |

**SPA 静态文件服务：** 当 `config.spa.enabled = true` 时，自动提供前端静态文件服务，API 返回前端打包后的 `index.html`，实现一站式部署。

#### 5.2.3 数据模型层

##### ORM Schema（[`src/model/`](https://github.com/ShenHaiSu/ThingsExpired/tree/ServerTsDev/src/model)）

使用 Drizzle ORM 定义数据表结构：

| 表名 | 文件 | 核心字段 |
|------|------|----------|
| `users` | [`user.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/model/user.ts) | id, username, email, password(bcrypt), status, created_at, updated_at |
| `categories` | [`category.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/model/category.ts) | id, user_id, name, color, icon, sort_order, created_at, updated_at |
| `items` | [`item.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/model/item.ts) | id, user_id, category_id, name, description, quantity, unit, expired_at, remind_days, status |
| `sessions` | [`session.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/model/session.ts) | id, user_id, jti, device_info, ip_address, created_at, expires_at, is_revoked |

##### DTO（[`src/model/dto/`](https://github.com/ShenHaiSu/ThingsExpired/tree/ServerTsDev/src/model/dto)）

使用 Zod 定义请求体验证：

- [`user.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/model/dto/user.ts) —— `RegisterRequestSchema`, `LoginRequestSchema`, `UpdateUserRequestSchema`
- [`category.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/model/dto/category.ts) —— `CreateCategoryRequestSchema`, `UpdateCategoryRequestSchema`
- [`item.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/model/dto/item.ts) —— `CreateItemRequestSchema`, `ItemListRequestSchema`（支持 15+ 筛选参数）, `UpdateItemRequestSchema`

##### VO（[`src/model/vo/`](https://github.com/ShenHaiSu/ThingsExpired/tree/ServerTsDev/src/model/vo)）

定义响应数据结构：

- [`user.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/model/vo/user.ts) —— `UserVO`
- [`category.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/model/vo/category.ts) —— `CategoryVO`
- [`item.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/model/vo/item.ts) —— `ItemVO`, `ExpiringItemVO`, `ItemStatsVO`

#### 5.2.4 Repository 层：[`src/repository/`](https://github.com/ShenHaiSu/ThingsExpired/tree/ServerTsDev/src/repository)

数据访问层通过 `interfaces.ts` 定义接口契约，各实现类注入 `DBInstance`（Drizzle ORM 实例）：

| 文件 | 核心方法 |
|------|----------|
| [`db.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/repository/db.ts) | `createDB()` 创建 SQLite 连接 + Drizzle 实例，WAL 模式 + 外键约束 |
| [`user.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/repository/user.ts) | findByEmail, findByUsername, findById, create, update |
| [`category.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/repository/category.ts) | CRUD + list（分页 + 关键词搜索） |
| [`item.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/repository/item.ts) | CRUD + 丰富筛选列表 + getExpiringItems + getStats + getExpiredItems + batchUpdateStatus |
| [`session.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/repository/session.ts) | CRUD + findByJTI + revoke + countActiveByUserId |

关键设计：
- **[`item_query_builder.go`](https://github.com/ShenHaiSu/ThingsExpired/blob/server-dev/internal/repository/item_query_builder.go) 的动态查询构建器**（Go 端）：类似模式的 TypeScript 实现在 [`item.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/repository/item.ts) 中，通过动态拼接 WHERE 子句实现 15+ 种筛选条件的灵活组合。
- **批量更新：** [`item.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/repository/item.ts) 的 `batchUpdateStatus` 用于后台过期扫描任务。

#### 5.2.5 Service 层：[`src/service/`](https://github.com/ShenHaiSu/ThingsExpired/tree/ServerTsDev/src/service)

业务逻辑层通过 `interfaces.ts` 定义接口契约：

| 文件 | 核心逻辑 |
|------|----------|
| [`user.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/service/user.ts) | 注册（用户名+邮箱唯一性校验，bcrypt 加密）、登录（密码验证 + JWT 生成 + 会话创建）、会话管理（超额会话自动撤销最早会话） |
| [`category.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/service/category.ts) | 创建（同用户下名称唯一）、删除（级联删除关联物品） |
| [`item.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/service/item.ts) | 物品 CRUD + 过期状态校验（过期物品不允许创建）+ 统计 + 标记已消耗 |
| [`item_expiration.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/service/item_expiration.ts) | **后台定时任务**：`setInterval` 周期性执行，每次查询已过期但状态仍为「正常」的物品，批量更新为「已过期」 |

**过期扫描服务**（[`item_expiration.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/service/item_expiration.ts)）的设计要点：
- 启动时立即执行一次检查
- 按 `intervalSec` 配置的时间间隔定时触发
- 每次最多处理 `batchSize` 条（防止大表阻塞）
- 支持优雅启停（`start()` / `stop()`）
- 日志记录每次扫描结果

#### 5.2.6 中间件：[`src/middleware/`](https://github.com/ShenHaiSu/ThingsExpired/tree/ServerTsDev/src/middleware)

| 中间件 | 文件 | 功能 |
|--------|------|------|
| **认证中间件** | [`auth.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/middleware/auth.ts) | 解析 `Authorization: Bearer {token}`，验证 JWT 签名 + 会话有效性，注入 `userId` 和 `sessionId` 到 Context |
| **CORS** | [`cors.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/middleware/cors.ts) | 跨域支持 |
| **日志** | [`logger.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/middleware/logger.ts) | 请求日志记录 |

#### 5.2.7 配置与工具

- **配置：** [`src/config/index.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/config/index.ts) —— 从环境变量读取配置，`.env.example` 提供参考模板。
- **统一响应：** [`src/utils/response.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/utils/response.ts) —— `success()` / `fail()` / `failWithCode()` 三件套。
- **时间工具：** [`src/utils/time.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/utils/time.ts) —— `nowUTC()` / `daysUntil()` / `daysFromNow()`。
- **日志系统：** [`src/utils/logger.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/utils/logger.ts) —— 自实现按日切分的日志写入器，支持控制台带色输出 + 文件持久化 + 日志自动清理。
- **错误码：** [`src/errors/code.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/errors/code.ts) 定义所有业务错误码，[`src/errors/index.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/errors/index.ts) 提供 `AppError` 类 + 工厂函数。

### 5.3 数据库表结构

```
users
├── id            INTEGER PRIMARY KEY AUTOINCREMENT
├── username      TEXT NOT NULL UNIQUE
├── email         TEXT NOT NULL UNIQUE
├── password      TEXT NOT NULL (bcrypt hashed)
├── status        INTEGER NOT NULL DEFAULT 1 (1=正常, 0=禁用)
├── created_at    TEXT NOT NULL (ISO 8601 UTC)
└── updated_at    TEXT NOT NULL

categories
├── id            INTEGER PRIMARY KEY AUTOINCREMENT
├── user_id       INTEGER NOT NULL → users.id
├── name          TEXT NOT NULL (同用户下唯一)
├── color         TEXT (十六进制颜色值)
├── icon          TEXT (PrimeIcons 图标名)
├── sort_order    INTEGER NOT NULL DEFAULT 0
├── created_at    TEXT NOT NULL
└── updated_at    TEXT NOT NULL

items
├── id            INTEGER PRIMARY KEY AUTOINCREMENT
├── user_id       INTEGER NOT NULL → users.id
├── category_id   INTEGER NOT NULL → categories.id
├── name          TEXT NOT NULL
├── description   TEXT
├── quantity      INTEGER NOT NULL DEFAULT 1
├── unit          TEXT (个/盒/瓶/kg 等)
├── expired_at    TEXT NOT NULL (过期日期)
├── remind_days   INTEGER NOT NULL DEFAULT 3
├── status        INTEGER NOT NULL DEFAULT 1 (1=正常, 2=已过期, 3=已消耗)
├── created_at    TEXT NOT NULL
└── updated_at    TEXT NOT NULL

sessions
├── id            INTEGER PRIMARY KEY AUTOINCREMENT
├── user_id       INTEGER NOT NULL → users.id
├── jti           TEXT NOT NULL UNIQUE (JWT Token ID)
├── device_info   TEXT (客户端信息)
├── ip_address    TEXT
├── created_at    TEXT NOT NULL
├── expires_at    TEXT NOT NULL
└── is_revoked    INTEGER NOT NULL DEFAULT 0
```

**索引：** 在 [`db.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/src/repository/db.ts) 中创建了 10 个索引，覆盖用户查询、分类查询、物品查询（复合索引 `(user_id, status, expired_at)`）和会话查询等场景。

### 5.4 测试

测试位于 [`test/service/`](https://github.com/ShenHaiSu/ThingsExpired/tree/ServerTsDev/test/service)，使用 Bun 内置测试框架：

| 测试文件 | 覆盖范围 |
|----------|----------|
| `user_service.test.ts` | 用户注册、登录、信息获取、会话管理 |
| `category_service.test.ts` | 分类 CRUD |
| `item_service.test.ts` | 物品 CRUD、筛选、统计、标记消耗 |
| `item_expiration.test.ts` | 过期检查逻辑 |
| `item_expiration.integration.test.ts` | 过期检查集成测试 |

---

## 6. `ThingsExpired_server-dev` —— Go 后端详解

> **目录：** [`ThingsExpired_server-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/server-dev)  
> **技术栈：** Go 1.21 + Gin + GORM + SQLite + fx DI + zap 日志 + Viper 配置 + JWT  
> **构建命令：** `go build -o server ./cmd/server`  
> **Docker 部署：** `docker build -f Dockerfile .`

### 6.1 与 ServerTsDev 的异同

| 对比维度 | Go 后端 (server-dev) | TS 后端 (ServerTsDev) |
|----------|---------------------|----------------------|
| 运行时 | Go 1.21 编译运行 | Bun (JavaScriptCore) |
| HTTP 框架 | **Gin** (最流行的 Go Web 框架) | **Hono** (轻量级 TS Web 框架) |
| ORM | **GORM** (全功能 ORM，自动迁移) | **Drizzle ORM** (类型安全轻量 ORM) |
| DI 框架 | **fx** (Uber 出品的 DI 容器) | 手动依赖注入 |
| 配置管理 | **Viper** (YAML 配置文件) | 环境变量 (.env) |
| 日志 | **zap** (结构化日志) | 自实现简易日志器 |
| 验证 | Go 手动校验 | **Zod** (运行时类型验证) |
| API 路由 | 完全相同（16 个接口） | 完全相同 |
| 过期扫描 | 有，fx lifecycle 集成 | 有，setInterval |

### 6.2 架构亮点

#### 6.2.1 fx 依赖注入

Go 后端使用 Uber 的 fx 框架实现依赖注入（[`cmd/server/main.go`](https://github.com/ShenHaiSu/ThingsExpired/blob/server-dev/cmd/server/main.go)）：

```go
fx.New(
    fx.Provide(func() *config.Config { return cfg }),
    fx.Provide(repository.NewDB),
    fx.Provide(repository.NewUserRepository),
    fx.Provide(service.NewUserService),
    fx.Provide(handler.NewUserHandler),
    fx.Provide(middleware.NewAuthMiddleware),
    fx.Provide(router.NewRouter),
    fx.Invoke(startServer),
    fx.Invoke(startExpirationChecker),
).Run()
```

所有依赖的创建和生命周期由 fx 自动管理，启动顺序由依赖关系自动推导。

#### 6.2.2 路由注册（[`internal/router/router.go`](https://github.com/ShenHaiSu/ThingsExpired/blob/server-dev/internal/router/router.go)）

中间件链：`RequestID → Recovery → Logger → CORS`

路由分组方式与 ServerTsDev 完全一致：
- 公开路由：`/api/user/register`, `/api/user/login`
- 认证路由：所有 `/api/user/*`, `/api/category/*`, `/api/item/*`

SPA 兜底路由：`r.NoRoute(middleware.SPACatchAllMiddleware())`

#### 6.2.3 配置管理（[`config/config.go`](https://github.com/ShenHaiSu/ThingsExpired/blob/server-dev/config/config.go)）

使用 Viper 读取 YAML 配置文件，支持配置验证：

```yaml
app:
  name: "things-expired"
  host: "0.0.0.0"
  port: 8080
  mode: "debug"

database:
  path: "./data/app.db"
  max_idle_conns: 5
  max_open_conns: 10

jwt:
  secret: "CHANGE_ME_IN_PRODUCTION"
  expire_hours: 24

security:
  allow_multi_login: true
  max_sessions_per_user: 3

expiration:
  enabled: true
  interval_sec: 3600
  batch_size: 100

frontend:
  static_path: "./dist"
```

Go 端额外支持 `upload` 上传配置和更细粒度的日志配置（最大备份数、压缩、保留天数等）。

#### 6.2.4 Docker 部署（[`Dockerfile`](https://github.com/ShenHaiSu/ThingsExpired/blob/server-dev/Dockerfile)）

```dockerfile
# 多阶段构建
FROM golang:1.21-alpine AS builder  # 构建阶段
FROM alpine:latest                    # 运行阶段
```

- 构建阶段使用 `CGO_ENABLED=1`（SQLite 需要 CGO）
- 运行阶段仅安装 `ca-certificates` 和 `tzdata`
- 设置时区为 `Asia/Shanghai`
- 健康检查：`wget http://localhost:8080/api/user/login`
- 暴露端口 8080

#### 6.2.5 物品过期自动更新

设计文档见 [`document/物品过期状态自动更新设计文档.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/server-dev/document/物品过期状态自动更新设计文档.md)，核心逻辑与 ServerTsDev 一致：定时查询已过期的「正常」物品，批量更新为「已过期」。Go 端使用 `fx.Lifecycle` 管理后台任务的启停。

### 6.3 项目结构

```
cmd/server/main.go               # 入口
config/
├── config.go                    # 配置结构 + 加载 + 验证
├── config.example.yaml          # 配置模板
deploy/
├── nginx.conf                   # Nginx 反向代理配置
├── things-expired.service       # systemd 服务文件
├── README.md                    # 部署说明
internal/
├── handler/                     # 处理器层
│   ├── user.go, category.go, item.go, response.go
├── model/                       # 数据模型层
│   ├── user.go, category.go, item.go, user_session.go
│   ├── dto/                     # 请求 DTO
│   └── vo/                      # 响应 VO
├── repository/                  # 数据访问层
│   ├── db.go                    # 数据库初始化
│   ├── item_query_builder.go    # 物品查询构建器
│   ├── user.go, category.go, item.go, user_session.go
├── service/                     # 业务服务层
│   ├── item_expiration.go       # 过期扫描服务
│   └── user.go, category.go, item.go
├── router/router.go             # 路由注册
migrations/                      # 数据库迁移脚本
│   ├── 001_init.sql
│   └── 002_create_user_sessions.sql
test/index.ts                    # 测试入口
document/                        # 开发文档
├── stageDocument/               # 开发阶段文档
│   └── stage1-init.md ~ stage7-test-deploy.md
├── 物品过期状态自动更新设计文档.md
├── Go-HTTP-后端项目开发规范.md
└── exchangeDocument/API交接文档.md
```

---

## 7. `ThingsExpired_desktop-dev` —— 桌面端详解

> **目录：** [`ThingsExpired_desktop-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/desktop-dev)  
> **技术栈：** C# .NET 8 + WPF + WebView2 + CommunityToolkit.WinUI.Notifications  
> **方案：** 当前处于**方案探索与技术验证阶段**，尚未进入正式开发。

### 7.1 核心设计思路

桌面端采用 **WebView 壳 + JS Bridge** 模式：

```
┌──────────────────────────────────────────────┐
│           Windows 桌面应用 (WPF)                │
│  ┌────────────────────────────────────────┐   │
│  │     WebView2 (Chromium 内核)           │   │
│  │  ┌──────────────────────────────────┐  │   │
│  │  │  Web 前端 (Vue 3 SPA)            │  │   │
│  │  │  - 全部 UI 和业务逻辑复用        │  │   │
│  │  │  - 通过 JS Bridge 调用原生能力    │  │   │
│  │  └──────────────────────────────────┘  │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  原生能力层:                                   │
│  ├── NotificationService  (Windows Toast)     │
│  ├── BackgroundService   (定时检查过期)       │
│  ├── BridgeService       (JS ↔ C# 通信)      │
│  └── 系统托盘 (收起到托盘运行)                 │
└──────────────────────────────────────────────┘
```

### 7.2 关键组件

#### 7.2.1 MainWindow（[`MainWindow.xaml`](https://github.com/ShenHaiSu/ThingsExpired/blob/desktop-dev/src/ThingsExpired.App/MainWindow.xaml)）

- 使用 WPF 窗口承载 WebView2 控件
- 窗口大小：1200×800，最小 800×600
- 支持系统托盘，关闭窗口时最小化到托盘而非退出

#### 7.2.2 ApiProxyService（[`ApiProxyService.cs`](https://github.com/ShenHaiSu/ThingsExpired/blob/desktop-dev/src/ThingsExpired.App/Services/ApiProxyService.cs)）

API 代理服务，拦截 WebView2 中的 `/api` 请求并转发到真实后端：
- 代理所有 `/api` 路径的请求到 `http://localhost:8080`
- 复制请求头、请求体、Content-Type
- 处理响应并转换为 WebView2 能识别的格式
- 错误时返回 JSON 错误响应

#### 7.2.3 NotificationService（[`NotificationService.cs`](https://github.com/ShenHaiSu/ThingsExpired/blob/desktop-dev/src/ThingsExpired.App/Services/NotificationService.cs)）

Windows 原生通知服务，使用 Windows Toast Notification：
- `ShowNotification()` —— 即时显示 Toast 通知
- `ScheduleNotification()` —— 调度定时通知
- `CancelScheduledNotification()` —— 取消预定的通知
- `ClearAllScheduledNotifications()` —— 清除所有预定通知

#### 7.2.4 后台任务（[`BackgroundService.cs`](https://github.com/ShenHaiSu/ThingsExpired/blob/desktop-dev/src/ThingsExpired.App/Services/BackgroundService.cs)）

使用 `System.Threading.Timer` 定时检查过期物品，每小时执行一次。

#### 7.2.5 BridgeService

JS ↔ C# 桥接，暴露给 Web 前端的原生能力：
- `GetPlatform()` —— 返回 `"windows-desktop"`
- `ShowNotification()` —— 显示 Windows 通知
- `ScheduleReminder()` —— 调度过期提醒
- `CancelReminder()` —— 取消提醒

前端通过 `window.chrome.webview.hostObjects.nativeBridge` 调用。

### 7.3 Web 端适配

跨平台适配方案详细记录在 [`document/Web项目跨平台适配指南.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/main/document/Web项目跨平台适配指南.md) 和 [`document/跨平台应用技术方案.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/main/document/跨平台应用技术方案.md) 中，涉及：
- 平台检测工具（`PlatformDetector`）
- 统一通知服务接口（`INotificationService`）
- 各平台通知实现（Web / Windows / Android）
- 通知服务工厂
- 提醒服务集成

---

## 8. `ThingsExpired_android-dev` —— 安卓端详解

> **目录：** [`ThingsExpired_android-dev`](https://github.com/ShenHaiSu/ThingsExpired/tree/android-dev)  
> **技术栈：** Kotlin + Android WebView + WorkManager + AlarmManager  
> **方案：** 当前处于**方案探索阶段**，仅包含技术方案文档，尚未有实际代码。

### 8.1 核心理念

与桌面端完全一致：**WebView 壳 + JS Bridge**。将 Web 前端打包为 Android 资源，嵌入 WebView 容器，通过 `@JavascriptInterface` 调用原生能力。

### 8.2 方案文档

安卓端技术方案详细记录在 [`document/安卓端技术方案.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/main/document/安卓端技术方案.md)（位于项目根目录 `document/` 下）。

关键设计：
- **WebView 集成：** 主 Activity 加载 `file:///android_asset/webapp/index.html`
- **JS Bridge：** `JsBridge.kt` 暴露 `@JavascriptInterface` 注解方法
- **通知系统：** `NotificationHelper` 使用 `NotificationCompat` + `AlarmManager`
- **后台任务：** `ExpiryCheckWorker` 使用 WorkManager 周期性检查
- **权限管理：** Android 13+ `POST_NOTIFICATIONS` 运行时权限请求

---

## 9. `ThingsExpired_release` + `ReleaseScript` —— 发布体系

> **部署入口：** 需要部署服务端的用户请直接跳转到 [`release`](https://github.com/ShenHaiSu/ThingsExpired/tree/release) 分支获取构建产物。

### 9.1 发布目录结构

[`ThingsExpired_release`](https://github.com/ShenHaiSu/ThingsExpired/tree/release) 是构建产物的汇聚目录：

```
ThingsExpired_release/
├── server-go/           # Go 后端编译产物
│   └── server.exe
├── server-ts/           # TypeScript 后端编译产物
│   ├── dist.js          # 单文件编译产出
│   ├── dist.js.map      # Sourcemap (调试用)
│   ├── .env.example     # 环境配置模板
│   ├── data/            # SQLite 数据目录（空）
│   ├── frontend-dist/   # 前端静态资源（从 client-web 复制）
│   └── logs/            # 日志目录（空）
├── client-web/          # Web 前端构建产物
│   └── assets/          # 编译后的 JS/CSS 文件
├── client-android/      # 预留（Android 构建产物）
└── client-desktop/      # 预留（桌面端构建产物）
```

### 9.2 发布脚本（[`ReleaseScript/index.ts`](https://github.com/ShenHaiSu/ThingsExpired/blob/ReleaseScript/index.ts)）

自动化发布流程共 13 步：

| 步骤 | 任务 | 说明 |
|------|------|------|
| 1 | 构建 Web 项目 | `pnpm run build` |
| 2 | 构建 Go 服务端 | `go build -o server.exe ./cmd/server` |
| 3 | 构建 TS 服务端 | `bun build ./src/index.ts --target bun --outfile ../dist.js --sourcemap` |
| 4 | 跳过安卓/桌面端 | 预留步骤 |
| 5 | 准备发布目录 | 清空并重建 `server-go/`, `server-ts/`, `client-web/` 等 |
| 6 | 复制 Go 构建产物 | `server.exe` → `server-go/` |
| 7 | 复制 TS 构建产物 | `dist.js` + `dist.js.map` → `server-ts/` |
| 8 | 复制 Web 构建产物 | `dist/` → `client-web/` |
| 9 | 创建 TS 服务端运行目录 | `data/`, `frontend-dist/`, `logs/` |
| 10 | 复制前端到 frontend-dist | 让 TS 服务端可直接提供静态文件服务 |
| 11 | 复制 .env.example | 配置模板 |
| 12 | 清理构建产物 | 删除各项目中的临时编译文件 |
| 13 | 完成 | 输出发布目录路径 |

---

## 10. `document` —— 文档体系

项目根目录的 [`document/`](https://github.com/ShenHaiSu/ThingsExpired/tree/main/document) 包含跨项目的综合设计方案：

| 文档 | 内容 |
|------|------|
| [`跨平台应用技术方案.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/main/document/跨平台应用技术方案.md) | 覆盖桌面端、安卓端、Web 端的完整跨平台适配方案，包括平台检测、通知服务抽象、提醒服务集成等 |
| [`安卓端技术方案.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/main/document/安卓端技术方案.md) | Android WebView 壳方案详述，含 Kotlin 代码示例 |
| [`桌面端技术方案.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/main/document/桌面端技术方案.md) | WPF + WebView2 方案详述，含 C# 代码示例 |
| [`Web项目跨平台适配指南.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/main/document/Web项目跨平台适配指南.md) | Web 端如何适配桌面和移动端的指南 |

各分支内的文档：

| 分支 | 文档路径 | 内容 |
|------|----------|------|
| ServerTsDev | [`document/develop/API接口文档.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/document/develop/API接口文档.md) | 完整 API 规范（1075 行） |
| ServerTsDev | [`document/develop/物品过期自动更新设计文档.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/document/develop/物品过期自动更新设计文档.md) | 过期扫描服务设计 |
| ServerTsDev | [`document/develop/项目开发规范.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/ServerTsDev/document/develop/项目开发规范.md) | TypeScript 后端开发规范 |
| server-dev | [`document/stageDocument/`](https://github.com/ShenHaiSu/ThingsExpired/tree/server-dev/document/stageDocument) | 7 个开发阶段文档（stage1 ~ stage7） |
| server-dev | [`document/Go-HTTP-后端项目开发规范.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/server-dev/document/Go-HTTP-后端项目开发规范.md) | Go 后端开发规范 |
| server-dev | [`document/物品过期状态自动更新设计文档.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/server-dev/document/物品过期状态自动更新设计文档.md) | Go 端过期扫描设计 |
| web-dev | [`document/develop/前端开发规范.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/document/develop/前端开发规范.md) | Vue 前端开发规范 |
| web-dev | [`document/develop/前端设计规范.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/document/develop/前端设计规范.md) | 色彩系统、组件设计 |
| web-dev | [`document/exchange/API交接文档.md`](https://github.com/ShenHaiSu/ThingsExpired/blob/web-dev/document/exchange/API交接文档.md) | 前后端 API 约定 |

---

## 11. 开发路线图

### 📌 近期（主后端迭代）

- **ServerTsDev** 持续开发：性能优化、安全加固、功能扩展
- **server-dev (Go)** 仅做关键 Bug 修复，保持与 ServerTsDev 的 API 兼容

### 🔄 中期（前端完善）

- **Web 前端** 持续迭代：用户体验优化、更多筛选功能、数据可视化
- **跨平台通知服务** 在 Web 端实现（HTTP 通知 API + Service Worker）

### 🧪 长期（多端探索）

- **Windows 桌面端**：完成 WPF + WebView2 骨架，实现系统托盘 + 后台通知
- **Android 移动端**：完成 Kotlin + WebView 骨架，实现原生通知 + 后台检查
- 探索 **统一通知推送服务**（可选，需要服务器端配合）

---

> **许可证：** MIT License
