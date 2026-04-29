<template>
  <div class="items-view">
    <div class="page-header">
      <div class="page-header-left">
        <i class="pi pi-box text-green-500 text-xl mr-2"></i>
        <h1 class="page-title">{{ t('items.title') }}</h1>
      </div>
      <div class="header-actions">
        <Button
          :label="t('items.add')"
          icon="pi pi-plus"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-green-50">
          <i class="pi pi-box text-green-500"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('items.stats.total') }}</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-orange-50">
          <i class="pi pi-clock text-orange-500"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('items.stats.expiringSoon') }}</span>
          <span class="stat-value text-orange-500">{{ stats.expiring_soon }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-red-50">
          <i class="pi pi-exclamation-triangle text-red-500"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('items.stats.expired') }}</span>
          <span class="stat-value text-red-500">{{ stats.expired }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-teal-50">
          <i class="pi pi-check-circle text-teal-500"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('items.stats.used') }}</span>
          <span class="stat-value text-teal-500">{{ stats.used }}</span>
        </div>
      </div>
    </div>

    <!-- 物品列表 -->
    <div class="content-card">
      <DataTable
        :value="itemList"
        :loading="loading"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        stripedRows
        tableStyle="min-width: 50rem"
        :filters="filters"
      >
        <template #header>
          <div class="table-header">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters['global'].value" :placeholder="t('common.search')" />
            </IconField>
          </div>
        </template>
        <Column field="name" :header="t('items.name')" sortable>
          <template #body="slotProps">
            <span class="font-medium">{{ slotProps.data.name }}</span>
          </template>
        </Column>
        <Column field="category_name" :header="t('items.category')">
          <template #body="slotProps">
            <Tag :value="slotProps.data.category_name" severity="success" rounded />
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
            <Tag :severity="getStatusSeverity(slotProps.data.status)" :value="getStatusText(slotProps.data.status)" rounded />
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
                @click="openEditDialog(slotProps.data)"
                v-tooltip.top="t('common.edit')"
              />
              <Button
                icon="pi pi-check"
                text
                rounded
                severity="success"
                @click="handleMarkUsed(slotProps.data.item_id)"
                v-tooltip.top="t('items.markAsUsed')"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                @click="handleDelete(slotProps.data.item_id)"
                v-tooltip.top="t('common.delete')"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- 创建/编辑对话框 -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? t('items.edit') : t('items.create')"
      modal
      :style="{ width: '520px' }"
      :breakpoints="{ '640px': '90vw' }"
    >
      <div class="form-field">
        <label class="form-label">{{ t('items.name') }} <span class="text-red-500">*</span></label>
        <InputText v-model="formData.name" :placeholder="t('items.namePlaceholder')" />
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('items.category') }} <span class="text-red-500">*</span></label>
        <Select
          v-model="formData.category_id"
          :options="categoryOptions"
          optionLabel="name"
          optionValue="category_id"
          :placeholder="t('items.selectCategory')"
        />
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">{{ t('items.quantity') }}</label>
          <InputNumber v-model="formData.quantity" :min="1" />
        </div>
        <div class="form-field">
          <label class="form-label">{{ t('items.unit') }}</label>
          <InputText v-model="formData.unit" :placeholder="t('items.unitPlaceholder')" />
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('items.expiredAt') }} <span class="text-red-500">*</span></label>
        <DatePicker v-model="expiredAtDate" showTime hourFormat="24" />
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('items.description') }}</label>
        <Textarea v-model="formData.description" rows="3" />
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('items.remindDays') }}</label>
        <InputNumber v-model="formData.remind_days" :min="0" :max="365" />
      </div>
      <template #footer>
        <Button :label="t('common.cancel')" severity="secondary" text @click="dialogVisible = false" />
        <Button :label="t('common.save')" icon="pi pi-check" @click="handleSubmit" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { formatDateTime } from '@/utils'
import {
  getItemList,
  getItemStats,
  createItem,
  updateItem,
  deleteItem,
  markItemAsUsed,
  type Item,
  type CreateItemParams,
  type ItemStatus,
} from '@/api/item'
import { getCategoryList, type Category } from '@/api/category'

const { t } = useI18n()

// 状态
const itemList = ref<Item[]>([])
const categoryList = ref<Category[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

// 统计数据
const stats = ref({
  total: 0,
  expiring_soon: 0,
  expired: 0,
  used: 0,
})

// 筛选器
const filters = ref({
  global: { value: null, matchMode: 'contains' },
})

// 分类选项
const categoryOptions = computed(() =>
  categoryList.value.map((c) => ({
    category_id: c.category_id,
    name: c.name,
  }))
)

// 表单数据
const formData = ref<CreateItemParams>({
  name: '',
  category_id: 0,
  quantity: 1,
  unit: '',
  expired_at: '',
  description: '',
  remind_days: 3,
})

// 过期时间（用于 DatePicker 绑定）
const expiredAtDate = computed({
  get() {
    return formData.value.expired_at ? new Date(formData.value.expired_at) : null
  },
  set(val: Date | null) {
    formData.value.expired_at = val ? val.toISOString() : ''
  },
})

// 加载物品列表
async function loadItemList() {
  loading.value = true
  try {
    const res = await getItemList()
    itemList.value = res.data.list
  } catch (error) {
    console.error('Failed to load items:', error)
  } finally {
    loading.value = false
  }
}

// 加载统计数据
async function loadStats() {
  try {
    const res = await getItemStats()
    stats.value = res.data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// 加载分类列表
async function loadCategoryList() {
  try {
    const res = await getCategoryList()
    categoryList.value = res.data.list
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

// 获取过期样式
function getExpiredClass(expiredAt: string): string {
  const now = new Date()
  const expired = new Date(expiredAt)
  const diffDays = Math.ceil((expired.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired-text'
  if (diffDays <= 7) return 'warning-text'
  return ''
}

// 获取状态严重程度 - 按照设计规范使用绿色系
function getStatusSeverity(status: ItemStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
  const map: Record<ItemStatus, 'success' | 'danger' | 'info'> = {
    1: 'success',    // 正常 - 绿色
    2: 'danger',     // 已过期 - 红色
    3: 'info',       // 已消耗 - 青色（替代蓝色）
  }
  return map[status]
}

// 获取状态文本
function getStatusText(status: ItemStatus): string {
  const map: Record<ItemStatus, string> = {
    1: 'items.status.normal',
    2: 'items.status.expired',
    3: 'items.status.used',
  }
  return t(map[status])
}

// 打开创建对话框
function openCreateDialog() {
  isEdit.value = false
  formData.value = {
    name: '',
    category_id: categoryList.value[0]?.category_id || 0,
    quantity: 1,
    unit: '',
    expired_at: '',
    description: '',
    remind_days: 3,
  }
  dialogVisible.value = true
}

// 打开编辑对话框
function openEditDialog(item: Item) {
  isEdit.value = true
  editingId.value = item.item_id
  formData.value = {
    name: item.name,
    category_id: item.category_id,
    quantity: item.quantity,
    unit: item.unit,
    expired_at: item.expired_at,
    description: item.description,
    remind_days: item.remind_days,
  }
  dialogVisible.value = true
}

// 提交表单
async function handleSubmit() {
  try {
    if (isEdit.value && editingId.value) {
      await updateItem({
        item_id: editingId.value,
        ...formData.value,
      })
    } else {
      await createItem(formData.value)
    }
    dialogVisible.value = false
    loadItemList()
    loadStats()
  } catch (error) {
    console.error('Failed to save item:', error)
  }
}

// 删除物品
async function handleDelete(itemId: number) {
  try {
    await deleteItem(itemId)
    loadItemList()
    loadStats()
  } catch (error) {
    console.error('Failed to delete item:', error)
  }
}

// 标记为已使用
async function handleMarkUsed(itemId: number) {
  try {
    await markItemAsUsed(itemId)
    loadItemList()
    loadStats()
  } catch (error) {
    console.error('Failed to mark item as used:', error)
  }
}

// 生命周期
onMounted(() => {
  loadItemList()
  loadStats()
  loadCategoryList()
})
</script>

<style scoped>
.items-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-color, #1f2937);
  margin: 0;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--surface-card, #ffffff);
  border-radius: 10px;
  border: 1px solid var(--surface-border, #e5e7eb);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 1.25rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-color-secondary, #6b7280);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color, #1f2937);
  line-height: 1;
}

/* 内容卡片 */
.content-card {
  background: var(--surface-card, #ffffff);
  border-radius: 10px;
  border: 1px solid var(--surface-border, #e5e7eb);
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: flex-end;
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

/* 表单样式 */
.form-field {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, #1f2937);
}

.form-field :deep(.p-inputtext),
.form-field :deep(.p-select),
.form-field :deep(.p-inputnumber),
.form-field :deep(.p-textarea),
.form-field :deep(.p-datepicker) {
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
