<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <Sidebar />
    
    <div class="dashboard-container">
      <!-- Header -->
      <AdminHeader 
        title="Dashboard - Tổng quan hệ thống" 
        icon="📊"
      />

      <!-- Main Content -->
      <main class="dashboard-main">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải thống kê...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <!-- Stats Grid -->
      <div v-else class="stats-grid">
        <!-- Total Books -->
        <div class="stat-card books">
          <div class="stat-icon">
            <font-awesome-icon :icon="['fas', 'book']" />
          </div>
          <div class="stat-content">
            <h3>Tổng số sách</h3>
            <p class="stat-number">{{ stats.totalBooks }}</p>
            <span class="stat-label">Đầu sách trong thư viện</span>
          </div>
        </div>

        <!-- Total Readers -->
        <div class="stat-card readers">
          <div class="stat-icon">
            <font-awesome-icon :icon="['fas', 'users']" />
          </div>
          <div class="stat-content">
            <h3>Tổng độc giả</h3>
            <p class="stat-number">{{ stats.totalReaders }}</p>
            <span class="stat-label">Người dùng đã đăng ký</span>
          </div>
        </div>

        <!-- Active Loans -->
        <div class="stat-card loans">
          <div class="stat-icon">
            <font-awesome-icon :icon="['fas', 'book-open']" />
          </div>
          <div class="stat-content">
            <h3>Đang mượn</h3>
            <p class="stat-number">{{ stats.activeLoans }}</p>
            <span class="stat-label">Sách đang được mượn</span>
          </div>
        </div>

        <!-- Overdue Loans -->
        <div class="stat-card overdue">
          <div class="stat-icon">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
          </div>
          <div class="stat-content">
            <h3>Quá hạn</h3>
            <p class="stat-number">{{ stats.overdueLoans }}</p>
            <span class="stat-label">Sách chưa trả đúng hạn</span>
          </div>
        </div>

        <!-- Total Revenue -->
        <div class="stat-card revenue">
          <div class="stat-icon">
            <font-awesome-icon :icon="['fas', 'dollar-sign']" />
          </div>
          <div class="stat-content">
            <h3>Tổng doanh thu</h3>
            <p class="stat-number">{{ formatCurrency(stats.totalRevenue) }}</p>
            <span class="stat-label">Tổng thu từ phí mượn</span>
          </div>
        </div>

        <!-- Pending Fines -->
        <div class="stat-card fines">
          <div class="stat-icon">
            <font-awesome-icon :icon="['fas', 'bell']" />
          </div>
          <div class="stat-content">
            <h3>Phí chưa thu</h3>
            <p class="stat-number">{{ formatCurrency(stats.pendingFines) }}</p>
            <span class="stat-label">Tiền phạt chưa thanh toán</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div class="actions-grid">
          <router-link to="/books" class="action-card">
            <font-awesome-icon :icon="['fas', 'book']" class="action-icon" />
            <span class="action-label">Quản lý sách</span>
          </router-link>
          <router-link to="/readers" class="action-card">
            <font-awesome-icon :icon="['fas', 'users']" class="action-icon" />
            <span class="action-label">Quản lý độc giả</span>
          </router-link>
          <router-link to="/staff" class="action-card">
            <font-awesome-icon :icon="['fas', 'user-tie']" class="action-icon" />
            <span class="action-label">Quản lý nhân viên</span>
          </router-link>
          <router-link to="/loans" class="action-card">
            <font-awesome-icon :icon="['fas', 'book-open']" class="action-icon" />
            <span class="action-label">Quản lý mượn trả</span>
          </router-link>
          <router-link to="/publishers" class="action-card">
            <font-awesome-icon :icon="['fas', 'building']" class="action-icon" />
            <span class="action-label">Quản lý NXB</span>
          </router-link>
          <router-link to="/categories" class="action-card">
            <font-awesome-icon :icon="['fas', 'tags']" class="action-icon" />
            <span class="action-label">Quản lý thể loại</span>
          </router-link>
          <router-link to="/roles" class="action-card">
            <font-awesome-icon :icon="['fas', 'user-shield']" class="action-icon" />
            <span class="action-label">Quản lý vai trò</span>
          </router-link>
          <router-link to="/statistics" class="action-card">
            <font-awesome-icon :icon="['fas', 'chart-bar']" class="action-icon" />
            <span class="action-label">Thống kê chi tiết</span>
          </router-link>
          <router-link to="/health" class="action-card">
            <font-awesome-icon :icon="['fas', 'heart-pulse']" class="action-icon" />
            <span class="action-label">Sức khỏe hệ thống</span>
          </router-link>
        </div>
      </div>
    </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useDashboard } from '@/composables/useDashboard'

const {
  stats,
  isLoading,
  errorMessage,
  loadDashboard,
  formatCurrency
} = useDashboard()

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped src="@/styles/DashboardView.css"></style>
