package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// RequestIDMiddleware 请求 ID 中间件
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从请求头获取请求 ID，如果没有则生成一个新的
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}

		// 将请求 ID 存入 Context
		c.Set("request_id", requestID)

		// 在响应头中设置请求 ID
		c.Writer.Header().Set("X-Request-ID", requestID)

		c.Next()
	}
}
