<template>
  <div class="default-layout">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-left">
        <!-- 移动端汉堡菜单按钮 -->
        <Button icon="pi pi-bars" text class="md:hidden" @click="toggleMobileMenu" />
        <i class="pi pi-box text-green-500 text-xl mr-2"></i>
        <h1 class="logo">Things Expired</h1>
      </div>
      <div class="header-right">
        <span class="username hidden sm:inline">{{ userStore.userInfo?.name }}</span>
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
      <!-- 侧边栏 - 桌面端显示 -->
      <aside class="layout-sidebar hidden md:block">
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

      <!-- 移动端底部导航栏 -->
      <nav class="mobile-nav hidden md:hidden">
        <router-link to="/" class="mobile-nav-item">
          <i class="pi pi-home"></i>
          <span>首页</span>
        </router-link>
        <router-link to="/items" class="mobile-nav-item">
          <i class="pi pi-list"></i>
          <span>物品</span>
        </router-link>
        <router-link to="/categories" class="mobile-nav-item">
          <i class="pi pi-folder"></i>
          <span>分类</span>
        </router-link>
        <router-link to="/settings" class="mobile-nav-item">
          <i class="pi pi-cog"></i>
          <span>设置</span>
        </router-link>
      </nav>
    </div>

    <!-- 移动端侧边栏抽屉 -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-sidebar-overlay md:hidden"
      @click="toggleMobileMenu"
    ></div>
    <aside v-if="mobileMenuOpen" class="mobile-sidebar md:hidden">
      <div class="mobile-sidebar-header">
        <span class="username">{{ userStore.userInfo?.name }}</span>
        <Button icon="pi pi-times" text @click="toggleMobileMenu" />
      </div>
      <nav class="mobile-sidebar-nav">
        <router-link to="/" class="mobile-nav-item" @click="toggleMobileMenu">
          <i class="pi pi-home"></i>
          <span>首页</span>
        </router-link>
        <router-link to="/items" class="mobile-nav-item" @click="toggleMobileMenu">
          <i class="pi pi-list"></i>
          <span>物品管理</span>
        </router-link>
        <router-link to="/categories" class="mobile-nav-item" @click="toggleMobileMenu">
          <i class="pi pi-folder"></i>
          <span>分类管理</span>
        </router-link>
        <router-link to="/settings" class="mobile-nav-item" @click="toggleMobileMenu">
          <i class="pi pi-cog"></i>
          <span>设置</span>
        </router-link>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user/userStore'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const userStore = useUserStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 16px;
  background: var(--surface-card, #ffffff);
  border-bottom: 1px solid var(--surface-border, #e5e7eb);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color, #1f2937);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  color: var(--text-color-secondary, #6b7280);
  font-size: 14px;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.layout-sidebar {
  width: 220px;
  background: var(--surface-card, #ffffff);
  border-right: 1px solid var(--surface-border, #e5e7eb);
  flex-shrink: 0;
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
  padding: 16px;
  overflow-y: auto;
  background: var(--surface-ground, #f9fafb);
}

/* 移动端底部导航栏 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--surface-card, #ffffff);
  border-top: 1px solid var(--surface-border, #e5e7eb);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

/* 桌面端隐藏底部导航栏 */
@media (min-width: 768px) {
  .mobile-nav {
    display: none !important;
  }
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  color: var(--text-color-secondary, #6b7280);
  text-decoration: none;
  font-size: 12px;
  transition: all 0.2s ease;
  min-height: 44px;
  min-width: 44px;
}

.mobile-nav-item:hover {
  color: var(--primary-600, #16a34a);
}

.mobile-nav-item.router-link-active {
  color: var(--primary-500, #22c55e);
}

/* 移动端侧边栏抽屉 */
.mobile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: var(--surface-card, #ffffff);
  z-index: 201;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease;
}

.mobile-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--surface-border, #e5e7eb);
}

.mobile-sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.mobile-sidebar-nav .mobile-nav-item {
  flex-direction: row;
  justify-content: flex-start;
  gap: 12px;
  padding: 12px 24px;
  font-size: 14px;
  width: 100%;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
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

/* 桌面端适配 */
@media (min-width: 768px) {
  .layout-header {
    padding: 0 24px;
  }

  .logo {
    font-size: 18px;
  }

  .layout-main {
    padding: 24px;
  }
}

/* 大屏幕适配 */
@media (min-width: 1024px) {
  .layout-header {
    padding: 0 32px;
  }

  .layout-main {
    padding: 32px;
  }
}
</style>
