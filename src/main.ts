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
import ConfirmationService from 'primevue/confirmationservice'

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
// 注意：locale 配置必须是直接的 locale 对象，不能是多语言映射
// 动态切换语言需要在组件中通过 usePrimeVue() 修改 config.locale
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      // 使用 .dark 作为暗色模式选择器，与自定义组件共用同一个 class
      darkModeSelector: '.dark',
    },
  },
  ripple: true,
  // 默认使用中文 locale，后续通过组件动态切换
  locale: primevueZhCN,
})

// 使用 PrimeVue Confirm 服务
app.use(ConfirmationService)

// 挂载应用
app.mount('#app')
