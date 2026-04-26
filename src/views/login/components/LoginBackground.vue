<template>
  <div class="login-background">
    <div class="background-shape shape-1"></div>
    <div class="background-shape shape-2"></div>
    <div class="background-shape shape-3"></div>
  </div>
</template>

<script setup lang="ts">
// 背景装饰组件 - 无需逻辑
</script>

<style scoped>
.login-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #2d8a6e 0%, #1a5f4a 100%);
  top: -200px;
  right: -100px;
  filter: blur(80px);
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  bottom: -100px;
  left: -50px;
  filter: blur(60px);
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(100px);
  opacity: 0.2;
}

/* 响应式设计 */
@media (min-width: 1200px) {
  .shape-1 {
    width: 800px;
    height: 800px;
  }

  .shape-2 {
    width: 600px;
    height: 600px;
  }

  .shape-3 {
    width: 400px;
    height: 400px;
  }
}

@media (min-width: 1920px) {
  .shape-1 {
    width: 1000px;
    height: 1000px;
  }

  .shape-2 {
    width: 800px;
    height: 800px;
  }

  .shape-3 {
    width: 500px;
    height: 500px;
  }
}

@media (max-width: 768px) {
  .shape-1 {
    width: 400px;
    height: 400px;
  }

  .shape-2 {
    width: 280px;
    height: 280px;
  }
}

@media (max-width: 480px) {
  .background-shape {
    opacity: 0.3;
  }

  .shape-1 {
    width: 280px;
    height: 280px;
    top: -80px;
    right: -60px;
  }

  .shape-2 {
    width: 200px;
    height: 200px;
    bottom: -60px;
    left: -40px;
  }
}
</style>
