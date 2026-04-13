package vo

// UserVO 用户响应
type UserVO struct {
	UserID    uint   `json:"user_id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Status    int8   `json:"status"`
	CreatedAt string `json:"created_at"`
}

// LoginVO 登录响应
type LoginVO struct {
	UserID  uint   `json:"user_id"`
	Token   string `json:"token"`
	Expired string `json:"expired"`
}
