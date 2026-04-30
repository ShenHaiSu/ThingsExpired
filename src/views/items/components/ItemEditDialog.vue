<template>
  <Dialog
    v-model:visible="visible"
    :header="isEdit ? t('items.edit') : t('items.create')"
    modal
    :style="{ width: '520px' }"
    :breakpoints="{ '640px': '90vw' }"
  >
    <div class="form-field">
      <label class="form-label">{{ t('items.name') }} <span class="text-red-500">*</span></label>
      <InputText v-model="formData.name" :placeholder="t('items.namePlaceholder')" class="w-full" />
    </div>
    <div class="form-field">
      <label class="form-label"
        >{{ t('items.category') }} <span class="text-red-500">*</span></label
      >
      <AutoComplete
        v-model="categoryInput"
        :suggestions="categorySuggestions"
        optionLabel="name"
        :placeholder="t('items.categoryPlaceholder')"
        class="w-full"
        :forceSelection="false"
        :loading="categoryLoading"
        @complete="searchCategory"
        @item-select="onCategorySelect"
      />
      <small v-if="categoryError" class="p-error">{{ categoryError }}</small>
      <small v-else class="text-gray-500 text-xs">{{ t('items.categoryHint') }}</small>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label class="form-label">{{ t('items.quantity') }}</label>
        <InputNumber v-model="formData.quantity" :min="1" class="w-full" />
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('items.unit') }}</label>
        <InputText
          v-model="formData.unit"
          :placeholder="t('items.unitPlaceholder')"
          class="w-full"
        />
      </div>
    </div>

    <!-- 时间填写模式切换 -->
    <div class="form-field">
      <label class="form-label">{{ t('items.timeMode') }}</label>
      <SelectButton
        v-model="timeMode"
        :options="timeModeOptions"
        optionLabel="label"
        optionValue="value"
        class="w-full"
      />
    </div>

    <!-- 生产日期 + 保质期模式 -->
    <div v-if="!isDirectExpiryMode" class="form-row">
      <div class="form-field">
        <label class="form-label"
          >{{ t('items.productionDate') }} <span class="text-red-500">*</span></label
        >
        <DatePicker v-model="productionDate" :showTime="false" class="w-full" />
      </div>
      <div class="form-field">
        <label class="form-label"
          >{{ t('items.shelfLife') }} <span class="text-red-500">*</span></label
        >
        <InputGroup>
          <InputNumber v-model="shelfLife" :min="1" class="w-full" />
          <Select
            v-model="shelfLifeUnit"
            :options="shelfLifeUnitOptions"
            optionLabel="label"
            optionValue="value"
            class="w-24"
          />
        </InputGroup>
      </div>
    </div>

    <!-- 直接过期日期模式 -->
    <div v-else class="form-field">
      <label class="form-label"
        >{{ t('items.expiredAt') }} <span class="text-red-500">*</span></label
      >
      <DatePicker v-model="expiredAtDate" showTime hourFormat="24" class="w-full" />
    </div>

    <div class="form-field">
      <label class="form-label">{{ t('items.description') }}</label>
      <Textarea v-model="formData.description" rows="3" class="w-full" />
    </div>
    <div class="form-field">
      <label class="form-label">{{ t('items.remindDays') }}</label>
      <InputNumber v-model="formData.remind_days" :min="0" :max="365" class="w-full" />
    </div>
    <template #footer>
      <Button :label="t('common.cancel')" severity="secondary" text @click="close" />
      <Button :label="t('common.save')" icon="pi pi-check" :loading="submitting" @click="submit" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
// 1. Vue 相关
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// 2. 第三方库
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import AutoComplete from 'primevue/autocomplete'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import InputGroup from 'primevue/inputgroup'
import Select from 'primevue/select'

// 3. 项目内部 - 类型
import type { Item, CreateItemParams } from '@/types/api/item'
import type { Category } from '@/types/api/category'

// 4. 项目内部 - 工具函数
import { calculateExpiredAt } from '@/utils/date'

// 5. 项目内部 - API
import { createCategory } from '@/api/category'

// 6. 项目内部 - 组合式函数
import { useToast } from '@/composables'

const { t } = useI18n()
const toast = useToast()

interface Props {
  visible: boolean
  isEdit: boolean
  item?: Item | null
  categories: Category[]
  defaultMode?: 'production' | 'expiry' // 外部控制过期模式
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
  defaultMode: 'production',
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: CreateItemParams & { item_id?: number }): void
  (e: 'category-created', category: Category): void
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const formData = ref<CreateItemParams>({
  name: '',
  category_id: 0,
  quantity: 1,
  unit: '',
  expired_at: '',
  description: '',
  remind_days: 3,
})

// 类别输入相关状态
// categoryInput 可以是 Category 对象（选择已有类别）或 string（新类别名称）
const categoryInput = ref<Category | string>('')
const categorySuggestions = ref<Category[]>([])
const categoryError = ref<string>('')
const categoryLoading = ref(false)
const submitting = ref(false)

// 时间填写模式选项
const timeModeOptions = computed(() => [
  { label: t('items.modeProduction'), value: false },
  { label: t('items.modeDirect'), value: true },
])

// 时间填写模式：false = 生产日期+保质期，true = 直接过期日期
const timeMode = ref(props.defaultMode === 'expiry')
const isDirectExpiryMode = computed(() => timeMode.value)

// 生产日期和保质期（用于计算模式）
const productionDate = ref<Date | null>(null)
const shelfLife = ref<number>(30)
const shelfLifeUnit = ref<'hour' | 'day' | 'week' | 'month' | 'year'>('day')

// 保质期单位选项
const shelfLifeUnitOptions = computed(() => [
  { label: t('items.timeUnitHour'), value: 'hour' },
  { label: t('items.timeUnitDay'), value: 'day' },
  { label: t('items.timeUnitWeek'), value: 'week' },
  { label: t('items.timeUnitMonth'), value: 'month' },
  { label: t('items.timeUnitYear'), value: 'year' },
])

// 直接过期日期模式的日期选择器绑定
const expiredAtDate = computed({
  get() {
    return formData.value.expired_at ? new Date(formData.value.expired_at) : null
  },
  set(val: Date | null) {
    formData.value.expired_at = val ? val.toISOString() : ''
  },
})

// 搜索类别（用于 AutoComplete 的过滤功能）
function searchCategory(event: { query: string }) {
  const query = event.query.toLowerCase().trim()
  if (query) {
    categorySuggestions.value = props.categories.filter((c) => c.name.toLowerCase().includes(query))
  } else {
    categorySuggestions.value = props.categories
  }
}

// 当用户从下拉列表中选择一个类别时
function onCategorySelect(event: { value: Category }) {
  categoryError.value = ''
  formData.value.category_id = event.value.category_id
}

// 监听类别输入变化，处理用户直接输入新类别名称的情况
watch(categoryInput, (newVal) => {
  // 如果输入的是字符串（新类别名称），清除 category_id
  if (typeof newVal === 'string') {
    // 检查是否与已有类别名称匹配
    const matchedCategory = props.categories.find(
      (c) => c.name.toLowerCase() === newVal.toLowerCase().trim(),
    )
    if (matchedCategory) {
      // 如果匹配到已有类别，自动设置为该类别
      formData.value.category_id = matchedCategory.category_id
      categoryError.value = ''
    } else {
      // 新类别名称，category_id 设为 0
      formData.value.category_id = 0
      // 如果输入不为空，清除错误提示
      if (newVal.trim()) {
        categoryError.value = ''
      }
    }
  }
})

// 监听生产日期和保质期变化，自动计算过期日期
watch(
  [productionDate, shelfLife, shelfLifeUnit],
  ([newProdDate, newShelfLife, newShelfLifeUnit]) => {
    if (!isDirectExpiryMode.value && newProdDate && newShelfLife) {
      formData.value.expired_at = calculateExpiredAt(newProdDate, newShelfLife, newShelfLifeUnit)
    }
  },
)

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      formData.value = {
        name: newItem.name,
        category_id: newItem.category_id,
        quantity: newItem.quantity,
        unit: newItem.unit,
        expired_at: newItem.expired_at,
        description: newItem.description || '',
        remind_days: newItem.remind_days,
      }
      // 设置类别输入为对应的类别对象
      const category = props.categories.find((c) => c.category_id === newItem.category_id)
      if (category) {
        categoryInput.value = category
      }
      // 如果是编辑模式，默认使用过期日期模式
      if (props.isEdit) {
        timeMode.value = true
      }
      // 如果是编辑模式，根据过期日期反推生产日期和保质期
      if (newItem.expired_at) {
        productionDate.value = new Date(newItem.expired_at)
        shelfLife.value = 30 // 默认值，实际应该根据业务逻辑计算
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

function resetForm() {
  formData.value = {
    name: '',
    category_id: 0,
    quantity: 1,
    unit: '',
    expired_at: '',
    description: '',
    remind_days: 3,
  }
  categoryInput.value = ''
  categoryError.value = ''
  productionDate.value = null
  shelfLife.value = 30
  shelfLifeUnit.value = 'day'
  // 根据外部传入的默认模式设置
  timeMode.value = props.defaultMode === 'expiry'
}

function close() {
  visible.value = false
}

// 验证表单
function validateForm(): boolean {
  // 验证物品名称
  if (!formData.value.name || formData.value.name.trim() === '') {
    toast.warn(t('items.validation.nameRequired'), t('common.warning'))
    return false
  }

  // 验证类别
  const categoryValue = categoryInput.value
  if (!categoryValue) {
    categoryError.value = t('items.validation.categoryRequired')
    toast.warn(t('items.validation.categoryRequired'), t('common.warning'))
    return false
  }

  // 如果是字符串且为空
  if (typeof categoryValue === 'string' && categoryValue.trim() === '') {
    categoryError.value = t('items.validation.categoryRequired')
    toast.warn(t('items.validation.categoryRequired'), t('common.warning'))
    return false
  }

  // 验证过期时间
  if (!formData.value.expired_at) {
    toast.warn(t('items.validation.expiredAtRequired'), t('common.warning'))
    return false
  }

  return true
}

// 创建新类别
async function createNewCategory(name: string): Promise<number | null> {
  categoryLoading.value = true
  try {
    const res = await createCategory({
      name: name.trim(),
      color: '#22c55e', // 默认绿色
      sort_order: 0,
    })
    if (res.data) {
      toast.success(t('items.message.categoryCreated'))
      // 通知父组件新类别已创建，以便更新类别列表
      emit('category-created', res.data)
      return res.data.category_id
    }
    return null
  } catch (error) {
    console.error('Failed to create category:', error)
    toast.error(t('items.message.categoryCreateFailed'))
    return null
  } finally {
    categoryLoading.value = false
  }
}

// 提交表单
async function submit() {
  // 验证表单
  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    // 处理类别
    let categoryId = formData.value.category_id

    // 如果 category_id 为 0，说明用户输入了新类别名称
    if (categoryId === 0 && typeof categoryInput.value === 'string') {
      const newCategoryName = categoryInput.value.trim()
      // 先创建新类别
      const newCategoryId = await createNewCategory(newCategoryName)
      if (newCategoryId === null) {
        // 创建类别失败，不继续提交物品
        submitting.value = false
        return
      }
      categoryId = newCategoryId
    }

    // 确保过期日期是UTC格式
    let expiredAt = formData.value.expired_at
    if (expiredAt) {
      // 检查是否已经是UTC格式 (包含Z或+00:00)
      if (!expiredAt.endsWith('Z') && !expiredAt.includes('+00:00')) {
        // 转换为UTC
        const date = new Date(expiredAt)
        expiredAt = date.toISOString()
      }
    }

    const submitData =
      props.isEdit && props.item
        ? {
            ...formData.value,
            category_id: categoryId,
            expired_at: expiredAt,
            item_id: props.item.item_id,
          }
        : { ...formData.value, category_id: categoryId, expired_at: expiredAt }

    emit('submit', submitData)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

:deep(.p-autocomplete-input) {
  width: 100%;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  /* InputGroup 在移动端需要特殊处理 */
  :deep(.p-inputgroup) {
    flex-direction: column;
  }

  :deep(.p-inputgroup > *:first-child) {
    border-radius: 6px 6px 0 0;
    border-right: 1px solid var(--color-border);
  }

  :deep(.p-inputgroup > *:last-child) {
    border-radius: 0 0 6px 6px;
  }
}
</style>
