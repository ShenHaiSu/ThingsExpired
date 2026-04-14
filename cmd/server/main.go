package main

import (
	"context"
	"fmt"
	"log"
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
)

func main() {
	// 获取配置文件路径，默认使用 config/config.yaml
	configPath := "config/config.yaml"
	if len(os.Args) > 1 {
		configPath = os.Args[1]
	}

	fx.New(
		// 配置模块
		fx.Provide(func() (*config.Config, error) {
			return config.Load(configPath)
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
		fx.Provide(func(cfg *config.Config) (*utils.Logger, error) {
			return utils.NewLogger(cfg.App.Mode)
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
) {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			addr := fmt.Sprintf("%s:%d", cfg.App.Host, cfg.App.Port)
			log.Printf("Server starting on %s", addr)
			go func() {
				if err := r.Run(addr); err != nil {
					log.Fatal(err)
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			log.Println("Server stopping")
			return nil
		},
	})
}
