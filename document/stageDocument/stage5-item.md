# ThingsExpired 后端项目 - 阶段五

> 物品模块实现

## 📋 阶段目标

本阶段完成物品模块的完整实现，包括物品的创建、列表查询（支持筛选）、物品详情、更新、删除，以及即将过期的物品查询等功能。

**核心功能**：用户输入物品的生产日期和保质期，系统自动计算过期日期。

## 🎯 实现目标

### 5.1 DTO 和 VO 定义

#### 5.1.1 物品 DTO internal/model/dto/item.go

```go
package dto

type CreateItemRequest struct {
    CategoryID   *uint   `json:"category_id" binding:"omitempty"`
    Name         string  `json:"name" binding:"required,min=1,max=200"`
    Remark       string  `json:"remark" binding:"omitempty,max=500"`
    ProductDate  string  `json:"product_date" binding:"required"` // format: "2006-01-02"
    ShelfDays    int     `json:"shelf_days" binding:"required,min=1,max=36500"` // 保质期天数
    NotifyDays   int     `json:"notify_days" binding:"omitempty,min=0,max=365"`
}

type UpdateItemRequest struct {
    ItemID       uint    `json:"item_id" binding:"required,min=1"`
    CategoryID   *uint   `json:"category_id" binding:"omitempty"`
    Name         string  `json:"name" binding:"omitempty,min=1,max=200"`
    Remark       string  `json:"remark" binding:"omitempty,max=500"`
    ProductDate  string  `json:"product_date" binding:"omitempty"` // format: "2006-01-02"
    ShelfDays    *int    `json:"shelf_days" binding:"omitempty,min=1,max=36500"` // 保质期天数
    NotifyDays   *int    `json:"notify_days" binding:"omitempty,min=0,max=365"`
}

type DeleteItemRequest struct {
    ItemID uint `json:"item_id" binding:"required,min=1"`
}

type ListItemRequest struct {
    CategoryID *uint  `json:"category_id" binding:"omitempty"`
    Status     *int8  `json:"status" binding:"omitempty,oneof=1 2 3"` // 1: 正常, 2: 已过期, 3: 已用完
    Page       int    `json:"page" binding:"omitempty,min=1"`
    PageSize   int    `json:"page_size" binding:"omitempty,min=1,max=100"`
}

type GetExpiringRequest struct {
    Days int `json:"days" binding:"omitempty,min=1,max=365"` // 查询多少天内的即将过期物品
}

type GetItemDetailRequest struct {
    ItemID uint `json:"item_id" binding:"required,min=1"`
}
```

#### 5.1.2 物品 VO internal/model/vo/item.go

```go
package vo

type ItemVO struct {
    ItemID       uint    `json:"item_id"`
    CategoryID   *uint   `json:"category_id,omitempty"`
    CategoryName string  `json:"category_name,omitempty"`
    Name         string  `json:"name"`
    Remark       string  `json:"remark"`
    ProductDate  string  `json:"product_date"`  // 生产日期
    ShelfDays    int     `json:"shelf_days"`     // 保质期天数
    ExpireDate   string  `json:"expire_date"`   // 过期日期（自动计算）
    NotifyDays   int     `json:"notify_days"`
    Status       int8    `json:"status"`
    IsExpiring   bool    `json:"is_expiring"`   // 是否即将过期
    DaysLeft     int     `json:"days_left"`     // 距离过期的天数，负数表示已过期
    CreatedAt    string  `json:"created_at"`
    UpdatedAt    string  `json:"updated_at"`
}

type ItemListVO struct {
    Items     []*ItemVO `json:"items"`
    Total     int64     `json:"total"`
    Page      int       `json:"page"`
    PageSize  int       `json:"page_size"`
    TotalPage int       `json:"total_page"`
}
```

### 5.2 Repository 层实现

#### 5.2.1 物品 Repository 实现 internal/repository/item.go

```go
package repository

import (
    "context"
    "errors"
    "time"
    
    "things-expired/internal/model"
    
    "gorm.io/gorm"
)

type ItemRepository struct {
    db *gorm.DB
}

func NewItemRepository(db *gorm.DB) *ItemRepository {
    return &ItemRepository{db: db}
}

func (r *ItemRepository) GetByID(ctx context.Context, id uint) (*model.Item, error) {
    var item model.Item
    if err := r.db.WithContext(ctx).First(&item, id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, err
    }
    return &item, nil
}

func (r *ItemRepository) GetByUserID(ctx context.Context, userID uint, categoryID *uint, status *int8, page, pageSize int) ([]*model.Item, int64, error) {
    var items []*model.Item
    var total int64
    
    query := r.db.WithContext(ctx).Model(&model.Item{}).Where("user_id = ?", userID)
    
    if categoryID != nil {
        query = query.Where("category_id = ?", *categoryID)
    }
    if status != nil {
        query = query.Where("status = ?", *status)
    }
    
    // 统计总数
    if err := query.Count(&total).Error; err != nil {
        return nil, 0, err
    }
    
    // 分页查询
    offset := (page - 1) * pageSize
    if err := query.Offset(offset).Limit(pageSize).Order("expire_date ASC, created_at DESC").Find(&items).Error; err != nil {
        return nil, 0, err
    }
    
    return items, total, nil
}

func (r *ItemRepository) GetExpiring(ctx context.Context, userID uint, days int) ([]*model.Item, error) {
    var items []*model.Item
    
    now := time.Now()
    futureDate := now.AddDate(0, 0, days)
    
    if err := r.db.WithContext(ctx).
        Where("user_id = ?", userID).
        Where("status = ?", 1).
        Where("expire_date <= ?", futureDate).
        Order("expire_date ASC").
        Find(&items).Error; err != nil {
        return nil, err
    }
    
    return items, nil
}

func (r *ItemRepository) Create(ctx context.Context, item *model.Item) error {
    // 创建物品时自动计算过期日期
    item.ExpireDate = item.ProductDate.AddDate(0, 0, item.ShelfDays)
    return r.db.WithContext(ctx).Create(item).Error
}

func (r *ItemRepository) Update(ctx context.Context, item *model.Item) error {
    // 更新物品时自动重新计算过期日期
    item.ExpireDate = item.ProductDate.AddDate(0, 0, item.ShelfDays)
    return r.db.WithContext(ctx).Save(item).Error
}

func (r *ItemRepository) Delete(ctx context.Context, id uint) error {
    return r.db.WithContext(ctx).Delete(&model.Item{}, id).Error
}

func (r *ItemRepository) GetExpiredItems(ctx context.Context, userID uint) ([]*model.Item, error) {
    var items []*model.Item
    
    now := time.Now().Format("2006-01-02")
    
    if err := r.db.WithContext(ctx).
        Where("user_id = ?", userID).
        Where("status = ?", 1).
        Where("expire_date < ?", now).
        Find(&items).Error; err != nil {
        return nil, err
    }
    
    return items, nil
}
```

### 5.3 Service 层实现

#### 5.3.1 物品 Service 实现 internal/service/item.go

```go
package service

import (
    "context"
    "math"
    "time"
    
    "things-expired/internal/model"
    "things-expired/internal/model/dto"
    "things-expired/internal/model/vo"
    "things-expired/internal/repository"
    "things-expired/pkg/errors"
)

type ItemService struct {
    itemRepo     repository.IItemRepository
    categoryRepo repository.ICategoryRepository
}

func NewItemService(itemRepo repository.IItemRepository, categoryRepo repository.ICategoryRepository) *ItemService {
    return &ItemService{
        itemRepo:     itemRepo,
        categoryRepo: categoryRepo,
    }
}

// Create 创建物品
func (s *ItemService) Create(ctx context.Context, userID uint, req *dto.CreateItemRequest) (*vo.ItemVO, error) {
    // 解析生产日期
    productDate, err := time.Parse("2006-01-02", req.ProductDate)
    if err != nil {
        return nil, errors.New(400, "无效的生产日期格式，请使用 YYYY-MM-DD")
    }
    
    // 验证生产日期不能晚于今天
    now := time.Now()
    today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
    if productDate.After(today) {
        return nil, errors.New(400, "生产日期不能晚于今天")
    }
    
    // 验证分类归属
    if req.CategoryID != nil {
        category, err := s.categoryRepo.GetByID(ctx, *req.CategoryID)
        if err != nil {
            return nil, errors.NewWithCause(errors.CodeDatabaseError, "查询分类失败", err)
        }
        if category == nil || category.UserID != userID {
            return nil, errors.New(403, "无权限使用此分类")
        }
    }
    
    // 设置默认值
    notifyDays := req.NotifyDays
    if notifyDays == 0 {
        notifyDays = 7
    }
    
    // 计算过期日期
    expireDate := productDate.AddDate(0, 0, req.ShelfDays)
    
    item := &model.Item{
        UserID:     userID,
        CategoryID: req.CategoryID,
        Name:       req.Name,
        Remark:     req.Remark,
        ProductDate: productDate,
        ShelfDays:  req.ShelfDays,
        ExpireDate: expireDate,
        NotifyDays: notifyDays,
        Status:     1,
    }
    
    if err := s.itemRepo.Create(ctx, item); err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "创建物品失败", err)
    }
    
    return s.toItemVO(ctx, item)
}

// GetList 获取物品列表
func (s *ItemService) GetList(ctx context.Context, userID uint, req *dto.ListItemRequest) (*vo.ItemListVO, error) {
    // 设置默认值
    page := req.Page
    if page <= 0 {
        page = 1
    }
    pageSize := req.PageSize
    if pageSize <= 0 {
        pageSize = 20
    }
    
    items, total, err := s.itemRepo.GetByUserID(ctx, userID, req.CategoryID, req.Status, page, pageSize)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "查询物品失败", err)
    }
    
    itemVOs := make([]*vo.ItemVO, len(items))
    for i, item := range items {
        itemVO, err := s.toItemVO(ctx, item)
        if err != nil {
            return nil, err
        }
        itemVOs[i] = itemVO
    }
    
    totalPage := int(math.Ceil(float64(total) / float64(pageSize)))
    
    return &vo.ItemListVO{
        Items:     itemVOs,
        Total:     total,
        Page:      page,
        PageSize:  pageSize,
        TotalPage: totalPage,
    }, nil
}

// GetExpiring 获取即将过期的物品
func (s *ItemService) GetExpiring(ctx context.Context, userID uint, days int) ([]*vo.ItemVO, error) {
    if days <= 0 {
        days = 7
    }
    
    items, err := s.itemRepo.GetExpiring(ctx, userID, days)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "查询即将过期物品失败", err)
    }
    
    itemVOs := make([]*vo.ItemVO, len(items))
    for i, item := range items {
        itemVO, err := s.toItemVO(ctx, item)
        if err != nil {
            return nil, err
        }
        itemVOs[i] = itemVO
    }
    
    return itemVOs, nil
}

// GetDetail 获取物品详情
func (s *ItemService) GetDetail(ctx context.Context, userID uint, itemID uint) (*vo.ItemVO, error) {
    item, err := s.itemRepo.GetByID(ctx, itemID)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "查询物品失败", err)
    }
    if item == nil {
        return nil, errors.New(404, "物品不存在")
    }
    if item.UserID != userID {
        return nil, errors.New(403, "无权限查看此物品")
    }
    
    return s.toItemVO(ctx, item)
}

// Update 更新物品
func (s *ItemService) Update(ctx context.Context, userID uint, req *dto.UpdateItemRequest) (*vo.ItemVO, error) {
    item, err := s.itemRepo.GetByID(ctx, req.ItemID)
    if err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "查询物品失败", err)
    }
    if item == nil {
        return nil, errors.New(404, "物品不存在")
    }
    if item.UserID != userID {
        return nil, errors.New(403, "无权限操作此物品")
    }
    
    // 验证分类归属
    if req.CategoryID != nil {
        category, err := s.categoryRepo.GetByID(ctx, *req.CategoryID)
        if err != nil {
            return nil, errors.NewWithCause(errors.CodeDatabaseError, "查询分类失败", err)
        }
        if category == nil || category.UserID != userID {
            return nil, errors.New(403, "无权限使用此分类")
        }
        item.CategoryID = req.CategoryID
    }
    
    // 更新字段
    if req.Name != "" {
        item.Name = req.Name
    }
    if req.Remark != "" {
        item.Remark = req.Remark
    }
    if req.ProductDate != "" {
        productDate, err := time.Parse("2006-01-02", req.ProductDate)
        if err != nil {
            return nil, errors.New(400, "无效的生产日期格式，请使用 YYYY-MM-DD")
        }
        // 验证生产日期不能晚于今天
        now := time.Now()
        today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
        if productDate.After(today) {
            return nil, errors.New(400, "生产日期不能晚于今天")
        }
        item.ProductDate = productDate
    }
    if req.ShelfDays != nil {
        item.ShelfDays = *req.ShelfDays
    }
    if req.NotifyDays != nil {
        item.NotifyDays = *req.NotifyDays
    }
    
    if err := s.itemRepo.Update(ctx, item); err != nil {
        return nil, errors.NewWithCause(errors.CodeDatabaseError, "更新物品失败", err)
    }
    
    return s.toItemVO(ctx, item)
}

// Delete 删除物品
func (s *ItemService) Delete(ctx context.Context, userID uint, itemID uint) error {
    item, err := s.itemRepo.GetByID(ctx, itemID)
    if err != nil {
        return errors.NewWithCause(errors.CodeDatabaseError, "查询物品失败", err)
    }
    if item == nil {
        return errors.New(404, "物品不存在")
    }
    if item.UserID != userID {
        return errors.New(403, "无权限操作此物品")
    }
    
    if err := s.itemRepo.Delete(ctx, itemID); err != nil {
        return errors.NewWithCause(errors.CodeDatabaseError, "删除物品失败", err)
    }
    
    return nil
}

// toItemVO 转换为物品VO
func (s *ItemService) toItemVO(ctx context.Context, item *model.Item) (*vo.ItemVO, error) {
    now := time.Now()
    today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
    expireDate := time.Date(item.ExpireDate.Year(), item.ExpireDate.Month(), item.ExpireDate.Day(), 0, 0, 0, 0, now.Location())
    
    daysLeft := int(today.Sub(expireDate).Hours() / 24)
    isExpiring := daysLeft >= 0 && daysLeft <= item.NotifyDays
    
    itemVO := &vo.ItemVO{
        ItemID:      item.ID,
        CategoryID:  item.CategoryID,
        Name:        item.Name,
        Remark:      item.Remark,
        ProductDate: item.ProductDate.Format("2006-01-02"),
        ShelfDays:   item.ShelfDays,
        ExpireDate:  item.ExpireDate.Format("2006-01-02"),
        NotifyDays:  item.NotifyDays,
        Status:      item.Status,
        IsExpiring:  isExpiring,
        DaysLeft:    -daysLeft, // 转换为距离过期的天数
        CreatedAt:   item.CreatedAt.Format("2006-01-02 15:04:05"),
        UpdatedAt:   item.UpdatedAt.Format("2006-01-02 15:04:05"),
    }
    
    // 获取分类名称
    if item.CategoryID != nil {
        category, _ := s.categoryRepo.GetByID(ctx, *item.CategoryID)
        if category != nil {
            itemVO.CategoryName = category.Name
        }
    }
    
    return itemVO, nil
}
```

### 5.4 Handler 层实现

#### 5.4.1 物品 Handler 实现 internal/handler/item.go

```go
package handler

import (
    "things-expired/internal/model/dto"
    "things-expired/internal/service"
    "things-expired/pkg/errors"
    
    "github.com/gin-gonic/gin"
)

type ItemHandler struct {
    itemService service.IItemService
}

func NewItemHandler(itemService service.IItemService) *ItemHandler {
    return &ItemHandler{itemService: itemService}
}

// Create 创建物品
func (h *ItemHandler) Create(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    var req dto.CreateItemRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    item, err := h.itemService.Create(c.Request.Context(), userID.(uint), &req)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, item)
}

// GetList 获取物品列表
func (h *ItemHandler) GetList(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    var req dto.ListItemRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    result, err := h.itemService.GetList(c.Request.Context(), userID.(uint), &req)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, result)
}

// GetExpiring 获取即将过期的物品
func (h *ItemHandler) GetExpiring(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    var req dto.GetExpiringRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    items, err := h.itemService.GetExpiring(c.Request.Context(), userID.(uint), req.Days)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, items)
}

// GetDetail 获取物品详情
func (h *ItemHandler) GetDetail(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    var req dto.GetItemDetailRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    item, err := h.itemService.GetDetail(c.Request.Context(), userID.(uint), req.ItemID)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, item)
}

// Update 更新物品
func (h *ItemHandler) Update(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    var req dto.UpdateItemRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    item, err := h.itemService.Update(c.Request.Context(), userID.(uint), &req)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, item)
}

// Delete 删除物品
func (h *ItemHandler) Delete(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        FailWithCode(c, errors.CodeUnauthorized, "用户未认证")
        return
    }
    
    var req dto.DeleteItemRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        FailWithCode(c, errors.CodeParamInvalid, err.Error())
        return
    }
    
    err := h.itemService.Delete(c.Request.Context(), userID.(uint), req.ItemID)
    if err != nil {
        Fail(c, err)
        return
    }
    
    Success(c, nil)
}
```

### 5.5 路由更新

#### 5.5.1 路由定义 internal/router/router.go

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
        
        // 分类路由
        category := api.Group("/category")
        category.Use(authMiddleware.Handle)
        {
            category.POST("/create", categoryHandler.Create)
            category.POST("/list", categoryHandler.GetList)
            category.POST("/update", categoryHandler.Update)
            category.POST("/delete", categoryHandler.Delete)
        }
        
        // 物品路由
        item := api.Group("/item")
        item.Use(authMiddleware.Handle)
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

1. ✅ 物品创建功能正常
2. ✅ 物品列表查询支持分类和状态筛选
3. ✅ 物品列表支持分页
4. ✅ 物品详情查询功能正常
5. ✅ 即将过期物品查询功能正常
6. ✅ 物品更新功能正常
7. ✅ 物品删除功能正常
8. ✅ 物品归属权限校验正确
9. ✅ 生产日期和保质期正确传入
10. ✅ 过期日期根据生产日期和保质期自动计算正确
11. ✅ 生产日期验证（不能晚于今天）

## 📝 注意事项

- 物品必须归属于当前登录用户
- 生产日期格式必须为 YYYY-MM-DD，且不能晚于今天
- 保质期以天为单位，由用户输入
- 过期日期由系统根据生产日期和保质期自动计算得出：`过期日期 = 生产日期 + 保质期天数`
- 列表按过期日期升序排列
- 即将过期判断基于 NotifyDays 字段
- 分类变更时需验证分类归属
- 更新生产日期或保质期时，过期日期会自动重新计算

## ➡️ 下一步

完成本阶段后，进入 [阶段六：中间件完善与日志](./stage6-middleware.md)
