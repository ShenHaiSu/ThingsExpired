<template>
  <div class="items-view">
    <div class="page-header">
      <div class="page-header-left">
        <i class="pi pi-box text-xl mr-2" style="color: var(--color-primary-500)"></i>
        <h1 class="page-title">{{ t('items.title') }}</h1>
      </div>
      <div class="header-actions">
        <Button
          :label="t('items.add')"
          icon="pi pi-plus"
          @click="openCreateDialog"
          class="w-full sm:w-auto"
        />
      </div>
    </div>

    <!-- 统计卡片 -->
    <ItemStatsCard :stats="stats" />

    <!-- 搜索组件 -->
    <ItemSearch :categories="categoryList" @search="handleSearch" @reset="handleReset" />

    <!-- 物品列表 - 桌面端 -->
    <div class="desktop-only">
      <ItemListDesktop
        :items="filteredItems"
        :categories="categoryList"
        :loading="loading"
        :pagination="pagination"
        :default-mode="'expiry'"
        @edit="openEditDialog"
        @markUsed="handleMarkUsed"
        @delete="handleDelete"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- 物品列表 - 移动端 -->
    <div class="mobile-only">
      <ItemListMobile
        :items="filteredItems"
        :categories="categoryList"
        :loading="loading"
        :pagination="pagination"
        :default-mode="'expiry'"
        @edit="openEditDialog"
        @markUsed="handleMarkUsed"
        @delete="handleDelete"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- 创建/编辑对话框 -->
    <ItemEditDialog
      v-model:visible="dialogVisible"
      :is-edit="isEdit"
      :item="editingItem"
      :categories="categoryList"
      :default-mode="'expiry'"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

// 2. 第三方库
import Button from 'primevue/button'

// 3. 项目内部 - 组件
import ItemStatsCard from './components/ItemStatsCard.vue'
import ItemSearch from './components/ItemSearch.vue'
import ItemListDesktop from './components/ItemListDesktop.vue'
import ItemListMobile from './components/ItemListMobile.vue'
import ItemEditDialog from './components/ItemEditDialog.vue'

// 4. 项目内部 - API
import {
  getItemList,
  getItemStats,
  createItem,
  updateItem,
  deleteItem,
  markItemAsUsed,
} from '@/api'
import { getCategoryList } from '@/api'

// 5. 项目内部 - 类型
import type { Item, CreateItemParams, ItemSearchParams } from '@/types/api/item'
import type { Category } from '@/types/api/category'

// 6. 项目内部 - 工具函数
import { isUtcFormat, toUtcFormat } from '@/utils/date'

// 7. 项目内部 - 组合式函数
import { useToast } from '@/composables'

const { t } = useI18n()
const toast = useToast()

// 状态
const itemList = ref<Item[]>([])
const categoryList = ref<Category[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingItem = ref<Item | null>(null)
const currentSearchParams = ref<ItemSearchParams>({})

// 分页状态
const pagination = ref({
  total: 0,
  page: 1,
  pageSize: 10,
})

// 统计数据
const stats = ref({
  total: 0,
  expiring_soon: 0,
  expired: 0,
  used: 0,
})

// 加载物品列表
async function loadItemList() {
  loading.value = true
  try {
    // 构建查询参数
    const params: any = {
      page: pagination.value.page,
      page_size: pagination.value.pageSize,
    }

    // 复制搜索参数
    const searchParams = currentSearchParams.value

    // 名称搜索（模糊搜索）
    if (searchParams.name) params.name = searchParams.name

    // 描述搜索（模糊搜索）
    if (searchParams.description) params.description = searchParams.description

    // 分类筛选
    if (searchParams.category_id) params.category_id = searchParams.category_id

    // 状态筛选
    if (searchParams.status) params.status = searchParams.status as 1 | 2 | 3

    // 数量范围筛选
    if (searchParams.quantity_min !== undefined) params.quantity_min = searchParams.quantity_min
    if (searchParams.quantity_max !== undefined) params.quantity_max = searchParams.quantity_max

    // 过期时间范围筛选
    if (searchParams.expired_at_from) params.expired_at_from = searchParams.expired_at_from
    if (searchParams.expired_at_to) params.expired_at_to = searchParams.expired_at_to

    // 创建时间范围筛选
    if (searchParams.created_at_from) params.created_at_from = searchParams.created_at_from
    if (searchParams.created_at_to) params.created_at_to = searchParams.created_at_to

    // 排序参数
    if (searchParams.order_by) params.order_by = searchParams.order_by
    if (searchParams.order) params.order = searchParams.order

    const res = await getItemList(params)
    itemList.value = res.data.list
    pagination.value.total = res.data.total
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

// 打开创建对话框
function openCreateDialog() {
  isEdit.value = false
  editingItem.value = null
  dialogVisible.value = true
}

// 打开编辑对话框
function openEditDialog(item: Item) {
  isEdit.value = true
  editingItem.value = item
  dialogVisible.value = true
}

// 提交表单
async function handleSubmit(data: CreateItemParams & { item_id?: number }) {
  // 表单验证
  if (!data.name || data.name.trim() === '') {
    toast.error(t('items.validation.nameRequired'))
    return
  }

  if (!data.category_id || data.category_id === 0) {
    toast.error(t('items.validation.categoryRequired'))
    return
  }

  if (!data.expired_at || data.expired_at.trim() === '') {
    toast.error(t('items.validation.expiredAtRequired'))
    return
  }

  try {
    // 检查并转换过期日期为UTC格式
    let expiredAt = data.expired_at
    if (expiredAt && !isUtcFormat(expiredAt)) {
      expiredAt = toUtcFormat(expiredAt)
    }

    if (isEdit.value && data.item_id) {
      await updateItem({
        item_id: data.item_id,
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        expired_at: expiredAt,
        remind_days: data.remind_days,
      })
      toast.success(t('items.message.updateSuccess'))
    } else {
      await createItem({
        ...data,
        expired_at: expiredAt,
      })
      toast.success(t('items.message.createSuccess'))
    }
    dialogVisible.value = false
    loadItemList()
    loadStats()
  } catch (error: any) {
    console.error('Failed to save item:', error)
    // 根据错误信息显示对应的提示
    const errorMessage = error?.response?.data?.message || error?.message || ''
    if (isEdit.value) {
      toast.error(t('items.message.updateFailed') + (errorMessage ? `: ${errorMessage}` : ''))
    } else {
      toast.error(t('items.message.createFailed') + (errorMessage ? `: ${errorMessage}` : ''))
    }
  }
}

// 删除物品
async function handleDelete(itemId: number) {
  try {
    await deleteItem(itemId)
    toast.success(t('items.message.deleteSuccess'))
    loadItemList()
    loadStats()
  } catch (error: any) {
    console.error('Failed to delete item:', error)
    const errorMessage = error?.response?.data?.message || error?.message || ''
    toast.error(t('items.message.deleteFailed') + (errorMessage ? `: ${errorMessage}` : ''))
  }
}

// 标记为已使用
async function handleMarkUsed(itemId: number) {
  try {
    await markItemAsUsed(itemId)
    toast.success(t('items.message.markUsedSuccess'))
    loadItemList()
    loadStats()
  } catch (error: any) {
    console.error('Failed to mark item as used:', error)
    const errorMessage = error?.response?.data?.message || error?.message || ''
    toast.error(t('items.message.markUsedFailed') + (errorMessage ? `: ${errorMessage}` : ''))
  }
}

// 搜索处理
function handleSearch(params: ItemSearchParams) {
  currentSearchParams.value = params
  pagination.value.page = 1 // 重置到第一页
  loadItemList()
}

function handleReset() {
  currentSearchParams.value = {}
  pagination.value.page = 1 // 重置到第一页
  loadItemList()
}

// 分页处理
function handlePageChange(page: number) {
  pagination.value.page = page
  loadItemList()
}

function handlePageSizeChange(size: number) {
  pagination.value.pageSize = size
  pagination.value.page = 1 // 重置到第一页
  loadItemList()
}

// 过滤物品列表
const filteredItems = computed(() => {
  // 直接返回当前页的数据，因为后端已经处理了分页
  return itemList.value
})

function getCategoryName(categoryId: number): string {
  const category = categoryList.value.find((c) => c.category_id === categoryId)
  return category ? category.name : 'Unknown'
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
  .items-view {
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
