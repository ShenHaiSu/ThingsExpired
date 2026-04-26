package middleware

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// StaticFileMiddleware 静态文件服务中间件
// 用于处理前端静态资源的请求，并实现 SPA 兜底路由
// 当请求路径不符合所有已知路径时，返回前端资源让 SPA 处理 404 页面
type StaticFileMiddleware struct {
	staticPath string // 前端静态资源目录路径
	indexFile  string // 入口 HTML 文件名
}

// NewStaticFileMiddleware 创建静态文件服务中间件
func NewStaticFileMiddleware(staticPath string) *StaticFileMiddleware {
	if staticPath == "" {
		staticPath = "./dist"
	}
	return &StaticFileMiddleware{
		staticPath: staticPath,
		indexFile:  "index.html",
	}
}

// Handle 处理静态文件请求
// 规则：
// 1. 如果请求路径以 /api 开头，不处理（让后续路由处理）
// 2. 尝试在静态目录中查找对应文件并返回
// 3. 如果文件不存在但目录存在，返回 index.html（让 SPA 处理路由）
// 4. 如果目录也不存在，继续处理（可能返回 404）
func (m *StaticFileMiddleware) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 如果是 API 请求，不处理
		if strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.Next()
			return
		}

		// 获取请求路径
		path := c.Request.URL.Path
		if path == "/" {
			path = "/" + m.indexFile
		} else {
			// 移除前导斜杠
			path = strings.TrimPrefix(path, "/")
		}

		// 构建文件完整路径
		filePath := filepath.Join(m.staticPath, path)

		// 检查文件是否存在
		info, err := os.Stat(filePath)
		if err != nil {
			if os.IsNotExist(err) {
				// 文件不存在，检查是否是目录请求
				dirPath := filepath.Join(m.staticPath, path)
				if _, dirErr := os.Stat(dirPath); dirErr == nil {
					// 目录存在，返回 index.html（让 SPA 处理）
					m.serveIndex(c)
					return
				}
				// 文件和目录都不存在，继续处理（让 Gin 处理 404）
				c.Next()
				return
			}
			// 其他错误，继续处理
			c.Next()
			return
		}

		// 如果是目录，尝试返回目录中的 index.html
		if info.IsDir() {
			indexPath := filepath.Join(filePath, m.indexFile)
			if _, err := os.Stat(indexPath); err == nil {
				c.File(indexPath)
				return
			}
			// 目录中没有 index.html，继续处理
			c.Next()
			return
		}

		// 是文件，直接返回
		c.File(filePath)
	}
}

// serveIndex 返回 index.html
func (m *StaticFileMiddleware) serveIndex(c *gin.Context) {
	indexPath := filepath.Join(m.staticPath, m.indexFile)
	if _, err := os.Stat(indexPath); err == nil {
		c.File(indexPath)
		return
	}
	// 如果 index.html 也不存在，返回 404
	c.JSON(http.StatusNotFound, gin.H{
		"code":    404,
		"message": "页面未找到",
		"data":    nil,
	})
}

// SPACatchAllMiddleware 创建 SPA 兜底路由中间件
// 此中间件应该放在所有路由之后，用于处理未匹配的请求
// 它会将非 API 请求重定向到前端，让 SPA 来处理路由和显示 404 页面
func SPACatchAllMiddleware(staticPath string) gin.HandlerFunc {
	if staticPath == "" {
		staticPath = "./dist"
	}

	m := NewStaticFileMiddleware(staticPath)
	return m.Handle()
}
