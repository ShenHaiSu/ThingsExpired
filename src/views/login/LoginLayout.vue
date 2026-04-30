<template>
  <div class="login-layout">
    <!-- 左侧装饰区域 -->
    <div class="login-decoration">
      <div class="decoration-content">
        <div class="logo-area">
          <div class="logo-icon">
            <i class="pi pi-clock"></i>
          </div>
          <h1 class="app-title">Things Expired</h1>
          <p class="app-slogan">{{ t('auth.subtitle') }}</p>
        </div>
        <div class="feature-list">
          <div class="feature-item">
            <i class="pi pi-check-circle"></i>
            <span>{{ t('auth.featureTrack') }}</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-bell"></i>
            <span>{{ t('auth.featureRemind') }}</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-folder"></i>
            <span>{{ t('auth.featureOrganize') }}</span>
          </div>
        </div>
      </div>
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
    </div>

    <!-- 右侧表单区域 -->
    <div class="form-area">
      <!-- 顶部设置栏 -->
      <div class="form-top-bar">
        <!-- 主题切换 -->
        <Button
          :icon="themeIcon"
          text
          size="small"
          @click="toggleTheme"
          v-tooltip="t('common.theme')"
        />

        <!-- 语言切换 -->
        <Select
          v-model="currentLocale"
          :options="localeOptions"
          optionLabel="label"
          optionValue="value"
          @change="handleLocaleChange"
          class="locale-select"
          size="small"
        />
      </div>

      <div class="form-container">
        <!-- 表单头部 -->
        <div class="form-header">
          <h2>{{ title }}</h2>
          <p>{{ subtitle }}</p>
        </div>

        <!-- 表单内容插槽 -->
        <div class="form-content">
          <slot></slot>
        </div>

        <!-- 底部链接插槽 -->
        <div class="form-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore, type Theme, type Locale } from '@/stores/app/appStore'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Select from 'primevue/select'

interface Props {
  title: string
  subtitle: string
}

defineProps<Props>()

const appStore = useAppStore()
const { t, locale: i18nLocale } = useI18n()

// 从 appStore 获取主题和语言
const theme = computed(() => appStore.theme)

// 主题图标
const themeIcon = computed(() => {
  if (theme.value === 'light') return 'pi pi-sun'
  if (theme.value === 'dark') return 'pi pi-moon'
  return 'pi pi-desktop'
})

// 当前语言选择
const currentLocale = ref(appStore.locale)

// 语言选项
const localeOptions = computed(() => [
  { label: t('common.languageZh'), value: 'zh-CN' },
  { label: t('common.languageEn'), value: 'en' },
])

// 切换主题
function toggleTheme() {
  appStore.toggleTheme()
}

// 处理语言切换
function handleLocaleChange() {
  appStore.setLocale(currentLocale.value as Locale)
  i18nLocale.value = currentLocale.value as Locale
}
</script>

<style scoped>
.login-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  background: var(--color-bg-card);
}

/* 左侧装饰区域 */
.login-decoration {
  flex: 1;
  display: none;
  position: relative;
  background: linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary-900) 100%);
  overflow: hidden;
}

@media (min-width: 992px) {
  .login-decoration {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.decoration-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
  padding: 40px;
}

.logo-area {
  margin-bottom: 60px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon i {
  font-size: 36px;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.app-slogan {
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 15px;
  opacity: 0.9;
}

.feature-item i {
  font-size: 18px;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
}

/* 右侧表单区域 */
.form-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--color-bg-page);
  position: relative;
}

/* 顶部设置栏 */
.form-top-bar {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.locale-select {
  width: 150px;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.form-header p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 表单内容区域 */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 底部链接 */
.form-footer {
  margin-top: 32px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}
</style>
