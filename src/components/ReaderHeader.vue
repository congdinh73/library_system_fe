<template>
  <header class="reader-header">
    <div class="header-left">
      <div class="logo">
        <font-awesome-icon :icon="['fas', 'book-open']" class="logo-icon" />
        <h1>Thư viện</h1>
      </div>
    </div>
    <div class="header-right">
      <!-- Custom slot for additional buttons/content -->
      <slot name="actions"></slot>
      
      <!-- User Menu -->
      <div class="user-info" @click="toggleUserMenu">
        <font-awesome-icon :icon="['fas', 'user-circle']" class="user-icon" />
        <span class="user-name">{{ user?.name || user?.email }}</span>
        <font-awesome-icon :icon="['fas', 'chevron-down']" class="dropdown-arrow" />
        
        <!-- User Dropdown Menu -->
        <div v-if="showUserMenu" class="user-dropdown" @click.stop>
          <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
            <font-awesome-icon :icon="['fas', 'user']" class="item-icon" />
            <span>Thông tin cá nhân</span>
          </router-link>
          <button @click.stop="handleLogout" class="dropdown-item logout">
            <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="item-icon" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }
})
</script>

<style scoped>
/* Header */
.reader-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 100;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.8rem;
  color: #667eea;
}

.logo h1 {
  font-size: 1.5rem;
  color: #667eea;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(102, 126, 234, 0.2);
}

.user-icon {
  font-size: 1.3rem;
  color: #667eea;
}

.user-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.dropdown-arrow {
  font-size: 0.8rem;
  color: #666;
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-arrow {
  transform: translateY(2px);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.logout {
  color: #e74c3c;
  border-top: 1px solid #f0f0f0;
}

.dropdown-item.logout:hover {
  background: #fee;
  color: #c0392b;
}

.item-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
  color: #667eea;
}

.dropdown-item.logout .item-icon {
  color: #e74c3c;
}

/* Responsive */
@media (max-width: 768px) {
  .reader-header {
    padding: 0.75rem 1rem;
  }

  .logo h1 {
    font-size: 1.25rem;
  }

  .user-name {
    display: none;
  }
}
</style>
