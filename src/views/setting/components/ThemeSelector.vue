<template>
  <div class="setting-card">
    <!-- 设置项标题 -->
    <div class="setting-card-header">
      <i class="pi pi-palette setting-card-icon"></i>
      <h3 class="setting-card-title">
        {{ t('settings.theme.title') }}
      </h3>
    </div>

    <!-- 设置项描述 -->
    <p class="setting-card-desc">
      {{ t('settings.theme.description') }}
    </p>

    <!-- 主题选择器 -->
    <div class="setting-card-actions">
      <Button
        :label="t('settings.theme.light')"
        :severity="theme === 'light' ? 'success' : 'secondary'"
        :outlined="theme !== 'light'"
        icon="pi pi-sun"
        class="setting-btn"
        @click="handleThemeChange('light')"
      />
      <Button
        :label="t('settings.theme.dark')"
        :severity="theme === 'dark' ? 'success' : 'secondary'"
        :outlined="theme !== 'dark'"
        icon="pi pi-moon"
        class="setting-btn"
        @click="handleThemeChange('dark')"
      />
      <Button
        :label="t('settings.theme.auto')"
        :severity="theme === 'auto' ? 'success' : 'secondary'"
        :outlined="theme !== 'auto'"
        icon="pi pi-desktop"
        class="setting-btn"
        @click="handleThemeChange('auto')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore, type Theme } from '@/stores/app/appStore'

// i18n
const { t } = useI18n()

// App Store
const appStore = useAppStore()

// 当前主题
const theme = computed(() => appStore.theme)

// 处理主题切换
function handleThemeChange(newTheme: Theme) {
  if (theme.value !== newTheme) {
    appStore.setTheme(newTheme)
  }
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

.setting-card-icon {
  font-size: 1.125rem;
  color: var(--color-primary-500);
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

.setting-card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 640px) {
  .setting-card-actions {
    flex-direction: row;
  }
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