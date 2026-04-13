package middleware

import (
	"time"

	"things-expired/pkg/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// LoggerMiddleware 日志中间件
func LoggerMiddleware(logger *utils.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 开始时间
		start := time.Now()

		// 获取请求路径
		path := c.Request.URL.Path

		// 获取客户端 IP
		clientIP := c.ClientIP()

		// 获取请求方法
		method := c.Request.Method

		// 获取请求 ID（如果存在）
		requestID, _ := c.Get("request_id")

		// 处理请求
		c.Next()

		// 计算耗时
		latency := time.Since(start)

		// 获取响应状态码
		statusCode := c.Writer.Status()

		// 构建日志字段
		fields := []zap.Field{
			zap.String("method", method),
			zap.String("path", path),
			zap.String("client_ip", clientIP),
			zap.Duration("latency", latency),
			zap.Int("status", statusCode),
			zap.Int("body_size", c.Writer.Size()),
		}

		// 添加请求 ID（如果存在）
		if requestID != nil {
			fields = append(fields, zap.String("request_id", requestID.(string)))
		}

		// 添加用户 ID（如果存在）
		if userID, exists := c.Get("user_id"); exists {
			fields = append(fields, zap.Uint("user_id", userID.(uint)))
		}

		// 添加错误信息（如果存在）
		if len(c.Errors) > 0 {
			fields = append(fields, zap.String("errors", c.Errors.String()))
		}

		// 根据状态码选择日志级别
		if statusCode >= 500 {
			logger.Error("server error", fields...)
		} else if statusCode >= 400 {
			logger.Warn("client error", fields...)
		} else {
			logger.Info("request", fields...)
		}
	}
}
