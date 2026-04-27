<template>
  <div class="home-view">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <i class="pi pi-box text-4xl text-green-500 mb-4"></i>
        <h1 class="welcome-title">欢迎使用 Things Expired</h1>
        <p class="welcome-desc">轻松管理您的物品过期信息，避免浪费</p>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h2 class="section-title">快捷操作</h2>
      <div class="action-grid">
        <router-link to="/items" class="action-card">
          <div class="action-icon bg-green-50">
            <i class="pi pi-plus text-green-500 text-xl"></i>
          </div>
          <span class="action-label">添加物品</span>
          <span class="action-desc">记录新的物品信息</span>
        </router-link>
        <router-link to="/categories" class="action-card">
          <div class="action-icon bg-teal-50">
            <i class="pi pi-folder text-teal-500 text-xl"></i>
          </div>
          <span class="action-label">管理分类</span>
          <span class="action-desc">整理物品分类</span>
        </router-link>
        <router-link to="/items" class="action-card">
          <div class="action-icon bg-orange-50">
            <i class="pi pi-clock text-orange-500 text-xl"></i>
          </div>
          <span class="action-label">即将过期</span>
          <span class="action-desc">查看即将过期的物品</span>
        </router-link>
        <router-link to="/settings" class="action-card">
          <div class="action-icon bg-gray-50">
            <i class="pi pi-cog text-gray-500 text-xl"></i>
          </div>
          <span class="action-label">系统设置</span>
          <span class="action-desc">管理账户和偏好</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 首页视图
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
  background: linear-gradient(135deg, var(--primary-50, #f0fdf4) 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid var(--surface-border, #e5e7eb);
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color, #1f2937);
  margin: 0 0 8px;
}

.welcome-desc {
  font-size: 16px;
  color: var(--text-color-secondary, #6b7280);
  margin: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #1f2937);
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
  background: var(--surface-card, #ffffff);
  border-radius: 10px;
  border: 1px solid var(--surface-border, #e5e7eb);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-card:hover {
  border-color: var(--primary-300, #86efac);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
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

.action-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, #1f2937);
}

.action-desc {
  font-size: 12px;
  color: var(--text-color-secondary, #6b7280);
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
