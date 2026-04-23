<template>
  <Button
    :label="label"
    :icon="icon"
    :severity="severity"
    :size="size"
    :outlined="outlined"
    :text="text"
    :disabled="disabled"
    :loading="loading"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button'

interface Props {
  label?: string
  icon?: string
  severity?: 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast' | undefined
  size?: 'small' | 'large' | undefined
  outlined?: boolean
  text?: boolean
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  icon: '',
  severity: undefined,
  size: undefined,
  outlined: false,
  text: false,
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
