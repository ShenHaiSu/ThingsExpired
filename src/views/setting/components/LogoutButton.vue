<template>
  <div class="setting-card">
    <!-- 设置项标题 -->
    <div class="setting-card-header">
      <i class="pi pi-sign-out setting-card-icon-danger"></i>
      <h3 class="setting-card-title">
        {{ t('settings.logout.title') }}
      </h3>
    </div>

    <!-- 设置项描述 -->
    <p class="setting-card-desc">
      {{ t('settings.logout.description') }}
    </p>

    <!-- 登出按钮 -->
    <Button
      :label="t('settings.logout.button')"
      severity="danger"
      icon="pi pi-sign-out"
      class="setting-btn"
      :loading="loading"
      @click="handleLogout"
    />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useUserStore } from '@/stores/user/userStore'

// i18n
const { t } = useI18n()

// Router
const router = useRouter()

// User Store
const userStore = useUserStore()

// PrimeVue Confirm & Toast
const confirm = useConfirm()
const toast = useToast()

// 加载状态
const loading = ref(false)

// 处理登出
function handleLogout() {
  confirm.require({
    header: t('settings.logout.confirmTitle'),
    message: t('settings.logout.confirmMessage'),
    acceptLabel: t('common.confirm'),
    rejectLabel: t('common.cancel'),
    acceptClass: 'p-button-danger',
    accept: async () => {
      loading.value = true
      try {
        await userStore.logout()
        toast.add({
          severity: 'success',
          summary: t('common.success'),
          detail: t('settings.logout.success'),
          life: 3000,
        })
        router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        loading.value = false
      }
    },
  })
}
</script>

<style scoped>
.setting-card {
  background: var(--color-bg-card);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.setting-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.setting-card-icon-danger {
  font-size: 1.125rem;
  color: var(--color-danger);
}

.setting-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.setting-card-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
}

.setting-btn {
  width: 100%;
  transition: all 0.2s ease;
}

@media (min-width: 640px) {
  .setting-btn {
    width: auto;
  }
}
</style>
