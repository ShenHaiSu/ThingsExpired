# ThingsExpired 后端项目 - 阶段六

> 中间件完善与日志系统

## 📋 阶段目标

本阶段完善中间件系统，包括日志中间件、CORS 中间件、请求追踪，以及 zap 日志系统的集成。

## 🎯 实现目标

### 6.1 日志系统

#### 6.1.1 Logger 封装 pkg/utils/logger.go

```go
package utils

import (
    "go.uber.org/zap"
    "go.uber.org/zap"
)

type Logger struct {
    zap *zap.Logger
}

func NewLogger(mode string) (*Logger, error) {
    var zapConfig zap.Config
    
    switch mode {
    case "release":
        zapConfig = zap.NewProductionConfig()
    case "test":
        zapConfig = zap.NewDevelopmentConfig()
        zapConfig.Level = zap.NewAtomicLevelAt(zap.WarnLevel)
    default: // debug
        zapConfig = zap.NewDevelopmentConfig()
        zapConfig.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
    }
    
    zapLogger, err := zapConfig.Build()
    if err != nil {
        return nil, err
    }
    
    return &Logger{zap: zapLogger}, nil
}

func (l *Logger) Debug(msg string, fields ...zap.Field) {
    l.zap.Debug(msg, fields...)
}

func (l *Logger) Info(msg string, fields ...zap.Field) {
    l.zap.Info(msg, fields...)
}

func (l *Logger) Warn(msg string, fields ...zap.Field) {
    l.zap.Warn(msg, fields...)
}

func (l *Logger) Error(msg string, fields ...zap.Field) {
    l.zap.Error(msg, fields...)
}

func (l *Logger) Fatal(msg string, fields ...zap.Field) {
    l.zap.Fatal(msg, fields...)
}

func (l *Logger) Sync() {
    l.zap.Sync()
}
```

### 6.2 日志中间件

#### 6.2.1 日志中间件 pkg/middleware/logger.go

```go
package middleware

import (
    "time"
    
    "things-expired/pkg/utils"
    
    "github.com/gin-gonic/gin"
    "go.uber.org/zap"
)

func NewLoggerMiddleware(logger *utils.Logger) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 开始时间
        start := time.Now()
        
        // 获取请求路径
        path := c.Request.URL.Path
        
        // 获取客户端 IP
        clientIP := c.ClientIP()
        
        // 获取请求方法
        method := c.Request.Method
        
        // 获取用户ID（如果已认证）
        userID, _ := c.Get("user_id")
        
        // 处理请求
        c.Next()
        
        // 计算耗时
        latency := time.Since(start)
        
        // 获取响应状态码
        statusCode := c.Writer.Status()
        
        // 构建日志字段
        fields := []zap.Field{
            zap.String("method", method),
            zap.String("path", path),
            zap.String("client_ip", clientIP),
            zap.Duration("latency", latency),
            zap.Int("status", statusCode),
        }
        
        // 添加用户ID（如果存在）
        if userID != nil {
            fields = append(fields, zap.Uint("user_id", userID.(uint)))
        }
        
        // 根据状态码选择日志级别
        if statusCode >= 500 {
            logger.Error("server error", fields...)
        } else if statusCode >= 400 {
            logger.Warn("client error", fields...)
        } else {
            logger.Info("request", fields...)
        }
    }
}
```

### 6.3 CORS 中间件

#### 6.3.1 CORS 中间件 pkg/middleware/cors.go

```go
package middleware

import (
    "github.com/gin-gonic/gin"
)

func NewCorsMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    }
}
```

### 6.4 请求追踪中间件

#### 6.4.1 请求追踪中间件 pkg/middleware/requestid.go

```go
package middleware

import (
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

const RequestIDKey = "X-Request-ID"

func NewRequestIDMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // 检查请求头中是否有 Request-ID
        requestID := c.GetHeader(RequestIDKey)
        if requestID == "" {
            // 生成新的 UUID
            requestID = uuid.New().String()
        }
        
        // 设置到响应头
        c.Writer.Header().Set(RequestIDKey, requestID)
        
        // 设置到 context
        c.Set(RequestIDKey, requestID)
        
        c.Next()
    }
}
```

### 6.5 统一错误恢复中间件

#### 6.5.1 错误恢复中间件 pkg/middleware/recovery.go

```go
package middleware

import (
    "fmt"
    "runtime/debug"
    
    "things-expired/pkg/utils"
    
    "github.com/gin-gonic/gin"
    "go.uber.org/zap"
)

func NewRecoveryMiddleware(logger *utils.Logger) gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if err := recover(); err != nil {
                // 打印堆栈信息
                stack := debug.Stack()
                logger.Error("panic recovered",
                    zap.Any("error", err),
                    zap.ByteString("stack", stack),
                )
                
                // 返回 500 错误
                c.AbortWithStatusJSON(500, gin.H{
                    "code":    5001,
                    "message": "内部错误",
                    "data":    nil,
                })
            }
        }()
        
        c.Next()
    }
}
```

### 6.6 中间件工厂

#### 6.6.1 中间件工厂 pkg/middleware/factory.go

```go
package middleware

import (
    "things-expired/pkg/utils"
    
    "github.com/gin-gonic/gin"
)

type MiddlewareFactory struct {
    logger        *utils.Logger
    auth          *AuthMiddleware
    requestID     gin.HandlerFunc
    cors          gin.HandlerFunc
    recovery      gin.HandlerFunc
}

func NewMiddlewareFactory(
    logger *utils.Logger,
    auth *AuthMiddleware,
) *MiddlewareFactory {
    return &MiddlewareFactory{
        logger:    logger,
        auth:      auth,
        requestID: NewRequestIDMiddleware(),
        cors:      NewCorsMiddleware(),
        recovery:  NewRecoveryMiddleware(logger),
    }
}

func (f *MiddlewareFactory) Logger() gin.HandlerFunc {
    return NewLoggerMiddleware(f.logger)
}

func (f *MiddlewareFactory) RequestID() gin.HandlerFunc {
    return f.requestID
}

func (f *MiddlewareFactory) Cors() gin.HandlerFunc {
    return f.cors
}

func (f *MiddlewareFactory) Recovery() gin.HandlerFunc {
    return f.recovery
}

func (f *MiddlewareFactory) Auth() gin.HandlerFunc {
    return f.auth.Handle
}
```

### 6.7 路由更新

#### 6.7.1 路由定义 internal/router/router.go

```go
package router

import (
    "things-expired/internal/handler"
    "things-expired/pkg/middleware"
    
    "github.com/gin-gonic/gin"
)

func NewRouter(
    userHandler *handler.UserHandler,
    categoryHandler *handler.CategoryHandler,
    itemHandler *handler.ItemHandler,
    authMiddleware *middleware.AuthMiddleware,
    logger *utils.Logger,
) *gin.Engine {
    r := gin.New()
    
    // 创建中间件工厂
    mf := middleware.NewMiddlewareFactory(logger, authMiddleware)
    
    // 注册全局中间件（按顺序）
    r.Use(mf.Recovery())    // 1. 错误恢复（最先）
    r.Use(mf.RequestID())   // 2. 请求追踪
    r.Use(mf.Logger())      // 3. 请求日志
    r.Use(mf.Cors())        // 4. CORS
    
    // API 路由组
    api := r.Group("/api")
    {
        // 用户公开路由
        user := api.Group("/user")
        {
            user.POST("/register", userHandler.Register)
            user.POST("/login", userHandler.Login)
        }
        
        // 用户认证路由
        userAuth := api.Group("/user")
        userAuth.Use(mf.Auth())
        {
            userAuth.POST("/info", userHandler.GetUserInfo)
            userAuth.POST("/update", userHandler.UpdateUser)
        }
        
        // 分类路由
        category := api.Group("/category")
        category.Use(mf.Auth())
        {
            category.POST("/create", categoryHandler.Create)
            category.POST("/list", categoryHandler.GetList)
            category.POST("/update", categoryHandler.Update)
            category.POST("/delete", categoryHandler.Delete)
        }
        
        // 物品路由
        item := api.Group("/item")
        item.Use(mf.Auth())
        {
            item.POST("/create", itemHandler.Create)
            item.POST("/list", itemHandler.GetList)
            item.POST("/detail", itemHandler.GetDetail)
            item.POST("/expiring", itemHandler.GetExpiring)
            item.POST("/update", itemHandler.Update)
            item.POST("/delete", itemHandler.Delete)
        }
    }
    
    return r
}
```

## ✅ 阶段验收标准

1. ✅ 日志中间件正确记录请求信息
2. ✅ CORS 中间件正确处理跨域请求
3. ✅ 请求追踪中间件生成唯一 Request-ID
4. ✅ 错误恢复中间件正确捕获 panic
5. ✅ 日志分级正确（DEBUG/INFO/WARN/ERROR）
6. ✅ 所有中间件按正确顺序执行

## 📝 注意事项

- 中间件执行顺序：Recovery -> RequestID -> Logger -> Cors
- 日志应包含请求耗时、状态码、用户ID等信息
- panic 必须被恢复，防止服务崩溃
- Request-ID 用于问题追踪

## ➡️ 下一步

完成本阶段后，进入 [阶段七：测试与部署](./stage7-test-deploy.md)
