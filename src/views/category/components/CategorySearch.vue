<template>
  <div class="search-panel">
    <!-- 移动端搜索组件：移动端显示，桌面端隐藏 -->
    <CategorySearchMobile
      class="block md:hidden"
      @search="handleSearch"
      @reset="handleReset"
    />
    <!-- 桌面端搜索组件：移动端隐藏，桌面端显示 -->
    <CategorySearchDesktop
      class="hidden md:block"
      @search="handleSearch"
      @reset="handleReset"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CategorySearchMobile from './CategorySearchMobile.vue'
import CategorySearchDesktop from './CategorySearchDesktop.vue'
import type { CategoryListParams } from '@/types/api/category'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'search', params: CategoryListParams): void
  (e: 'reset'): void
}>()

// 处理搜索
function handleSearch(params: CategoryListParams) {
  emit('search', params)
}

// 处理重置
function handleReset() {
  emit('reset')
}
</script>

<style scoped>
.search-panel {
  background: var(--color-bg-card);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px var(--color-shadow);
  margin-bottom: 24px;
}

/* 深色主题适配 */
:global(.dark) .search-panel {
  background: var(--color-bg-card);
  border-color: var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>