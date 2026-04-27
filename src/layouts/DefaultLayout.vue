<template>
  <div class="default-layout">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-left">
        <i class="pi pi-box text-green-500 text-xl mr-2"></i>
        <h1 class="logo">Things Expired</h1>
      </div>
      <div class="header-right">
        <span class="username">{{ userStore.userInfo?.name }}</span>
        <Button
          icon="pi pi-sign-out"
          label="退出"
          severity="secondary"
          text
          @click="handleLogout"
        />
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="layout-body">
      <!-- 侧边栏 -->
      <aside class="layout-sidebar">
        <nav class="sidebar-nav">
          <router-link to="/" class="nav-item">
            <i class="pi pi-home"></i>
            <span>首页</span>
          </router-link>
          <router-link to="/items" class="nav-item">
            <i class="pi pi-list"></i>
            <span>物品管理</span>
          </router-link>
          <router-link to="/categories" class="nav-item">
            <i class="pi pi-folder"></i>
            <span>分类管理</span>
          </router-link>
          <router-link to="/settings" class="nav-item">
            <i class="pi pi-cog"></i>
            <span>设置</span>
          </router-link>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="layout-main">
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user/userStore'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const userStore = useUserStore()
const router = useRouter()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 24px;
  background: var(--surface-card, #ffffff);
  border-bottom: 1px solid var(--surface-border, #e5e7eb);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color, #1f2937);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: var(--text-color-secondary, #6b7280);
  font-size: 14px;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.layout-sidebar {
  width: 220px;
  background: var(--surface-card, #ffffff);
  border-right: 1px solid var(--surface-border, #e5e7eb);
}

.sidebar-nav {
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: var(--text-color-secondary, #6b7280);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  border-right: 3px solid transparent;
}

.nav-item:hover {
  background: var(--primary-50, #f0fdf4);
  color: var(--primary-600, #16a34a);
}

.nav-item.router-link-active {
  background: var(--primary-50, #f0fdf4);
  color: var(--primary-500, #22c55e);
  border-right: 3px solid var(--primary-500, #22c55e);
  font-weight: 500;
}

.layout-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: var(--surface-ground, #f9fafb);
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
</style>
