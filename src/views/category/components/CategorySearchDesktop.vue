<template>
  <div class="desktop-search">
    <div class="search-header">
      <h3 class="search-title">
        <i class="pi pi-search"></i>
        {{ t('category.search.title') }}
      </h3>
    </div>

    <div class="search-fields">
      <div class="search-grid">
        <!-- 名称关键词搜索 -->
        <div class="field-group keyword-field">
          <label>{{ t('category.search.keyword') }}</label>
          <InputText
            v-model="searchParams.keyword"
            :placeholder="t('category.search.keywordPlaceholder')"
            class="w-full"
          />
        </div>

        <!-- 搜索按钮 -->
        <div class="field-group button-field">
          <label>&nbsp;</label>
          <Button
            :label="t('common.search')"
            icon="pi pi-search"
            class="w-full"
            @click="handleSearch"
          />
        </div>

        <!-- 重置按钮 -->
        <div class="field-group button-field">
          <label>&nbsp;</label>
          <Button
            :label="t('common.reset')"
            icon="pi pi-refresh"
            severity="secondary"
            text
            class="w-full"
            @click="handleReset"
          />
        </div>
      </div>
    </div>
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

// 搜索参数
const searchParams = ref<CategoryListParams>({
  keyword: '',
})

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
.desktop-search {
  width: 100%;
}

.search-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.search-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.search-title i {
  color: var(--color-primary-500);
}

.search-fields {
  padding: 16px;
}

.search-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
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

.button-field .w-full {
  height: 100%;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .search-grid {
    grid-template-columns: 1fr 1fr;
  }

  .keyword-field {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .search-grid {
    grid-template-columns: 1fr;
  }

  .keyword-field {
    grid-column: span 1;
  }
}

/* 深色主题适配 */
:global(.dark) .search-header {
  border-bottom-color: var(--color-border);
}

:global(.dark) .search-title {
  color: var(--color-text-primary);
}

:global(.dark) .search-fields {
  background: var(--color-bg-card);
}

:global(.dark) .field-group label {
  color: var(--color-text-primary);
}
</style>