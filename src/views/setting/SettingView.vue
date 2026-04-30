<template>
  <div class="setting-view">
    <!-- 页面内容 -->
    <main>
      <!-- 账户信息卡片 -->
      <div class="setting-card mb-6">
        <div class="setting-card-header">
          <i class="pi pi-user setting-card-icon"></i>
          <h3 class="setting-card-title">
            {{ t('settings.account.title') }}
          </h3>
        </div>
        <p class="setting-card-desc">
          {{ t('settings.account.description') }}
        </p>
        <div class="setting-card-content">
          <div class="setting-card-field">
            <label class="setting-card-label">
              {{ t('settings.account.username') }}
            </label>
            <p class="setting-card-value">
              {{ userStore.userInfo?.name || '-' }}
            </p>
          </div>
          <div class="setting-card-field">
            <label class="setting-card-label">
              {{ t('settings.account.email') }}
            </label>
            <p class="setting-card-value">
              {{ userStore.userInfo?.email || '-' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 设置项网格布局 -->
      <div class="setting-grid">
        <!-- 语言设置 -->
        <LanguageSelector />

        <!-- 主题设置 -->
        <ThemeSelector />

        <!-- 登出按钮 -->
        <LogoutButton />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user/userStore'
import LanguageSelector from './components/LanguageSelector.vue'
import ThemeSelector from './components/ThemeSelector.vue'
import LogoutButton from './components/LogoutButton.vue'

// i18n
const { t } = useI18n()

// User Store
const userStore = useUserStore()
</script>

<style scoped>
.setting-view {
  margin: 0 auto;
}

.setting-card {
  background: var(--color-bg-card);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  margin-bottom: 24px;
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

.setting-card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 640px) {
  .setting-card-content {
    flex-direction: row;
  }
}

.setting-card-field {
  flex: 1;
}

.setting-card-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.setting-card-value {
  font-size: 1rem;
  color: var(--color-text-primary);
  margin: 0;
}

.setting-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .setting-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .setting-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
