/**
 * 国际化配置
 * 使用 vue-i18n 进行多语言支持
 */

import { createI18n } from 'vue-i18n'
import en from './en.json'
import zhCN from './zh-CN.json'
import { localCache } from '@/utils/storage'

// 获取存储的语言或浏览器语言
function getInitialLocale(): string {
  // 优先从 localStorage 获取
  const storedLocale = localCache.get<string>('locale')
  if (storedLocale && (storedLocale === 'en' || storedLocale === 'zh-CN')) {
    return storedLocale
  }
  // 其次从浏览器语言获取
  const lang = navigator.language || (navigator as any).userLanguage
  if (lang.startsWith('zh')) return 'zh-CN'
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
  },
})

export default i18n
