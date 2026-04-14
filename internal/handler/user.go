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

	// 获取设备信息和 IP 地址
	deviceInfo := c.GetHeader("User-Agent")
	ipAddress := c.ClientIP()

	loginVO, err := h.userService.Login(c.Request.Context(), &req, deviceInfo, ipAddress)
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, loginVO)
}

// Logout 用户登出
func (h *UserHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	sessionJTI, _ := c.Get("session_jti")

	err := h.userService.Logout(c.Request.Context(), userID.(uint), sessionJTI.(string))
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, nil)
}

// GetSessions 获取用户所有会话
func (h *UserHandler) GetSessions(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	sessions, err := h.userService.GetSessions(c.Request.Context(), userID.(uint))
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, sessions)
}

// RevokeSession 撤销指定会话
func (h *UserHandler) RevokeSession(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	var req dto.RevokeSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		FailWithCode(c, errors.CodeParamInvalid, err.Error())
		return
	}

	err := h.userService.RevokeSession(c.Request.Context(), userID.(uint), req.SessionID)
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, nil)
}

// ForceLogout 强制下线（撤销所有会话）
func (h *UserHandler) ForceLogout(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		FailWithCode(c, errors.CodeUnauthorized, "未授权")
		return
	}

	err := h.userService.ForceLogout(c.Request.Context(), userID.(uint))
	if err != nil {
		Fail(c, err)
		return
	}

	Success(c, nil)
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
