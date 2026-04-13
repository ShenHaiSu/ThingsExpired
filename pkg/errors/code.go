package errors

// 错误码定义
const (
	CodeSuccess       = 0
	CodeParamInvalid  = 1001
	CodeUnauthorized  = 1002
	CodeForbidden     = 1003

	// 用户相关
	CodeUserNotFound  = 2001
	CodeUserExists    = 2002
	CodePasswordWrong = 2003

	// 系统相关
	CodeInternalError = 5001
	CodeDatabaseError = 5002
)
