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
      <Select
        v-model="formData.category_id"
        :options="categoryOptions"
        optionLabel="name"
        optionValue="category_id"
        :placeholder="t('items.selectCategory')"
        class="w-full"
      />
    </div>
    <div class="form-row">
      <div class="form-field">
        <label class="form-label">{{ t('items.quantity') }}</label>
        <InputNumber v-model="formData.quantity" :min="1" class="w-full" />
      </div>
      <div class="form-field">
        <label class="form-label">{{ t('items.unit') }}</label>
        <InputText v-model="formData.unit" :placeholder="t('items.unitPlaceholder')" class="w-full" />
      </div>
    </div>
    <div class="form-field">
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
      <Button
        :label="t('common.cancel')"
        severity="secondary"
        text
        @click="close"
      />
      <Button :label="t('common.save')" icon="pi pi-check" @click="submit" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import type { Item, CreateItemParams } from '@/api/item'
import type { Category } from '@/api/category'

const { t } = useI18n()

interface Props {
  visible: boolean
  isEdit: boolean
  item?: Item | null
  categories: Category[]
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: CreateItemParams & { item_id?: number }): void
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

const expiredAtDate = computed({
  get() {
    return formData.value.expired_at ? new Date(formData.value.expired_at) : null
  },
  set(val: Date | null) {
    formData.value.expired_at = val ? val.toISOString() : ''
  },
})

const categoryOptions = computed(() =>
  props.categories.map((c) => ({
    category_id: c.category_id,
    name: c.name,
  })),
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
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

function resetForm() {
  formData.value = {
    name: '',
    category_id: props.categories[0]?.category_id || 0,
    quantity: 1,
    unit: '',
    expired_at: '',
    description: '',
    remind_days: 3,
  }
}

function close() {
  visible.value = false
}

function submit() {
  const submitData = props.isEdit && props.item
    ? { ...formData.value, item_id: props.item.item_id }
    : { ...formData.value }
  emit('submit', submitData)
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
  color: var(--text-color, #1f2937);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
