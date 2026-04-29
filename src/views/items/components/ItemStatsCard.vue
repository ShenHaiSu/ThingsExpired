<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon bg-green-50">
        <i class="pi pi-box text-green-500"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('items.stats.total') }}</span>
        <span class="stat-value">{{ stats.total }}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon bg-orange-50">
        <i class="pi pi-clock text-orange-500"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('items.stats.expiringSoon') }}</span>
        <span class="stat-value text-orange-500">{{ stats.expiring_soon }}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon bg-red-50">
        <i class="pi pi-exclamation-triangle text-red-500"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('items.stats.expired') }}</span>
        <span class="stat-value text-red-500">{{ stats.expired }}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon bg-teal-50">
        <i class="pi pi-check-circle text-teal-500"></i>
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ t('items.stats.used') }}</span>
        <span class="stat-value text-teal-500">{{ stats.used }}</span>
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
  background: var(--surface-card, #ffffff);
  border-radius: 10px;
  border: 1px solid var(--surface-border, #e5e7eb);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-color-secondary, #6b7280);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color, #1f2937);
  line-height: 1;
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
