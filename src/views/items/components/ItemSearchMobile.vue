<template>
  <div class="mobile-search">
    <div class="search-toggle" @click="toggleMobileSearch">
      <i class="pi pi-search"></i>
      <span>{{ t('common.search') }}</span>
      <i :class="['pi', isMobileSearchOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
    </div>

    <Transition name="slide">
      <div v-if="isMobileSearchOpen" class="search-content">
        <div class="search-fields">
          <!-- 名称搜索 -->
          <div class="field-group">
            <label>{{ t('items.search.name') }}</label>
            <InputText
              v-model="searchParams.name"
              :placeholder="t('items.search.namePlaceholder')"
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
  get: () => (searchParams.expired_at_from ? new Date(searchParams.expired_at_from) : undefined),
  set: (value: Date | undefined) => {
    searchParams.expired_at_from = value ? value.toISOString().split('T')[0] : undefined
  },
})

const expiredToDate = computed({
  get: () => (searchParams.expired_at_to ? new Date(searchParams.expired_at_to) : undefined),
  set: (value: Date | undefined) => {
    searchParams.expired_at_to = value ? value.toISOString().split('T')[0] : undefined
  },
})

// 状态选项
const statusOptions = ref([
  { label: t('items.status.normal'), value: 1 },
  { label: t('items.status.expired'), value: 2 },
  { label: t('items.status.used'), value: 3 },
])

// 切换移动端搜索面板
function toggleMobileSearch() {
  isMobileSearchOpen.value = !isMobileSearchOpen.value
}

// 处理搜索
function handleSearch() {
  const params: ItemSearchParams = { ...searchParams }

  // 移除空值
  Object.keys(params).forEach((key) => {
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
  { deep: true },
)
</script>

<style scoped>
:deep(.p-inputnumber-input) {
  width: 100%;
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

/* 字段组样式 */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
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
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--surface-border, #e5e7eb);
}

.search-actions :deep(.p-button) {
  width: 100%;
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
