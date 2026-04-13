package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"things-expired/internal/handler"
	"things-expired/pkg/errors"
	"things-expired/pkg/utils"
)

// AuthMiddleware 认证中间件
type AuthMiddleware struct {
	jwtUtil *utils.JWTUtil
}

// NewAuthMiddleware 创建认证中间件
func NewAuthMiddleware(jwtUtil *utils.JWTUtil) *AuthMiddleware {
	return &AuthMiddleware{
		jwtUtil: jwtUtil,
	}
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

		// 验证 JWT token
		claims, err := m.jwtUtil.ValidateToken(token)
		if err != nil {
			handler.FailWithCode(c, errors.CodeUnauthorized, "invalid token")
			c.Abort()
			return
		}

		// 将用户信息存入 Context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("email", claims.Email)

		c.Next()
	}
}
