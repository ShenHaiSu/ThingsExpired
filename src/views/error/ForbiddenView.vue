<template>
  <div class="error-view">
    <div class="error-content">
      <h1 class="error-code">403</h1>
      <p class="error-message">无权访问</p>
      <p class="error-description">抱歉，您没有权限访问此页面</p>
      <Button label="返回首页" @click="goHome" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.error-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.error-content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #f59e0b;
  margin: 0;
}

.error-message {
  font-size: 24px;
  color: #333;
  margin: 20px 0 10px;
}

.error-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}
</style>
