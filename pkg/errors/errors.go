package errors

// AppError 应用错误类型
type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Cause   error  `json:"-"` // 不序列化到 JSON
}

// Error 实现 error 接口
func (e *AppError) Error() string {
	return e.Message
}

// Unwrap 解包错误
func (e *AppError) Unwrap() error {
	return e.Cause
}

// New 创建新的应用错误
func New(code int, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
	}
}

// NewWithCause 创建带原因的应用错误
func NewWithCause(code int, message string, cause error) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Cause:   cause,
	}
}

// 预定义错误
var (
	ErrUserNotFound  = New(CodeUserNotFound, "用户不存在")
	ErrUserExists    = New(CodeUserExists, "用户已存在")
	ErrUnauthorized  = New(CodeUnauthorized, "未授权")
	ErrParamInvalid  = New(CodeParamInvalid, "参数错误")
	ErrPasswordWrong = New(CodePasswordWrong, "密码错误")
)
