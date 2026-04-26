<template>
  <div class="login-header">
    <div class="logo-wrapper">
      <i class="pi pi-box logo-icon"></i>
    </div>
    <h1 class="title">{{ t('auth.title') }}</h1>
    <p class="subtitle">{{ t('auth.subtitle') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #1a5f4a 0%, #0d3d32 100%);
  border-radius: 18px;
  margin-bottom: 20px;
  box-shadow: 0 8px 20px -8px rgba(26, 95, 74, 0.4);
  transition: all 0.3s ease;
  animation: float 3s ease-in-out infinite;
}

.logo-wrapper:hover {
  transform: scale(1.05) rotate(3deg);
  box-shadow: 0 12px 28px -10px rgba(26, 95, 74, 0.5);
}

.logo-icon {
  font-size: 32px;
  color: #fff;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (min-width: 1200px) {
  .title {
    font-size: 32px;
  }

  .logo-wrapper {
    width: 80px;
    height: 80px;
  }

  .logo-icon {
    font-size: 36px;
  }
}

@media (min-width: 1920px) {
  .title {
    font-size: 36px;
  }

  .logo-wrapper {
    width: 88px;
    height: 88px;
  }

  .logo-icon {
    font-size: 40px;
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 24px;
  }

  .logo-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }

  .logo-icon {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .login-header {
    margin-bottom: 32px;
  }

  .logo-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    margin-bottom: 16px;
  }

  .logo-icon {
    font-size: 24px;
  }

  .title {
    font-size: 22px;
  }

  .subtitle {
    font-size: 12px;
  }
}
</style>
