<template>
  <LoginLayout :title="t('auth.createAccount')" :subtitle="t('auth.startManaging')">
    <form @submit.prevent="handleRegister" class="register-form">
      <!-- 用户名 -->
      <div class="form-group">
        <label for="username">{{ t('auth.username') }}</label>
        <div class="input-container">
          <i class="pi pi-user"></i>
          <InputText
            id="username"
            v-model="form.username"
            :placeholder="t('auth.usernamePlaceholder')"
            autocomplete="username"
          />
        </div>
      </div>

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

      <!-- 密码 -->
      <div class="form-group">
        <label for="password">{{ t('auth.password') }}</label>
        <div class="input-container">
          <i class="pi pi-lock"></i>
          <Password
            id="password"
            v-model="form.password"
            :placeholder="t('auth.passwordPlaceholder')"
            toggleMask
            autocomplete="new-password"
          />
        </div>
      </div>

      <!-- 确认密码 -->
      <div class="form-group">
        <label for="confirmPassword">{{ t('auth.confirmPassword') }}</label>
        <div class="input-container">
          <i class="pi pi-lock"></i>
          <Password
            id="confirmPassword"
            v-model="form.confirmPassword"
            :placeholder="t('auth.confirmPasswordPlaceholder')"
            :feedback="false"
            toggleMask
            autocomplete="new-password"
          />
        </div>
      </div>

      <!-- 注册按钮 -->
      <Button
        type="submit"
        :label="t('auth.register')"
        :loading="loading"
        class="submit-btn"
        icon="pi pi-user-plus"
      />
    </form>

    <template #footer>
      <span>{{ t('auth.hasAccount') }}</span>
      <router-link to="/login" class="login-link">
        {{ t('auth.loginNow') }}
      </router-link>
    </template>
  </LoginLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { register as registerApi } from '@/api'
import { useToast } from '@/composables'
import LoginLayout from './LoginLayout.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const toast = useToast()

const loading = ref(false)

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

async function handleRegister() {
  // 表单验证
  if (!form.value.username || !form.value.email || !form.value.password) {
    toast.error(t('auth.fillAllFields'))
    return
  }

  // 验证密码匹配
  if (form.value.password !== form.value.confirmPassword) {
    toast.error(t('auth.passwordMismatch'))
    return
  }

  // 验证密码长度
  if (form.value.password.length < 6) {
    toast.error(t('auth.passwordTooShort'))
    return
  }

  loading.value = true
  try {
    const res = await registerApi({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
    })

    if (res.code === 0) {
      toast.success(t('auth.registerSuccess'))
      // 注册成功后跳转到登录页，并传递 redirect 参数
      const redirect = route.query.redirect as string
      if (redirect) {
        router.push({ path: '/login', query: { redirect } })
      } else {
        router.push('/login')
      }
    } else {
      toast.error(res.message || t('auth.registerFailed'))
    }
  } catch (error: any) {
    console.error('Register failed:', error)
    toast.error(error?.response?.data?.message || error?.message || t('auth.registerFailed'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 表单样式 */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.input-container :deep(.p-password) {
  width: 100%;
}

.input-container :deep(.p-password-input) {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-size: 15px;
  background: var(--color-bg-card);
  transition: all 0.2s ease;
}

.input-container :deep(.p-password-input:hover) {
  border-color: var(--color-border-hover);
}

.input-container :deep(.p-password-input:focus) {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px var(--color-primary-100);
  outline: none;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 14px 24px;
  margin-top: 12px;
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
