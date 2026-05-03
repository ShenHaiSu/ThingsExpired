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

// ItemStatsVO 物品统计响应
type ItemStatsVO struct {
	Total         int `json:"total"`           // 物品总数（所有状态的物品数量）
	ExpiringSoon  int `json:"expiring_soon"`    // 即将过期数量（距离过期≤7天且状态为正常的物品）
	Expired       int `json:"expired"`         // 已过期数量（已超过过期时间且状态为已过期的物品）
	Used          int `json:"used"`            // 已消耗数量（状态为已消耗的物品）
}
