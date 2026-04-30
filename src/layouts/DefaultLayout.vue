<template>
  <div class="default-layout">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-left">
        <!-- 顶栏菜单按钮 - 统一控制侧边栏 -->
        <Button icon="pi pi-bars" text @click="toggleSidebar" />
        <i class="pi pi-box text-green-500 text-xl mr-2"></i>
        <h1 class="logo">Things Expired</h1>
      </div>
      <div class="header-right">
        <span class="username sm:inline">{{ userStore.userInfo?.name }}</span>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="layout-body">
      <!-- 统一侧边栏 - 移动端默认隐藏 -->
      <aside
        class="layout-sidebar"
        :class="{
          hidden: isMobile && !mobileSidebarOpen,
          'mobile-open': isMobile && mobileSidebarOpen,
          'md:block': !isMobile,
          collapsed: sidebarCollapsed && !isMobile,
        }"
      >
        <nav class="sidebar-nav">
          <router-link to="/" class="nav-item" @click="handleNavClick">
            <i class="pi pi-home"></i>
            <span>{{ t('menu.home') }}</span>
          </router-link>
          <router-link to="/items" class="nav-item" @click="handleNavClick">
            <i class="pi pi-list"></i>
            <span>{{ t('menu.items') }}</span>
          </router-link>
          <router-link to="/categories" class="nav-item" @click="handleNavClick">
            <i class="pi pi-folder"></i>
            <span>{{ t('menu.categories') }}</span>
          </router-link>
          <router-link to="/settings" class="nav-item" @click="handleNavClick">
            <i class="pi pi-cog"></i>
            <span>{{ t('menu.settings') }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- 移动端侧边栏遮罩 -->
      <div
        v-if="mobileSidebarOpen && isMobile"
        class="sidebar-overlay"
        @click="closeMobileSidebar"
      ></div>

      <!-- 主内容区 -->
      <main class="layout-main" @click="handleMainClick">
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>

      <!-- 移动端底栏 -->
      <footer class="mobile-footer" v-if="isMobile">
        <router-link to="/" class="footer-item" @click="closeMobileSidebar">
          <i class="pi pi-home"></i>
          <span>{{ t('menu.home') }}</span>
        </router-link>
        <router-link to="/items" class="footer-item" @click="closeMobileSidebar">
          <i class="pi pi-list"></i>
          <span>{{ t('footer.items') }}</span>
        </router-link>
        <router-link to="/categories" class="footer-item" @click="closeMobileSidebar">
          <i class="pi pi-folder"></i>
          <span>{{ t('footer.categories') }}</span>
        </router-link>
        <router-link to="/settings" class="footer-item" @click="closeMobileSidebar">
          <i class="pi pi-cog"></i>
          <span>{{ t('menu.settings') }}</span>
        </router-link>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user/userStore'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'

const userStore = useUserStore()
const { t } = useI18n()

// 响应式状态
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)
const windowWidth = ref(window.innerWidth)

// 判断是否为移动端
const isMobile = computed(() => windowWidth.value < 768)

// 监听窗口大小变化
function handleResize() {
  windowWidth.value = window.innerWidth
  // 窗口大小变化时，如果切换到桌面端，关闭移动端侧边栏
  if (!isMobile.value) {
    mobileSidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 切换侧边栏（桌面端切换常驻状态，移动端切换抽屉显示）
function toggleSidebar() {
  if (isMobile.value) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

// 关闭移动端侧边栏
function closeMobileSidebar() {
  mobileSidebarOpen.value = false
}

// 处理导航点击（移动端自动关闭侧边栏）
function handleNavClick() {
  if (isMobile.value) {
    closeMobileSidebar()
  }
}

// 处理主内容区点击（移动端自动关闭侧边栏）
function handleMainClick() {
  if (isMobile.value && mobileSidebarOpen.value) {
    closeMobileSidebar()
  }
}
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  padding-bottom: 0;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 16px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
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
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  color: var(--color-text-secondary);
  font-size: 14px;
  position: relative;
  transition: color 0.3s ease;
}

.username::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary-500);
  transition: width 0.3s ease;
}

.username:hover {
  color: var(--color-primary-500);
}

.username:hover::after {
  width: 100%;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  padding-bottom: 0;
}

/* 统一侧边栏样式 */
.layout-sidebar {
  width: 220px;
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  flex-shrink: 0;
  transition:
    width 0.2s ease,
    transform 0.2s ease;
  z-index: 90;
}

/* 桌面端收起状态 */
.layout-sidebar.collapsed {
  width: 60px;
}

.layout-sidebar.collapsed .nav-item span {
  display: none;
}

.layout-sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

/* 移动端抽屉状态 */
.layout-sidebar.mobile-open {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 201;
  animation: slideIn 0.2s ease;
}

/* 移动端底栏 */
.mobile-footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.footer-item:hover {
  color: var(--color-primary-600);
}

.footer-item.router-link-active {
  color: var(--color-primary-500);
}

.footer-item i {
  font-size: 18px;
}

/* 移动端遮罩 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-shadow-lg);
  z-index: 200;
}

.sidebar-nav {
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  border-right: 3px solid transparent;
}

.nav-item:hover {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

.nav-item.router-link-active {
  background: var(--color-primary-50);
  color: var(--color-primary-500);
  border-right: 3px solid var(--color-primary-500);
  font-weight: 500;
}

.layout-main {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: var(--color-bg-page);
  padding-bottom: 70px; /* 为移动端底栏留出空间 */
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

/* 动画 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
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
    padding-bottom: 24px; /* 桌面端不需要底栏空间 */
  }

  /* 桌面端隐藏移动端遮罩 */
  .sidebar-overlay {
    display: none;
  }

  /* 桌面端隐藏移动端底栏 */
  .mobile-footer {
    display: none;
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
