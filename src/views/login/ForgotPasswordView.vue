<template>
  <LoginLayout :title="t('auth.forgotPassword')" :subtitle="t('auth.resetPasswordHint')">
    <form @submit.prevent="handleSubmit" class="forgot-form">
      <!-- 邮箱 -->
      <div class="form-group">
        <label for="email">{{ t('auth.email') }}</label>
        <div class="input-container">
          <i class="pi pi-envelope"></i>
          <InputText
            id="email"
            v-model="form.email"
            :placeholder="t('auth.emailPlaceholder')"
            type="email"
            autocomplete="email"
          />
        </div>
      </div>

      <!-- 提交按钮 -->
      <Button
        type="submit"
        :label="t('auth.sendResetLink')"
        :loading="loading"
        class="submit-btn"
        icon="pi pi-send"
      />
    </form>

    <template #footer>
      <span>{{ t('auth.rememberPassword') }}</span>
      <router-link :to="{ path: '/login', query: { redirect } }" class="login-link">
        {{ t('auth.backToLogin') }}
      </router-link>
    </template>
  </LoginLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useToast } from '@/composables'
import LoginLayout from './LoginLayout.vue'

const route = useRoute()
const { t } = useI18n()
const toast = useToast()

const loading = ref(false)

const form = ref({
  email: '',
})

async function handleSubmit() {
  // 表单验证
  if (!form.value.email) {
    toast.error(t('auth.fillEmail'))
    return
  }

  loading.value = true
  try {
    // 模拟发送重置密码链接
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('重置密码链接已发送到您的邮箱')
    // 这里可以调用 API 发送重置密码链接
  } catch (error: any) {
    console.error('Send reset link failed:', error)
    toast.error(error?.message || '发送失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取 redirect 参数
const redirect = route.query.redirect as string
</script>

<style scoped>
/* 表单样式 */
.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-container > i {
  position: absolute;
  left: 16px;
  z-index: 1;
  color: var(--color-text-disabled);
  font-size: 16px;
}

.input-container :deep(.p-inputtext) {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-size: 15px;
  background: var(--color-bg-card);
  transition: all 0.2s ease;
}

.input-container :deep(.p-inputtext:hover) {
  border-color: var(--color-border-hover);
}

.input-container :deep(.p-inputtext:focus) {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px var(--color-primary-100);
  outline: none;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 14px 24px;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  background: var(--color-primary-500) !important;
  border: none !important;
  border-radius: 12px;
  color: #fff !important;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: var(--color-primary-600) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3) !important;
}

.submit-btn:active {
  transform: translateY(0);
}

/* 底部链接 */
.login-link {
  font-size: 14px;
  color: var(--color-primary-600);
  font-weight: 600;
  text-decoration: none;
  margin-left: 6px;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: var(--color-primary-700);
  text-decoration: underline;
}
</style>