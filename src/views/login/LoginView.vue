<template>
  <div class="login-page">
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

    <!-- 右侧登录表单区域 -->
    <div class="login-form-area">
      <div class="form-container">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p>请登录您的账户</p>
        </div>

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
            <a href="#" class="forgot-link">{{ t('auth.forgotPassword') }}</a>
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

        <!-- 注册链接 -->
        <div class="form-footer">
          <span>{{ t('auth.noAccount') }}</span>
          <router-link to="/register" class="register-link">
            {{ t('auth.registerNow') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables'

const router = useRouter()
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

    // 登录成功（code === 0）则跳转首页
    if (res.code === 0) {
      router.push('/')
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
.login-page {
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

/* 右侧登录表单区域 */
.login-form-area {
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
.form-footer {
  margin-top: 32px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.form-footer span {
  font-size: 14px;
  color: var(--color-text-secondary);
}

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
