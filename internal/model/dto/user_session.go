package dto

// RevokeSessionRequest 撤销会话请求
type RevokeSessionRequest struct {
	SessionID uint `json:"session_id" binding:"required,min=1"`
}

// ForceLogoutRequest 强制下线请求
type ForceLogoutRequest struct {
	UserID uint `json:"user_id" binding:"required,min=1"`
}