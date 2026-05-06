
<h1 align="center">ThingsExpired 🏷️</h1>

<p align="center">
  <em>智能物品过期追踪管理系统 - 后端 API 服务</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Runtime-Bun-ff69b4?logo=bun" alt="Runtime: Bun" />
  <img src="https://img.shields.io/badge/Framework-Hono-ff6348?logo=hono" alt="Framework: Hono" />
  <img src="https://img.shields.io/badge/Database-SQLite-003b57?logo=sqlite" alt="Database: SQLite" />
  <img src="https://img.shields.io/badge/ORM-Drizzle-7b68ee" alt="ORM: Drizzle" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178c6?logo=typescript" alt="Language: TypeScript" />
  <img src="https://img.shields.io/badge/License-Private-red" alt="License: Private" />
</p>

---

## 📖 项目简介

**ThingsExpired** 是一款基于 Bun + Hono 构建的轻量级 RESTful API 后端服务，专注于帮助用户追踪和管理物品的**过期信息**。用户可以通过分类管理各类物品，系统会自动检测物品过期状态，提供及时的过期提醒和统计数据。

### 核心功能

| 功能模块 | 描述 |
|---------|------|
| 👤 **用户管理** | 注册、登录、JWT 认证、多会话管理、强制登出 |
| 📂 **分类管理** | 自定义分类（名称、颜色、图标）、排序 |
| 📦 **物品管理** | 添加/编辑/删除物品、数量与单位、过期时间、提醒天数 |
| ⏰ **过期检测** | 后台定时任务自动扫描并更新过期状态（可配置） |
| 📊 **数据统计** | 物品总数、即将过期数、已过期数、已消耗数 |
| 🔔 **过期提醒** | 按指定天数提前预警即将过期的物品 |
| 🌐 **SPA 支持** | 内建前端静态文件服务，支持 SPA 路由回退 |

---

## 🏗️ 技术栈

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| 🏃 **运行时** | [Bun 1.1+](https://bun.sh) | 高性能 JavaScript/TypeScript 运行时 |
| 🌐 **Web 框架** | [Hono 4.x](https://hono.dev) | 轻量、快速、类型安全的 HTTP 框架 |
| 🗄️ **数据库** | [SQLite](https://www.sqlite.org) | 无需额外部署，文件级数据库 |
| 🛠️ **ORM** | [Drizzle ORM 0.45+](https://orm.drizzle.team) | TypeScript-first ORM，类型安全 |
| ✅ **参数校验** | [Zod 4.x](https://zod.dev) | TypeScript-first 模式校验 |
| 📝 **日志** | [Pino 10.x](https://getpino.io) | 高性能结构化日志 |
| 🔑 **认证** | [jsonwebtoken 9.x](https://github.com/auth0/node-jsonwebtoken) | JWT Token 认证 |
| 🔐 **加密** | Bun 内置 `Bun.password` | bcrypt 密码哈希 |
| 🧪 **测试** | Bun 内置 `bun test` | Jest 风格测试运行器 |

---

## 📁 项目结构

```
thingsexpired_servertsdev/
├── src/                          # 源代码
│   ├── index.ts                  # 应用入口，依赖组装与服务启动
│   ├── config/
│   │   └── index.ts              # 配置类型定义与加载（环境变量）
│   ├── router/
│   │   └── index.ts              # 路由注册与中间件挂载
│   ├── handler/                  # Handler 层（请求处理）
│   │   ├── user.ts               # 用户模块控制器
│   │   ├── category.ts           # 分类模块控制器
│   │   └── item.ts               # 物品模块控制器
│   ├── service/                  # Service 层（业务逻辑）
│   │   ├── user.ts               # 用户业务逻辑
│   │   ├── category.ts           # 分类业务逻辑
│   │   ├── item.ts               # 物品业务逻辑
│   │   ├── item_expiration.ts    # ⏰ 过期检查定时任务
│   │   └── interfaces.ts         # Service 层接口定义
│   ├── repository/               # Repository 层（数据访问）
│   │   ├── db.ts                 # 数据库连接与初始化
│   │   ├── user.ts               # 用户数据操作
│   │   ├── category.ts           # 分类数据操作
│   │   ├── item.ts               # 物品数据操作
│   │   ├── session.ts            # 会话数据操作
│   │   └── interfaces.ts         # Repository 层接口定义
│   ├── model/                    # Model 层（数据模型）
│   │   ├── user.ts               # 用户表 Schema
│   │   ├── category.ts           # 分类表 Schema
│   │   ├── item.ts               # 物品表 Schema
│   │   ├── session.ts            # 会话表 Schema
│   │   ├── dto/                  # 请求 DTO（Zod 校验）
│   │   │   ├── user.ts
│   │   │   ├── category.ts
│   │   │   └── item.ts
│   │   └── vo/                   # 响应 VO
│   │       ├── user.ts
│   │       ├── category.ts
│   │       └── item.ts
│   ├── middleware/               # 中间件
│   │   ├── auth.ts               # JWT 认证中间件
│   │   ├── cors.ts               # CORS 中间件
│   │   └── logger.ts             # 请求日志中间件
│   ├── errors/                   # 错误处理
│   │   ├── code.ts               # 错误码常量
│   │   └── index.ts              # 自定义错误类 AppError
│   └── utils/                    # 工具函数
│       ├── logger.ts             # 自定义日志写入器（按日分文件）
│       ├── response.ts           # 统一响应格式工具
│       └── time.ts               # 时间工具函数
├── data/                         # SQLite 数据库文件目录
├── frontend-dist/                # 前端静态文件目录（SPA）
├── document/develop/             # 开发文档
├── test/                         # 测试文件
│   └── service/                  # Service 层测试
├── .env.example                  # 环境变量配置模板
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🏛️ 分层架构

本项目采用**严格分层架构**，请求按固定顺序流经各层，每一层职责清晰明确。

```
HTTP Request (JSON)
       │
       ▼
┌─────────────────────────────┐
│      Router Layer           │  ── 路由匹配、中间件挂载
├─────────────────────────────┤
│      Middleware              │  ── 认证、CORS、日志记录
├─────────────────────────────┤
│      Handler Layer          │  ── 参数解析与校验、调用 Service、统一响应
├─────────────────────────────┤
│      Service Layer          │  ── 业务逻辑、事务控制、组合 Repository
├─────────────────────────────┤
│      Repository Layer       │  ── 数据库 CRUD、复杂查询封装
├─────────────────────────────┤
│      Model Layer            │  ── Schema、DTO、VO 定义
└─────────────────────────────┘
       │
       ▼
   SQLite Database
```

### 各层职责

| 层级 | 职责 | 禁止事项 |
|------|------|---------|
| **Router** | 注册路由、绑定方法与路径、挂载中间件 | ❌ 处理业务逻辑 |
| **Handler** | 参数绑定、Zod 校验、调用 Service、返回统一响应 | ❌ 业务逻辑、❌ 直接操作数据库 |
| **Service** | 业务逻辑处理、事务控制、组合多个 Repository | ❌ 直接操作数据库、❌ 处理 HTTP 请求/响应 |
| **Repository** | 数据库 CRUD 操作、复杂查询封装 | ❌ 业务逻辑 |
| **Model** | 定义数据结构（Schema、DTO、VO） | ❌ 业务逻辑 |

---

## 🚀 快速开始

### 环境要求

- [Bun](https://bun.sh) 1.1 或更高版本

### 安装与运行

```bash
# 克隆项目
git clone <repo-url>
cd thingsexpired_servertsdev

# 安装依赖
bun install

# 配置环境变量（复制示例文件并按需修改）
cp .env.example .env

# 开发模式运行（热重载）
bun run dev

# 或生产模式运行
bun run start
```

服务默认启动在 `http://0.0.0.0:8080`。

### 常用命令

| 命令 | 说明 |
|------|------|
| `bun run dev` | 开发模式（带热重载） |
| `bun run start` | 生产模式运行 |
| `bun test` | 运行测试 |
| `bun run test:coverage` | 运行测试并生成覆盖率报告 |
| `bun run typecheck` | TypeScript 类型检查 |
| `bun run db:generate` | 生成数据库迁移文件 |
| `bun run db:migrate` | 执行数据库迁移 |

---

## ⚙️ 配置说明

通过环境变量或 `.env` 文件进行配置，详见 [`.env.example`](.env.example)。

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `APP_HOST` | `0.0.0.0` | 服务监听地址 |
| `APP_PORT` | `8080` | 服务监听端口 |
| `APP_MODE` | `debug` | 运行模式（`debug` / `release`） |
| `DB_PATH` | `./data/app.db` | SQLite 数据库文件路径 |
| `JWT_SECRET` | `things-expired-secret-key-2024` | JWT 签名密钥 |
| `JWT_EXPIRE_HOURS` | `24` | Token 过期时间（小时） |
| `SESSION_MAX_SESSIONS` | `3` | 每用户最大并发会话数 |
| `EXPIRATION_ENABLED` | `true` | 是否启用自动过期检查 |
| `EXPIRATION_INTERVAL_SEC` | `3600` | 过期检查间隔（秒） |
| `EXPIRATION_BATCH_SIZE` | `100` | 每次批量处理物品数 |
| `LOG_PATH` | `./logs` | 日志存储目录 |
| `LOG_LEVEL` | `info` | 日志级别 |
| `SPA_ENABLED` | `true` | 是否启用前端静态文件服务 |
| `SPA_DIST_PATH` | `./frontend-dist` | 前端打包文件目录 |

---

## 📋 API 接口

### 基础规范

- **路径前缀**: 所有 API 以 `/api` 开头
- **请求方法**: 全部使用 `POST`
- **请求体格式**: `application/json`
- **认证方式**: `Authorization: Bearer <token>`（除登录/注册外）
- **时间格式**: 统一使用 UTC ISO 8601（如 `2026-05-02T00:00:00.000Z`）

### 统一响应格式

```json
// 成功响应
{ "code": 0, "message": "success", "data": { ... } }

// 失败响应
{ "code": 1001, "message": "参数错误", "data": null }
```

### 错误码

| 错误码 | 常量名 | 说明 |
|--------|--------|------|
| `0` | `CodeSuccess` | 成功 |
| `1001` | `CodeParamInvalid` | 参数错误 |
| `1002` | `CodeUnauthorized` | 未授权 |
| `1003` | `CodeForbidden` | 禁止访问 |
| `2001` | `CodeUserNotFound` | 用户不存在 |
| `2002` | `CodeUserExists` | 用户已存在 |
| `2003` | `CodePasswordWrong` | 密码错误 |
| `3001` | `CodeCategoryNotFound` | 分类不存在 |
| `4001` | `CodeItemNotFound` | 物品不存在 |
| `5001` | `CodeInternalError` | 内部错误 |
| `5002` | `CodeDatabaseError` | 数据库错误 |

### 用户模块

| 接口 | 认证 | 说明 |
|------|------|------|
| `POST /api/user/register` | ❌ | 用户注册 |
| `POST /api/user/login` | ❌ | 用户登录（返回 JWT Token） |
| `POST /api/user/info` | ✅ | 获取当前用户信息 |
| `POST /api/user/update` | ✅ | 更新用户信息 |
| `POST /api/user/logout` | ✅ | 退出登录 |
| `POST /api/user/sessions` | ✅ | 获取会话列表 |
| `POST /api/user/revoke_session` | ✅ | 撤销指定会话 |
| `POST /api/user/force_logout` | ✅ | 强制登出所有会话 |

### 分类模块

| 接口 | 认证 | 说明 |
|------|------|------|
| `POST /api/category/create` | ✅ | 创建分类 |
| `POST /api/category/list` | ✅ | 分类列表（支持分页和关键词搜索） |
| `POST /api/category/update` | ✅ | 更新分类 |
| `POST /api/category/delete` | ✅ | 删除分类（同时删除分类下所有物品） |

### 物品模块

| 接口 | 认证 | 说明 |
|------|------|------|
| `POST /api/item/create` | ✅ | 创建物品 |
| `POST /api/item/list` | ✅ | 物品列表（丰富查询条件与排序） |
| `POST /api/item/detail` | ✅ | 物品详情 |
| `POST /api/item/update` | ✅ | 更新物品 |
| `POST /api/item/delete` | ✅ | 删除物品 |
| `POST /api/item/expiring` | ✅ | 即将过期物品列表 |
| `POST /api/item/stats` | ✅ | 物品统计数据 |
| `POST /api/item/mark_used` | ✅ | 标记物品为已消耗 |

---

## ⏰ 过期检测机制

系统内置**后台定时任务**自动检测物品过期状态，无需用户手动操作。

### 状态流转

```
┌──────────┐     定时任务自动更新      ┌──────────┐
│  正常    │ ──────────────────────→ │  已过期  │
│ (status  │   expired_at < now      │ (status  │
│  = 1)    │                          │  = 2)    │
└────┬─────┘                          └────┬─────┘
     │ 手动标记 (mark_used)                │ 手动标记
     ▼                                     ▼
┌──────────────────────────────────────────────┐
│                 已消耗                        │
│             (status = 3)                      │
└──────────────────────────────────────────────┘
```

### 工作流程

1. 应用启动时，`ItemExpirationService` 立即执行一次全量检查
2. 之后按配置的 `intervalSec` 间隔（默认 1 小时）定时触发
3. 每次查询 `status=1` 且 `expired_at < 当前时间` 的物品，最多 `batchSize` 条
4. 批量更新这些物品的状态为 `status=2`（已过期）
5. 支持优雅关闭：收到 `SIGINT`/`SIGTERM` 信号时停止定时器

### 配置建议

| 场景 | 间隔 | 批大小 | 说明 |
|------|------|--------|------|
| 开发环境 | 60 秒 | 50 | 快速验证 |
| 生产（少量物品） | 1 小时 | 100 | 默认配置 |
| 生产（大量物品） | 30 分钟 | 200 | 更频繁检查 |

---

## 🧪 测试

```bash
# 运行所有测试
bun test

# 运行测试并生成覆盖率报告
bun run test:coverage

# 运行特定测试文件
bun test test/service/item_expiration.test.ts
```

测试覆盖范围：
- **用户服务**：注册、登录、信息查询、会话管理
- **分类服务**：创建、列表、更新、删除
- **物品服务**：CRUD、过期查询、统计、标记已消耗
- **过期检测服务**：单元测试（mock Repository） + 集成测试（内存 SQLite）

---

## 📚 文档

更多开发相关文档见 [`document/develop/`](document/develop/) 目录：

| 文档 | 说明 |
|------|------|
| [项目开发规范](document/develop/项目开发规范.md) | 强制性开发规范（分层架构、命名、错误处理等） |
| [物品过期自动更新设计文档](document/develop/物品过期自动更新设计文档.md) | 过期检测功能技术设计方案 |
| [API 接口文档](document/develop/API接口文档.md) | 完整 API 接口说明（待完善） |

---

## 🚢 部署

### 部署架构

```
                   ┌─────────────────┐
                   │     Nginx       │
                   │  (HTTPS 卸载)    │
                   │   反向代理       │
                   └────────┬────────┘
                            │ HTTP
                            ▼
                   ┌─────────────────┐
                   │   Bun Server    │
                   │   (0.0.0.0:8080)│
                   └────────┬────────┘
                            │ SQLite
                            ▼
                   ┌─────────────────┐
                   │   app.db        │
                   └─────────────────┘
```

### 启动方式

```bash
# 开发模式
bun run dev

# 生产模式
bun run start

# 编译为单文件二进制（可选）
bun build --compile src/index.ts --outfile server
./server
```

> **注意**: 本项目使用 SQLite 数据库，单实例部署即可满足多数场景。多实例部署时需注意 SQLite 的写并发限制。

---

## 🛡️ 认证流程

1. 用户通过 `POST /api/user/login` 获取 JWT Token
2. Token 中包含 `userId`、`jti`（会话唯一标识）和过期时间
3. 需要认证的接口在 `Authorization` 请求头中携带 `Bearer <token>`
4. [`AuthMiddleware`](src/middleware/auth.ts) 验证 Token 有效性和会话状态
5. 支持多会话管理，每用户可配置最大并发会话数，超过时自动撤销最早会话
6. 支持主动撤销会话和强制登出所有会话

---

## 🤝 贡献指南

1. 遵守 [`项目开发规范`](document/develop/项目开发规范.md) 的全部要求
2. 遵循严格分层架构设计
3. 面向接口编程，编写单元测试
4. 代码提交前运行 `bun run typecheck` 确保类型正确

---

## 📄 许可

本项目为私有项目。
