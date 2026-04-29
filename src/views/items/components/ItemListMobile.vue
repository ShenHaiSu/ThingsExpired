<template>
  <div class="mobile-list">
    <!-- 物品卡片列表 -->
    <div class="cards-container">
      <div
        v-for="item in items"
        :key="item.item_id"
        class="item-card"
        :class="getCardClass(item.expired_at)"
      >
        <!-- 卡片头部：名称和状态 -->
        <div class="card-header">
          <div class="item-name">{{ item.name }}</div>
          <Tag
            :severity="getStatusSeverity(item.status)"
            :value="getStatusText(item.status)"
            rounded
            class="status-tag"
          />
        </div>

        <!-- 卡片内容：关键信息 -->
        <div class="card-content">
          <div class="info-row">
            <span class="info-label">{{ t('items.category') }}:</span>
            <Tag
              :value="getCategoryName(item.category_id)"
              severity="success"
              rounded
              class="category-tag"
            />
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('items.quantity') }}:</span>
            <span class="info-value">{{ item.quantity }} {{ item.unit }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('items.expiredAt') }}:</span>
            <span :class="getExpiredClass(item.expired_at)" class="info-value">
              {{ formatDateTime(item.expired_at) }}
            </span>
          </div>
        </div>

        <!-- 卡片操作栏 -->
        <div class="card-actions">
          <Button
            icon="pi pi-pencil"
            text
            rounded
            severity="secondary"
            @click="emit('edit', item)"
            v-tooltip.top="t('common.edit')"
          />
          <Button
            icon="pi pi-check"
            text
            rounded
            severity="success"
            @click="emit('markUsed', item.item_id)"
            v-tooltip.top="t('items.markAsUsed')"
          />
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            @click="emit('delete', item.item_id)"
            v-tooltip.top="t('common.delete')"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="items.length === 0" class="empty-state">
        <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
        <p>{{ t('common.noData') }}</p>
      </div>
    </div>

    <!-- 自定义分页器 -->
    <Pagination
      :total="pagination.total"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :page-size-options="[5, 10, 20, 50]"
      @update:current-page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { formatDateTime } from '@/utils'
import { type Item, type ItemStatus } from '@/api/item'
import { type Category } from '@/api/category'
import Pagination from '@/components/common/Pagination.vue'

const { t } = useI18n()

interface Props {
  items: Item[]
  categories: Category[]
  loading: boolean
  pagination: {
    total: number
    page: number
    pageSize: number
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', item: Item): void
  (e: 'markUsed', id: number): void
  (e: 'delete', id: number): void
  (e: 'page-change', page: number): void
  (e: 'page-size-change', size: number): void
}>()

function handlePageChange(page: number) {
  emit('page-change', page)
}

function handlePageSizeChange(size: number) {
  emit('page-size-change', size)
}

function getCategoryName(categoryId: number): string {
  const category = props.categories.find((c) => c.category_id === categoryId)
  return category ? category.name : 'Unknown'
}

function getExpiredClass(expiredAt: string): string {
  const now = new Date()
  const expired = new Date(expiredAt)
  const diffDays = Math.ceil((expired.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired-text'
  if (diffDays <= 7) return 'warning-text'
  return ''
}

function getCardClass(expiredAt: string): string {
  const now = new Date()
  const expired = new Date(expiredAt)
  const diffDays = Math.ceil((expired.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'card-expired'
  if (diffDays <= 7) return 'card-warning'
  return ''
}

function getStatusSeverity(
  status: ItemStatus,
): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
  const map: Record<ItemStatus, 'success' | 'danger' | 'info'> = {
    1: 'success', // 正常 - 绿色
    2: 'danger', // 已过期 - 红色
    3: 'info', // 已消耗 - 青色（替代蓝色）
  }
  return map[status]
}

function getStatusText(status: ItemStatus): string {
  const map: Record<ItemStatus, string> = {
    1: 'items.status.normal',
    2: 'items.status.expired',
    3: 'items.status.used',
  }
  return t(map[status])
}
</script>

<style scoped>
.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  background: var(--surface-card, #ffffff);
  border-radius: 10px;
  border: 1px solid var(--surface-border, #e5e7eb);
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 过期状态边框高亮 */
.card-expired {
  border-left: 4px solid var(--color-danger, #ef4444);
}

.card-warning {
  border-left: 4px solid var(--color-warning, #f59e0b);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-color, #1f2937);
  flex: 1;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-tag {
  flex-shrink: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-label {
  color: var(--text-color-secondary, #6b7280);
  flex-shrink: 0;
}

.info-value {
  color: var(--text-color, #1f2937);
}

.category-tag {
  font-size: 11px;
  padding: 2px 6px;
}

/* 过期文本颜色 */
.expired-text {
  color: var(--color-danger, #ef4444);
  font-weight: 500;
}

.warning-text {
  color: var(--color-warning, #f59e0b);
  font-weight: 500;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--surface-border, #e5e7eb);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-color-secondary, #6b7280);
}
</style>
