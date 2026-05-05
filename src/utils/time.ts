/**
 * 返回当前时间的 UTC ISO 8601 字符串
 * 示例: "2026-05-02T00:00:00.000Z"
 */
export function nowUTC(): string {
  return new Date().toISOString();
}

/**
 * 格式化时间为 UTC ISO 8601 字符串
 * @param date - Date 对象
 * @returns UTC ISO 8601 字符串
 */
export function formatTime(date: Date): string {
  return date.toISOString();
}

/**
 * 计算两个时间之间的天数差
 * @param target - 目标时间（UTC ISO 8601 字符串）
 * @returns 天数差（正数表示目标时间在未来，负数表示在过去）
 */
export function daysUntil(target: string): number {
  const targetDate = new Date(target).getTime();
  const now = Date.now();
  const diffMs = targetDate - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 获取 N 天后的 UTC ISO 8601 字符串
 * @param days - 天数
 * @returns UTC ISO 8601 字符串
 */
export function daysFromNow(days: number): string {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return date.toISOString();
}
