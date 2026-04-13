package handler

import (
	"github.com/gin-gonic/gin"
	"things-expired/internal/model/dto"
	"things-expired/internal/service"
	"things-expired/pkg/errors"
)

// UserHandler 用户处理器
type UserHandler struct {
	userService service.IUserService
}

// NewUserHandler 创建用户处理器
func NewUserHandler(userService service.IUserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// Register 用户注册
func (h *UserHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		FailWithCode(c, errors.CodeParamInvalid, err.Error())
		return
	}

	user, err := h.userService.Register(c.Request.Context(), &req)
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, user)
}

// Login 用户登录
func (h *UserHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		FailWithCode(c, errors.CodeParamInvalid, err.Error())
		return
	}

	loginVO, err := h.userService.Login(c.Request.Context(), &req)
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, loginVO)
}

// GetUserInfo 获取用户信息
func (h *UserHandler) GetUserInfo(c *gin.Context) {
	// 从 context 中获取用户 ID（后续由中间件设置）
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	userInfo, err := h.userService.GetUserInfo(c.Request.Context(), userID.(uint))
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, userInfo)
}

// UpdateUser 更新用户信息
func (h *UserHandler) UpdateUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		FailWithCode(c, errors.CodeParamInvalid, err.Error())
		return
	}

	userInfo, err := h.userService.UpdateUser(c.Request.Context(), userID.(uint), &req)
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, userInfo)
}
