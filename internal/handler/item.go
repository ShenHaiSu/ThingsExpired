package handler

import (
	"github.com/gin-gonic/gin"
	"things-expired/internal/model/dto"
	"things-expired/internal/service"
	"things-expired/pkg/errors"
)

// ItemHandler 物品处理器
type ItemHandler struct {
	itemService service.IItemService
}

// NewItemHandler 创建物品处理器
func NewItemHandler(itemService service.IItemService) *ItemHandler {
	return &ItemHandler{itemService: itemService}
}

// Create 创建物品
func (h *ItemHandler) Create(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
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

// List 获取物品列表
func (h *ItemHandler) List(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	var req dto.ItemListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		FailWithCode(c, errors.CodeParamInvalid, err.Error())
		return
	}

	list, err := h.itemService.List(c.Request.Context(), userID.(uint), &req)
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, list)
}

// Detail 获取物品详情
func (h *ItemHandler) Detail(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	var req dto.ItemDetailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		FailWithCode(c, errors.CodeParamInvalid, err.Error())
		return
	}

	item, err := h.itemService.Detail(c.Request.Context(), userID.(uint), req.ItemID)
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
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
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
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
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

// GetExpiringItems 获取即将过期物品
func (h *ItemHandler) GetExpiringItems(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	var req dto.ExpiringItemsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		FailWithCode(c, errors.CodeParamInvalid, err.Error())
		return
	}

	days := req.Days
	if days <= 0 {
		days = 7
	}

	items, err := h.itemService.GetExpiringItems(c.Request.Context(), userID.(uint), days)
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, items)
}

// GetStats 获取物品统计信息
func (h *ItemHandler) GetStats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	stats, err := h.itemService.GetStats(c.Request.Context(), userID.(uint))
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, stats)
}

// MarkUsed 标记物品已使用（已消耗）
func (h *ItemHandler) MarkUsed(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	var req dto.MarkUsedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		FailWithCode(c, errors.CodeParamInvalid, err.Error())
		return
	}

	item, err := h.itemService.MarkUsed(c.Request.Context(), userID.(uint), req.ItemID)
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, item)
}
