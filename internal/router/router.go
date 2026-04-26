package router

import (
	"github.com/gin-gonic/gin"
	"things-expired/config"
	"things-expired/internal/handler"
	"things-expired/pkg/middleware"
	"things-expired/pkg/utils"
)

// NewRouter 创建并配置路由
func NewRouter(
	userHandler *handler.UserHandler,
	categoryHandler *handler.CategoryHandler,
	itemHandler *handler.ItemHandler,
	authMiddleware *middleware.AuthMiddleware,
	bodyHandler *middleware.EmptyBodyHandler,
	logger *utils.Logger,
	cfg *config.Config,
) *gin.Engine {
	r := gin.New()

	// 注册全局中间件
	r.Use(middleware.RequestIDMiddleware())
	r.Use(middleware.RecoveryMiddleware(logger))
	r.Use(middleware.LoggerMiddleware(logger))
	r.Use(middleware.CorsMiddleware())

	// API 路由组（所有 API 必须以 /api 开头）
	api := r.Group("/api")
	api.Use(bodyHandler.Handle())
	{
		// 用户相关路由（公开）
		user := api.Group("/user")
		{
			user.POST("/register", userHandler.Register)
			user.POST("/login", userHandler.Login)
		}

		// 需要认证的路由
		authenticated := api.Group("")
		authenticated.Use(authMiddleware.Handle())
		{
			// 用户相关
			authenticated.POST("/user/info", userHandler.GetUserInfo)
			authenticated.POST("/user/update", userHandler.UpdateUser)
			authenticated.POST("/user/logout", userHandler.Logout)
			authenticated.POST("/user/sessions", userHandler.GetSessions)
			authenticated.POST("/user/revoke_session", userHandler.RevokeSession)
			authenticated.POST("/user/force_logout", userHandler.ForceLogout)

			// 分类相关
			authenticated.POST("/category/create", categoryHandler.Create)
			authenticated.POST("/category/list", categoryHandler.List)
			authenticated.POST("/category/update", categoryHandler.Update)
			authenticated.POST("/category/delete", categoryHandler.Delete)

			// 物品相关
			authenticated.POST("/item/create", itemHandler.Create)
			authenticated.POST("/item/list", itemHandler.List)
			authenticated.POST("/item/detail", itemHandler.Detail)
			authenticated.POST("/item/update", itemHandler.Update)
			authenticated.POST("/item/delete", itemHandler.Delete)
			authenticated.POST("/item/expiring", itemHandler.GetExpiringItems)
			authenticated.POST("/item/stats", itemHandler.GetStats)
		}
	}

	// SPA 兜底路由：处理前端静态资源和 SPA 路由
	// 当请求路径不符合所有已知路径时，返回前端资源让 SPA 处理 404 页面
	// 如果请求以 /api 开头，则不会返回前端资源（由上面的 API 路由处理）
	// 使用 NoRoute 来处理未匹配的路由
	r.NoRoute(middleware.SPACatchAllMiddleware(cfg.Frontend.StaticPath))

	return r
}
