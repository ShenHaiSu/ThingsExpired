# ThingsExpired 后端项目 - 阶段文档

> 本目录包含 ThingsExpired 后端项目的完整阶段开发文档，按照开发规范逐步落地项目。

## 📚 文档目录

| 阶段 | 文档 | 描述 |
|------|------|------|
| 阶段一 | [stage1-init.md](./stage1-init.md) | 项目初始化与基础架构搭建 |
| 阶段二 | [stage2-arch.md](./stage2-arch.md) | 分层架构基础实现 |
| 阶段三 | [stage3-user.md](./stage3-user.md) | 用户模块完整实现 |
| 阶段四 | [stage4-category.md](./stage4-category.md) | 分类模块实现 |
| 阶段五 | [stage5-item.md](./stage5-item.md) | 物品模块实现 |
| 阶段六 | [stage6-middleware.md](./stage6-middleware.md) | 中间件完善与日志系统 |
| 阶段七 | [stage7-test-deploy.md](./stage7-test-deploy.md) | 测试与部署 |

## 🚀 快速开始

### 项目结构

```
things-expired/
├── cmd/
│   └── server/
│       └── main.go              # 应用入口
├── config/
│   ├── config.go                # 配置加载
│   └── config.yaml              # 配置文件
├── internal/
│   ├── handler/                  # Handler 层
│   ├── service/                  # Service 层
│   ├── repository/               # Repository 层
│   └── model/                   # Model 层
│       ├── dto/                  # 请求 DTO
│       └── vo/                   # 响应 VO
├── pkg/
│   ├── errors/                   # 错误定义
│   ├── middleware/              # 中间件
│   └── utils/                   # 工具函数
├── migrations/                   # 数据库迁移
└── ...
```

### 开发流程

按照阶段顺序逐步实现：

1. **阶段一**：初始化项目，创建目录结构，引入依赖
2. **阶段二**：实现分层架构，搭建基础框架
3. **阶段三**：实现用户模块（注册、登录）
4. **阶段四**：实现分类模块（CRUD）
5. **阶段五**：实现物品模块（CRUD、过期提醒）
6. **阶段六**：完善中间件和日志系统
7. **阶段七**：测试与部署

## 📖 各阶段概览

### 阶段一：项目初始化与基础架构搭建
- 项目目录结构创建
- 依赖引入（Go 1.21+、Gin、GORM、fx、viper、zap 等）
- 配置管理（config.yaml）
- 错误定义（AppError、错误码）
- 统一响应封装

### 阶段二：分层架构基础实现
- 数据库初始化（SQLite）
- Model 层定义（User、Category、Item、Notification）
- Repository 层基础实现
- Service 层接口定义
- Handler 层基础结构
- 路由注册
- 依赖注入主入口

### 阶段三：用户模块完整实现
- 用户注册（密码加密）
- 用户登录（JWT Token）
- 获取用户信息
- 更新用户信息
- 认证中间件

### 阶段四：分类模块实现
- 创建分类
- 获取分类列表
- 更新分类
- 删除分类
- 分类归属权限校验

### 阶段五：物品模块实现
- 创建物品
- 获取物品列表（支持筛选、分页）
- 获取物品详情
- 获取即将过期物品
- 更新物品
- 删除物品
- 过期计算逻辑

### 阶段六：中间件完善与日志系统
- zap 日志系统集成
- 日志中间件
- CORS 中间件
- 请求追踪中间件
- 错误恢复中间件
- 中间件工厂

### 阶段七：测试与部署
- 单元测试（Service、Handler）
- 集成测试
- Dockerfile
- docker-compose.yml
- Nginx 配置
- systemd 服务配置
- 部署检查清单

## 📝 开发规范

本项目严格遵守 [Go HTTP 后端项目开发规范](../Go-HTTP-后端项目开发规范.md)，包括：

- **严格分层**：Router → Handler → Service → Repository → Model
- **禁止越权**：每一层只做本层的事情
- **面向接口**：各层之间通过接口依赖
- **配置外置**：所有配置通过配置文件管理
- **错误统一**：建立统一的错误类型和响应格式

## 🔧 常用命令

```bash
# 运行应用
go run ./cmd/server

# 编译
go build -o server ./cmd/server

# 运行测试
go test ./...

# 代码格式化
go fmt ./...

# 依赖管理
go mod tidy
```

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](../../LICENSE)。
