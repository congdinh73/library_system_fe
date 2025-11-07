<template>
  <header class="admin-header">
    <div class="header-left">
      <button v-if="showBackButton && !isStaff" @click="goBack" class="back-btn">
        ← Quay lại
      </button>
      <h1>
        <span v-if="icon">{{ icon }}</span>
        {{ title }}
      </h1>
    </div>
    <div class="header-right">
      <!-- Custom slot for action buttons -->
      <slot name="actions"></slot>
      
      <!-- User Menu -->
      <div class="user-info" @click="toggleUserMenu">
        <font-awesome-icon :icon="['fas', 'user']" class="user-icon" />
        <span class="user-name">{{ user?.name || user?.email }}</span>
        <font-awesome-icon :icon="['fas', 'chevron-down']" class="dropdown-arrow" />
        
        <!-- User Dropdown Menu -->
        <div v-if="showUserMenu" class="user-dropdown">
          <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
            <font-awesome-icon :icon="['fas', 'user']" class="item-icon" />
            <span>Thông tin cá nhân</span>
          </router-link>
          <button @click="handleLogout" class="dropdown-item logout">
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

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  showBackButton: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const user = ref(null)
const showUserMenu = ref(false)
const isStaff = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
    const userRole = user.value.role || user.value.roles?.[0]
    isStaff.value = userRole === 'STAFF'
  }
})
</script>

<style scoped>
.admin-header {
  background: white;
  padding: 20px 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  padding: 10px 20px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #e0e0e0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: #f5f5f5;
  border-radius: 25px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s ease;
}

.user-info:hover {
  background: #e8e8e8;
}

.user-icon {
  font-size: 18px;
  color: #667eea;
}

.user-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.dropdown-arrow {
  font-size: 12px;
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
  margin-top: 8px;
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
  gap: 12px;
  padding: 14px 20px;
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
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
  font-size: 16px;
  color: #667eea;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-item.logout .item-icon {
  color: #e74c3c;
}

.dropdown-item.logout:hover .item-icon {
  color: #c0392b;
}
</style>
