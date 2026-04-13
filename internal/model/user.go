package model

import (
	"time"
)

// User 用户模型
type User struct {
	ID        uint      `gorm:"primaryKey"`
	Username  string    `gorm:"size:50;not null;uniqueIndex"`
	Email     string    `gorm:"size:255;uniqueIndex;not null"`
	Password  string    `gorm:"size:255;not null"`
	Status    int8      `gorm:"default:1;index"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}
