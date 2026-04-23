package main

import (
	"context"
	"fmt"
	"os"

	"go.uber.org/fx"
	"things-expired/config"
	"things-expired/internal/handler"
	"things-expired/internal/repository"
	"things-expired/internal/router"
	"things-expired/internal/service"
	"things-expired/pkg/middleware"
	"things-expired/pkg/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	// 获取配置文件路径，默认使用 config/config.yaml
	configPath := "config/config.yaml"
	if len(os.Args) > 1 {
		configPath = os.Args[1]
	}

	// 尝试加载配置，如果失败则打印友好错误信息
	cfg, err := config.Load(configPath)
	if err != nil {
		printStartupError(err, configPath)
		os.Exit(1)
	}

	// 初始化日志（在 fx 之前初始化，以便记录启动日志）
	logCfg := &cfg.Log
	logger, err := utils.NewLoggerWithConfig(logCfg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "初始化日志失败: %v\n", err)
		os.Exit(1)
	}

	// 确保退出时同步日志
	defer logger.Sync()

	logger.Info("应用程序启动",
		zap.String("config", configPath),
		zap.String("mode", cfg.App.Mode),
	)

	fx.New(
		// 配置模块
		fx.Provide(func() *config.Config {
			return cfg
		}),

		// 数据库配置
		fx.Provide(func(cfg *config.Config) *config.DatabaseConfig {
			return &cfg.Database
		}),

		// JWT 配置
		fx.Provide(func(cfg *config.Config) *config.JWTConfig {
			return &cfg.JWT
		}),

		// 数据库
		fx.Provide(repository.NewDB),

		// Repository
		fx.Provide(repository.NewUserRepository),
		fx.Provide(repository.NewUserSessionRepository),
		fx.Provide(repository.NewCategoryRepository),
		fx.Provide(repository.NewItemRepository),

		// Utils
		fx.Provide(utils.NewJWTUtil),

		// Log 配置
		fx.Provide(func(cfg *config.Config) *config.LogConfig {
			return &cfg.Log
		}),

		// Logger - 使用配置创建日志器
		fx.Provide(func(cfg *config.LogConfig) (*utils.Logger, error) {
			return utils.NewLoggerWithConfig(cfg)
		}),

		// Security 配置
		fx.Provide(func(cfg *config.Config) (bool, int) {
			return cfg.Security.AllowMultiLogin, cfg.Security.MaxSessionsPerUser
		}),

		// Service
		fx.Provide(service.NewUserService),
		fx.Provide(service.NewCategoryService),
		fx.Provide(service.NewItemService),

		// Handler
		fx.Provide(handler.NewUserHandler),
		fx.Provide(handler.NewCategoryHandler),
		fx.Provide(handler.NewItemHandler),

		// 中间件
		fx.Provide(middleware.NewAuthMiddleware),

		// Router
		fx.Provide(router.NewRouter),

		// 启动服务器
		fx.Invoke(startServer),
	).Run()
}

// startServer 启动 HTTP 服务器
func startServer(
	lc fx.Lifecycle,
	r *gin.Engine,
	cfg *config.Config,
	logger *utils.Logger,
) {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			addr := fmt.Sprintf("%s:%d", cfg.App.Host, cfg.App.Port)
			logger.Info("服务器启动", zap.String("address", addr))
			go func() {
				if err := r.Run(addr); err != nil {
					logger.Fatal("服务器启动失败", zap.Error(err))
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			logger.Info("服务器停止")
			return nil
		},
	})
}

// printStartupError 打印启动错误信息
func printStartupError(err error, configPath string) {
	fmt.Fprintf(os.Stderr, "\n===========================================\n")
	fmt.Fprintf(os.Stderr, "  应用程序启动失败\n")
	fmt.Fprintf(os.Stderr, "===========================================\n\n")
	fmt.Fprintf(os.Stderr, "错误: %v\n\n", err)
	fmt.Fprintf(os.Stderr, "请检查以下内容:\n")
	fmt.Fprintf(os.Stderr, "  1. 配置文件是否存在: %s\n", configPath)
	fmt.Fprintf(os.Stderr, "  2. 配置文件格式是否正确 (YAML 语法)\n")
	fmt.Fprintf(os.Stderr, "  3. 必要的配置项是否已填写\n")
	fmt.Fprintf(os.Stderr, "\n提示: 复制 config/config.example.yaml 为 config/config.yaml\n")
	fmt.Fprintf(os.Stderr, "===========================================\n")
}
