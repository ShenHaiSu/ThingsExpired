package model

import (
	"time"
)

// Category 分类模型
type Category struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"index;not null"`                 // 所属用户 ID
	Name      string    `gorm:"size:100;not null"`              // 分类名称
	Color     string    `gorm:"size:20;default:'#000000'"`       // 分类颜色
	Icon      string    `gorm:"size:50"`                        // 分类图标
	SortOrder int       `gorm:"default:0"`                      // 排序
	CreatedAt time.Time
	UpdatedAt time.Time
}

// TableName 指定表名
func (Category) TableName() string {
	return "categories"
}
