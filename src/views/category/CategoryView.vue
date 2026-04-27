<template>
  <div class="category-view">
    <div class="page-header">
      <div class="page-header-left">
        <i class="pi pi-folder text-green-500 text-xl mr-2"></i>
        <h1 class="page-title">{{ t('category.title') }}</h1>
      </div>
      <Button
        :label="t('category.add')"
        icon="pi pi-plus"
        @click="openCreateDialog"
      />
    </div>

    <div class="content-card">
      <DataTable
        :value="categoryList"
        :loading="loading"
        stripedRows
        tableStyle="min-width: 50rem"
        :rows="10"
        :paginator="categoryList.length > 10"
      >
        <Column field="category_id" :header="t('category.id')" />
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
            <span class="text-gray-500">{{ slotProps.data.icon || '-' }}</span>
          </template>
        </Column>
        <Column field="sort_order" :header="t('category.sortOrder')" />
        <Column field="created_at" :header="t('category.createdAt')">
          <template #body="slotProps">
            <span class="text-sm text-gray-500">
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
                @click="openEditDialog(slotProps.data)"
                v-tooltip.top="t('common.edit')"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                @click="handleDelete(slotProps.data.category_id)"
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
      :header="isEdit ? t('category.edit') : t('category.create')"
      modal
      :style="{ width: '450px' }"
      :breakpoints="{ '640px': '90vw' }"
    >
      <div class="form-field">
        <label class="form-label">{{ t('category.name') }} <span class="text-red-500">*</span></label>
        <InputText v-model="formData.name" placeholder="请输入分类名称" />
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('category.color') }}</label>
        <InputText v-model="formData.color" placeholder="如：#22c55e" />
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('category.icon') }}</label>
        <InputText v-model="formData.icon" placeholder="如：pi pi-folder" />
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('category.sortOrder') }}</label>
        <InputNumber v-model="formData.sort_order" :min="0" />
      </div>
      <template #footer>
        <Button :label="t('common.cancel')" severity="secondary" text @click="dialogVisible = false" />
        <Button :label="t('common.save')" icon="pi pi-check" @click="handleSubmit" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { formatDateTime } from '@/utils'
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CreateCategoryParams,
} from '@/api/category'

const { t } = useI18n()

// 状态
const categoryList = ref<Category[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

// 表单数据
const formData = ref<CreateCategoryParams>({
  name: '',
  color: '',
  icon: '',
  sort_order: 0,
})

// 加载分类列表
async function loadCategoryList() {
  loading.value = true
  try {
    const res = await getCategoryList()
    categoryList.value = res.data.list
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    loading.value = false
  }
}

// 打开创建对话框
function openCreateDialog() {
  isEdit.value = false
  formData.value = {
    name: '',
    color: '',
    icon: '',
    sort_order: 0,
  }
  dialogVisible.value = true
}

// 打开编辑对话框
function openEditDialog(category: Category) {
  isEdit.value = true
  editingId.value = category.category_id
  formData.value = {
    name: category.name,
    color: category.color,
    icon: category.icon,
    sort_order: category.sort_order,
  }
  dialogVisible.value = true
}

// 提交表单
async function handleSubmit() {
  try {
    if (isEdit.value && editingId.value) {
      await updateCategory({
        category_id: editingId.value,
        ...formData.value,
      })
    } else {
      await createCategory(formData.value)
    }
    dialogVisible.value = false
    loadCategoryList()
  } catch (error) {
    console.error('Failed to save category:', error)
  }
}

// 删除分类
async function handleDelete(categoryId: number) {
  try {
    await deleteCategory(categoryId)
    loadCategoryList()
  } catch (error) {
    console.error('Failed to delete category:', error)
  }
}

// 生命周期
onMounted(() => {
  loadCategoryList()
})
</script>

<style scoped>
.category-view {
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

.content-card {
  background: var(--surface-card, #ffffff);
  border-radius: 10px;
  border: 1px solid var(--surface-border, #e5e7eb);
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
.form-field :deep(.p-inputnumber) {
  width: 100%;
}
</style>
