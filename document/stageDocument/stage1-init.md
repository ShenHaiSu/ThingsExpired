# ThingsExpired 后端项目 - 阶段一

> 项目初始化与基础架构搭建

## 📋 阶段目标

本阶段完成项目的基础架构搭建，包括目录结构、依赖引入、配置管理、错误定义和统一响应封装。

## 🎯 实现目标

### 1.1 项目目录结构创建

按照开发规范创建标准目录结构：

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
│   │   └── response.go          # 统一响应
│   ├── service/                  # Service 层
│   ├── repository/               # Repository 层
│   └── model/                   # Model 层
│       ├── dto/                  # 请求 DTO
│       └── vo/                   # 响应 VO
├── pkg/
│   ├── errors/                   # 错误定义
│   │   ├── code.go
│   │   └── errors.go
│   ├── middleware/              # 中间件
│   └── utils/                   # 工具函数
├── migrations/                   # 数据库迁移
├── go.mod
└── go.sum
```

### 1.2 依赖引入

使用 `go mod init` 初始化项目，并引入以下依赖：

| 组件 | 包路径 | 版本 | 说明 |
|------|--------|------|------|
| Web 框架 | github.com/gin-gonic/gin | latest | HTTP Web 框架 |
| ORM | gorm.io/gorm | latest | 数据库 ORM |
| SQLite 驱动 | gorm.io/driver/sqlite | latest | SQLite 驱动 |
| 依赖注入 | go.uber.org/fx | latest | Uber 依赖注入 |
| 配置管理 | github.com/spf13/viper | latest | 配置加载 |
| 日志 | go.uber.org/zap | latest | 结构化日志 |
| 参数验证 | github.com/go-playground/validator/v10 | latest | 请求验证 |
| 密码加密 | golang.org/x/crypto | latest | bcrypt 加密 |

初始化命令：
```bash
go mod init things-expired
go get github.com/gin-gonic/gin
go get gorm.io/gorm
go get gorm.io/driver/sqlite
go get go.uber.org/fx
go get github.com/spf13/viper
go get go.uber.org/zap
go get github.com/go-playground/validator/v10
go get golang.org/x/crypto
```

### 1.3 配置管理

#### 1.3.1 配置文件 config/config.yaml

```yaml
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
  secret: "your-secret-key-change-in-production"
  expire_hours: 24

upload:
  max_size_mb: 10
  allowed_types:
    - ".jpg"
    - ".png"
    - ".pdf"
  save_path: "./uploads"
```

#### 1.3.2 配置加载 config/config.go

实现配置结构体定义和加载逻辑：

```go
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

### 1.4 错误定义

#### 1.4.1 错误码定义 pkg/errors/code.go

```go
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

#### 1.4.2 错误类型定义 pkg/errors/errors.go

```go
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
    ErrParamInvalid = New(CodeParamInvalid, "参数错误")
)
```

### 1.5 统一响应封装

#### 1.5.1 响应结构 internal/handler/response.go

```go
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

## ✅ 阶段验收标准

1. ✅ 项目目录结构符合规范
2. ✅ `go.mod` 文件正确创建，所有依赖已引入
3. ✅ 配置文件 `config.yaml` 存在且格式正确
4. ✅ 配置加载逻辑可正常工作
5. ✅ 错误码定义完整
6. ✅ `AppError` 类型定义正确
7. ✅ 统一响应格式正确

## 📝 注意事项

- 所有配置文件必须外置，禁止硬编码
- 错误必须使用 `AppError` 类型
- 响应格式必须统一为 `{code, message, data}`
- 配置加载失败应导致应用启动失败

## ➡️ 下一步

完成本阶段后，进入 [阶段二：分层架构基础实现](./stage2-arch.md)
