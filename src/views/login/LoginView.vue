<template>
  <div class="login-view">
    <div class="login-card">
      <h2>登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label>用户名</label>
          <InputText v-model="form.username" placeholder="请输入用户名" />
        </div>
        <div class="form-item">
          <label>密码</label>
          <Password v-model="form.password" placeholder="请输入密码" :feedback="false" toggleMask />
        </div>
        <div class="form-item">
          <Checkbox v-model="form.rememberMe" :binary="true" inputId="rememberMe" />
          <label for="rememberMe">记住我</label>
        </div>
        <Button type="submit" label="登录" :loading="loading" class="login-btn" />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: '',
  rememberMe: false,
})

const loading = ref(false)

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    return
  }

  loading.value = true
  try {
    await userStore.login({
      username: form.value.username,
      password: form.value.password,
    })
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-card h2 {
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.form-item :deep(.p-inputtext),
.form-item :deep(.p-password-input) {
  width: 100%;
}

.login-btn {
  width: 100%;
  margin-top: 10px;
}
</style>
