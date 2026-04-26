<template>
  <div class="login-footer">
    <span class="footer-text">{{ t('auth.noAccount') }}</span>
    <router-link to="/register" class="register-link">
      {{ t('auth.registerNow') }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.login-footer {
  margin-top: 32px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.footer-text {
  font-size: 14px;
  color: #6b7280;
}

.register-link {
  font-size: 14px;
  color: #1a5f4a;
  font-weight: 600;
  text-decoration: none;
  margin-left: 6px;
  transition: color 0.2s ease;
}

.register-link:hover {
  color: #0d3d32;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-footer {
    margin-top: 24px;
    padding-top: 20px;
  }
}
</style>
