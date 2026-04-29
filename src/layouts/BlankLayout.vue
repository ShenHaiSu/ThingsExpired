<template>
  <div class="blank-layout">
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
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
  background: var(--surface-ground, #f9fafb);
  padding: 16px;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .blank-layout {
    padding: 12px;
    align-items: flex-start;
    padding-top: 24px;
  }
}
</style>
