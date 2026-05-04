<template>
  <div class="category-view">
    <div class="page-header">
      <div class="page-header-left">
        <i class="pi pi-folder text-xl mr-2"></i>
        <h1 class="page-title">{{ t('category.title') }}</h1>
      </div>
      <Button
        :label="t('category.add')"
        icon="pi pi-plus"
        @click="openCreateDialog"
        class="w-full sm:w-auto"
      />
    </div>

    <!-- 分类列表 - 桌面端 -->
    <div class="desktop-only">
      <CategoryDataListDesktop
        :categories="categoryList"
        :loading="loading"
        @edit="openEditDialog"
        @delete="confirmDelete"
      />
    </div>

    <!-- 分类列表 - 移动端 -->
    <div class="mobile-only">
      <CategoryDataListMobile
        :categories="categoryList"
        :loading="loading"
        @edit="openEditDialog"
        @delete="confirmDelete"
      />
    </div>

    <!-- 创建/编辑对话框 -->
    <CategoryFormDialog
      v-model:visible="dialogVisible"
      :is-edit="isEdit"
      v-model:form-data="formData"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'

// 2. 第三方库
import Button from 'primevue/button'

// 3. 项目内部 - 组件
import CategoryDataListDesktop from './components/CategoryDataListDesktop.vue'
import CategoryDataListMobile from './components/CategoryDataListMobile.vue'
import CategoryFormDialog from './components/CategoryFormDialog.vue'

// 4. 项目内部 - API
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CreateCategoryParams,
} from '@/api/category'

// 5. 项目内部 - 组合式函数
import { useToast } from '@/composables'

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

// 表单提交处理
async function handleFormSubmit(formDataSubmit: CreateCategoryParams) {
  try {
    if (isEdit.value && editingId.value) {
      await updateCategory({
        category_id: editingId.value,
        ...formDataSubmit,
      })
      toast.success(t('category.message.updateSuccess'))
    } else {
      await createCategory(formDataSubmit)
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
  padding: 0 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
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

/* 桌面端显示 */
.desktop-only {
  display: block;
}

/* 移动端隐藏 */
.mobile-only {
  display: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .category-view {
    padding: 0 12px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 18px;
  }

  /* 移动端隐藏桌面端组件 */
  .desktop-only {
    display: none;
  }

  /* 移动端显示移动端组件 */
  .mobile-only {
    display: block;
  }
}
</style>