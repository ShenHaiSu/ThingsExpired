<template>
  <div class="error-view">
    <div class="error-content">
      <div class="error-icon">
        <i class="pi pi-lock text-6xl text-warning-500"></i>
      </div>
      <h1 class="error-code">403</h1>
      <p class="error-message">无权访问</p>
      <p class="error-description">抱歉，您没有权限访问此页面</p>
      <Button label="返回首页" icon="pi pi-home" @click="goHome" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.error-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--surface-ground, #f9fafb);
}

.error-content {
  text-align: center;
  padding: 48px;
  background: var(--surface-card, #ffffff);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--surface-border, #e5e7eb);
}

.error-icon {
  margin-bottom: 16px;
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  color: var(--color-warning, #f59e0b);
  margin: 0;
  line-height: 1;
}

.error-message {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color, #1f2937);
  margin: 16px 0 8px;
}

.error-description {
  font-size: 14px;
  color: var(--text-color-secondary, #6b7280);
  margin-bottom: 32px;
}
</style>
