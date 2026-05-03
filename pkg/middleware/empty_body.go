package middleware

import (
	"io"

	"github.com/gin-gonic/gin"
)

// EmptyBodyHandler 中间件，处理空请求体的情况
// 当 POST 请求不带 body 时，Gin 的 ShouldBindJSON 会返回 EOF 错误
// 此中间件在绑定前检查请求体，如果为空则设置一个空的 JSON 对象 {}
type EmptyBodyHandler struct{}

// NewEmptyBodyHandler 创建 EmptyBodyHandler 中间件
func NewEmptyBodyHandler() *EmptyBodyHandler {
	return &EmptyBodyHandler{}
}

// Handle 返回处理空请求体的中间件函数
func (m *EmptyBodyHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 只处理 POST 请求
		if c.Request.Method == "POST" {
			// 检查 Content-Type 是否为 JSON
			contentType := c.GetHeader("Content-Type")
			if len(contentType) >= 16 && contentType[:16] == "application/json" {
				// 检查请求体是否为空
				if c.Request.Body != nil {
					bodyBytes, err := io.ReadAll(c.Request.Body)
					if err != nil {
						// 无法读取请求体，继续后续处理
						c.Next()
						return
					}

					// 如果请求体为空，创建一个空的 JSON 对象
					if len(bodyBytes) == 0 {
						c.Request.Body = io.NopCloser(&emptyBodyReader{})
					} else {
						// 恢复请求体，供后续 handler 使用
						c.Request.Body = io.NopCloser(&readerWithData{data: bodyBytes})
					}
				}
			}
		}

		c.Next()
	}
}

// emptyBodyReader 是一个空的 body reader，返回有效的 JSON
type emptyBodyReader struct{}

func (e *emptyBodyReader) Read(p []byte) (n int, err error) {
	// 返回一个空的 JSON 对象
	copy(p, "{}")
	return 2, io.EOF
}

// readerWithData 包装已读取的数据
type readerWithData struct {
	data   []byte
	offset int
}

func (r *readerWithData) Read(p []byte) (n int, err error) {
	if r.offset >= len(r.data) {
		return 0, io.EOF
	}
	n = copy(p, r.data[r.offset:])
	r.offset += n
	return n, nil
}
