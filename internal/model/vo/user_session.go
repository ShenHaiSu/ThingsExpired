package vo

// SessionVO 会话响应模型
type SessionVO struct {
	SessionID  uint   `json:"session_id"`
	UserID     uint   `json:"user_id"`
	DeviceInfo string `json:"device_info"`
	IPAddress  string `json:"ip_address"`
	CreatedAt  string `json:"created_at"`
	ExpiresAt  string `json:"expires_at"`
	IsRevoked  bool   `json:"is_revoked"`
}

// SessionListVO 会话列表响应
type SessionListVO struct {
	Sessions []SessionVO `json:"sessions"`
	Total    int        `json:"total"`
}