package vo

// ItemVO 物品响应
type ItemVO struct {
	ItemID     uint   `json:"item_id"`
	UserID     uint   `json:"user_id"`
	CategoryID uint   `json:"category_id"`
	Name       string `json:"name"`
	Desc       string `json:"description"`
	Quantity   int    `json:"quantity"`
	Unit       string `json:"unit"`
	ExpiredAt  string `json:"expired_at"`
	RemindDays int    `json:"remind_days"`
	Status     int8   `json:"status"`
	CreatedAt  string `json:"created_at"`
}

// ItemListVO 物品列表响应
type ItemListVO struct {
	List  []ItemVO `json:"list"`
	Total int64    `json:"total"`
	Page  int      `json:"page"`
}

// ExpiringItemVO 即将过期物品响应
type ExpiringItemVO struct {
	ItemVO
	DaysUntilExpired int `json:"days_until_expired"` // 距离过期的天数，负数表示已过期
}
