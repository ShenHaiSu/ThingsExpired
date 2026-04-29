<template>
  <div class="search-panel">
    <!-- 移动端搜索组件：移动端显示，桌面端隐藏 -->
    <ItemSearchMobile
      class="block md:hidden"
      :categories="categories"
      @search="handleSearch"
      @reset="handleReset"
    />
    <!-- 桌面端搜索组件：移动端隐藏，桌面端显示 -->
    <ItemSearchDesktop
      class="hidden md:block"
      :categories="categories"
      @search="handleSearch"
      @reset="handleReset"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ItemSearchMobile from './ItemSearchMobile.vue'
import ItemSearchDesktop from './ItemSearchDesktop.vue'
import type { Category } from '@/api/category'
import type { ItemSearchParams } from '@/api/item'

const { t } = useI18n()

interface Props {
  categories: Category[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'search', params: ItemSearchParams): void
  (e: 'reset'): void
}>()

// 处理搜索
function handleSearch(params: ItemSearchParams) {
  emit('search', params)
}

// 处理重置
function handleReset() {
  emit('reset')
}
</script>

<style scoped>
.search-panel {
  background: var(--surface-card, #ffffff);
  border-radius: 10px;
  border: 1px solid var(--surface-border, #e5e7eb);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}
</style>
