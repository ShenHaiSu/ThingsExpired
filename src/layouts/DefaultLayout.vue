<template>
  <div class="default-layout">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-left">
        <h1 class="logo">Things Expired</h1>
      </div>
      <div class="header-right">
        <span class="username">{{ userStore.userInfo?.name }}</span>
        <Button icon="pi pi-sign-out" label="退出" text @click="handleLogout" />
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
        <router-view />
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
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: #6b7280;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.layout-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
}

.sidebar-nav {
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #4b5563;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.nav-item.router-link-active {
  background: #eff6ff;
  color: #3b82f6;
  border-right: 3px solid #3b82f6;
}

.layout-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f9fafb;
}
</style>
