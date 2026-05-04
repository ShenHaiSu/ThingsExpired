<template>
  <div class="mobile-search">
    <div class="search-toggle" @click="toggleMobileSearch">
      <i class="pi pi-search"></i>
      <span>{{ t('common.search') }}</span>
      <i :class="['pi', isMobileSearchOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
    </div>

    <Transition name="slide">
      <div v-if="isMobileSearchOpen" class="search-content">
        <div class="search-fields">
          <!-- 名称关键词搜索 -->
          <div class="field-group">
            <label>{{ t('category.search.keyword') }}</label>
            <InputText
              v-model="searchParams.keyword"
              :placeholder="t('category.search.keywordPlaceholder')"
              class="w-full"
            />
          </div>

          <!-- 操作按钮 -->
          <div class="search-actions">
            <Button
              :label="t('common.search')"
              icon="pi pi-search"
              @click="handleSearch"
              class="w-full"
            />
            <Button
              :label="t('common.reset')"
              icon="pi pi-refresh"
              severity="secondary"
              text
              @click="handleReset"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import type { CategoryListParams } from '@/types/api/category'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'search', params: CategoryListParams): void
  (e: 'reset'): void
}>()

// 移动端搜索面板展开状态
const isMobileSearchOpen = ref(false)

// 搜索参数
const searchParams = ref<CategoryListParams>({
  keyword: '',
})

// 切换移动端搜索面板
function toggleMobileSearch() {
  isMobileSearchOpen.value = !isMobileSearchOpen.value
}

// 处理搜索
function handleSearch() {
  const params: CategoryListParams = {}

  // 只传递有值的参数
  if (searchParams.value.keyword && searchParams.value.keyword.trim()) {
    params.keyword = searchParams.value.keyword.trim()
  }

  emit('search', params)
}

// 处理重置
function handleReset() {
  searchParams.value = {
    keyword: '',
  }
  emit('reset')
}
</script>

<style scoped>
.mobile-search {
  width: 100%;
}

.search-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 10px 10px 0 0;
  background: var(--color-bg-card);
  transition: background-color 0.2s ease;
}

.search-toggle:hover {
  background: var(--color-bg-hover);
}

.search-toggle i:first-child {
  color: var(--color-primary-500);
  margin-right: 8px;
}

.search-toggle span {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.search-toggle i:last-child {
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.search-content {
  padding: 16px;
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
}

.search-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.search-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

/* 滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 深色主题适配 */
:global(.dark) .search-toggle {
  background: var(--color-bg-card);
}

:global(.dark) .search-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
}

:global(.dark) .search-content {
  background: var(--color-bg-card);
  border-top-color: var(--color-border);
}

:global(.dark) .field-group label {
  color: var(--color-text-primary);
}
</style>