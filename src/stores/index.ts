/**
 * Pinia Store 统一导出
 */

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 创建 Pinia 实例
const pinia = createPinia()

// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

export default pinia

// 导出各模块 store
export { useUserStore } from './user/userStore'
export { useAppStore } from './app/appStore'
