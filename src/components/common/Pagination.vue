<template>
  <div class="pagination-container">
    <!-- 移动端视图：紧凑布局 -->
    <div v-if="isMobile" class="mobile-pagination">
      <div class="pagination-info">
        <span class="text-sm text-gray-600">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </span>
      </div>
      <div class="pagination-controls">
        <Button
          icon="pi pi-chevron-left"
          text
          rounded
          severity="secondary"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
          class="pagination-btn"
        />
        <span class="page-number text-sm font-medium">
          {{ currentPage }}
        </span>
        <Button
          icon="pi pi-chevron-right"
          text
          rounded
          severity="secondary"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
          class="pagination-btn"
        />
      </div>
    </div>

    <!-- 桌面端视图：完整布局 -->
    <div v-else class="flex desktop-pagination">
      <!-- 每页条数选择 -->
      <div class="page-size-selector">
        <span class="text-sm text-gray-600 mr-1">每页</span>
        <Select
          v-model="pageSize"
          :options="pageSizeOptions"
          optionLabel="label"
          optionValue="value"
          class="page-size-select"
          scrollHeight="200px"
          @change="handlePageSizeChange"
        />
        <span class="text-sm text-gray-600 ml-1">条</span>
      </div>

      <!-- 页码信息 -->
      <div class="pagination-info">
        <span class="text-sm text-gray-600">
          显示 {{ startItem }} - {{ endItem }} 条，共 {{ total }} 条
        </span>
      </div>

      <!-- 页码控制 -->
      <div class="pagination-controls">
        <!-- 首页 -->
        <Button
          icon="pi pi-angle-double-left"
          text
          rounded
          severity="secondary"
          :disabled="currentPage <= 1"
          @click="goToPage(1)"
          v-tooltip.top="'首页'"
          class="pagination-btn"
        />

        <!-- 上一页 -->
        <Button
          icon="pi pi-angle-left"
          text
          rounded
          severity="secondary"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
          v-tooltip.top="'上一页'"
          class="pagination-btn"
        />

        <!-- 页码列表 -->
        <div class="page-numbers">
          <Button
            v-for="page in visiblePages"
            :key="page"
            :label="String(page)"
            :class="['page-number-btn', { active: page === currentPage }]"
            text
            rounded
            @click="goToPage(page)"
          />
        </div>

        <!-- 下一页 -->
        <Button
          icon="pi pi-angle-right"
          text
          rounded
          severity="secondary"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
          v-tooltip.top="'下一页'"
          class="pagination-btn"
        />

        <!-- 末页 -->
        <Button
          icon="pi pi-angle-double-right"
          text
          rounded
          severity="secondary"
          :disabled="currentPage >= totalPages"
          @click="goToPage(totalPages)"
          v-tooltip.top="'末页'"
          class="pagination-btn"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'

interface PageSizeOption {
  label: string
  value: number
}

interface Props {
  total: number
  currentPage: number
  pageSize: number
  pageSizeOptions?: PageSizeOption[]
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  currentPage: 1,
  pageSize: 10,
  pageSizeOptions: () => [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
  ],
})

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'page-change', page: number): void
  (e: 'page-size-change', size: number): void
}>()

// 移动端断点检测 (768px)
const MOBILE_BREAKPOINT = 768
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT)

function checkScreenSize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
}

onMounted(() => {
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// 响应式数据
const pageSize = ref(props.pageSize)

// 计算属性
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.total / pageSize.value))
})

const startItem = computed(() => {
  if (props.total === 0) return 0
  return (props.currentPage - 1) * pageSize.value + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * pageSize.value, props.total)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = props.currentPage

  // 显示 5 个页码：当前页前后各 2 页
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)

  // 调整起始位置
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// 方法
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('page-change', page)
  }
}

function handlePageSizeChange(event: { value: number }) {
  // 更新 pageSize 值
  pageSize.value = event.value

  emit('update:pageSize', pageSize.value)
  emit('page-size-change', pageSize.value)

  // 页码变化时，如果当前页超出范围，重置为第一页
  if (props.currentPage > totalPages.value) {
    goToPage(1)
  }
}

// 监听 props 变化
watch(
  () => props.pageSize,
  (newVal) => {
    pageSize.value = newVal
  },
)
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  width: 100%;
}

/* 移动端样式 */
.mobile-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 8px;
}

.mobile-pagination .pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-pagination .page-number {
  min-width: 32px;
  text-align: center;
  color: var(--text-color, #1f2937);
}

/* 桌面端样式 */
.desktop-pagination {
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.page-size-selector {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.page-size-select {
  width: 100px;
}

.pagination-info {
  color: var(--text-color-secondary, #6b7280);
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 2px;
}

.pagination-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 1px;
}

.page-number-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  font-size: 13px;
}

.page-number-btn.active {
  background-color: var(--primary-500, #16a34a);
  color: white;
}

.page-number-btn:hover:not(.active) {
  background-color: var(--primary-100, #bbf7d0);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .pagination-container {
    padding: 12px 0;
  }

  .mobile-pagination {
    padding: 0 4px;
  }

  .pagination-btn {
    width: 28px;
    height: 28px;
  }

  .page-number {
    min-width: 28px;
    font-size: 13px;
  }
}
</style>
