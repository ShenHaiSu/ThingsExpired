# ThingsExpired 后端项目 - 阶段二

> 分层架构基础实现

## 📋 阶段目标

本阶段完成项目分层架构的基础实现，包括数据库连接、依赖注入框架集成、Model 层定义、Repository 层基础实现、Service 层基础实现、Handler 层基础实现以及路由注册。

## 🎯 实现目标

### 2.1 数据库初始化

#### 2.1.1 数据库连接 internal/repository/db.go

```go
package repository

import (
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
    "things-expired/config"
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

#### 2.1.2 数据库迁移

创建 `migrations/001_init_schema.sql`：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#000000',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 物品表
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    name TEXT NOT NULL,
    remark TEXT,
    expire_date DATE NOT NULL,
    notify_days INTEGER DEFAULT 7,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 通知记录表
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    notify_type TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_expire_date ON items(expire_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
```

### 2.2 Model 层定义

#### 2.2.1 用户模型 internal/model/user.go

```go
package model

import "time"

type User struct {
    ID        uint      `gorm:"primaryKey"`
    Name      string    `gorm:"size:100;not null"`
    Email     string    `gorm:"size:255;uniqueIndex;not null"`
    Password  string    `gorm:"size:255;not null"`
    Status    int8      `gorm:"default:1;index"`
    CreatedAt time.Time
    UpdatedAt time.Time
}

func (User) TableName() string {
    return "users"
}
```

#### 2.2.2 分类模型 internal/model/category.go

```go
package model

import "time"

type Category struct {
    ID        uint      `gorm:"primaryKey"`
    UserID    uint      `gorm:"not null;index"`
    Name      string    `gorm:"size:100;not null"`
    Color     string    `gorm:"size:20;default:#000000"`
    Icon      string    `gorm:"size:50"`
    SortOrder int       `gorm:"default:0"`
    CreatedAt time.Time
    UpdatedAt time.Time
}

func (Category) TableName() string {
    return "categories"
}
```

#### 2.2.3 物品模型 internal/model/item.go

```go
package model

import "time"

type Item struct {
    ID          uint      `gorm:"primaryKey"`
    UserID      uint      `gorm:"not null;index"`
    CategoryID  *uint     `gorm:"index"`
    Name        string    `gorm:"size:200;not null"`
    Remark      string    `gorm:"size:500"`
    ExpireDate  time.Time `gorm:"type:date;not null;index"`
    NotifyDays  int       `gorm:"default:7"`
    Status      int8      `gorm:"default:1"`
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

func (Item) TableName() string {
    return "items"
}
```

#### 2.2.4 通知模型 internal/model/notification.go

```go
package model

import "time"

type Notification struct {
    ID        uint      `gorm:"primaryKey"`
    UserID    uint      `gorm:"not null;index"`
    ItemID    uint      `gorm:"not null"`
    NotifyType string   `gorm:"size:20;not null"`
    IsRead    bool      `gorm:"default:false"`
    SentAt    *time.Time
    CreatedAt time.Time
}

func (Notification) TableName() string {
    return "notifications"
}
```

### 2.3 Repository 层实现

#### 2.3.1 用户 Repository 接口 internal/repository/interfaces.go

```go
package repository

import (
    "context"
    "things-expired/internal/model"
)

type IUserRepository interface {
    GetByID(ctx context.Context, id uint) (*model.User, error)
    GetByEmail(ctx context.Context, email string) (*model.User, error)
    Create(ctx context.Context, user *model.User) error
    Update(ctx context.Context, user *model.User) error
    Delete(ctx context.Context, id uint) error
    ExistsByEmail(ctx context.Context, email string) (bool, error)
}

type ICategoryRepository interface {
    GetByID(ctx context.Context, id uint) (*model.Category, error)
    GetByUserID(ctx context.Context, userID uint) ([]*model.Category, error)
    Create(ctx context.Context, category *model.Category) error
    Update(ctx context.Context, category *model.Category) error
    Delete(ctx context.Context, id uint) error
}

type IItemRepository interface {
    GetByID(ctx context.Context, id uint) (*model.Item, error)
    GetByUserID(ctx context.Context, userID uint, status *int8) ([]*model.Item, error)
    GetExpiring(ctx context.Context, userID uint, days int) ([]*model.Item, error)
    Create(ctx context.Context, item *model.Item) error
    Update(ctx context.Context, item *model.Item) error
    Delete(ctx context.Context, id uint) error
}

type INotificationRepository interface {
    Create(ctx context.Context, notification *model.Notification) error
    GetUnreadByUserID(ctx context.Context, userID uint) ([]*model.Notification, error)
    MarkAsRead(ctx context.Context, id uint) error
}
```

#### 2.3.2 用户 Repository 实现 internal/repository/user.go

```go
package repository

import (
    "context"
    "errors"
    "things-expired/internal/model"
    "gorm.io/gorm"
)

type UserRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
    return &UserRepository{db: db}
}

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

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
    var user model.User
    if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, err
    }
    return &user, nil
}

func (r *UserRepository) Create(ctx context.Context, user *model.User) error {
    return r.db.WithContext(ctx).Create(user).Error
}

func (r *UserRepository) Update(ctx context.Context, user *model.User) error {
    return r.db.WithContext(ctx).Save(user).Error
}

func (r *UserRepository) Delete(ctx context.Context, id uint) error {
    return r.db.WithContext(ctx).Delete(&model.User{}, id).Error
}

func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
    var count int64
    if err := r.db.WithContext(ctx).Model(&model.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
        return false, err
    }
    return count > 0, nil
}
```

### 2.4 Service 层实现

#### 2.4.1 Service 接口定义 internal/service/interfaces.go

```go
package service

import (
    "context"
    "things-expired/internal/model/dto"
    "things-expired/internal/model/vo"
)

type IUserService interface {
    Register(ctx context.Context, req *dto.RegisterRequest) (*vo.UserVO, error)
    Login(ctx context.Context, req *dto.LoginRequest) (*vo.LoginVO, error)
    GetUserInfo(ctx context.Context, userID uint) (*vo.UserVO, error)
    UpdateUser(ctx context.Context, req *dto.UpdateUserRequest) (*vo.UserVO, error)
}

type ICategoryService interface {
    Create(ctx context.Context, userID uint, req *dto.CreateCategoryRequest) (*vo.CategoryVO, error)
    GetList(ctx context.Context, userID uint) ([]*vo.CategoryVO, error)
    Update(ctx context.Context, userID uint, req *dto.UpdateCategoryRequest) (*vo.CategoryVO, error)
    Delete(ctx context.Context, userID uint, categoryID uint) error
}

type IItemService interface {
    Create(ctx context.Context, userID uint, req *dto.CreateItemRequest) (*vo.ItemVO, error)
    GetList(ctx context.Context, userID uint, req *dto.ListItemRequest) ([]*vo.ItemVO, int64, error)
    GetExpiring(ctx context.Context, userID uint, days int) ([]*vo.ItemVO, error)
    Update(ctx context.Context, userID uint, req *dto.UpdateItemRequest) (*vo.ItemVO, error)
    Delete(ctx context.Context, userID uint, itemID uint) error
}
```

### 2.5 Handler 层实现

#### 2.5.1 Handler 结构定义 internal/handler/user.go

```go
package handler

import (
    "things-expired/internal/model/dto"
    "things-expired/internal/service"
)

type UserHandler struct {
    userService service.IUserService
}

func NewUserHandler(userService service.IUserService) *UserHandler {
    return &UserHandler{userService: userService}
}
```

### 2.6 路由注册

#### 2.6.1 路由定义 internal/router/router.go

```go
package router

import (
    "things-expired/internal/handler"
    "things-expired/pkg/middleware"

    "github.com/gin-gonic/gin"
)

func NewRouter(
    userHandler *handler.UserHandler,
    middlewares ...gin.HandlerFunc,
) *gin.Engine {
    r := gin.New()
    
    // 注册全局中间件
    r.Use(middlewares...)
    
    // API 路由组（所有 API 必须以 /api 开头）
    api := r.Group("/api")
    {
        // 用户相关路由（公开）
        user := api.Group("/user")
        {
            user.POST("/register", userHandler.Register)
            user.POST("/login", userHandler.Login)
        }
        
        // 需要认证的路由
        userAuth := api.Group("/user")
        userAuth.Use(middleware.NewAuthMiddleware())
        {
            userAuth.POST("/info", userHandler.GetUserInfo)
            userAuth.POST("/update", userHandler.UpdateUser)
        }
    }
    
    return r
}
```

### 2.7 依赖注入主入口

#### 2.7.1 main.go cmd/server/main.go

```go
package main

import (
    "context"
    "fmt"
    "log"
    
    "go.uber.org/fx"
    
    "things-expired/config"
    "things-expired/internal/handler"
    "things-expired/internal/repository"
    "things-expired/internal/router"
    "things-expired/internal/service"
    "things-expired/pkg/middleware"
)

func main() {
    fx.New(
        // 配置模块
        fx.Provide(config.Load),
        
        // 数据库
        fx.Provide(repository.NewDB),
        
        // Repository
        fx.Provide(repository.NewUserRepository),
        
        // Service
        fx.Provide(service.NewUserService),
        
        // Handler
        fx.Provide(handler.NewUserHandler),
        
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

## ✅ 阶段验收标准

1. ✅ 数据库连接正常
2. ✅ 所有 Model 定义正确
3. ✅ Repository 接口和实现符合规范
4. ✅ Service 接口定义完整
5. ✅ Handler 结构定义正确
6. ✅ 路由注册正确
7. ✅ 依赖注入正常工作

## 📝 注意事项

- Repository 层只做数据库操作，禁止业务逻辑
- Service 层必须通过接口依赖 Repository
- Handler 层禁止直接操作数据库
- 所有层之间通过接口通信

## ➡️ 下一步

完成本阶段后，进入 [阶段三：用户模块完整实现](./stage3-user.md)
