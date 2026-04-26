<template>
  <div class="login-view">
    <!-- 背景装饰 -->
    <LoginBackground />

    <!-- 登录容器 -->
    <div class="login-container">
      <div class="login-card">
        <!-- 登录头部 -->
        <LoginHeader />

        <!-- 登录表单 -->
        <LoginForm :loading="loading" @submit="handleLogin" />

        <!-- 登录底部 -->
        <LoginFooter />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { useToast } from '@/composables'
import { LoginHeader, LoginForm, LoginFooter, LoginBackground } from './components'

const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

const loading = ref(false)

async function handleLogin(payload: { email: string; password: string }) {
  loading.value = true
  try {
    const res = await userStore.login({
      email: payload.email,
      password: payload.password,
    })
    // 登录成功（code === 0）则跳转首页
    if (res.code === 0) {
      router.push('/')
    } else {
      // 登录失败，显示错误信息
      toast.error(res.message || '登录失败，请稍后重试')
    }
  } catch (error: any) {
    console.error('Login failed:', error)
    // 显示错误信息
    toast.error(error?.response?.data?.message || error?.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '../../assets/styles/login.scss';
</style>