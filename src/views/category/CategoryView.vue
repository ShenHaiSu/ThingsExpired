<template>
  <div class="category-view">
    <div class="page-header">
      <h1>{{ t('category.title') }}</h1>
      <Button
        :label="t('category.add')"
        icon="pi pi-plus"
        @click="openCreateDialog"
      />
    </div>

    <DataTable
      :value="categoryList"
      :loading="loading"
      stripedRows
      tableStyle="min-width: 50rem"
    >
      <Column field="category_id" :header="t('category.id')" />
      <Column field="name" :header="t('category.name')">
        <template #body="slotProps">
          <div class="category-name">
            <span
              class="color-dot"
              :style="{ backgroundColor: slotProps.data.color || '#666' }"
            ></span>
            {{ slotProps.data.name }}
          </div>
        </template>
      </Column>
      <Column field="icon" :header="t('category.icon')" />
      <Column field="sort_order" :header="t('category.sortOrder')" />
      <Column field="created_at" :header="t('category.createdAt')">
        <template #body="slotProps">
          {{ formatDateTime(slotProps.data.created_at) }}
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
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            @click="handleDelete(slotProps.data.category_id)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- 创建/编辑对话框 -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? t('category.edit') : t('category.create')"
      modal
      :style="{ width: '400px' }"
    >
      <div class="form-field">
        <label>{{ t('category.name') }}</label>
        <InputText v-model="formData.name" />
      </div>
      <div class="form-field">
        <label>{{ t('category.color') }}</label>
        <InputText v-model="formData.color" />
      </div>
      <div class="form-field">
        <label>{{ t('category.icon') }}</label>
        <InputText v-model="formData.icon" />
      </div>
      <div class="form-field">
        <label>{{ t('category.sortOrder') }}</label>
        <InputNumber v-model="formData.sort_order" />
      </div>
      <template #footer>
        <Button :label="t('common.cancel')" text @click="dialogVisible = false" />
        <Button :label="t('common.save')" @click="handleSubmit" />
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
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.category-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
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
.form-field :deep(.p-inputnumber) {
  width: 100%;
}
</style>
