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
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import ItemStatsCard from './components/ItemStatsCard.vue'
import ItemSearch from './components/ItemSearch.vue'
import ItemListDesktop from './components/ItemListDesktop.vue'
import ItemListMobile from './components/ItemListMobile.vue'
import ItemEditDialog from './components/ItemEditDialog.vue'
import {
  getItemList,
  getItemStats,
  createItem,
  updateItem,
  deleteItem,
  markItemAsUsed,
  type Item,
  type CreateItemParams,
  type ItemSearchParams,
} from '@/api/item'
import { getCategoryList, type Category } from '@/api/category'

const { t } = useI18n()

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
    // 构建查询参数，处理类型转换
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }

    // 复制搜索参数，处理类型转换
    const searchParams = currentSearchParams.value
    if (searchParams.name) params.keyword = searchParams.name
    if (searchParams.category_id) params.category_id = searchParams.category_id
    if (searchParams.status) params.status = searchParams.status as 1 | 2 | 3
    if (searchParams.order_by) params.sort_by = searchParams.order_by
    if (searchParams.order) params.sort_order = searchParams.order

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
  try {
    if (isEdit.value && data.item_id) {
      await updateItem({
        item_id: data.item_id,
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        expired_at: data.expired_at,
        remind_days: data.remind_days,
      })
    } else {
      await createItem(data)
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
  max-width: 1200px;
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
  color: var(--text-color, #1f2937);
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
