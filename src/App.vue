<template>
  <Toast />
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Toast from 'primevue/toast'
import { DefaultLayout, BlankLayout } from '@/layouts'
import { useAppStore } from '@/stores'

const route = useRoute()
const appStore = useAppStore()

// 根据路由 meta 获取布局组件
const layoutComponent = computed(() => {
  const layout = route.meta.layout as any
  if (layout === BlankLayout) {
    return BlankLayout
  }
  return DefaultLayout
})

// 初始化应用
onMounted(() => {
  // 初始化主题
  appStore.applyTheme()
})
</script>

<style>
/* 全局样式在 assets/styles 中定义 */
</style>
