<template>
  <div class="category-view">
    <div class="page-header">
      <div class="page-header-left">
        <i class="pi pi-folder text-xl mr-2"></i>
        <h1 class="page-title">{{ t('category.title') }}</h1>
      </div>
      <Button :label="t('category.add')" icon="pi pi-plus" @click="openCreateDialog" />
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
                @click="openEditDialog(slotProps.data)"
                v-tooltip.top="t('common.edit')"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                @click="confirmDelete(slotProps.data)"
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
        <label class="form-label"
          >{{ t('category.name') }} <span class="text-danger">*</span></label
        >
        <InputText
          v-model="formData.name"
          :placeholder="t('category.namePlaceholder')"
          :class="{ 'p-invalid': validationErrors.name }"
        />
        <small v-if="validationErrors.name" class="p-error">{{ validationErrors.name }}</small>
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('category.color') }}</label>
        <InputText v-model="formData.color" :placeholder="t('category.colorPlaceholder')" />
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('category.icon') }}</label>
        <InputText v-model="formData.icon" :placeholder="t('category.iconPlaceholder')" />
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('category.sortOrder') }}</label>
        <InputNumber v-model="formData.sort_order" :min="0" />
      </div>
      <template #footer>
        <Button
          :label="t('common.cancel')"
          severity="secondary"
          text
          @click="dialogVisible = false"
        />
        <Button :label="t('common.save')" icon="pi pi-check" @click="handleSubmit" />
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import ConfirmDialog from 'primevue/confirmdialog'
import { formatDateTime } from '@/utils'
import { useToast } from '@/composables'
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CreateCategoryParams,
} from '@/api/category'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()

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

// 校验错误
const validationErrors = ref<{
  name?: string
}>({})

// 加载分类列表
async function loadCategoryList() {
  loading.value = true
  try {
    const res = await getCategoryList()
    categoryList.value = res.data.list
  } catch (error) {
    console.error('Failed to load categories:', error)
    toast.error(t('category.message.createFailed'))
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
  validationErrors.value = {}
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
  validationErrors.value = {}
  dialogVisible.value = true
}

// 表单校验
function validateForm(): boolean {
  validationErrors.value = {}

  if (!formData.value.name || formData.value.name.trim() === '') {
    validationErrors.value.name = t('category.validation.nameRequired')
    return false
  }

  return true
}

// 提交表单
async function handleSubmit() {
  // 校验表单
  if (!validateForm()) {
    toast.warn(t('category.validation.nameRequired'), t('common.warning'))
    return
  }

  try {
    if (isEdit.value && editingId.value) {
      await updateCategory({
        category_id: editingId.value,
        ...formData.value,
      })
      toast.success(t('category.message.updateSuccess'))
    } else {
      await createCategory(formData.value)
      toast.success(t('category.message.createSuccess'))
    }
    dialogVisible.value = false
    loadCategoryList()
  } catch (error) {
    console.error('Failed to save category:', error)
    if (isEdit.value) {
      toast.error(t('category.message.updateFailed'))
    } else {
      toast.error(t('category.message.createFailed'))
    }
  }
}

// 确认删除
function confirmDelete(category: Category) {
  confirm.require({
    message: t('category.message.deleteConfirmMessage'),
    header: t('category.message.deleteConfirmTitle'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: t('common.cancel'),
      severity: 'secondary',
      text: true,
    },
    acceptProps: {
      label: t('common.delete'),
      severity: 'danger',
    },
    accept: () => {
      handleDelete(category.category_id)
    },
  })
}

// 删除分类
async function handleDelete(categoryId: number) {
  try {
    await deleteCategory(categoryId)
    toast.success(t('category.message.deleteSuccess'))
    loadCategoryList()
  } catch (error) {
    console.error('Failed to delete category:', error)
    toast.error(t('category.message.deleteFailed'))
  }
}

// 生命周期
onMounted(() => {
  loadCategoryList()
})
</script>

<style scoped>
.category-view {
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

.page-header-left i {
  color: var(--color-primary-500);
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

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

.form-field {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.text-danger {
  color: var(--color-danger);
}

.text-secondary {
  color: var(--color-text-secondary);
}

.form-field :deep(.p-inputtext),
.form-field :deep(.p-inputnumber) {
  width: 100%;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .page-title {
    font-size: 18px;
  }

  .content-card {
    padding: 12px;
  }
}
</style>
