<template>
  <div class="mobile-list">
    <!-- 分类卡片列表 -->
    <div class="cards-container">
      <div
        v-for="category in categories"
        :key="category.category_id"
        class="category-card"
      >
        <!-- 卡片头部：名称和颜色标识 -->
        <div class="card-header">
          <div class="category-info">
            <span
              class="color-dot"
              :style="{ backgroundColor: category.color || '#22c55e' }"
            ></span>
            <span class="category-name">{{ category.name }}</span>
          </div>
          <div class="card-actions">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              severity="secondary"
              size="small"
              @click="emit('edit', category)"
              v-tooltip.top="t('common.edit')"
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              size="small"
              @click="emit('delete', category)"
              v-tooltip.top="t('common.delete')"
            />
          </div>
        </div>

        <!-- 卡片内容：关键信息 -->
        <div class="card-content">
          <div class="info-row">
            <span class="info-label">{{ t('category.icon') }}:</span>
            <span class="info-value">{{ category.icon || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('category.sortOrder') }}:</span>
            <span class="info-value">{{ category.sort_order }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('category.createdAt') }}:</span>
            <span class="info-value">{{ formatDateTime(category.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="categories.length === 0 && !loading" class="empty-state">
        <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
        <p>{{ t('common.noData') }}</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner text-4xl text-primary-500 mb-4"></i>
        <p>{{ t('common.loading') }}</p>
      </div>
    </div>

    <!-- 分页组件 - 放在组件末尾 -->
    <Pagination
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import { formatDateTime } from '@/utils'
import type { Category } from '@/api/category'
import Pagination from '@/components/common/Pagination.vue'

const { t } = useI18n()

interface Props {
  categories: Category[]
  loading: boolean
  total: number
  currentPage: number
  pageSize: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', category: Category): void
  (e: 'delete', category: Category): void
  (e: 'page-change', page: number): void
  (e: 'page-size-change', size: number): void
}>()

// 处理分页变化
function handlePageChange(page: number) {
  emit('page-change', page)
}

// 处理每页数量变化
function handlePageSizeChange(size: number) {
  emit('page-size-change', size)
}
</script>

<style scoped>
.mobile-list {
  width: 100%;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-card {
  background: var(--color-bg-card);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  padding: 16px;
  box-shadow: 0 1px 3px var(--color-shadow);
  transition: box-shadow 0.2s ease;
}

.category-card:hover {
  box-shadow: 0 2px 6px var(--color-shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-actions {
  display: flex;
  gap: 4px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--color-text-primary);
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  background: var(--color-bg-card);
  border-radius: 10px;
  border: 1px solid var(--color-border);
}

.empty-state p,
.loading-state p {
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 深色主题适配 */
:global(.dark) .category-card {
  background: var(--color-bg-card);
  border-color: var(--color-border);
}

:global(.dark) .empty-state,
:global(.dark) .loading-state {
  background: var(--color-bg-card);
  border-color: var(--color-border);
}
</style>