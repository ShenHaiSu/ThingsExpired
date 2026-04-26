import { useToast as usePrimeToast } from 'primevue/usetoast'

/**
 * Toast 通知组合式函数
 *
 * 提供简洁的 API 用于显示不同类型的通知消息
 * 下属组件只需引入 useToast 即可进行通知的添加
 *
 * @example
 * ```typescript
 * import { useToast } from '@/composables'
 *
 * const toast = useToast()
 *
 * // 成功通知
 * toast.success('操作成功')
 *
 * // 错误通知
 * toast.error('操作失败')
 *
 * // 警告通知
 * toast.warn('请注意')
 *
 * // 信息通知
 * toast.info('提示信息')
 *
 * // 自定义通知
 * toast.add({
 *   severity: 'info',
 *   summary: '标题',
 *   detail: '详细内容',
 *   life: 3000
 * })
 * ```
 */
export function useToast() {
  const toast = usePrimeToast()

  /**
   * 显示成功通知
   * @param detail 通知内容
   * @param summary 标题（可选，默认：'成功'）
   * @param life 显示时长（可选，默认：3000ms）
   */
  function success(detail: string, summary: string = '成功', life: number = 3000) {
    toast.add({
      severity: 'success',
      summary,
      detail,
      life,
    })
  }

  /**
   * 显示错误通知
   * @param detail 通知内容
   * @param summary 标题（可选，默认：'错误'）
   * @param life 显示时长（可选，默认：3000ms）
   */
  function error(detail: string, summary: string = '错误', life: number = 3000) {
    toast.add({
      severity: 'error',
      summary,
      detail,
      life,
    })
  }

  /**
   * 显示警告通知
   * @param detail 通知内容
   * @param summary 标题（可选，默认：'警告'）
   * @param life 显示时长（可选，默认：3000ms）
   */
  function warn(detail: string, summary: string = '警告', life: number = 3000) {
    toast.add({
      severity: 'warn',
      summary,
      detail,
      life,
    })
  }

  /**
   * 显示信息通知
   * @param detail 通知内容
   * @param summary 标题（可选，默认：'提示'）
   * @param life 显示时长（可选，默认：3000ms）
   */
  function info(detail: string, summary: string = '提示', life: number = 3000) {
    toast.add({
      severity: 'info',
      summary,
      detail,
      life,
    })
  }

  return {
    ...toast,
    success,
    error,
    warn,
    info,
  }
}
