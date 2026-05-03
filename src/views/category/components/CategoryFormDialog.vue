<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="isEdit ? t('category.edit') : t('category.create')"
    modal
    :style="{ width: '450px' }"
    :breakpoints="{ '640px': '90vw' }"
  >
    <div class="form-field">
      <label class="form-label">{{ t('category.name') }} <span class="text-danger">*</span></label>
      <InputText
        v-model="localFormData.name"
        :placeholder="t('category.namePlaceholder')"
        :class="{ 'p-invalid': validationErrors.name }"
      />
      <small v-if="validationErrors.name" class="p-error">{{ validationErrors.name }}</small>
    </div>
    <div class="form-field">
      <label class="form-label">{{ t('category.color') }}</label>
      <InputText v-model="localFormData.color" :placeholder="t('category.colorPlaceholder')" />
    </div>
    <div class="form-field">
      <label class="form-label">{{ t('category.icon') }}</label>
      <InputText v-model="localFormData.icon" :placeholder="t('category.iconPlaceholder')" />
    </div>
    <div class="form-field">
      <label class="form-label">{{ t('category.sortOrder') }}</label>
      <InputNumber v-model="localFormData.sort_order" :min="0" />
    </div>
    <template #footer>
      <Button :label="t('common.cancel')" severity="secondary" text @click="handleCancel" />
      <Button :label="t('common.save')" icon="pi pi-check" @click="handleSubmit" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import type { Category, CreateCategoryParams } from '@/api/category'

const { t } = useI18n()

interface Props {
  visible: boolean
  isEdit: boolean
  formData: CreateCategoryParams
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:formData': [value: CreateCategoryParams]
  submit: [data: CreateCategoryParams]
}>()

const dialogVisible = ref(props.visible)
const localFormData = ref<CreateCategoryParams>({ ...props.formData })
const validationErrors = ref<{ name?: string }>({})

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
  },
)

watch(
  () => props.formData,
  (val) => {
    localFormData.value = { ...val }
    validationErrors.value = {}
  },
)

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

function validateForm(): boolean {
  validationErrors.value = {}

  if (!localFormData.value.name || localFormData.value.name.trim() === '') {
    validationErrors.value.name = t('category.validation.nameRequired')
    return false
  }

  return true
}

function handleSubmit() {
  if (!validateForm()) {
    return
  }
  emit('submit', { ...localFormData.value })
}

function handleCancel() {
  dialogVisible.value = false
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

.text-danger {
  color: var(--color-danger);
}

.form-field :deep(.p-inputtext),
.form-field :deep(.p-inputnumber) {
  width: 100%;
}
</style>
