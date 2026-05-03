package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

// Config 应用配置结构
type Config struct {
	App        AppConfig        `mapstructure:"app"`
	Database   DatabaseConfig   `mapstructure:"database"`
	JWT        JWTConfig        `mapstructure:"jwt"`
	Upload     UploadConfig     `mapstructure:"upload"`
	Security   SecurityConfig   `mapstructure:"security"`
	Log        LogConfig        `mapstructure:"log"`
	Frontend   FrontendConfig   `mapstructure:"frontend"`
	Expiration ExpirationConfig `mapstructure:"expiration"`
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

// FrontendConfig 前端静态资源配置
type FrontendConfig struct {
	StaticPath string `mapstructure:"static_path"` // 前端静态资源目录路径
}

// SecurityConfig 安全配置
type SecurityConfig struct {
	AllowMultiLogin     bool `mapstructure:"allow_multi_login"`      // 是否允许多端登录
	MaxSessionsPerUser int  `mapstructure:"max_sessions_per_user"`  // 每个用户最大会话数
}

// LogConfig 日志配置
type LogConfig struct {
	Level      string `mapstructure:"level"`        // 日志级别: debug, info, warn, error
	Path       string `mapstructure:"path"`         // 日志文件目录
	MaxSizeMB  int    `mapstructure:"max_size_mb"`  // 单个日志文件最大大小(MB)
	MaxBackups int    `mapstructure:"max_backups"`  // 保留的旧日志文件最大数量
	MaxAgeDays int    `mapstructure:"max_age_days"` // 保留的旧日志文件最大天数
	Compress   bool   `mapstructure:"compress"`     // 是否压缩旧日志文件
}

// ExpirationConfig 过期检查配置
type ExpirationConfig struct {
	Enabled     bool `mapstructure:"enabled"`      // 是否启用自动过期检查
	IntervalSec int  `mapstructure:"interval_sec"` // 检查间隔（秒）
	BatchSize   int  `mapstructure:"batch_size"`   // 每次批量处理数量
}

// Load 加载配置文件
func Load(path string) (*Config, error) {
	// 检查配置文件是否存在
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil, fmt.Errorf("配置文件不存在: %s\n请复制 config/config.example.yaml 为 config/config.yaml 并根据需要修改配置", path)
	}

	viper.SetConfigFile(path)
	viper.SetConfigType("yaml")

	if err := viper.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("配置文件读取失败: %v\n请检查配置文件格式是否正确 (YAML 语法)", err)
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("配置文件解析失败: %v\n请检查配置项是否正确", err)
	}

	// 验证必要的配置
	if err := validateConfig(&cfg); err != nil {
		return nil, fmt.Errorf("配置验证失败: %v", err)
	}

	return &cfg, nil
}

// validateConfig 验证配置项
func validateConfig(cfg *Config) error {
	if cfg.App.Port <= 0 || cfg.App.Port > 65535 {
		return fmt.Errorf("app.port 必须在 1-65535 之间，当前值: %d", cfg.App.Port)
	}
	if cfg.Database.Path == "" {
		return fmt.Errorf("database.path 不能为空")
	}
	if cfg.JWT.Secret == "" {
		return fmt.Errorf("jwt.secret 不能为空")
	}
	if cfg.JWT.ExpireHours <= 0 {
		return fmt.Errorf("jwt.expire_hours 必须大于 0")
	}
	return nil
}
