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

	// 检查数据库文件是否存在
	dbExists := true
	if _, err := os.Stat(absPath); os.IsNotExist(err) {
		dbExists = false
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

	// 如果数据库文件不存在，则自动创建表
	if !dbExists {
		// 确保目录存在
		dir := filepath.Dir(absPath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, err
		}

		// 自动迁移创建表
		if err := db.AutoMigrate(&model.User{}, &model.Category{}, &model.Item{}); err != nil {
			return nil, err
		}
	}

	return db, nil
}
