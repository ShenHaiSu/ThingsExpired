package model

import (
	"time"
)

// Item 物品模型
type Item struct {
	ID          uint      `gorm:"primaryKey"`
	UserID      uint      `gorm:"index;not null"`              // 所属用户 ID
	CategoryID  uint      `gorm:"index;not null"`             // 所属分类 ID
	Name        string    `gorm:"size:200;not null"`          // 物品名称
	Description string    `gorm:"size:500"`                   // 物品描述
	Quantity    int       `gorm:"default:1"`                 // 数量
	Unit        string    `gorm:"size:20"`                    // 单位
	ExpiredAt   time.Time `gorm:"index;not null"`             // 过期时间
	RemindDays  int       `gorm:"default:3"`                  // 提前提醒天数
	Status      int8      `gorm:"default:1;index"`           // 状态：1正常 2已过期 3已消耗
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// TableName 指定表名
func (Item) TableName() string {
	return "items"
}
