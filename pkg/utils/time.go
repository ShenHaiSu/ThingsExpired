package utils

import "time"

// TimeFormatUTC UTC 时间格式化常量
// 按照 ISO 8601 标准，格式为 YYYY-MM-DDTHH:mm:ss.sssZ
const TimeFormatUTC = "2006-01-02T15:04:05.000Z"

// FormatTimeUTC 将时间格式化为 UTC ISO 8601 格式
// 用于 API 响应中的时间字段
func FormatTimeUTC(t time.Time) string {
	return t.UTC().Format(TimeFormatUTC)
}

// NowUTC 返回当前 UTC 时间
// 用于数据库存储和业务逻辑中的时间操作
func NowUTC() time.Time {
	return time.Now().UTC()
}

// ParseTimeUTC 解析 UTC ISO 8601 格式的时间字符串
// 用于解析 API 请求中的时间字段
func ParseTimeUTC(timeStr string) (time.Time, error) {
	return time.Parse(TimeFormatUTC, timeStr)
}

// ParseTimeUTCDefault 解析 UTC ISO 8601 格式的时间字符串，失败返回零值
func ParseTimeUTCDefault(timeStr string) time.Time {
	t, err := time.Parse(TimeFormatUTC, timeStr)
	if err != nil {
		return time.Time{}
	}
	return t
}
