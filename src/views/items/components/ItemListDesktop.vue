<template>
  <div class="content-card">
    <DataTable
      :value="items"
      :loading="loading"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
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
          <span :class="getExpiredClass(slotProps.data.expired_at)" class="text-sm">
            {{ formatDateTime(slotProps.data.expired_at) }}
          </span>
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
      <Column :header="t('common.actions')" align="center">
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
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { formatDateTime } from '@/utils'
import { type Item, type ItemStatus } from '@/api/item'
import { type Category } from '@/api/category'

const { t } = useI18n()

interface Props {
  items: Item[]
  categories: Category[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', item: Item): void
  (e: 'markUsed', id: number): void
  (e: 'delete', id: number): void
}>()

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
  background: var(--surface-card, #ffffff);
  border-radius: 10px;
  border: 1px solid var(--surface-border, #e5e7eb);
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 过期文本颜色 - 遵循设计规范 */
.expired-text {
  color: var(--color-danger, #ef4444);
  font-weight: 500;
}

.warning-text {
  color: var(--color-warning, #f59e0b);
  font-weight: 500;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  justify-content: center;
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
