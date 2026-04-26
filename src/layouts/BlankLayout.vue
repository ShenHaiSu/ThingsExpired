<template>
  <div class="blank-layout">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 空白布局 - 仅包含路由视图，无任何装饰
// 用于登录页、错误页等不需要导航的场景
</script>

<style scoped>
.blank-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background: #f9fafb;
}
</style>
