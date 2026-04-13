package dto

import "time"

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

// ItemListRequest 物品列表请求
type ItemListRequest struct {
	CategoryID uint `json:"category_id" binding:"omitempty,min=1"`
	Page       int  `json:"page" binding:"omitempty,min=1"`
	PageSize   int  `json:"page_size" binding:"omitempty,min=1,max=100"`
}

// ExpiringItemsRequest 即将过期物品请求
type ExpiringItemsRequest struct {
	Days int `json:"days" binding:"omitempty,min=1,max=365"`
}
