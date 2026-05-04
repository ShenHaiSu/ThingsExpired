<template>
  <div class="content-card">
    <DataTable
      :value="categories"
      :loading="loading"
      stripedRows
      tableStyle="min-width: 50rem"
      :rows="10"
      :paginator="categories.length > 10"
    >
      <Column field="name" :header="t('category.name')">
        <template #body="slotProps">
          <div class="category-name">
            <span
              class="color-dot"
              :style="{ backgroundColor: slotProps.data.color || '#22c55e' }"
            ></span>
            <span class="font-medium">{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="icon" :header="t('category.icon')">
        <template #body="slotProps">
          <span class="text-secondary">{{ slotProps.data.icon || '-' }}</span>
        </template>
      </Column>
      <Column field="sort_order" :header="t('category.sortOrder')" />
      <Column field="created_at" :header="t('category.createdAt')">
        <template #body="slotProps">
          <span class="text-sm text-secondary">
            {{ formatDateTime(slotProps.data.created_at) }}
          </span>
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
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              @click="emit('delete', slotProps.data)"
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
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { formatDateTime } from '@/utils'
import type { Category } from '@/api/category'

const { t } = useI18n()

interface Props {
  categories: Category[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [category: Category]
  delete: [category: Category]
}>()
</script>

<style scoped>
.content-card {
  background: var(--color-bg-card);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  padding: 16px;
  box-shadow: 0 1px 3px var(--color-shadow);
}

.category-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.text-secondary {
  color: var(--color-text-secondary);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .content-card {
    padding: 12px;
  }
}
</style>