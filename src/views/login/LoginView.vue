<template>
  <LoginLayout :title="t('auth.welcomeBack')" :subtitle="t('auth.pleaseLogin')">
    <form @submit.prevent="handleLogin" class="login-form">
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
            :feedback="false"
            toggleMask
            autocomplete="current-password"
          />
        </div>
      </div>

      <!-- 记住我 & 忘记密码 -->
      <div class="form-options">
        <div class="remember-me">
          <Checkbox v-model="form.rememberMe" :binary="true" inputId="rememberMe" />
          <label for="rememberMe">{{ t('auth.rememberMe') }}</label>
        </div>
        <router-link
          :to="{ path: '/forgot-password', query: { redirect: route.query.redirect } }"
          class="forgot-link"
        >
          {{ t('auth.forgotPassword') }}
        </router-link>
      </div>

      <!-- 登录按钮 -->
      <Button
        type="submit"
        :label="t('auth.login')"
        :loading="loading"
        class="submit-btn"
        icon="pi pi-sign-in"
      />
    </form>

    <template #footer>
      <span>{{ t('auth.noAccount') }}</span>
      <router-link
        :to="{ path: '/register', query: { redirect: route.query.redirect } }"
        class="register-link"
      >
        {{ t('auth.registerNow') }}
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
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables'
import LoginLayout from './LoginLayout.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const userStore = useUserStore()
const toast = useToast()

const loading = ref(false)

const form = ref({
  email: '',
  password: '',
  rememberMe: false,
})

async function handleLogin() {
  // 表单验证
  if (!form.value.email || !form.value.password) {
    toast.error(t('auth.fillAllFields'))
    return
  }

  loading.value = true
  try {
    const res = await userStore.login({
      email: form.value.email,
      password: form.value.password,
    })

    // 登录成功（code === 0）则跳转
    if (res.code === 0) {
      // 检查是否有 redirect 参数，有则跳转到该页面，否则跳转到首页
      const redirect = route.query.redirect as string
      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/')
      }
    } else {
      toast.error(res.message || '登录失败，请稍后重试')
    }
  } catch (error: any) {
    console.error('Login failed:', error)
    toast.error(error?.response?.data?.message || error?.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 表单样式 */
.login-form {
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

/* 表单选项 */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remember-me label {
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  user-select: none;
}

.remember-me :deep(.p-checkbox .p-checkbox-box) {
  border: 2px solid var(--color-border-hover);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.remember-me :deep(.p-checkbox .p-checkbox-box:hover) {
  border-color: var(--color-primary-500);
}

.remember-me :deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.forgot-link {
  font-size: 14px;
  color: var(--color-primary-600);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--color-primary-700);
  text-decoration: underline;
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
.register-link {
  font-size: 14px;
  color: var(--color-primary-600);
  font-weight: 600;
  text-decoration: none;
  margin-left: 6px;
  transition: color 0.2s ease;
}

.register-link:hover {
  color: var(--color-primary-700);
  text-decoration: underline;
}
</style>
