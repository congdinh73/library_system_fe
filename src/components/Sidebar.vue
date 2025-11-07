<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <font-awesome-icon :icon="['fas', 'book-open']" class="logo-icon" />
        <span v-if="!isCollapsed" class="logo-text">Thư viện</span>
      </div>
      <button @click="toggleSidebar" class="toggle-btn">
        <font-awesome-icon :icon="['fas', isCollapsed ? 'chevron-right' : 'chevron-left']" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <p v-if="!isCollapsed" class="section-title">Tổng quan</p>
        <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }">
          <font-awesome-icon :icon="['fas', 'chart-line']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Dashboard</span>
        </router-link>
        <router-link to="/statistics" class="nav-item" :class="{ active: isActive('/statistics') }">
          <font-awesome-icon :icon="['fas', 'chart-bar']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Thống kê</span>
        </router-link>
      </div>

      <div class="nav-section" v-if="!isStaff">
        <p v-if="!isCollapsed" class="section-title">Quản lý</p>
        <router-link to="/books" class="nav-item" :class="{ active: isActive('/books') }">
          <font-awesome-icon :icon="['fas', 'book']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Sách</span>
        </router-link>
        <router-link to="/loans" class="nav-item" :class="{ active: isActive('/loans') }">
          <font-awesome-icon :icon="['fas', 'book-open']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Mượn trả</span>
        </router-link>
        <router-link to="/readers" class="nav-item" :class="{ active: isActive('/readers') }">
          <font-awesome-icon :icon="['fas', 'users']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Độc giả</span>
        </router-link>
      </div>

      <div class="nav-section" v-if="!isStaff">
        <p v-if="!isCollapsed" class="section-title">Danh mục</p>
        <router-link to="/categories" class="nav-item" :class="{ active: isActive('/categories') }">
          <font-awesome-icon :icon="['fas', 'folder']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Thể loại</span>
        </router-link>
        <router-link to="/publishers" class="nav-item" :class="{ active: isActive('/publishers') }">
          <font-awesome-icon :icon="['fas', 'building']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Nhà xuất bản</span>
        </router-link>
      </div>

      <div class="nav-section" v-if="isAdmin">
        <p v-if="!isCollapsed" class="section-title">Hệ thống</p>
        <router-link to="/staff" class="nav-item" :class="{ active: isActive('/staff') }">
          <font-awesome-icon :icon="['fas', 'user-tie']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Nhân viên</span>
        </router-link>
        <router-link to="/roles" class="nav-item" :class="{ active: isActive('/roles') }">
          <font-awesome-icon :icon="['fas', 'user-shield']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Vai trò</span>
        </router-link>
        <router-link to="/health" class="nav-item" :class="{ active: isActive('/health') }">
          <font-awesome-icon :icon="['fas', 'heart-pulse']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Hệ thống</span>
        </router-link>
      </div>

      <div class="nav-section" v-if="isStaff">
        <p v-if="!isCollapsed" class="section-title">Quản lý</p>
        <router-link to="/books" class="nav-item" :class="{ active: isActive('/books') }">
          <font-awesome-icon :icon="['fas', 'book']" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-text">Sách</span>
        </router-link>
      </div>
    </nav>

    <div class="sidebar-footer">
      <router-link to="/profile" class="nav-item" :class="{ active: isActive('/profile') }">
        <font-awesome-icon :icon="['fas', 'user']" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-text">Cá nhân</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapsed = ref(false)
const userRole = ref('')

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const isActive = (path) => {
  return route.path === path
}

const isAdmin = computed(() => userRole.value === 'ADMIN')
const isStaff = computed(() => userRole.value === 'STAFF')

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    userRole.value = user.role || user.roles?.[0] || ''
  }
})
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 70px;
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.logo-icon {
  font-size: 24px;
  color: #3498db;
}

.logo-text {
  white-space: nowrap;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 24px;
}

.section-title {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  padding: 0 20px;
  margin-bottom: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: #3498db;
  opacity: 0;
  transition: opacity 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  background: rgba(52, 152, 219, 0.15);
  color: white;
}

.nav-item.active::before {
  opacity: 1;
}

.nav-icon {
  font-size: 18px;
  min-width: 18px;
  text-align: center;
}

.nav-text {
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar.collapsed .section-title,
.sidebar.collapsed .logo-text,
.sidebar.collapsed .nav-text {
  display: none;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 20px 10px;
}

.sidebar.collapsed .toggle-btn {
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  background: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  z-index: 10;
}

/* Scrollbar styling */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
