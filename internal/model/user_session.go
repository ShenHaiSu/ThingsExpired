package model

import (
	"time"
)

// UserSession 用户会话模型
type UserSession struct {
	ID         uint      `gorm:"primaryKey"`
	UserID     uint      `gorm:"index;not null"`
	TokenJTI   string    `gorm:"uniqueIndex;not null"`
	DeviceInfo string    `gorm:"size:500"`
	IPAddress  string    `gorm:"size:50"`
	CreatedAt  time.Time
	ExpiresAt  time.Time
	IsRevoked  bool      `gorm:"default:false;index"`
}

// TableName 指定表名
func (UserSession) TableName() string {
	return "user_sessions"
}