<template>
  <div class="error-view">
    <div class="error-background">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
    <div class="error-content">
      <div class="error-icon-wrapper">
        <div class="icon-circle">
          <i class="pi pi-lock"></i>
        </div>
        <div class="icon-ring"></div>
      </div>
      <h1 class="error-code">{{ t('error.forbidden.code') }}</h1>
      <p class="error-message">{{ t('error.forbidden.title') }}</p>
      <p class="error-description">{{ t('error.forbidden.description') }}</p>
      <div class="error-actions">
        <Button
          :label="t('error.backToHome')"
          icon="pi pi-home"
          @click="goHome"
          class="p-button-primary"
        />
        <Button
          :label="t('error.goBack')"
          icon="pi pi-arrow-left"
          @click="goBack"
          class="p-button-outlined p-button-secondary"
        />
      </div>
      <div class="error-hint">
        <i class="pi pi-info-circle"></i>
        <span>{{ t('error.forbidden.hint') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'

const router = useRouter()
const { t } = useI18n()

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.error-view {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-width: 100vw;
  background: var(--color-bg-page);
  overflow: hidden;
}

/* 背景装饰 */
.error-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: var(--color-warning);
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: var(--color-warning);
  bottom: -50px;
  left: -50px;
  animation-delay: -5s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: var(--color-warning);
  top: 50%;
  left: 20%;
  animation-delay: -10s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -20px) scale(1.05);
  }
  50% {
    transform: translate(-10px, 10px) scale(0.95);
  }
  75% {
    transform: translate(-20px, -10px) scale(1.02);
  }
}

/* 内容区域 */
.error-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 48px 56px;
  background: var(--color-bg-card);
  border-radius: 16px;
  box-shadow: 0 8px 32px var(--color-shadow);
  border: 1px solid var(--color-border);
  max-width: 480px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 图标样式 */
.error-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(
    135deg,
    var(--color-warning) 0%,
    color-mix(in srgb, var(--color-warning) 80%, black) 100%
  );
  border-radius: 50%;
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-warning) 40%, transparent);
  animation: pulse 2s ease-in-out infinite;
}

.icon-circle i {
  font-size: 36px;
  color: white;
}

.icon-ring {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid var(--color-warning);
  border-radius: 50%;
  opacity: 0.3;
  animation: ringPulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 20px color-mix(in srgb, var(--color-warning) 40%, transparent);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 30px color-mix(in srgb, var(--color-warning) 50%, transparent);
  }
}

@keyframes ringPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
}

/* 错误码 */
.error-code {
  font-size: 96px;
  font-weight: 800;
  background: linear-gradient(
    135deg,
    var(--color-warning) 0%,
    color-mix(in srgb, var(--color-warning) 70%, var(--color-primary-500)) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1;
  letter-spacing: -2px;
  animation: fadeIn 0.5s ease-out 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 错误消息 */
.error-message {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 16px 0 8px;
  animation: fadeIn 0.5s ease-out 0.3s both;
}

.error-description {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
  animation: fadeIn 0.5s ease-out 0.4s both;
}

/* 按钮区域 */
.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
  animation: fadeIn 0.5s ease-out 0.5s both;
}

.error-actions :deep(.p-button) {
  min-width: 140px;
}

/* 提示信息 */
.error-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--color-warning) 10%, transparent);
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--color-warning) 20%, transparent);
  font-size: 13px;
  color: var(--color-text-secondary);
  animation: fadeIn 0.5s ease-out 0.6s both;
}

.error-hint i {
  color: var(--color-warning);
  font-size: 14px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .error-content {
    padding: 40px 32px;
    margin: 16px;
    max-width: calc(100% - 32px);
  }

  .icon-circle {
    width: 64px;
    height: 64px;
  }

  .icon-circle i {
    font-size: 28px;
  }

  .icon-ring {
    width: 80px;
    height: 80px;
  }

  .error-code {
    font-size: 72px;
  }

  .error-message {
    font-size: 20px;
  }

  .error-description {
    font-size: 14px;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-actions :deep(.p-button) {
    width: 100%;
  }

  .bg-shape {
    opacity: 0.05;
  }

  .shape-1 {
    width: 250px;
    height: 250px;
  }

  .shape-2 {
    width: 180px;
    height: 180px;
  }

  .shape-3 {
    width: 120px;
    height: 120px;
  }
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .error-content {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}
</style>
