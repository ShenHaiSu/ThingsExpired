package handler

import (
	"github.com/gin-gonic/gin"
	"things-expired/internal/model/dto"
	"things-expired/internal/service"
	"things-expired/pkg/errors"
)

// CategoryHandler 分类处理器
type CategoryHandler struct {
	categoryService service.ICategoryService
}

// NewCategoryHandler 创建分类处理器
func NewCategoryHandler(categoryService service.ICategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: categoryService}
}

// Create 创建分类
func (h *CategoryHandler) Create(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
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

// List 获取分类列表
func (h *CategoryHandler) List(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	var req dto.ListCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		FailWithCode(c, errors.CodeParamInvalid, err.Error())
		return
	}

	list, err := h.categoryService.List(c.Request.Context(), userID.(uint), &req)
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, list)
}

// Update 更新分类
func (h *CategoryHandler) Update(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
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
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
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
