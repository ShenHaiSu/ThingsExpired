/**
 * 国际化配置
 * 使用 vue-i18n 进行多语言支持
 */

import { createI18n } from 'vue-i18n'
import en from './en.json'
import zhCN from './zh-CN.json'

// 获取浏览器语言
function getBrowserLanguage(): string {
  const lang = navigator.language || (navigator as any).userLanguage
  if (lang.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getBrowserLanguage(),
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
  },
})

export default i18n
