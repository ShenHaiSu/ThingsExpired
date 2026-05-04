package dto

// CreateCategoryRequest 创建分类请求
type CreateCategoryRequest struct {
	Name      string `json:"name" binding:"required,min=1,max=100"`
	Color     string `json:"color" binding:"omitempty,max=20"`
	Icon      string `json:"icon" binding:"omitempty,max=50"`
	SortOrder int    `json:"sort_order" binding:"omitempty"`
}

// UpdateCategoryRequest 更新分类请求
type UpdateCategoryRequest struct {
	CategoryID uint   `json:"category_id" binding:"required,min=1"`
	Name       string `json:"name" binding:"omitempty,min=1,max=100"`
	Color      string `json:"color" binding:"omitempty,max=20"`
	Icon       string `json:"icon" binding:"omitempty,max=50"`
	SortOrder  int    `json:"sort_order"`
}

// DeleteCategoryRequest 删除分类请求
type DeleteCategoryRequest struct {
	CategoryID uint `json:"category_id" binding:"required,min=1"`
}

// ListCategoryRequest 分类列表请求
type ListCategoryRequest struct {
	Page     int    `json:"page" binding:"omitempty,min=1"`
	PageSize int    `json:"page_size" binding:"omitempty,min=1,max=100"`
	Keyword  string `json:"keyword" binding:"omitempty,max=100"`
}
