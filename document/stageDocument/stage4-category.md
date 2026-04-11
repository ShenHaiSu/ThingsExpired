# ThingsExpired 后端项目 - 阶段四

> 分类模块实现

## 📋 阶段目标

本阶段完成分类模块的完整实现，包括分类的创建、列表查询、更新、删除等功能。

## 🎯 实现目标

### 4.1 DTO 和 VO 定义

#### 4.1.1 分类 DTO internal/model/dto/category.go

```go
package dto

type CreateCategoryRequest struct {
    Name      string `json:"name" binding:"required,min=1,max=50"`
    Color     string `json:"color" binding:"omitempty,len=7"` // hex color like "#FF5733"
    Icon      string `json:"icon" binding:"omitempty,max=50"`
    SortOrder int    `json:"sort_order" binding:"omitempty"`
}

type UpdateCategoryRequest struct {
    CategoryID uint   `json:"category_id" binding:"required,min=1"`
    Name       string `json:"name" binding:"omitempty,min=1,max=50"`
    Color      string `json:"color" binding:"omitempty,len=7"`
    Icon       string `json:"icon" binding:"omitempty,max=50"`
    SortOrder  *int   `json:"sort_order" binding:"omitempty"`
}

type DeleteCategoryRequest struct {
    CategoryID uint `json:"category_id" binding:"required,min=1"`
}

type ListCategoryRequest struct {
    // 无需参数，返回用户所有分类
}
```

#### 4.1.2 分类 VO internal/model/vo/category.go

```go
package vo

type CategoryVO struct {
    CategoryID uint   `json:"category_id"`
    Name       string `json:"name"`
    Color      string `json:"color"`
    Icon       string `json:"icon"`
    SortOrder  int    `json:"sort_order"`
    CreatedAt  string `json:"created_at"`
}
```

### 4.2 Repository 层实现

#### 4.2.1 分类 Repository 实现 internal/repository/category.go

```go
package repository

import (
    "context"
    "errors"
    
    "things-expired/internal/model"
    
    "gorm.io/gorm"
)

type CategoryRepository struct {
    db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
    return &CategoryRepository{db: db}
}

func (r *CategoryRepository) GetByID(ctx context.Context, id uint) (*model.Category, error) {
    var category model.Category
    if err := r.db.WithContext(ctx).First(&category, id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, err
    }
    return &category, nil
}

func (r *CategoryRepository) GetByUserID(ctx context.Context, userID uint) ([]*model.Category, error) {
    var categories []*model.Category
    if err := r.db.WithContext(ctx).
        Where("user_id = ?", userID).
        Order("sort_order ASC, id ASC").
        Find(&categories).Error; err != nil {
        return nil, err
    }
    return categories, nil
}

func (r *CategoryRepository) Create(ctx context.Context, category *model.Category) error {
    return r.db.WithContext(ctx).Create(category).Error
}

func (r *CategoryRepository) Update(ctx context.Context, category *model.Category) error {
    return r.db.WithContext(ctx).Save(category).Error
}

func (r *CategoryRepository) Delete(ctx context.Context, id uint) error {
    return r.db.WithContext(ctx).Delete(&model.Category{}, id).Error
}
```

### 4.3 Service 层实现

#### 4.3.1 分类 Service 实现 internal/service/category.go

```go
package service

import (
    "context"
    
    "things-expired/internal/model"
    "things-expired/internal/model/dto"
    "things-expired/internal/model/vo"
    "things-expired/internal/repository"
    "things-expired/pkg/errors"
)

type CategoryService struct {
    categoryRepo repository.ICategoryRepository
}

func NewCategoryService(categoryRepo repository.ICategoryRepository) *CategoryService {
    return &CategoryService{categoryRepo: categoryRepo}
}

// Create 创建分类
func (s *CategoryService) Create(ctx context.Context, userID uint, req *dto.CreateCategoryRequest) (*vo.CategoryVO, error) {
    // 设置默认值
    color := req.Color
    if color == "" {
        color = "#000000"
    }
    
    category := &model.Category{
        UserID:    userID,
        Name:      req.Name,
        Color:     color,
        Icon:      req.Icon,
        SortOrder: req.SortOrder,
    }
    
    if err := s.categoryRepo.Create(ctx, category); err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "创建分类失败", err)
    }
    
    return s.toCategoryVO(category), nil
}

// GetList 获取分类列表
func (s *CategoryService) GetList(ctx context.Context, userID uint) ([]*vo.CategoryVO, error) {
    categories, err := s.categoryRepo.GetByUserID(ctx, userID)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "查询分类失败", err)
    }
    
    return s.toCategoryVOList(categories), nil
}

// Update 更新分类
func (s *CategoryService) Update(ctx context.Context, userID uint, req *dto.UpdateCategoryRequest) (*vo.CategoryVO, error) {
    // 查询分类
    category, err := s.categoryRepo.GetByID(ctx, req.CategoryID)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "查询分类失败", err)
    }
    if category == nil {
        return nil, errors.New(404, "分类不存在")
    }
    
    // 验证归属
    if category.UserID != userID {
        return nil, errors.New(403, "无权限操作此分类")
    }
    
    // 更新字段
    if req.Name != "" {
        category.Name = req.Name
    }
    if req.Color != "" {
        category.Color = req.Color
    }
    if req.Icon != "" {
        category.Icon = req.Icon
    }
    if req.SortOrder != nil {
        category.SortOrder = *req.SortOrder
    }
    
    if err := s.categoryRepo.Update(ctx, category); err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "更新分类失败", err)
    }
    
    return s.toCategoryVO(category), nil
}

// Delete 删除分类
func (s *CategoryService) Delete(ctx context.Context, userID uint, categoryID uint) error {
    // 查询分类
    category, err := s.categoryRepo.GetByID(ctx, categoryID)
    if err != nil {
        return errors.NewWithCause(errors.CodeDatabaseError, "查询分类失败", err)
    }
    if category == nil {
        return errors.New(404, "分类不存在")
    }
    
    // 验证归属
    if category.UserID != userID {
        return errors.New(403, "无权限操作此分类")
    }
    
    if err := s.categoryRepo.Delete(ctx, categoryID); err != nil {
        return errors.NewWithCause(errors.CodeDatabaseError, "删除分类失败", err)
    }
    
    return nil
}

// toCategoryVO 转换为分类VO
func (s *CategoryService) toCategoryVO(category *model.Category) *vo.CategoryVO {
    return &vo.CategoryVO{
        CategoryID: category.ID,
        Name:       category.Name,
        Color:      category.Color,
        Icon:       category.Icon,
        SortOrder:  category.SortOrder,
        CreatedAt:  category.CreatedAt.Format("2006-01-02 15:04:05"),
    }
}

func (s *CategoryService) toCategoryVOList(categories []*model.Category) []*vo.CategoryVO {
    result := make([]*vo.CategoryVO, len(categories))
    for i, c := range categories {
        result[i] = s.toCategoryVO(c)
    }
    return result
}
```

### 4.4 Handler 层实现

#### 4.4.1 分类 Handler 实现 internal/handler/category.go

```go
package handler

import (
    "things-expired/internal/model/dto"
    "things-expired/internal/service"
    "things-expired/pkg/errors"
    
    "github.com/gin-gonic/gin"
)

type CategoryHandler struct {
    categoryService service.ICategoryService
}

func NewCategoryHandler(categoryService service.ICategoryService) *CategoryHandler {
    return &CategoryHandler{categoryService: categoryService}
}

// Create 创建分类
func (h *CategoryHandler) Create(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    var req dto.CreateCategoryRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    category, err := h.categoryService.Create(c.Request.Context(), userID.(uint), &req)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, category)
}

// GetList 获取分类列表
func (h *CategoryHandler) GetList(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    categories, err := h.categoryService.GetList(c.Request.Context(), userID.(uint))
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, categories)
}

// Update 更新分类
func (h *CategoryHandler) Update(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    var req dto.UpdateCategoryRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    category, err := h.categoryService.Update(c.Request.Context(), userID.(uint), &req)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, category)
}

// Delete 删除分类
func (h *CategoryHandler) Delete(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    var req dto.DeleteCategoryRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    err := h.categoryService.Delete(c.Request.Context(), userID.(uint), req.CategoryID)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, nil)
}
```

### 4.5 路由更新

#### 4.5.1 路由定义 internal/router/router.go

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
    authMiddleware *middleware.AuthMiddleware,
    loggerMiddleware gin.HandlerFunc,
    corsMiddleware gin.HandlerFunc,
) *gin.Engine {
    r := gin.New()
    
    // 注册全局中间件
    r.Use(loggerMiddleware)
    r.Use(corsMiddleware)
    
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
        userAuth.Use(authMiddleware.Handle)
        {
            userAuth.POST("/info", userHandler.GetUserInfo)
            userAuth.POST("/update", userHandler.UpdateUser)
        }
        
        // 分类路由（需认证）
        category := api.Group("/category")
        category.Use(authMiddleware.Handle)
        {
            category.POST("/create", categoryHandler.Create)
            category.POST("/list", categoryHandler.GetList)
            category.POST("/update", categoryHandler.Update)
            category.POST("/delete", categoryHandler.Delete)
        }
    }
    
    return r
}
```

### 4.6 依赖注入更新

#### 4.6.1 main.go 更新 cmd/server/main.go

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
    "things-expired/pkg/utils"
)

func main() {
    fx.New(
        // 配置模块
        fx.Provide(config.Load),
        
        // 工具类
        fx.Provide(utils.NewJWTUtil),
        
        // 数据库
        fx.Provide(repository.NewDB),
        
        // Repository
        fx.Provide(repository.NewUserRepository),
        fx.Provide(repository.NewCategoryRepository),
        
        // Service
        fx.Provide(service.NewUserService),
        fx.Provide(service.NewCategoryService),
        
        // Handler
        fx.Provide(handler.NewUserHandler),
        fx.Provide(handler.NewCategoryHandler),
        
        // 中间件
        fx.Provide(middleware.NewAuthMiddleware),
        fx.Provide(middleware.NewLoggerMiddleware),
        fx.Provide(middleware.NewCorsMiddleware),
        
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

1. ✅ 分类创建功能正常
2. ✅ 分类列表查询功能正常
3. ✅ 分类更新功能正常
4. ✅ 分类删除功能正常
5. ✅ 分类归属权限校验正确
6. ✅ 所有分类操作需要用户认证

## 📝 注意事项

- 分类必须归属于当前登录用户
- 删除分类前应检查是否有物品关联（可选）
- 分类名称必填，颜色默认 #000000
- 分类按 sort_order 排序

## ➡️ 下一步

完成本阶段后，进入 [阶段五：物品模块实现](./stage5-item.md)
