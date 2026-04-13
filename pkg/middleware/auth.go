package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"things-expired/internal/handler"
	"things-expired/pkg/errors"
)

// AuthMiddleware 认证中间件
type AuthMiddleware struct {
}

// NewAuthMiddleware 创建认证中间件
func NewAuthMiddleware() *AuthMiddleware {
	return &AuthMiddleware{}
}

// Handle 处理认证逻辑
func (m *AuthMiddleware) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取 Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			handler.FailWithCode(c, errors.CodeUnauthorized, "missing authorization")
			c.Abort()
			return
		}

		// 解析 Bearer token
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == authHeader { // 没有 Bearer 前缀
			handler.FailWithCode(c, errors.CodeUnauthorized, "invalid token format")
			c.Abort()
			return
		}

		// TODO: 验证 JWT token
		// 这里先做简单的占位处理，后续阶段会实现完整的 JWT 验证

		c.Next()
	}
}
