package repository

import (
	"os"
	"path/filepath"
	"things-expired/config"
	"things-expired/internal/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// NewDB 创建数据库连接
func NewDB(cfg *config.DatabaseConfig) (*gorm.DB, error) {
	// 获取数据库文件的绝对路径
	absPath, err := filepath.Abs(cfg.Path)
	if err != nil {
		return nil, err
	}

	// 确保目录存在
	dir := filepath.Dir(absPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	db, err := gorm.Open(sqlite.Open(cfg.Path), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)

	// 检查 users 表是否存在，如果不存在则自动创建所有表
	if !db.Migrator().HasTable(&model.User{}) {
		// 自动迁移创建表
		if err := db.AutoMigrate(&model.User{}, &model.Category{}, &model.Item{}, &model.UserSession{}); err != nil {
			return nil, err
		}
	}

	// 检查 user_sessions 表是否存在，如果不存在则创建
	if !db.Migrator().HasTable(&model.UserSession{}) {
		if err := db.AutoMigrate(&model.UserSession{}); err != nil {
			return nil, err
		}
	}

	return db, nil
}
