<template>
  <div class="home-view">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <i class="pi pi-box text-4xl mb-4"></i>
        <h1 class="welcome-title">{{ t('home.welcomeTitle') }}</h1>
        <p class="welcome-desc">{{ t('home.welcomeDesc') }}</p>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h2 class="section-title">{{ t('home.quickActions') }}</h2>
      <div class="action-grid">
        <router-link to="/items" class="action-card">
          <div class="action-icon action-icon-green">
            <i class="pi pi-plus text-xl"></i>
          </div>
          <span class="action-label">{{ t('home.addItem') }}</span>
          <span class="action-desc">{{ t('home.addItemDesc') }}</span>
        </router-link>
        <router-link to="/categories" class="action-card">
          <div class="action-icon action-icon-teal">
            <i class="pi pi-folder text-xl"></i>
          </div>
          <span class="action-label">{{ t('home.manageCategory') }}</span>
          <span class="action-desc">{{ t('home.manageCategoryDesc') }}</span>
        </router-link>
        <router-link to="/items" class="action-card">
          <div class="action-icon action-icon-orange">
            <i class="pi pi-clock text-xl"></i>
          </div>
          <span class="action-label">{{ t('home.expiringSoon') }}</span>
          <span class="action-desc">{{ t('home.expiringSoonDesc') }}</span>
        </router-link>
        <router-link to="/settings" class="action-card">
          <div class="action-icon action-icon-gray">
            <i class="pi pi-cog text-xl"></i>
          </div>
          <span class="action-label">{{ t('home.systemSettings') }}</span>
          <span class="action-desc">{{ t('home.systemSettingsDesc') }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.home-view {
  max-width: 960px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  padding: 48px 24px;
  margin-bottom: 32px;
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-bg-card) 100%);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

/* 深色模式下的渐变背景适配 */
:global(.dark) .welcome-section {
  background: linear-gradient(135deg, var(--color-primary-800) 0%, var(--color-bg-card) 100%);
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-content i {
  color: var(--color-primary-500);
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.welcome-desc {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  background: var(--color-bg-card);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: 0 4px 12px var(--color-shadow);
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-green {
  background: var(--color-success-bg);
}

.action-icon-green i {
  color: var(--color-primary-500);
}

.action-icon-teal {
  background: var(--color-info-bg);
}

.action-icon-teal i {
  color: var(--color-info);
}

.action-icon-orange {
  background: var(--color-warning-bg);
}

.action-icon-orange i {
  color: var(--color-warning);
}

.action-icon-gray {
  background: var(--color-bg-hover);
}

.action-icon-gray i {
  color: var(--color-text-secondary);
}

.action-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.action-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
}

@media (max-width: 768px) {
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .welcome-title {
    font-size: 24px;
  }
}
</style>