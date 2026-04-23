package dto

import (
	"time"
)

// CreateItemRequest 创建物品请求
type CreateItemRequest struct {
	CategoryID uint      `json:"category_id" binding:"required,min=1"`
	Name       string    `json:"name" binding:"required,min=1,max=200"`
	Desc       string    `json:"description" binding:"omitempty,max=500"`
	Quantity   int       `json:"quantity" binding:"omitempty,min=1"`
	Unit       string    `json:"unit" binding:"omitempty,max=20"`
	ExpiredAt  time.Time `json:"expired_at" binding:"required"`
	RemindDays int       `json:"remind_days" binding:"omitempty,min=0,max=365"`
}

// UpdateItemRequest 更新物品请求
type UpdateItemRequest struct {
	ItemID     uint      `json:"item_id" binding:"required,min=1"`
	CategoryID uint      `json:"category_id" binding:"omitempty,min=1"`
	Name       string    `json:"name" binding:"omitempty,min=1,max=200"`
	Desc       string    `json:"description" binding:"omitempty,max=500"`
	Quantity   int       `json:"quantity" binding:"omitempty,min=1"`
	Unit       string    `json:"unit" binding:"omitempty,max=20"`
	ExpiredAt  time.Time `json:"expired_at"`
	RemindDays int       `json:"remind_days" binding:"omitempty,min=0,max=365"`
}

// DeleteItemRequest 删除物品请求
type DeleteItemRequest struct {
	ItemID uint `json:"item_id" binding:"required,min=1"`
}

// ItemDetailRequest 物品详情请求
type ItemDetailRequest struct {
	ItemID uint `json:"item_id" binding:"required,min=1"`
}

// ItemListRequest 物品列表请求（复合搜索）
type ItemListRequest struct {
	// 分页参数
	Page     int `json:"page" binding:"omitempty,min=1"`
	PageSize int `json:"page_size" binding:"omitempty,min=1,max=100"`

	// 基础筛选条件
	CategoryID uint   `json:"category_id" binding:"omitempty,min=1"`
	Name       string `json:"name" binding:"omitempty,max=200"`        // 模糊搜索
	Desc       string `json:"description" binding:"omitempty,max=500"` // 模糊搜索
	Unit       string `json:"unit" binding:"omitempty,max=20"`

	// 状态筛选
	Status int8 `json:"status" binding:"omitempty,oneof=0 1 2 3"` // 0表示全部,1正常,2已过期,3已消耗

	// 数量范围筛选
	QuantityMin int `json:"quantity_min" binding:"omitempty,min=0"`
	QuantityMax int `json:"quantity_max" binding:"omitempty,min=0"`

	// 提醒天数范围筛选
	RemindDaysMin int `json:"remind_days_min" binding:"omitempty,min=0"`
	RemindDaysMax int `json:"remind_days_max" binding:"omitempty,min=0"`

	// 过期时间范围筛选
	ExpiredAtFrom string `json:"expired_at_from" binding:"omitempty"` // 格式: 2006-01-02
	ExpiredAtTo   string `json:"expired_at_to" binding:"omitempty"`   // 格式: 2006-01-02

	// 创建时间范围筛选
	CreatedAtFrom string `json:"created_at_from" binding:"omitempty"` // 格式: 2006-01-02
	CreatedAtTo   string `json:"created_at_to" binding:"omitempty"`   // 格式: 2006-01-02

	// 排序字段
	OrderBy string `json:"order_by" binding:"omitempty,oneof=created_at updated_at expired_at name quantity"` // 排序字段
	Order   string `json:"order" binding:"omitempty,oneof=asc desc"`                                         // 排序方向
}

// GetPage 获取分页页码
func (r *ItemListRequest) GetPage() int {
	if r.Page <= 0 {
		return 1
	}
	return r.Page
}

// GetPageSize 获取分页大小
func (r *ItemListRequest) GetPageSize() int {
	if r.PageSize <= 0 {
		return 10
	}
	if r.PageSize > 100 {
		return 100
	}
	return r.PageSize
}

// GetOrderBy 获取排序字段
func (r *ItemListRequest) GetOrderBy() string {
	switch r.OrderBy {
	case "updated_at":
		return "updated_at"
	case "expired_at":
		return "expired_at"
	case "name":
		return "name"
	case "quantity":
		return "quantity"
	default:
		return "created_at"
	}
}

// GetOrder 获取排序方向
func (r *ItemListRequest) GetOrder() string {
	if r.Order == "desc" {
		return "DESC"
	}
	return "ASC"
}

// ExpiringItemsRequest 即将过期物品请求
type ExpiringItemsRequest struct {
	Days int `json:"days" binding:"omitempty,min=1,max=365"`
}
