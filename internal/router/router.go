package router

import (
	"github.com/gin-gonic/gin"
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
	logger *utils.Logger,
) *gin.Engine {
	r := gin.New()

	// 注册全局中间件
	r.Use(middleware.RequestIDMiddleware())
	r.Use(middleware.RecoveryMiddleware(logger))
	r.Use(middleware.LoggerMiddleware(logger))
	r.Use(middleware.CorsMiddleware())

	// API 路由组（所有 API 必须以 /api 开头）
	api := r.Group("/api")
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
		}
	}

	return r
}
