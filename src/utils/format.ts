/**
 * 格式化工具函数
 * 包含日期、数字、字符串等格式化方法
 */

import dayjs from 'dayjs'

/**
 * 格式化日期时间
 * @param date 日期字符串、数字或 Date 对象
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 */
export function formatDateTime(date?: string | number | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 格式化日期
 * @param date 日期字符串、数字或 Date 对象
 * @param format 格式化模板，默认为 'YYYY-MM-DD'
 */
export function formatDate(date?: string | number | Date, format: string = 'YYYY-MM-DD'): string {
  return formatDateTime(date, format)
}

/**
 * 格式化时间
 * @param date 日期字符串、数字或 Date 对象
 * @param format 格式化模板，默认为 'HH:mm:ss'
 */
export function formatTime(date?: string | number | Date, format: string = 'HH:mm:ss'): string {
  return formatDateTime(date, format)
}

/**
 * 格式化数字，添加千分位
 * @param num 数字
 * @param decimals 保留小数位数，默认为 0
 */
export function formatNumber(num: number, decimals: number = 0): string {
  if (num === null || num === undefined) return '-'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化百分比
 * @param value 数值（0-1 或 0-100）
 * @param isDecimal 是否为小数形式（true: 0.5, false: 50）
 * @param decimals 保留小数位数
 */
export function formatPercent(value: number, isDecimal: boolean = false, decimals: number = 0): string {
  const num = isDecimal ? value * 100 : value
  return `${num.toFixed(decimals)}%`
}

/**
 * 截断字符串
 * @param str 字符串
 * @param maxLength 最大长度
 * @param ellipsis 省略符，默认为 '...'
 */
export function truncateString(str: string, maxLength: number, ellipsis: string = '...'): string {
  if (!str || str.length <= maxLength) return str
  return str.slice(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * 脱敏手机号
 * @param phone 手机号
 */
export function maskPhone(phone: string): string {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 脱敏身份证号
 * @param idCard 身份证号
 */
export function maskIdCard(idCard: string): string {
  if (!idCard) return '-'
  return idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2')
}
