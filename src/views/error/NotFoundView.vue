<template>
  <div class="error-view">
    <div class="error-content">
      <div class="error-icon">
        <i class="pi pi-exclamation-triangle text-6xl"></i>
      </div>
      <h1 class="error-code">{{ t('error.notFound.code') }}</h1>
      <p class="error-message">{{ t('error.notFound.title') }}</p>
      <p class="error-description">{{ t('error.notFound.description') }}</p>
      <Button :label="t('error.backToHome')" icon="pi pi-home" @click="goHome" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'

const router = useRouter()
const { t } = useI18n()

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.error-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--color-bg-page);
}

.error-content {
  text-align: center;
  padding: 48px;
  background: var(--color-bg-card);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--color-shadow);
  border: 1px solid var(--color-border);
}

.error-icon {
  margin-bottom: 16px;
}

.error-icon i {
  color: var(--color-primary-500);
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  color: var(--color-primary-500);
  margin: 0;
  line-height: 1;
}

.error-message {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 16px 0 8px;
}

.error-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .error-content {
    padding: 32px 24px;
    margin: 16px;
  }

  .error-code {
    font-size: 56px;
  }

  .error-message {
    font-size: 20px;
  }
}
</style>
