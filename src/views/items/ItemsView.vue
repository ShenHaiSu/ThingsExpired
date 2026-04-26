<template>
  <div class="items-view">
    <div class="page-header">
      <h1>{{ t('items.title') }}</h1>
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
      <Card>
        <template #title>{{ t('items.stats.total') }}</template>
        <template #content>
          <div class="stat-value">{{ stats.total }}</div>
        </template>
      </Card>
      <Card>
        <template #title>{{ t('items.stats.expiringSoon') }}</template>
        <template #content>
          <div class="stat-value warning">{{ stats.expiring_soon }}</div>
        </template>
      </Card>
      <Card>
        <template #title>{{ t('items.stats.expired') }}</template>
        <template #content>
          <div class="stat-value danger">{{ stats.expired }}</div>
        </template>
      </Card>
      <Card>
        <template #title>{{ t('items.stats.used') }}</template>
        <template #content>
          <div class="stat-value success">{{ stats.used }}</div>
        </template>
      </Card>
    </div>

    <!-- 物品列表 -->
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
      <Column field="name" :header="t('items.name')" sortable />
      <Column field="category_name" :header="t('items.category')">
        <template #body="slotProps">
          <Tag :value="slotProps.data.category_name" />
        </template>
      </Column>
      <Column field="quantity" :header="t('items.quantity')">
        <template #body="slotProps">
          {{ slotProps.data.quantity }} {{ slotProps.data.unit }}
        </template>
      </Column>
      <Column field="expired_at" :header="t('items.expiredAt')" sortable>
        <template #body="slotProps">
          <span :class="getExpiredClass(slotProps.data.expired_at)">
            {{ formatDateTime(slotProps.data.expired_at) }}
          </span>
        </template>
      </Column>
      <Column field="status" :header="t('items.status.title')">
        <template #body="slotProps">
          <Tag :severity="getStatusSeverity(slotProps.data.status)" :value="getStatusText(slotProps.data.status)" />
        </template>
      </Column>
      <Column :header="t('common.actions')">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            text
            rounded
            @click="openEditDialog(slotProps.data)"
          />
          <Button
            icon="pi pi-check"
            text
            rounded
            severity="success"
            @click="handleMarkUsed(slotProps.data.item_id)"
            :title="t('items.markAsUsed')"
          />
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            @click="handleDelete(slotProps.data.item_id)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- 创建/编辑对话框 -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? t('items.edit') : t('items.create')"
      modal
      :style="{ width: '500px' }"
    >
      <div class="form-field">
        <label>{{ t('items.name') }} *</label>
        <InputText v-model="formData.name" />
      </div>
      <div class="form-field">
        <label>{{ t('items.category') }} *</label>
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
          <label>{{ t('items.quantity') }}</label>
          <InputNumber v-model="formData.quantity" :min="1" />
        </div>
        <div class="form-field">
          <label>{{ t('items.unit') }}</label>
          <InputText v-model="formData.unit" />
        </div>
      </div>
      <div class="form-field">
        <label>{{ t('items.expiredAt') }} *</label>
        <DatePicker v-model="expiredAtDate" showTime hourFormat="24" />
      </div>
      <div class="form-field">
        <label>{{ t('items.description') }}</label>
        <Textarea v-model="formData.description" rows="3" />
      </div>
      <div class="form-field">
        <label>{{ t('items.remindDays') }}</label>
        <InputNumber v-model="formData.remind_days" :min="0" :max="365" />
      </div>
      <template #footer>
        <Button :label="t('common.cancel')" text @click="dialogVisible = false" />
        <Button :label="t('common.save')" @click="handleSubmit" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Card from 'primevue/card'
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

  if (diffDays < 0) return 'text-danger'
  if (diffDays <= 7) return 'text-warning'
  return ''
}

// 获取状态严重程度
function getStatusSeverity(status: ItemStatus): 'success' | 'info' | 'warn' | 'danger' | undefined {
  const map: Record<ItemStatus, 'success' | 'info' | 'warn' | 'danger'> = {
    1: 'info',
    2: 'warn',
    3: 'danger',
    4: 'success',
  }
  return map[status]
}

// 获取状态文本
function getStatusText(status: ItemStatus): string {
  const map: Record<ItemStatus, string> = {
    1: 'items.status.normal',
    2: 'items.status.expiringSoon',
    3: 'items.status.expired',
    4: 'items.status.used',
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
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.text-danger {
  color: #ef4444;
}

.text-warning {
  color: #f59e0b;
}

.table-header {
  display: flex;
  justify-content: flex-end;
}

.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
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
</style>
