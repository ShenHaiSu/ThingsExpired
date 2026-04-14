package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"things-expired/config"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger 日志器
type Logger struct {
	zap *zap.Logger
}

// NewLogger 创建日志器（兼容旧接口）
func NewLogger(mode string) (*Logger, error) {
	return NewLoggerWithConfig(&config.LogConfig{
		Level:      mode,
		Path:       "./log",
		MaxSizeMB:  10,
		MaxBackups: 30,
		MaxAgeDays: 90,
		Compress:   true,
	})
}

// NewLoggerWithConfig 根据配置创建日志器
func NewLoggerWithConfig(cfg *config.LogConfig) (*Logger, error) {
	// 确保日志目录存在
	if err := ensureLogDir(cfg.Path); err != nil {
		return nil, fmt.Errorf("创建日志目录失败: %w", err)
	}

	// 解析日志级别
	level := parseLevel(cfg.Level)

	// 创建编码器配置
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "timestamp",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		MessageKey:     "msg",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.CapitalLevelEncoder,
		EncodeTime:     timeEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	// 创建编码器
	encoder := zapcore.NewJSONEncoder(encoderConfig)

	// 创建文件写入器
	fileWriter := createFileWriter(cfg)

	// 创建控制台写入器（debug 模式输出到控制台）
	var consoleWriter zapcore.WriteSyncer
	if cfg.Level == "debug" {
		consoleWriter = zapcore.AddSync(os.Stdout)
	}

	// 创建写入器链
	var writeSyncer zapcore.WriteSyncer
	if consoleWriter != nil {
		writeSyncer = zapcore.NewMultiWriteSyncer(consoleWriter, fileWriter)
	} else {
		writeSyncer = fileWriter
	}

	// 创建核心
	core := zapcore.NewCore(
		encoder,
		writeSyncer,
		level,
	)

	// 创建 logger
	zapLogger := zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1))

	return &Logger{zap: zapLogger}, nil
}

// ensureLogDir 确保日志目录存在
func ensureLogDir(path string) error {
	if path == "" {
		path = "./log"
	}
	return os.MkdirAll(path, 0755)
}

// createFileWriter 创建文件写入器
func createFileWriter(cfg *config.LogConfig) zapcore.WriteSyncer {
	// 生成日志文件名（yyyy-mm-dd.log）
	fileName := fmt.Sprintf("%s.log", time.Now().Format("2006-01-02"))
	filePath := filepath.Join(cfg.Path, fileName)

	// 使用 zap 提供的文件写入器（支持日志轮转）
	// 这里我们使用简单的文件写入，zap 本身不提供日志轮转
	// 但可以通过自定义 WriteSyncer 实现更复杂的轮转逻辑
	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		// 如果打开文件失败，回退到 stderr
		return zapcore.AddSync(os.Stderr)
	}

	return zapcore.AddSync(file)
}

// parseLevel 解析日志级别
func parseLevel(level string) zapcore.Level {
	switch strings.ToLower(level) {
	case "debug":
		return zapcore.DebugLevel
	case "info":
		return zapcore.InfoLevel
	case "warn", "warning":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	default:
		return zapcore.InfoLevel
	}
}

// timeEncoder 时间编码器
func timeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(t.Format("2006-01-02 15:04:05"))
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

// InitGlobalLoggerWithConfig 根据配置初始化全局日志器
func InitGlobalLoggerWithConfig(cfg *config.LogConfig) error {
	var err error
	GlobalLogger, err = NewLoggerWithConfig(cfg)
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