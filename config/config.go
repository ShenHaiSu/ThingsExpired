package config

import (
	"github.com/spf13/viper"
)

// Config 应用配置结构
type Config struct {
	App      AppConfig      `mapstructure:"app"`
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	Upload   UploadConfig   `mapstructure:"upload"`
	Security SecurityConfig `mapstructure:"security"`
	Log      LogConfig      `mapstructure:"log"`
}

// AppConfig 应用配置
type AppConfig struct {
	Name string `mapstructure:"name"`
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Path         string `mapstructure:"path"`
	MaxIdleConns int    `mapstructure:"max_idle_conns"`
	MaxOpenConns int    `mapstructure:"max_open_conns"`
}

// JWTConfig JWT 配置
type JWTConfig struct {
	Secret      string `mapstructure:"secret"`
	ExpireHours int    `mapstructure:"expire_hours"`
}

// UploadConfig 上传配置
type UploadConfig struct {
	MaxSizeMB    int      `mapstructure:"max_size_mb"`
	AllowedTypes []string `mapstructure:"allowed_types"`
	SavePath     string   `mapstructure:"save_path"`
}

// SecurityConfig 安全配置
type SecurityConfig struct {
	AllowMultiLogin     bool `mapstructure:"allow_multi_login"`      // 是否允许多端登录
	MaxSessionsPerUser int  `mapstructure:"max_sessions_per_user"`  // 每个用户最大会话数
}

// LogConfig 日志配置
type LogConfig struct {
	Level      string `mapstructure:"level"`       // 日志级别: debug, info, warn, error
	Path       string `mapstructure:"path"`        // 日志文件目录
	MaxSizeMB  int    `mapstructure:"max_size_mb"` // 单个日志文件最大大小(MB)
	MaxBackups int    `mapstructure:"max_backups"` // 保留的旧日志文件最大数量
	MaxAgeDays int    `mapstructure:"max_age_days"`// 保留的旧日志文件最大天数
	Compress   bool   `mapstructure:"compress"`    // 是否压缩旧日志文件
}

// Load 加载配置文件
func Load(path string) (*Config, error) {
	viper.SetConfigFile(path)
	viper.SetConfigType("yaml")

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
