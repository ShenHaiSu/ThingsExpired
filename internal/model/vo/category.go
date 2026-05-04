package vo

// CategoryVO 分类响应
type CategoryVO struct {
	CategoryID uint   `json:"category_id"`
	UserID     uint   `json:"user_id"`
	Name       string `json:"name"`
	Color      string `json:"color"`
	Icon       string `json:"icon"`
	SortOrder  int    `json:"sort_order"`
	CreatedAt  string `json:"created_at"`
}

// CategoryListVO 分类列表响应
type CategoryListVO struct {
	List  []CategoryVO `json:"list"`
	Total int64        `json:"total"`
	Page  int          `json:"page"`
}
