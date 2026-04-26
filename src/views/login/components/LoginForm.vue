<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <!-- 邮箱输入 -->
    <div class="form-item">
      <label for="email">{{ t('auth.email') }}</label>
      <div class="input-wrapper">
        <i class="pi pi-envelope input-icon"></i>
        <InputText
          id="email"
          v-model="form.email"
          :placeholder="t('auth.emailPlaceholder')"
          class="form-input"
        />
      </div>
    </div>

    <!-- 密码输入 -->
    <div class="form-item">
      <label for="password">{{ t('auth.password') }}</label>
      <div class="input-wrapper">
        <i class="pi pi-lock input-icon"></i>
        <Password
          id="password"
          v-model="form.password"
          :placeholder="t('auth.passwordPlaceholder')"
          :feedback="false"
          class="form-input"
          inputClass="password-input"
        />
      </div>
    </div>

    <!-- 记住我和忘记密码 -->
    <div class="form-options">
      <div class="remember-me">
        <Checkbox v-model="form.rememberMe" :binary="true" inputId="rememberMe" />
        <label for="rememberMe">{{ t('auth.rememberMe') }}</label>
      </div>
      <a href="#" class="forgot-link">{{ t('auth.forgotPassword') }}</a>
    </div>

    <!-- 登录按钮 -->
    <Button
      type="submit"
      :label="t('auth.login')"
      :loading="loading"
      class="login-btn"
      icon="pi pi-sign-in"
    />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  submit: [payload: { email: string; password: string; rememberMe: boolean }]
}>()

const { t } = useI18n()

const form = ref({
  email: '',
  password: '',
  rememberMe: false,
})

function handleSubmit() {
  if (!form.value.email || !form.value.password) {
    return
  }
  emit('submit', {
    email: form.value.email,
    password: form.value.password,
    rememberMe: form.value.rememberMe,
  })
}

// 暴露 form 状态供父组件使用
defineExpose({
  form,
})
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  z-index: 1;
  color: #9ca3af;
  font-size: 16px;
  transition: color 0.3s ease;
}

.input-wrapper:focus-within .input-icon {
  color: #1a5f4a;
}

.form-input {
  width: 100%;
  padding: 14px 16px 14px 44px !important;
  border: 2px solid #e5e7eb !important;
  border-radius: 12px !important;
  font-size: 15px !important;
  background: #f9fafb !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.form-input:hover {
  border-color: #d1d5db !important;
  background: #fff !important;
}

.form-input:focus {
  border-color: #1a5f4a !important;
  background: #fff !important;
  box-shadow: 0 0 0 4px rgba(26, 95, 74, 0.1) !important;
  outline: none !important;
}

.form-input::placeholder {
  color: #9ca3af;
}

/* 密码输入框特殊处理 */
.form-input :deep(.p-password-input) {
  width: 100%;
  padding: 14px 16px !important;
  border: 2px solid #e5e7eb !important;
  border-radius: 12px !important;
  font-size: 15px !important;
  background: #f9fafb !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.form-input :deep(.p-password-input:hover) {
  border-color: #d1d5db !important;
  background: #fff !important;
}

.form-input :deep(.p-password-input:focus) {
  border-color: #1a5f4a !important;
  background: #fff !important;
  box-shadow: 0 0 0 4px rgba(26, 95, 74, 0.1) !important;
  outline: none !important;
}

/* 表单选项 */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -8px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remember-me label {
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
}

.remember-me :deep(.p-checkbox .p-checkbox-box) {
  border: 2px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.remember-me :deep(.p-checkbox .p-checkbox-box:hover) {
  border-color: #1a5f4a;
}

.remember-me :deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background: #1a5f4a;
  border-color: #1a5f4a;
}

.forgot-link {
  font-size: 14px;
  color: #1a5f4a;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #0d3d32;
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 16px 24px !important;
  margin-top: 8px;
  font-size: 16px !important;
  font-weight: 600 !important;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #1a5f4a 0%, #0d3d32 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  color: #fff !important;
  box-shadow: 0 4px 14px -4px rgba(26, 95, 74, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -6px rgba(26, 95, 74, 0.5) !important;
}

.login-btn:hover::before {
  opacity: 1;
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px -2px rgba(26, 95, 74, 0.4) !important;
}

.login-btn:focus {
  box-shadow: 0 0 0 4px rgba(26, 95, 74, 0.15), 0 4px 14px -4px rgba(26, 95, 74, 0.4) !important;
}

.login-btn:deep(.p-button-label) {
  font-weight: 600;
}

.login-btn:deep(.p-button-icon) {
  font-size: 18px;
}

/* 响应式 */
@media (max-width: 480px) {
  .login-form {
    gap: 20px;
  }

  .form-input {
    padding: 12px 14px 12px 40px !important;
    font-size: 14px !important;
  }

  .input-icon {
    left: 14px;
    font-size: 14px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .login-btn {
    padding: 14px 20px !important;
    font-size: 15px !important;
  }
}
</style>
