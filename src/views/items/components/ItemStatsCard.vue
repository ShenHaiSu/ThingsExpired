<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon stat-icon-green">
        <i class="pi pi-box"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('items.stats.total') }}</span>
        <span class="stat-value">{{ stats.total }}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon stat-icon-orange">
        <i class="pi pi-clock"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('items.stats.expiringSoon') }}</span>
        <span class="stat-value stat-value-warning">{{ stats.expiring_soon }}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon stat-icon-red">
        <i class="pi pi-exclamation-triangle"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('items.stats.expired') }}</span>
        <span class="stat-value stat-value-danger">{{ stats.expired }}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon stat-icon-teal">
        <i class="pi pi-check-circle"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('items.stats.used') }}</span>
        <span class="stat-value stat-value-info">{{ stats.used }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  stats: {
    total: number
    expiring_soon: number
    expired: number
    used: number
  }
}

defineProps<Props>()
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-bg-card);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px var(--color-shadow);
  transition: box-shadow 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px var(--color-shadow-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 1.25rem;
}

/* 绿色图标 - 总数 */
.stat-icon-green {
  background: var(--color-success-bg);
}

.stat-icon-green i {
  color: var(--color-primary-500);
}

/* 橙色图标 - 即将过期 */
.stat-icon-orange {
  background: var(--color-warning-bg);
}

.stat-icon-orange i {
  color: var(--color-warning);
}

/* 红色图标 - 已过期 */
.stat-icon-red {
  background: var(--color-danger-bg);
}

.stat-icon-red i {
  color: var(--color-danger);
}

/* 青色图标 - 已使用 */
.stat-icon-teal {
  background: var(--color-info-bg);
}

.stat-icon-teal i {
  color: var(--color-info);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

/* 橙色数值 - 即将过期 */
.stat-value-warning {
  color: var(--color-warning);
}

/* 红色数值 - 已过期 */
.stat-value-danger {
  color: var(--color-danger);
}

/* 青色数值 - 已使用 */
.stat-value-info {
  color: var(--color-info);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-icon i {
    font-size: 1rem;
  }

  .stat-value {
    font-size: 20px;
  }
}
</style>
