/**
 * 应用入口文件
 * 初始化 Vue 应用、Pinia、Router、i18n 等
 */

import '@/assets/styles/variables.css'
import '@/assets/styles/public.css'
import { createApp } from 'vue'
import pinia from './stores'
import router from './router'
import i18n from './locales'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

// Import PrimeVue locale files
import primevueEn from './locales/primevue-en.json'
import primevueZhCN from './locales/primevue-zh-CN.json'

import App from './App.vue'

const app = createApp(App)

// 使用 Pinia 状态管理
app.use(pinia)

// 使用路由
app.use(router)

// 使用国际化
app.use(i18n)

// 使用 PrimeVue Toast 服务
app.use(ToastService)

// 使用 PrimeVue Tooltip 服务
app.directive('tooltip', Tooltip)

// 使用 PrimeVue UI 组件库
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
  ripple: true,
  locale: {
    en: primevueEn,
    'zh-CN': primevueZhCN,
  },
})

// 挂载应用
app.mount('#app')
