<template>
  <div class="content-card">
    <DataTable
      :value="items"
      :loading="loading"
      :paginator="false"
      stripedRows
      tableStyle="min-width: 50rem"
      :removableSort="true"
      responsiveLayout="scroll"
    >
      <Column field="name" :header="t('items.name')" sortable>
        <template #body="slotProps">
          <span class="font-medium">{{ slotProps.data.name }}</span>
        </template>
      </Column>
      <Column field="category_id" :header="t('items.category')">
        <template #body="slotProps">
          <Tag :value="getCategoryName(slotProps.data.category_id)" severity="success" rounded />
        </template>
      </Column>
      <Column field="quantity" :header="t('items.quantity')">
        <template #body="slotProps">
          <span class="text-sm">{{ slotProps.data.quantity }} {{ slotProps.data.unit }}</span>
        </template>
      </Column>
      <Column field="expired_at" :header="t('items.expiredAt')" sortable>
        <template #body="slotProps">
          <div class="flex flex-col items-start">
            <span
              :class="getExpiredTextClass(slotProps.data.expired_at)"
              class="text-sm font-medium"
            >
              {{ getExpiredDisplayText(slotProps.data.expired_at) }}
            </span>
            <span :class="getExpiredDateClass(slotProps.data.expired_at)" class="text-xs">
              {{ formatDate(slotProps.data.expired_at) }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="status" :header="t('items.status.title')" align="center">
        <template #body="slotProps">
          <Tag
            :severity="getStatusSeverity(slotProps.data.status)"
            :value="getStatusText(slotProps.data.status)"
            rounded
          />
        </template>
      </Column>
      <Column :header="t('common.actions')" headerStyle="text-align: end;">
        <template #body="slotProps">
          <div class="action-buttons">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              severity="secondary"
              @click="emit('edit', slotProps.data)"
              v-tooltip.top="t('common.edit')"
            />
            <Button
              icon="pi pi-check"
              text
              rounded
              severity="success"
              @click="emit('markUsed', slotProps.data.item_id)"
              v-tooltip.top="t('items.markAsUsed')"
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              @click="emit('delete', slotProps.data.item_id)"
              v-tooltip.top="t('common.delete')"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 自定义分页器 -->
    <Pagination
      :total="pagination.total"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :page-size-options="[
        { label: '5', value: 5 },
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '50', value: 50 },
      ]"
      @update:current-page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { formatDateTime, formatDate } from '@/utils'
import { getExpireDisplayInfo, getExpireStatus } from '@/utils/date'
import type { ExpireStatus } from '@/utils/date'
import type { Item, ItemStatus } from '@/types/api/item'
import type { Category } from '@/types/api/category'
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
  defaultMode?: 'production' | 'expiry'
}

const props = withDefaults(defineProps<Props>(), {
  defaultMode: 'production',
})

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

// 获取过期时间文本样式类
function getExpiredTextClass(expiredAt: string): string {
  const status = getExpireStatus(expiredAt)
  
  switch (status) {
    case 'expired':
      return 'expire-expired-text'
    case 'expiring':
      return 'expire-expiring-text'
    default:
      return 'expire-normal-text'
  }
}

// 获取过期日期样式类
function getExpiredDateClass(expiredAt: string): string {
  const status = getExpireStatus(expiredAt)
  
  switch (status) {
    case 'expired':
      return 'expire-expired-date'
    case 'expiring':
      return 'expire-expiring-date'
    default:
      return 'expire-normal-date'
  }
}

// 获取过期时间显示文本（支持i18n）
function getExpiredDisplayText(expiredAt: string): string {
  const info = getExpireDisplayInfo(expiredAt)
  
  // 根据不同的文本类型，使用i18n进行翻译
  switch (info.text) {
    case 'daysAgoExpired':
      return `${info.days} ${t('items.daysAgoExpired')}`
    case 'hoursAgoExpired':
      return `${info.hours} ${t('items.hoursAgoExpired')}`
    case 'hoursUntilExpired':
      return `${info.hours} ${t('items.hoursUntilExpired')}`
    case 'daysUntilExpired':
      return `${info.days} ${t('items.daysUntilExpired')}`
    default:
      return ''
  }
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
.content-card {
  background: var(--color-bg-card);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  padding: 16px;
  box-shadow: 0 1px 3px var(--color-shadow);
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  justify-content: start;
  gap: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .content-card {
    padding: 12px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
