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
          <p class="app-slogan">过期物品管理平台</p>
        </div>
        <div class="feature-list">
          <div class="feature-item">
            <i class="pi pi-check-circle"></i>
            <span>追踪物品过期时间</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-bell"></i>
            <span>智能提醒功能</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-folder"></i>
            <span>分类整理物品</span>
          </div>
        </div>
      </div>
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
    </div>

    <!-- 右侧表单区域 -->
    <div class="form-area">
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
interface Props {
  title: string
  subtitle: string
}

defineProps<Props>()
</script>

<style scoped>
.login-layout {
  display: flex;
  min-height: 100vh;
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
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--color-bg-page);
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
