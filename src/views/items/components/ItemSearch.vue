<template>
  <div class="search-panel">
    <!-- 移动端：折叠式搜索面板 -->
    <div class="mobile-search">
      <div class="search-toggle" @click="toggleMobileSearch">
        <i class="pi pi-search"></i>
        <span>{{ t('common.search') }}</span>
        <i :class="['pi', isMobileSearchOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
      </div>
      
      <Transition name="slide">
        <div v-if="isMobileSearchOpen" class="search-content">
          <div class="search-fields">
            <!-- 关键词搜索 -->
            <div class="field-group">
              <label>{{ t('items.search.keyword') }}</label>
              <InputText 
                v-model="searchParams.name" 
                :placeholder="t('items.search.keywordPlaceholder')"
                class="w-full"
              />
            </div>

            <!-- 分类选择 -->
            <div class="field-group">
              <label>{{ t('items.category') }}</label>
              <Select
                v-model="searchParams.category_id"
                :options="categories"
                optionLabel="name"
                optionValue="category_id"
                :placeholder="t('items.search.selectCategory')"
                class="w-full"
                showClear
              />
            </div>

            <!-- 状态选择 -->
            <div class="field-group">
              <label>{{ t('items.status.title') }}</label>
              <Select
                v-model="searchParams.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="t('items.search.selectStatus')"
                class="w-full"
                showClear
              />
            </div>

            <!-- 数量范围 -->
            <div class="field-group">
              <label>{{ t('items.quantity') }}</label>
              <div class="range-inputs">
                <InputNumber 
                  v-model="searchParams.quantity_min" 
                  :placeholder="t('common.min')"
                  class="w-full"
                  :min="0"
                />
                <span class="range-separator">-</span>
                <InputNumber 
                  v-model="searchParams.quantity_max" 
                  :placeholder="t('common.max')"
                  class="w-full"
                  :min="0"
                />
              </div>
            </div>

            <!-- 过期时间范围 -->
            <div class="field-group">
              <label>{{ t('items.expiredAt') }}</label>
              <div class="date-range">
                <DatePicker 
                  v-model="expiredFromDate" 
                  :placeholder="t('common.startDate')"
                  dateFormat="yy-mm-dd"
                  class="w-full"
                />
                <span class="range-separator">-</span>
                <DatePicker 
                  v-model="expiredToDate" 
                  :placeholder="t('common.endDate')"
                  dateFormat="yy-mm-dd"
                  class="w-full"
                />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="search-actions">
              <Button 
                :label="t('common.search')" 
                icon="pi pi-search" 
                @click="handleSearch"
                class="w-full"
              />
              <Button 
                :label="t('common.reset')" 
                icon="pi pi-refresh" 
                severity="secondary"
                @click="handleReset"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 桌面端：展开式搜索面板 -->
    <div class="desktop-search">
      <div class="search-header">
        <h3 class="search-title">
          <i class="pi pi-search"></i>
          {{ t('items.search.title') }}
        </h3>
      </div>
      
      <div class="search-fields">
        <div class="search-grid">
          <!-- 关键词搜索 -->
          <div class="field-group">
            <label>{{ t('items.search.keyword') }}</label>
            <InputText 
              v-model="searchParams.name" 
              :placeholder="t('items.search.keywordPlaceholder')"
              class="w-full"
            />
          </div>

          <!-- 分类选择 -->
          <div class="field-group">
            <label>{{ t('items.category') }}</label>
            <Select
              v-model="searchParams.category_id"
              :options="categories"
              optionLabel="name"
              optionValue="category_id"
              :placeholder="t('items.search.selectCategory')"
              class="w-full"
              showClear
            />
          </div>

          <!-- 状态选择 -->
          <div class="field-group">
            <label>{{ t('items.status.title') }}</label>
            <Select
              v-model="searchParams.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('items.search.selectStatus')"
              class="w-full"
              showClear
            />
          </div>

          <!-- 数量范围 -->
          <div class="field-group">
            <label>{{ t('items.quantity') }}</label>
            <div class="range-inputs">
              <InputNumber 
                v-model="searchParams.quantity_min" 
                :placeholder="t('common.min')"
                class="w-full"
                :min="0"
              />
              <span class="range-separator">-</span>
              <InputNumber 
                v-model="searchParams.quantity_max" 
                :placeholder="t('common.max')"
                class="w-full"
                :min="0"
              />
            </div>
          </div>

          <!-- 过期时间范围 -->
          <div class="field-group">
            <label>{{ t('items.expiredAt') }}</label>
            <div class="date-range">
              <DatePicker 
                v-model="expiredFromDate" 
                :placeholder="t('common.startDate')"
                dateFormat="yy-mm-dd"
                class="w-full"
              />
              <span class="range-separator">-</span>
              <DatePicker 
                v-model="expiredToDate" 
                :placeholder="t('common.endDate')"
                dateFormat="yy-mm-dd"
                class="w-full"
              />
            </div>
          </div>

          <!-- 排序方式 -->
          <div class="field-group">
            <label>{{ t('common.sort') }}</label>
            <Select
              v-model="searchParams.order_by"
              :options="sortOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="search-actions">
          <Button 
            :label="t('common.search')" 
            icon="pi pi-search" 
            @click="handleSearch"
          />
          <Button 
            :label="t('common.reset')" 
            icon="pi pi-refresh" 
            severity="secondary"
            @click="handleReset"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import type { Category } from '@/api/category'
import type { ItemSearchParams } from '@/api/item'

const { t } = useI18n()

interface Props {
  categories: Category[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'search', params: ItemSearchParams): void
  (e: 'reset'): void
}>()

// 移动端搜索面板状态
const isMobileSearchOpen = ref(false)

// 搜索参数
const searchParams = reactive<ItemSearchParams>({
  name: '',
  category_id: undefined,
  status: undefined,
  quantity_min: undefined,
  quantity_max: undefined,
  expired_at_from: undefined,
  expired_at_to: undefined,
  order_by: 'expired_at',
  order: 'asc',
})

// 日期选择器绑定（转换为Date对象）
const expiredFromDate = computed({
  get: () => searchParams.expired_at_from ? new Date(searchParams.expired_at_from) : undefined,
  set: (value: Date | undefined) => {
    searchParams.expired_at_from = value ? value.toISOString().split('T')[0] : undefined
  }
})

const expiredToDate = computed({
  get: () => searchParams.expired_at_to ? new Date(searchParams.expired_at_to) : undefined,
  set: (value: Date | undefined) => {
    searchParams.expired_at_to = value ? value.toISOString().split('T')[0] : undefined
  }
})

// 状态选项
const statusOptions = ref([
  { label: t('items.status.normal'), value: 1 },
  { label: t('items.status.expired'), value: 2 },
  { label: t('items.status.used'), value: 3 },
])

// 排序选项
const sortOptions = ref([
  { label: t('items.sort.byExpiredAt'), value: 'expired_at' },
  { label: t('items.sort.byCreatedAt'), value: 'created_at' },
  { label: t('items.sort.byQuantity'), value: 'quantity' },
  { label: t('items.sort.byName'), value: 'name' },
])

// 切换移动端搜索面板
function toggleMobileSearch() {
  isMobileSearchOpen.value = !isMobileSearchOpen.value
}

// 处理搜索
function handleSearch() {
  const params: ItemSearchParams = { ...searchParams }
  
  // 移除空值
  Object.keys(params).forEach(key => {
    const value = (params as any)[key]
    if (value === undefined || value === '' || value === null) {
      delete (params as any)[key]
    }
  })
  
  emit('search', params)
}

// 处理重置
function handleReset() {
  // 重置搜索参数
  searchParams.name = ''
  searchParams.category_id = undefined
  searchParams.status = undefined
  searchParams.quantity_min = undefined
  searchParams.quantity_max = undefined
  searchParams.expired_at_from = undefined
  searchParams.expired_at_to = undefined
  searchParams.order_by = 'expired_at'
  searchParams.order = 'asc'
  
  emit('reset')
}

// 监听搜索参数变化，自动搜索
watch(
  () => [searchParams.category_id, searchParams.status, searchParams.order_by],
  () => {
    handleSearch()
  },
  { deep: true }
)
</script>

<style scoped>
.search-panel {
  background: var(--surface-card, #ffffff);
  border-radius: 10px;
  border: 1px solid var(--surface-border, #e5e7eb);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

/* 移动端样式 */
.mobile-search {
  display: block;
}

.search-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--surface-border, #e5e7eb);
}

.search-toggle i {
  color: var(--text-color-secondary, #6b7280);
}

.search-content {
  padding: 16px;
}

/* 桌面端样式 */
.desktop-search {
  display: none;
}

.search-header {
  padding: 16px;
  border-bottom: 1px solid var(--surface-border, #e5e7eb);
}

.search-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color, #1f2937);
}

.search-fields {
  padding: 16px;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

/* 字段组样式 */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color-secondary, #6b7280);
}

/* 范围输入样式 */
.range-inputs,
.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-separator {
  color: var(--text-color-secondary, #6b7280);
  flex-shrink: 0;
}

/* 操作按钮样式 */
.search-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--surface-border, #e5e7eb);
}

.search-actions :deep(.p-button) {
  flex: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mobile-search {
    display: block;
  }
  
  .desktop-search {
    display: none;
  }
  
  .search-actions {
    flex-direction: column;
  }
  
  .search-actions :deep(.p-button) {
    width: 100%;
  }
}

/* 桌面端适配 */
@media (min-width: 769px) {
  .mobile-search {
    display: none;
  }
  
  .desktop-search {
    display: block;
  }
  
  .search-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .search-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
