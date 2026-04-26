<template>
  <div class="register-page">
    <!-- 左侧装饰区域 -->
    <div class="register-decoration">
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

    <!-- 右侧注册表单区域 -->
    <div class="register-form-area">
      <div class="form-container">
        <div class="form-header">
          <h2>创建账户</h2>
          <p>开始管理您的过期物品</p>
        </div>

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

        <!-- 登录链接 -->
        <div class="form-footer">
          <span>{{ t('auth.hasAccount') }}</span>
          <router-link to="/login" class="login-link">
            {{ t('auth.loginNow') }}
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
import Button from 'primevue/button'
import { register as registerApi } from '@/api/user'
import { useToast } from '@/composables'

const router = useRouter()
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
      // 注册成功后跳转到登录页
      router.push('/login')
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
.register-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #fff;
}

/* 左侧装饰区域 */
.register-decoration {
  flex: 1;
  display: none;
  position: relative;
  background: linear-gradient(135deg, #1a5f4a 0%, #0d3d32 100%);
  overflow: hidden;
}

@media (min-width: 992px) {
  .register-decoration {
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

/* 右侧注册表单区域 */
.register-form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #fafbfc;
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
  color: #1a1a2e;
  margin: 0 0 8px;
}

.form-header p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

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
  color: #374151;
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
  color: #9ca3af;
  font-size: 16px;
}

.input-container :deep(.p-inputtext) {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  background: #fff;
  transition: all 0.2s ease;
}

.input-container :deep(.p-inputtext:hover) {
  border-color: #d1d5db;
}

.input-container :deep(.p-inputtext:focus) {
  border-color: #1a5f4a;
  box-shadow: 0 0 0 4px rgba(26, 95, 74, 0.1);
  outline: none;
}

.input-container :deep(.p-password) {
  width: 100%;
}

.input-container :deep(.p-password-input) {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  background: #fff;
  transition: all 0.2s ease;
}

.input-container :deep(.p-password-input:hover) {
  border-color: #d1d5db;
}

.input-container :deep(.p-password-input:focus) {
  border-color: #1a5f4a;
  box-shadow: 0 0 0 4px rgba(26, 95, 74, 0.1);
  outline: none;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 14px 24px;
  margin-top: 12px;
  font-size: 16px;
  font-weight: 600;
  background: #1a5f4a !important;
  border: none !important;
  border-radius: 12px;
  color: #fff !important;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #0d3d32 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 95, 74, 0.3) !important;
}

.submit-btn:active {
  transform: translateY(0);
}

/* 底部链接 */
.form-footer {
  margin-top: 32px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.form-footer span {
  font-size: 14px;
  color: #6b7280;
}

.login-link {
  font-size: 14px;
  color: #1a5f4a;
  font-weight: 600;
  text-decoration: none;
  margin-left: 6px;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #0d3d32;
  text-decoration: underline;
}
</style>
