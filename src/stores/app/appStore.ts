/**
 * 应用状态管理
 * 管理应用全局状态，如主题、语言、侧边栏等
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { localCache } from '@/utils/storage'
import { usePrimeVue } from 'primevue/config'

// ============ 类型定义 ============

/** 主题类型 */
export type Theme = 'light' | 'dark' | 'auto'

/** 语言类型 */
export type Locale = 'en' | 'zh-CN'

// ============ Store 定义 ============

export const useAppStore = defineStore('app', () => {
  // ============ State ============

  /** 主题 */
  const theme = ref<Theme>(localCache.get('theme') || 'light')

  /** 语言 */
  const locale = ref<Locale>(localCache.get('locale') || 'zh-CN')

  /** 侧边栏展开状态 */
  const sidebarCollapsed = ref<boolean>(localCache.get('sidebarCollapsed') || false)

  /** 加载状态 */
  const loading = ref<boolean>(false)

  // ============ Getters ============

  /** 是否为深色主题 */
  const isDarkTheme = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })

  // ============ Actions ============

  /**
   * 设置主题
   * @param newTheme 主题值
   */
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localCache.set('theme', newTheme)
    applyTheme()
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    const themeMap: Record<Theme, Theme> = {
      light: 'dark',
      dark: 'auto',
      auto: 'light',
    }
    setTheme(themeMap[theme.value])
  }

  /**
   * 应用主题到 DOM
   */
  function applyTheme() {
    const root = document.documentElement
    if (isDarkTheme.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  /**
   * 设置语言
   * @param newLocale 语言值
   */
  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    localCache.set('locale', newLocale)
    
    // 同步 PrimeVue 本地化
    const primeVue = usePrimeVue()
    if (primeVue) {
      primeVue.config.locale = newLocale
    }
  }

  /**
   * 切换侧边栏
   */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localCache.set('sidebarCollapsed', sidebarCollapsed.value)
  }

  /**
   * 设置侧边栏状态
   * @param collapsed 是否折叠
   */
  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
    localCache.set('sidebarCollapsed', collapsed)
  }

  /**
   * 设置加载状态
   * @param isLoading 加载状态
   */
  function setLoading(isLoading: boolean) {
    loading.value = isLoading
  }

  // 初始化时应用主题
  applyTheme()

  return {
    // State
    theme,
    locale,
    sidebarCollapsed,
    loading,
    // Getters
    isDarkTheme,
    // Actions
    setTheme,
    toggleTheme,
    applyTheme,
    setLocale,
    toggleSidebar,
    setSidebarCollapsed,
    setLoading,
  }
})
