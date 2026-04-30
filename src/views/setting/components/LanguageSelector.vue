<template>
  <div class="setting-card">
    <!-- 设置项标题 -->
    <div class="setting-card-header">
      <i class="pi pi-language setting-card-icon"></i>
      <h3 class="setting-card-title">
        {{ t('settings.language.title') }}
      </h3>
    </div>

    <!-- 设置项描述 -->
    <p class="setting-card-desc">
      {{ t('settings.language.description') }}
    </p>

    <!-- 语言选择器 -->
    <div class="setting-card-actions">
      <Button
        :label="t('settings.language.zh')"
        :severity="locale === 'zh-CN' ? 'success' : 'secondary'"
        :outlined="locale !== 'zh-CN'"
        class="setting-btn"
        @click="handleLanguageChange('zh-CN')"
      />
      <Button
        :label="t('settings.language.en')"
        :severity="locale === 'en' ? 'success' : 'secondary'"
        :outlined="locale !== 'en'"
        class="setting-btn"
        @click="handleLanguageChange('en')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePrimeVue } from 'primevue/config'
import { useAppStore, type Locale } from '@/stores/app/appStore'
import primevueEn from '@/locales/primevue-en.json'
import primevueZhCN from '@/locales/primevue-zh-CN.json'

// i18n
const { t } = useI18n()

// PrimeVue
const primeVue = usePrimeVue()

// App Store
const appStore = useAppStore()

// 当前语言
const locale = computed(() => appStore.locale)

// 监听语言变化，同步更新 PrimeVue locale
watch(
  locale,
  (newLocale) => {
    if (primeVue) {
      if (newLocale === 'en') {
        primeVue.config.locale = primevueEn
      } else if (newLocale === 'zh-CN') {
        primeVue.config.locale = primevueZhCN
      }
    }
  },
  { immediate: true }
)

// 处理语言切换
function handleLanguageChange(newLocale: Locale) {
  if (locale.value !== newLocale) {
    appStore.setLocale(newLocale)
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