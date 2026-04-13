package utils

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger 日志器
type Logger struct {
	zap *zap.Logger
}

// NewLogger 创建日志器
func NewLogger(mode string) (*Logger, error) {
	var config zap.Config

	switch mode {
	case "release":
		config = zap.NewProductionConfig()
		config.EncoderConfig.TimeKey = "timestamp"
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	case "test":
		config = zap.NewDevelopmentConfig()
		config.Level = zap.NewAtomicLevelAt(zap.WarnLevel)
	default: // debug
		config = zap.NewDevelopmentConfig()
		config.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	// 设置输出
	config.OutputPaths = []string{"stdout"}
	config.ErrorOutputPaths = []string{"stderr"}

	zapLogger, err := config.Build()
	if err != nil {
		return nil, err
	}

	return &Logger{zap: zapLogger}, nil
}

// Sync 同步日志
func (l *Logger) Sync() {
	if l.zap != nil {
		_ = l.zap.Sync()
	}
}

// Debug 调试级别日志
func (l *Logger) Debug(msg string, fields ...zap.Field) {
	l.zap.Debug(msg, fields...)
}

// Info 信息级别日志
func (l *Logger) Info(msg string, fields ...zap.Field) {
	l.zap.Info(msg, fields...)
}

// Warn 警告级别日志
func (l *Logger) Warn(msg string, fields ...zap.Field) {
	l.zap.Warn(msg, fields...)
}

// Error 错误级别日志
func (l *Logger) Error(msg string, fields ...zap.Field) {
	l.zap.Error(msg, fields...)
}

// Fatal 致命级别日志
func (l *Logger) Fatal(msg string, fields ...zap.Field) {
	l.zap.Fatal(msg, fields...)
}

// WithFields 创建带有字段的日志记录器
func (l *Logger) WithFields(fields ...zap.Field) *zap.Logger {
	return l.zap.With(fields...)
}

// SuggaredLogger 获取 SugaredLogger
func (l *Logger) SuggaredLogger() *zap.SugaredLogger {
	return l.zap.Sugar()
}

// GlobalLogger 全局日志器
var GlobalLogger *Logger

// InitGlobalLogger 初始化全局日志器
func InitGlobalLogger(mode string) error {
	var err error
	GlobalLogger, err = NewLogger(mode)
	if err != nil {
		return err
	}

	// 确保退出时同步日志
	RegisterOnShutdown(func() {
		GlobalLogger.Sync()
	})

	return nil
}

// GetGlobalLogger 获取全局日志器
func GetGlobalLogger() *Logger {
	if GlobalLogger == nil {
		GlobalLogger, _ = NewLogger("debug")
	}
	return GlobalLogger
}

// onShutdownCallbacks 关闭时的回调函数
var onShutdownCallbacks []func()

// RegisterOnShutdown 注册关闭时的回调函数
func RegisterOnShutdown(callback func()) {
	onShutdownCallbacks = append(onShutdownCallbacks, callback)
}

// TriggerOnShutdown 触发关闭时的回调
func TriggerOnShutdown() {
	for _, callback := range onShutdownCallbacks {
		callback()
	}
}

// DefaultZapFields 默认字段
func DefaultZapFields() []zap.Field {
	return []zap.Field{
		zap.String("service", "things-expired"),
		zap.Int("pid", os.Getpid()),
	}
}
