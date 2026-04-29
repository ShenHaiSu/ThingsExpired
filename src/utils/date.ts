/**
 * 日期计算工具
 * 包含日期相关的计算和格式化方法
 */

import dayjs from 'dayjs'

/**
 * 计算距离过期的天数
 * @param expiredAt 过期时间 (ISO 8601 格式)
 * @returns 距离过期的天数，负数表示已过期
 */
export function getDaysUntilExpired(expiredAt: string): number {
  const now = dayjs()
  const expired = dayjs(expiredAt)
  return expired.diff(now, 'day')
}

/**
 * 计算过期时间
 * @param startDate 起始日期
 * @param validityValue 可用时间数值
 * @param unit 时间单位 ('hour' | 'day' | 'week' | 'month' | 'year')
 * @returns 过期时间 (ISO 8601 格式)
 */
export function calculateExpiredAt(startDate: string | Date, validityValue: number, unit: 'hour' | 'day' | 'week' | 'month' | 'year' = 'day'): string {
  return dayjs(startDate).add(validityValue, unit).toISOString()
}

/**
 * 格式化过期时间显示
 * @param expiredAt 过期时间
 * @returns 格式化后的显示文本
 */
export function formatExpiredDisplay(expiredAt: string): string {
  const days = getDaysUntilExpired(expiredAt)

  if (days < 0) {
    return `已过期 ${Math.abs(days)} 天`
  } else if (days === 0) {
    return '今天过期'
  } else if (days === 1) {
    return '明天过期'
  } else {
    return `还有 ${days} 天过期`
  }
}

/**
 * 判断是否即将过期
 * @param expiredAt 过期时间
 * @param remindDays 提前提醒天数
 * @returns 是否即将过期
 */
export function isExpiringSoon(expiredAt: string, remindDays: number = 3): boolean {
  const days = getDaysUntilExpired(expiredAt)
  return days >= 0 && days <= remindDays
}

/**
 * 判断是否已过期
 * @param expiredAt 过期时间
 * @returns 是否已过期
 */
export function isExpired(expiredAt: string): boolean {
  return getDaysUntilExpired(expiredAt) < 0
}

/**
 * 获取物品状态
 * @param expiredAt 过期时间
 * @returns 状态码 (1: 正常, 2: 已过期)
 */
export function getItemStatus(expiredAt: string): number {
  return isExpired(expiredAt) ? 2 : 1
}

/**
 * 检查日期格式是否为UTC格式
 * @param dateStr 日期字符串
 * @returns 是否为UTC格式
 */
export function isUtcFormat(dateStr: string): boolean {
  // 检查是否包含Z或+00:00
  return dateStr.endsWith('Z') || dateStr.includes('+00:00')
}

/**
 * 将日期转换为UTC格式
 * @param date 日期字符串、数字或Date对象
 * @returns UTC格式的日期字符串
 */
export function toUtcFormat(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString()
}

/**
 * 验证日期格式是否正确
 * @param dateStr 日期字符串
 * @returns 是否为有效日期
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}
