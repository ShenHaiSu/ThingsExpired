package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"

	"things-expired/pkg/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// RecoveryMiddleware 恢复中间件
func RecoveryMiddleware(logger *utils.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// 记录堆栈信息
				logger.Error("panic recovered",
					zap.Any("error", err),
					zap.String("stack", string(debug.Stack())),
				)

				// 返回 500 错误
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"code":    5001,
					"message": fmt.Sprintf("内部错误: %v", err),
					"data":    nil,
				})
			}
		}()

		c.Next()
	}
}
