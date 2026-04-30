# Go HTTP 后端项目开发规范与指导

> 本文档定义了一套生产级别的 Go HTTP 后端项目开发规范，所有项目必须严格遵守本文档的定义。

---

## 目录

1. [项目概述](#1-项目概述)
2. [设计原则](#2-设计原则)
3. [分层架构](#3-分层架构)
4. [API 规范](#4-api-规范)
5. [目录结构](#5-目录结构)
6. [代码规范](#6-代码规范)
7. [命名规范](#7-命名规范)
8. [错误处理](#8-错误处理)
9. [配置管理](#9-配置管理)
10. [依赖注入](#10-依赖注入)
11. [中间件规范](#11-中间件规范)
12. [日志规范](#12-日志规范)
13. [数据库规范](#13-数据库规范)
14. [测试规范](#14-测试规范)
15. [部署规范](#15-部署规范)

---

## 1. 项目概述

### 1.1 项目类型

- **项目类型**：RESTful API 后端服务
- **通信协议**：仅使用 HTTP 协议
- **HTTPS 说明**：不实现 HTTPS，由 Nginx 负责 HTTPS 卸载
- **数据库**：SQLite（轻量级，无需额外部署）

### 1.2 技术栈

| 组件 | 技术选型 | 说明 |
|------|----------|------|
| 语言 | Go 1.21+ | 必须使用最新稳定版 |
| Web 框架 | Gin | 高性能 HTTP Web 框架 |
| 数据库 | SQLite | 使用 gorm 作为 ORM |
| 依赖注入 | fx | Uber 出品的依赖注入框架 |
| 配置管理 | viper | 支持多格式配置 |
| 日志 | zap | 高性能结构化日志 |
| 验证 | go-playground/validator | 请求参数验证 |

### 1.3 依赖注入

采用运行时依赖注入容器（fx），所有依赖在应用启动时完成初始化和注入。

### 1.4 编码要求

- 严格遵守分层架构
- 高内聚低耦合
- 面向接口编程
- 配置外置
- 错误统一处理

---

## 2. 设计原则

### 2.1 核心原则总览

| 序号 | 原则名称 | 描述 |
|------|----------|------|
| 1 | 严格分层 | 请求必须按照固定顺序流经各层 |
| 2 | 禁止越权 | 每一层只做本层的事情 |
| 3 | 面向接口 | 各层之间通过接口依赖 |
| 4 | 配置外置 | 所有配置通过配置文件管理 |
| 5 | 错误统一 | 建立统一的错误类型和响应格式 |

### 2.2 详细原则

#### 2.2.1 严格分层原则

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Request                             │
│                     Content-Type: application/json              │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Router Layer                             │
│  - 注册路由                                                      │
│  - 绑定方法与路径                                                 │
│  - 挂载中间件                                                    │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Handler Layer                             │
│  - 参数绑定（从 request body 解析 JSON 到结构体）                  │
│  - 参数校验（使用 validator 进行必填、格式、范围校验）              │
│  - 调用 Service                                                  │
│  - 返回响应（统一响应格式）                                        │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Service Layer                            │
│  - 业务逻辑处理                                                  │
│  - 事务控制                                                     │
│  - 组合多个 Repository                                          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Repository Layer                            │
│  - 数据库 CRUD 操作                                             │
│  - 复杂查询封装                                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Model Layer                               │
│  - 数据库模型定义                                                │
│  - DTO 定义（请求参数）                                          │
│  - VO 定义（响应数据）                                           │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.2.2 禁止越权原则

| 层级 | 职责 | 禁止事项 |
|------|------|----------|
| **Router** | 注册路由、绑定方法与路径、挂载中间件 | ❌ 禁止处理业务逻辑 |
| **Handler** | 参数绑定、参数校验、调用 Service、返回响应 | ❌ 禁止业务逻辑<br>❌ 禁止直接操作数据库 |
| **Service** | 业务逻辑处理、事务控制、组合多个 Repository | ❌ 禁止直接操作数据库<br>❌ 禁止处理 HTTP 请求/响应 |
| **Repository** | 数据库 CRUD 操作、复杂查询封装 | ❌ 禁止业务逻辑 |
| **Model** | 定义数据结构 | ❌ 禁止业务逻辑 |

#### 2.2.3 面向接口编程原则

- **定义位置**：接口在调用方所在层定义
- **实现位置**：接口实现在被调用方所在层
- **好处**：便于单元测试和替换实现

```go
// Handler 层定义接口（调用方）
type IUserService interface {
    GetUserByID(ctx context.Context, id uint) (*UserVO, error)
    CreateUser(ctx context.Context, req *CreateUserRequest) (*UserVO, error)
}

// Service 层实现接口（被调用方）
type UserService struct {
    userRepo IUserRepository  // 依赖接口而非具体实现
}

func (s *UserService) GetUserByID(ctx context.Context, id uint) (*UserVO, error) {
    // 实现逻辑
}

func (s *UserService) CreateUser(ctx context.Context, req *CreateUserRequest) (*UserVO, error) {
    // 实现逻辑
}
```

#### 2.2.4 配置外置原则

- 所有配置必须通过配置文件管理
- 禁止在代码中硬编码任何配置值
- 支持多环境配置（dev、test、prod）

#### 2.2.5 错误统一处理原则

- 所有错误必须使用自定义错误类型
- 错误响应格式必须统一
- 错误需要区分业务错误和系统错误

---

## 3. 分层架构

### 3.1 Router Layer

#### 3.1.1 职责

| 职责 | 说明 |
|------|------|
| 注册路由 | 将 URL 路径与方法绑定 |
| 挂载中间件 | 全局中间件、路由组中间件 |
| 路径前缀 | 所有 API 必须以 `/api` 开头 |

#### 3.1.2 实现规范

```go
// 位置：internal/router/router.go

func NewRouter(
    userHandler *handler.UserHandler,      // 注入 Handler
    middleware ...gin.HandlerFunc,          // 全局中间件
) *gin.Engine {
    r := gin.New()
    
    // 注册全局中间件
    r.Use(middleware...)
    
    // API 路由组（所有 API 必须以 /api 开头）
    api := r.Group("/api")
    {
        // 用户相关路由
        user := api.Group("/user")
        user.Use(authMiddleware())  // 路由组中间件
        {
            user.POST("/info", userHandler.GetUserInfo)
            user.POST("/create", userHandler.CreateUser)
        }
    }
    
    return r
}
```

#### 3.1.3 禁止事项

```go
// ❌ 禁止在 Router 层处理业务逻辑
api.POST("/user", func(c *gin.Context) {
    // 这是 Handler 的工作，禁止在此处理
    name := c.Query("name")
    db.Create(&User{Name: name})
    c.JSON(200, User{Name: name})
})

// ❌ 禁止在 Router 层直接操作数据库
api.POST("/user", func(c *gin.Context) {
    // 禁止直接操作数据库
    db.Where("id = ?", 1).First(&user)
})

// ❌ 禁止在 Router 层进行参数校验
api.POST("/user", func(c *gin.Context) {
    // 禁止在此进行参数校验
    if c.Query("name") == "" {
        c.JSON(400, gin.H{"error": "name required"})
        return
    }
})
```

### 3.2 Handler Layer

#### 3.2.1 职责

| 职责 | 说明 |
|------|------|
| 参数绑定 | 从 request body 解析 JSON 到结构体 |
| 参数校验 | 使用 validator 进行必填、格式、范围校验 |
| 调用 Service | 调用对应的 Service 方法 |
| 返回响应 | 使用统一响应格式返回结果 |

#### 3.2.2 实现规范

```go
// 位置：internal/handler/user.go

type UserHandler struct {
    userService service.IUserService  // 依赖 Service 接口
}

type GetUserInfoRequest struct {
    UserID uint `json:"user_id" binding:"required,min=1"`
}

func (h *UserHandler) GetUserInfo(c *gin.Context) {
    // 1. 参数绑定
    var req GetUserInfoRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        // 统一错误响应
        response.FailWithCode(c, response.CodeParamInvalid, err.Error())
        return
    }
    
    // 2. 调用 Service
    user, err := h.userService.GetUserByID(c.Request.Context(), req.UserID)
    if err != nil {
        // 统一错误处理
        response.Fail(c, err)
        return
    }
    
    // 3. 返回成功响应
    response.Success(c, user)
}

func (h *UserHandler) CreateUser(c *gin.Context) {
    // 1. 参数绑定
    var req *service.CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        response.FailWithCode(c, response.CodeParamInvalid, err.Error())
        return
    }
    
    // 2. 调用 Service
    user, err := h.userService.CreateUser(c.Request.Context(), req)
    if err != nil {
        response.Fail(c, err)
        return
    }
    
    // 3. 返回成功响应
    response.Success(c, user)
}
```

#### 3.2.3 禁止事项

```go
// ❌ 禁止在 Handler 层处理业务逻辑
func (h *UserHandler) CreateUser(c *gin.Context) {
    // 禁止处理业务逻辑，应该调用 Service
    user := &User{
        Name:  req.Name,
        Email: req.Email,
    }
    // 业务逻辑应该放在 Service 层
    h.userService.CreateUser(c.Request.Context(), user)
}

// ❌ 禁止在 Handler 层直接操作数据库
func (h *UserHandler) CreateUser(c *gin.Context) {
    // 禁止直接操作数据库
    db.Create(&user)
}

// ❌ 禁止在 Handler 层直接返回数据库模型
func (h *UserHandler) GetUser(c *gin.Context) {
    // 应该转换为 VO 后再返回
    c.JSON(200, user)  // user 是数据库模型，包含不该暴露的字段
}
```

### 3.3 Service Layer

#### 3.3.1 职责

| 职责 | 说明 |
|------|------|
| 业务逻辑处理 | 实现所有业务逻辑 |
| 事务控制 | 管理数据库事务 |
| 组合 Repository | 调用多个 Repository 完成复杂业务 |

#### 3.3.2 实现规范

```go
// 位置：internal/service/user.go

// 定义接口（供 Handler 层依赖）
type IUserService interface {
    GetUserByID(ctx context.Context, id uint) (*UserVO, error)
    CreateUser(ctx context.Context, req *CreateUserRequest) (*UserVO, error)
    DeleteUser(ctx context.Context, id uint) error
    UpdateUser(ctx context.Context, req *UpdateUserRequest) (*UserVO, error)
}

type UserService struct {
    userRepo repository.IUserRepository    // 注入 Repository 接口
    deptRepo repository.IDeptRepository    // 注入另一个 Repository
    txManager *repository.TransactionManager // 事务管理器
}

// 必须返回 VO，而非数据库模型
func (s *UserService) GetUserByID(ctx context.Context, id uint) (*UserVO, error) {
    // 1. 调用 Repository 获取数据
    user, err := s.userRepo.GetByID(ctx, id)
    if err != nil {
        return nil, err
    }
    
    // 2. 业务逻辑处理（如果有）
    if user.Status == StatusDeleted {
        return nil, errors.New("user not found")
    }
    
    // 3. 转换为 VO
    return s.toVO(user), nil
}

func (s *UserService) CreateUser(ctx context.Context, req *CreateUserRequest) (*UserVO, error) {
    // 可以使用事务
    return s.txManager.Transaction(ctx, func(txRepo repository.IUserRepository) (interface{}, error) {
        // 1. 业务校验
        exist, _ := txRepo.ExistsByEmail(ctx, req.Email)
        if exist {
            return nil, errors.New("email already exists")
        }
        
        // 2. 创建用户
        user := &model.User{
            Name:  req.Name,
            Email: req.Email,
        }
        if err := txRepo.Create(ctx, user); err != nil {
            return nil, err
        }
        
        // 3. 返回 VO
        return s.toVO(user), nil
    })
}
```

#### 3.3.3 禁止事项

```go
// ❌ 禁止在 Service 层直接操作数据库
func (s *UserService) CreateUser(ctx context.Context, req *CreateUserRequest) (*UserVO, error) {
    // 禁止直接操作数据库，应该调用 Repository
    db.Create(&user)  // 错误！
}

// ❌ 禁止在 Service 层处理 HTTP 请求/响应
func (s *UserService) CreateUser(ctx context.Context, req *CreateUserRequest) (*UserVO, error) {
    // 禁止操作 c *gin.Context
    c.JSON(200, result)  // 错误！
    c.Get("user_id")     // 错误！
}

// ❌ 禁止在 Service 层返回数据库模型
func (s *UserService) GetUserByID(ctx context.Context, id uint) (*model.User, error) {
    // 应该返回 VO，不是数据库模型
    return &model.User{}, nil  // 错误！
}
```

### 3.4 Repository Layer

#### 3.4.1 职责

| 职责 | 说明 |
|------|------|
| 数据库 CRUD | 提供基础增删改查方法 |
| 复杂查询封装 | 提供复杂查询方法 |
| 事务支持 | 支持事务操作 |

#### 3.4.2 实现规范

```go
// 位置：internal/repository/user.go

// 定义接口（供 Service 层依赖）
type IUserRepository interface {
    GetByID(ctx context.Context, id uint) (*model.User, error)
    GetByEmail(ctx context.Context, email string) (*model.User, error)
    Create(ctx context.Context, user *model.User) error
    Update(ctx context.Context, user *model.User) error
    Delete(ctx context.Context, id uint) error
    ExistsByEmail(ctx context.Context, email string) (bool, error)
    List(ctx context.Context, page, pageSize int) ([]*model.User, int64, error)
}

type UserRepository struct {
    db *gorm.DB
}

// 实现接口
func (r *UserRepository) GetByID(ctx context.Context, id uint) (*model.User, error) {
    var user model.User
    if err := r.db.WithContext(ctx).First(&user, id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, err
    }
    return &user, nil
}

func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
    var count int64
    if err := r.db.WithContext(ctx).Model(&model.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
        return false, err
    }
    return count > 0, nil
}
```

#### 3.4.3 禁止事项

```go
// ❌ 禁止在 Repository 层处理业务逻辑
func (r *UserRepository) Create(ctx context.Context, user *model.User) error {
    // 禁止业务逻辑，应该只做数据库操作
    if user.Email == "" {
        return errors.New("email required")  // 错误！这是业务逻辑
    }
    return r.db.Create(user).Error
}

// ❌ 禁止在 Repository 层定义业务相关的接口方法
func (r *UserRepository) CheckUserPermission(ctx context.Context, userID uint, resource string) error {
    // 错误！这是业务逻辑，应该放在 Service 层
}
```

### 3.5 Model Layer

#### 3.5.1 模型类型定义

| 类型 | 后缀 | 说明 | 位置 |
|------|------|------|------|
| 数据库模型 | 无后缀 | 对应数据库表结构 | model/user.go |
| 请求 DTO | Request | 接收客户端请求参数 | model/dto/user.go |
| 响应 VO | VO/Response | 返回给客户端的数据 | model/vo/user.go |

#### 3.5.2 实现规范

```go
// 位置：internal/model/user.go

type User struct {
    ID        uint      `gorm:"primaryKey"`
    Name      string    `gorm:"size:100;not null"`
    Email     string    `gorm:"size:255;uniqueIndex;not null"`
    Password  string    `gorm:"size:255;not null"`
    Status    int8      `gorm:"default:1"`
    CreatedAt time.Time
    UpdatedAt time.Time
}

func (User) TableName() string {
    return "users"
}
```

```go
// 位置：internal/model/dto/user.go

type CreateUserRequest struct {
    Name     string `json:"name" binding:"required,min=2,max=50"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6,max=20"`
}

type UpdateUserRequest struct {
    UserID   uint   `json:"user_id" binding:"required,min=1"`
    Name     string `json:"name" binding:"omitempty,min=2,max=50"`
    Email    string `json:"email" binding:"omitempty,email"`
}

type DeleteUserRequest struct {
    UserID uint `json:"user_id" binding:"required,min=1"`
}
```

```go
// 位置：internal/model/vo/user.go

type UserVO struct {
    UserID   uint   `json:"user_id"`
    Name     string `json:"name"`
    Email    string `json:"email"`
    Status   int8   `json:"status"`
    CreateAt string `json:"create_at"`
}
```

#### 3.5.3 禁止事项

```go
// ❌ 禁止在 Model 层处理业务逻辑
func (u *User) Validate() error {
    // 禁止业务逻辑
}

// ❌ 禁止在数据库模型中定义响应相关字段
type User struct {
    ID     uint   `gorm:"primaryKey"`
    Result string `json:"result"`  // 错误！这是响应逻辑
}

// ❌ 禁止在 DTO 中定义数据库相关字段
type CreateUserRequest struct {
    ID       uint   `json:"id"`  // 错误！创建时不需要 ID
    Password string `json:"password"`
}
```

---

## 4. API 规范

### 4.1 基础规范

| 规范 | 要求 | 说明 |
|------|------|------|
| 路径前缀 | `/api` | 所有 API 必须以 `/api` 开头 |
| 请求方法 | `POST` | 所有 API 必须使用 POST 方法 |
| 请求体格式 | `JSON` | 请求 body 必须为 JSON 格式 |
| 文件上传 | `formData` | 仅文件上传 API 可使用 formData |

### 4.2 URL 规范

```
# 标准 API 格式
POST /api/{module}/{resource}

# 示例
POST /api/user/login          # 用户登录
POST /api/user/register       # 用户注册
POST /api/user/info           # 获取用户信息
POST /api/order/create         # 创建订单
POST /api/order/list           # 订单列表

# 文件上传 API（使用 formData）
POST /api/upload/image        # 上传图片
POST /api/upload/file          # 上传文件
```

### 4.3 请求规范

#### 4.3.1 请求头

| Header | 必须 | 说明 |
|--------|------|------|
| Content-Type | 是 | application/json |
| Authorization | 是 | Bearer Token（除登录/注册外） |

#### 4.3.2 请求体格式

```json
// 标准 JSON 请求体
{
    "field1": "value1",
    "field2": "value2"
}
```

#### 4.3.3 文件上传请求格式

```
# 使用 multipart/form-data
POST /api/upload/image
Content-Type: multipart/form-data

file: [选择文件]
```

### 4.4 响应规范

#### 4.4.1 统一响应格式

```go
// 成功响应
{
    "code": 0,
    "message": "success",
    "data": { ... }
}

// 失败响应
{
    "code": 1001,
    "message": "error description",
    "data": null
}
```

#### 4.4.2 响应码定义

| 响应码 | 常量名 | 说明 |
|--------|--------|------|
| 0 | CodeSuccess | 成功 |
| 1001 | CodeParamInvalid | 参数错误 |
| 1002 | CodeUnauthorized | 未授权 |
| 1003 | CodeForbidden | 禁止访问 |
| 2001 | CodeUserNotFound | 用户不存在 |
| 2002 | CodeUserExists | 用户已存在 |
| 2003 | CodePasswordWrong | 密码错误 |
| 5001 | CodeInternalError | 内部错误 |
| 5002 | CodeDatabaseError | 数据库错误 |

### 4.5 API 定义示例

```go
// 用户模块 API
POST /api/user/register       # 用户注册
POST /api/user/login          # 用户登录
POST /api/user/logout         # 用户登出
POST /api/user/info           # 获取用户信息
POST /api/user/update         # 更新用户信息
POST /api/user/delete         # 删除用户

// 订单模块 API
POST /api/order/create         # 创建订单
POST /api/order/list           # 订单列表
POST /api/order/detail         # 订单详情
POST /api/order/cancel         # 取消订单

// 文件上传 API（使用 formData）
POST /api/upload/image         # 上传图片
POST /api/upload/avatar        # 上传头像
```

### 4.6 时间格式规范（强制）

> **重要**: 本规范为强制要求，所有时间相关的存储和传输必须严格遵守。

#### 4.6.1 规范要求

| 场景 | 格式要求 | 示例 |
|------|----------|------|
| 数据库存储 | UTC 时间 | `2026-05-02T00:00:00.000Z` |
| API 响应 | UTC 时间（ISO 8601） | `2026-05-02T00:00:00.000Z` |
| API 请求 | UTC 时间（ISO 8601） | `2026-05-02T00:00:00.000Z` |

#### 4.6.2 格式说明

- **必须使用 UTC 时间**: 所有时间数据必须以 UTC（协调世界时）格式存储和传输
- **格式标准**: ISO 8601 格式，即 `YYYY-MM-DDTHH:mm:ss.sssZ`
- **禁止使用本地时间**: 禁止在数据库或 API 中使用本地时间格式（如 `2026-05-02 08:00:00`）
- **时区处理**: 时区转换由前端根据用户所在位置自行处理

#### 4.6.3 实现示例

```go
// ✅ 正确：使用 UTC 时间存储
type User struct {
    ID        uint      `gorm:"primaryKey"`
    CreatedAt time.Time `gorm:"type:datetime"`  // GORM 自动使用 UTC
}

// ✅ 正确：API 响应使用 UTC 时间格式
type UserVO struct {
    UserID    uint   `json:"user_id"`
    CreatedAt string `json:"created_at"`  // 格式: "2026-05-02T00:00:00.000Z"
}

// ✅ 正确：时间格式化输出
func formatTime(t time.Time) string {
    return t.UTC().Format("2006-01-02T15:04:05.000Z")
}

// ❌ 错误：使用本地时间格式
type UserVO struct {
    CreatedAt string `json:"created_at"`  // 格式: "2026-05-02 08:00:00" - 错误！
}

// ❌ 错误：不使用 UTC
func formatTime(t time.Time) string {
    return t.Format("2006-01-02 15:04:05")  // 缺少 UTC 转换 - 错误！
}
```

#### 4.6.4 前端对接说明

前端开发者需要：

1. **接收时间**: 后端返回的时间均为 UTC 格式，前端需要根据用户时区进行转换显示
2. **发送时间**: 前端向后端发送时间数据时，必须转换为 UTC 格式
3. **示例转换**（JavaScript）:
   ```javascript
   // 接收后端时间，转换为本地显示
   const utcTime = "2026-05-02T00:00:00.000Z";
   const localTime = new Date(utcTime).toLocaleString();
   
   // 发送时间到后端，转换为 UTC
   const localDate = new Date();
   const utcString = localDate.toISOString();  // 输出: "2026-05-02T00:00:00.000Z"
   ```

---

## 5. 目录结构

### 5.1 标准目录结构

```
project-name/
├── cmd/
│   └── server/
│       └── main.go              # 应用入口
├── config/
│   ├── config.go                # 配置加载
│   └── config.yaml              # 配置文件
├── internal/
│   ├── handler/                  # Handler 层
│   │   ├── user.go
│   │   ├── order.go
│   │   ├── upload.go
│   │   └── response.go          # 统一响应
│   ├── service/                  # Service 层
│   │   ├── user.go
│   │   ├── order.go
│   │   └── interfaces.go        # Service 接口定义
│   ├── repository/               # Repository 层
│   │   ├── user.go
│   │   ├── order.go
│   │   └── interfaces.go        # Repository 接口定义
│   └── model/                   # Model 层
│       ├── user.go              # 数据库模型
│       ├── order.go
│       ├── dto/                  # 请求 DTO
│       │   ├── user.go
│       │   └── order.go
│       └── vo/                   # 响应 VO
│           ├── user.go
│           └── order.go
├── pkg/
│   ├── errors/                   # 错误定义
│   │   ├── code.go
│   │   └── errors.go
│   ├── middleware/              # 中间件
│   │   ├── auth.go
│   │   ├── cors.go
│   │   └── logger.go
│   └── utils/                   # 工具函数
│       ├── crypto.go
│       └── response.go
├── migrations/                   # 数据库迁移
│   └── 001_create_users.sql
├── go.mod
├── go.sum
└── README.md
```

### 5.2 目录说明

| 目录 | 说明 |
|------|------|
| cmd/server | 应用入口，初始化所有依赖 |
| config | 配置加载和配置定义 |
| internal/handler | HTTP 请求处理 |
| internal/service | 业务逻辑处理 |
| internal/repository | 数据库操作 |
| internal/model | 数据结构定义 |
| internal/model/dto | 请求参数定义 |
| internal/model/vo | 响应数据定义 |
| pkg/errors | 统一错误处理 |
| pkg/middleware | 中间件 |
| pkg/utils | 工具函数 |
| migrations | 数据库迁移脚本 |

---

## 6. 代码规范

### 6.1 注释规范

```go
// Package user 提供用户相关的业务逻辑处理
package user

// IUserService 用户服务接口
type IUserService interface {
    // GetUserByID 根据用户ID获取用户信息
    // ctx: 上下文
    // id: 用户ID
    // 返回: 用户VO和错误信息
    GetUserByID(ctx context.Context, id uint) (*UserVO, error)
}
```

### 6.2 错误处理规范

```go
// ✅ 正确：错误应该立即处理，不允许忽略
if err != nil {
    return nil, err
}

// ❌ 错误：不允许忽略错误
if err != nil {
    // do something
}
// err 被忽略，错误！

// ✅ 正确：明确忽略错误的原因
_ = someFunc()  // 已知忽略原因，可添加注释说明

// ❌ 错误：不允许使用 _ 忽略未知错误
_ = riskyFunc()  // 如果不知道为什么要忽略，就不要忽略
```

### 6.3 Context 使用规范

```go
// ✅ 正确：所有数据库操作必须传递 context
func (r *UserRepository) GetByID(ctx context.Context, id uint) (*model.User, error) {
    var user model.User
    if err := r.db.WithContext(ctx).First(&user, id).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

// ❌ 错误：不允许不传递 context
func (r *UserRepository) GetByID(id uint) (*model.User, error) {
    var user model.User
    if err := r.db.First(&user, id).Error; err != nil {  // 没有 WithContext
        return nil, err
    }
    return &user, nil
}
```

---

## 7. 命名规范

### 7.1 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| Go 源文件 | 小写下划线 | user_service.go |
| 配置文件 | 小写下划线 | config.yaml |
| 数据库迁移 | 版本_描述.sql | 001_create_users.sql |
| 测试文件 | xxx_test.go | user_service_test.go |

### 7.2 结构体命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 数据库模型 | 大写下划线转驼峰 | type User struct |
| DTO | 名称+Request | type CreateUserRequest struct |
| VO | 名称+VO | type UserVO struct |
| 错误 | 大写下划线转驼峰 | type UserNotFoundError struct |

### 7.3 函数命名

| 位置 | 规范 | 示例 |
|------|------|------|
| Handler | 驼峰 | func (h *UserHandler) GetUserInfo |
| Service | 驼峰 | func (s *UserService) GetUserByID |
| Repository | 驼峰 | func (r *UserRepository) GetByID |
| 中间件 | 驼峰 | func AuthMiddleware |
| 工具函数 | 驼峰 | func HashPassword |

### 7.4 变量命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 普通变量 | 驼峰或下划线 | userName, user_name |
| 常量 | 全大写下划线 | MAX_RETRY_COUNT |
| 私有变量 | 小写下划线 | user_id |
| 接口 | 大写I前缀 | type IUserService interface |

---

## 8. 错误处理

### 8.1 错误类型定义

```go
// 位置：pkg/errors/code.go

package errors

// 错误码定义
const (
    CodeSuccess       = 0
    CodeParamInvalid  = 1001
    CodeUnauthorized  = 1002
    CodeForbidden     = 1003
    
    // 用户相关
    CodeUserNotFound  = 2001
    CodeUserExists    = 2002
    CodePasswordWrong = 2003
    
    // 系统相关
    CodeInternalError = 5001
    CodeDatabaseError = 5002
)
```

```go
// 位置：pkg/errors/errors.go

package errors

type AppError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Cause   error  `json:"-"`  // 不序列化到 JSON
}

func (e *AppError) Error() string {
    return e.Message
}

func (e *AppError) Unwrap() error {
    return e.Cause
}

// 构造函数
func New(code int, message string) *AppError {
    return &AppError{
        Code:    code,
        Message: message,
    }
}

func NewWithCause(code int, message string, cause error) *AppError {
    return &AppError{
        Code:    code,
        Message: message,
        Cause:   cause,
    }
}

// 预定义错误
var (
    ErrUserNotFound = New(CodeUserNotFound, "用户不存在")
    ErrUserExists   = New(CodeUserExists, "用户已存在")
    ErrUnauthorized = New(CodeUnauthorized, "未授权")
)
```

### 8.2 响应处理

```go
// 位置：internal/handler/response.go

package handler

type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data"`
}

func Success(c *gin.Context, data interface{}) {
    c.JSON(http.StatusOK, Response{
        Code:    0,
        Message: "success",
        Data:    data,
    })
}

func Fail(c *gin.Context, err error) {
    if appErr, ok := err.(*errors.AppError); ok {
        c.JSON(http.StatusOK, Response{
            Code:    appErr.Code,
            Message: appErr.Message,
            Data:    nil,
        })
        return
    }
    
    // 未知错误
    c.JSON(http.StatusOK, Response{
        Code:    errors.CodeInternalError,
        Message: "内部错误",
        Data:    nil,
    })
}

func FailWithCode(c *gin.Context, code int, message string) {
    c.JSON(http.StatusOK, Response{
        Code:    code,
        Message: message,
        Data:    nil,
    })
}
```

---

## 9. 配置管理

### 9.1 配置文件格式

```yaml
# 位置：config/config.yaml

app:
  name: "things-expired"
  host: "0.0.0.0"
  port: 8080
  mode: "debug"  # debug, release, test

database:
  path: "./data/app.db"  # SQLite 数据库路径
  max_idle_conns: 5
  max_open_conns: 10

jwt:
  secret: "your-secret-key"
  expire_hours: 24

upload:
  max_size_mb: 10
  allowed_types:
    - ".jpg"
    - ".png"
    - ".pdf"
  save_path: "./uploads"
```

### 9.2 配置加载

```go
// 位置：config/config.go

package config

import (
    "github.com/spf13/viper"
)

type Config struct {
    App      AppConfig
    Database DatabaseConfig
    JWT      JWTConfig
    Upload   UploadConfig
}

type AppConfig struct {
    Name string
    Host string
    Port int
    Mode string
}

type DatabaseConfig struct {
    Path         string
    MaxIdleConns int
    MaxOpenConns int
}

type JWTConfig struct {
    Secret      string
    ExpireHours int
}

type UploadConfig struct {
    MaxSizeMB    int
    AllowedTypes []string
    SavePath     string
}

func Load(path string) (*Config, error) {
    viper.SetConfigFile(path)
    viper.SetConfigType("yaml")
    
    if err := viper.ReadInConfig(); err != nil {
        return nil, err
    }
    
    var cfg Config
    if err := viper.Unmarshal(&cfg); err != nil {
        return nil, err
    }
    
    return &cfg, nil
}
```

---

## 10. 依赖注入

### 10.1 使用 fx 进行依赖注入

```go
// 位置：cmd/server/main.go

package main

import (
    "context"
    "log"
    
    "go.uber.org/fx"
    
    "project-name/config"
    "project-name/internal/handler"
    "project-name/internal/repository"
    "project-name/internal/service"
    "project-name/pkg/middleware"
)

func main() {
    fx.New(
        // 配置模块
        fx.Provide(config.Load),
        
        // 数据库
        fx.Provide(repository.NewDB),
        
        // Repository
        fx.Provide(repository.NewUserRepository),
        fx.Provide(repository.NewOrderRepository),
        
        // Service
        fx.Provide(service.NewUserService),
        fx.Provide(service.NewOrderService),
        
        // Handler
        fx.Provide(handler.NewUserHandler),
        fx.Provide(handler.NewOrderHandler),
        fx.Provide(handler.NewUploadHandler),
        
        // 中间件
        fx.Provide(middleware.NewAuthMiddleware),
        
        // Router
        fx.Provide(router.NewRouter),
        
        // 启动服务器
        fx.Invoke(startServer),
    ).Run()
}

func startServer(
    lc fx.Lifecycle,
    r *gin.Engine,
    cfg *config.Config,
) {
    lc.Append(fx.Hook{
        OnStart: func(ctx context.Context) error {
            addr := fmt.Sprintf("%s:%d", cfg.App.Host, cfg.App.Port)
            log.Printf("Server starting on %s", addr)
            go func() {
                if err := r.Run(addr); err != nil {
                    log.Fatal(err)
                }
            }()
            return nil
        },
        OnStop: func(ctx context.Context) error {
            log.Println("Server stopping")
            return nil
        },
    })
}
```

### 10.2 Repository 依赖注入

```go
// 位置：internal/repository/db.go

package repository

import (
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

func NewDB(cfg *config.DatabaseConfig) (*gorm.DB, error) {
    db, err := gorm.Open(sqlite.Open(cfg.Path), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    })
    if err != nil {
        return nil, err
    }
    
    sqlDB, err := db.DB()
    if err != nil {
        return nil, err
    }
    
    sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
    sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
    
    return db, nil
}
```

---

## 11. 中间件规范

### 11.1 中间件定义

```go
// 位置：pkg/middleware/auth.go

package middleware

type AuthMiddleware struct {
    jwtService *service.JWTService
}

func NewAuthMiddleware(jwtService *service.JWTService) *AuthMiddleware {
    return &AuthMiddleware{
        jwtService: jwtService,
    }
}

func (m *AuthMiddleware) Handle(c *gin.Context) {
    // 获取 Authorization header
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        response.FailWithCode(c, errors.CodeUnauthorized, "missing authorization")
        c.Abort()
        return
    }
    
    // 解析 Bearer token
    token := strings.TrimPrefix(authHeader, "Bearer ")
    if token == authHeader {  // 没有 Bearer 前缀
        response.FailWithCode(c, errors.CodeUnauthorized, "invalid token format")
        c.Abort()
        return
    }
    
    // 验证 token
    claims, err := m.jwtService.ValidateToken(token)
    if err != nil {
        response.FailWithCode(c, errors.CodeUnauthorized, "invalid token")
        c.Abort()
        return
    }
    
    // 将用户信息存入 context
    c.Set("user_id", claims.UserID)
    c.Set("username", claims.Username)
    
    c.Next()
}
```

```go
// 位置：pkg/middleware/logger.go

func LoggerMiddleware() gin.HandlerFunc {
    return zap Gin(zapLogger, zapConfig)
}
```

```go
// 位置：pkg/middleware/cors.go

func CorsMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    }
}
```

---

## 12. 日志规范

### 12.1 日志库选择

使用 zap 进行结构化日志记录。

### 12.2 日志级别

| 级别 | 使用场景 |
|------|----------|
| Debug | 开发调试信息 |
| Info | 一般信息，如启动、关闭、请求记录 |
| Warn | 警告信息，如重试、降级 |
| Error | 错误信息，但不影响服务运行 |
| Fatal | 致命错误，导致服务无法继续 |

### 12.3 日志格式

```go
// 使用 zap 记录结构化日志
logger.Info("user login",
    zap.Uint("user_id", userID),
    zap.String("ip", ip),
    zap.Duration("duration", duration),
)
```

---

## 13. 数据库规范

### 13.1 SQLite 配置

```go
// 使用 GORM 操作 SQLite
db, err := gorm.Open(sqlite.Open("app.db"), &gorm.Config{})
```

### 13.2 模型定义

```go
// 使用 GORM tag 定义字段
type User struct {
    ID        uint      `gorm:"primaryKey"`
    Name      string    `gorm:"size:100;not null"`
    Email     string    `gorm:"size:255;uniqueIndex;not null"`
    Password  string    `gorm:"size:255;not null"`
    Status    int8      `gorm:"default:1;index"`
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

### 13.3 索引规范

| 索引类型 | 使用场景 | 定义方式 |
|----------|----------|----------|
| 普通索引 | 单字段查询 | `index` |
| 唯一索引 | 唯一字段 | `uniqueIndex` |
| 复合索引 | 多字段组合查询 | `index:idx_user_status,priority:2` |

---

## 14. 测试规范

### 14.1 测试文件命名

```
user_service_test.go    # 单元测试
user_service_it_test.go # 集成测试
```

### 14.2 单元测试结构

```go
package service

import (
    "context"
    "testing"
    
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

func TestUserService_GetUserByID(t *testing.T) {
    // 准备 mock
    mockRepo := new(MockUserRepository)
    svc := NewUserService(mockRepo)
    
    ctx := context.Background()
    testUserID := uint(1)
    
    // 设置 mock 行为
    mockRepo.On("GetByID", ctx, testUserID).Return(&model.User{
        ID:    testUserID,
        Name:  "test",
        Email: "test@example.com",
    }, nil)
    
    // 执行测试
    user, err := svc.GetUserByID(ctx, testUserID)
    
    // 断言
    assert.NoError(t, err)
    assert.NotNil(t, user)
    assert.Equal(t, testUserID, user.UserID)
    assert.Equal(t, "test", user.Name)
    
    // 验证 mock 调用
    mockRepo.AssertExpectations(t)
}
```

---

## 15. 部署规范

### 15.1 部署架构

```
                    ┌─────────────────┐
                    │     Nginx       │
                    │  (HTTPS 卸载)    │
                    │  反向代理        │
                    └────────┬────────┘
                             │
                             │ HTTP
                             ▼
                    ┌─────────────────┐
                    │   Go Server     │
                    │   (0.0.0.0:8080)│
                    └────────┬────────┘
                             │
                             │ SQLite
                             ▼
                    ┌─────────────────┐
                    │   app.db        │
                    └─────────────────┘
```

### 15.2 Nginx 配置

```nginx
server {
    listen 443 ssl;
    server_name api.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 15.3 应用启动

```bash
# 使用环境变量指定配置
./server --config=/etc/app/config.yaml

# 或使用默认配置
./server
```

---

## 附录

### A. 完整示例

一个简单的用户注册流程：

```
1. Client 发送 POST 请求
   POST /api/user/register
   Content-Type: application/json
   Body: {"name": "test", "email": "test@example.com", "password": "123456"}

2. Router 匹配路由，调用 Handler
   Router: user.POST("/register", userHandler.CreateUser)

3. Handler 参数绑定和校验
   - 解析 JSON 到 CreateUserRequest
   - 使用 validator 校验参数
   - 调用 Service

4. Service 业务逻辑处理
   - 校验邮箱是否已存在
   - 密码加密
   - 调用 Repository 创建用户
   - 返回 UserVO

5. Repository 数据库操作
   - 检查邮箱是否存在
   - 插入用户记录

6. Model 数据结构
   - User 数据库模型
   - CreateUserRequest DTO
   - UserVO 响应数据

7. 逐层返回响应
   Repository -> Service -> Handler -> Router -> Client
```

### B. 常用命令

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
