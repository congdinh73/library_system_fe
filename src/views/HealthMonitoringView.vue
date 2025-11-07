<template>
  <div class="health-monitoring">
    <AdminHeader title="Giám Sát Hệ Thống" :show-back-button="true" />
    
    <div class="content-container">
      <div class="page-header">
        <h1>Giám Sát Sức Khỏe Hệ Thống</h1>
        <div class="header-actions">
          <span class="last-updated">Cập nhật lần cuối: {{ lastUpdated }}</span>
          <button @click="refresh" class="refresh-btn" :disabled="isLoading">
            <font-awesome-icon :icon="['fas', 'sync-alt']" :class="{ 'fa-spin': isLoading }" /> {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Main Health Status -->
      <div class="health-status-card">
        <div class="status-header">
          <h2>Tổng Quan Hệ Thống</h2>
          <span :class="['status-indicator', overallStatus]">
            {{ overallStatusText }}
          </span>
        </div>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-icon">
              <font-awesome-icon :icon="['fas', 'heartbeat']" />
            </span>
            <div class="status-info">
              <h3>Liveness</h3>
              <span :class="['status-badge', livenessStatus]">
                {{ livenessStatus === 'healthy' ? '✓ Hoạt động' : '✗ Ngưng' }}
              </span>
            </div>
          </div>
          
          <div class="status-item">
            <span class="status-icon">
              <font-awesome-icon :icon="['fas', 'check-circle']" />
            </span>
            <div class="status-info">
              <h3>Readiness</h3>
              <span :class="['status-badge', readinessStatus]">
                {{ readinessStatus === 'healthy' ? '✓ Sẵn sàng' : '✗ Chưa sẵn sàng' }}
              </span>
            </div>
          </div>
          
          <div class="status-item">
            <span class="status-icon">
              <font-awesome-icon :icon="['fas', 'database']" />
            </span>
            <div class="status-info">
              <h3>Database</h3>
              <span :class="['status-badge', databaseStatus]">
                {{ databaseStatus === 'healthy' ? '✓ Kết nối OK' : '✗ Lỗi kết nối' }}
              </span>
            </div>
          </div>
          
          <div class="status-item">
            <span class="status-icon">
              <font-awesome-icon :icon="['fas', 'bolt']" />
            </span>
            <div class="status-info">
              <h3>Performance</h3>
              <span class="status-value">{{ responseTime }}ms</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Health Information -->
      <div v-if="healthDetails" class="details-section">
        <h2>Chi Tiết Sức Khỏe</h2>
        
        <div class="details-grid">
          <!-- Application Info -->
          <div class="detail-card">
            <h3>
              <font-awesome-icon :icon="['fas', 'mobile-screen']" /> Thông Tin Ứng Dụng
            </h3>
            <div class="detail-content">
              <div class="detail-row">
                <span class="detail-label">Tên:</span>
                <span class="detail-value">{{ healthDetails.application?.name || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phiên bản:</span>
                <span class="detail-value">{{ healthDetails.application?.version || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Môi trường:</span>
                <span class="detail-value">{{ healthDetails.application?.environment || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Múi giờ:</span>
                <span class="detail-value">{{ healthDetails.application?.timezone || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Timestamp:</span>
                <span class="detail-value">{{ healthDetails.application?.timestamp || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Database Info -->
          <div class="detail-card">
            <h3>
              <font-awesome-icon :icon="['fas', 'database']" /> Thông Tin Database
            </h3>
            <div class="detail-content">
              <div class="detail-row">
                <span class="detail-label">Loại:</span>
                <span class="detail-value">{{ healthDetails.database?.database || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Trạng thái:</span>
                <span class="detail-value">{{ healthDetails.database?.message || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" :style="{ color: healthDetails.database?.status === 'UP' ? '#10b981' : '#ef4444', fontWeight: 'bold' }">
                  {{ healthDetails.database?.status === 'UP' ? '✓ UP' : '✗ DOWN' }}
                </span>
              </div>
            </div>
          </div>

          <!-- System Resources -->
          <div class="detail-card">
            <h3>🖥️ Tài Nguyên Hệ Thống</h3>
            <div class="detail-content">
              <div class="detail-row">
                <span class="detail-label">CPU Cores:</span>
                <span class="detail-value">{{ healthDetails.system?.processors || 0 }} cores</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Memory Usage:</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: parseFloat(healthDetails.system?.memoryUsagePercentage) + '%' }"
                    :class="getResourceClass(parseFloat(healthDetails.system?.memoryUsagePercentage))"
                  ></div>
                  <span class="progress-text">{{ healthDetails.system?.memoryUsagePercentage || '0%' }}</span>
                </div>
              </div>
              <div class="detail-row">
                <span class="detail-label">Used Memory:</span>
                <span class="detail-value">{{ healthDetails.system?.usedMemory || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Memory:</span>
                <span class="detail-value">{{ healthDetails.system?.totalMemory || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Free Memory:</span>
                <span class="detail-value">{{ healthDetails.system?.freeMemory || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Metrics -->
          <div class="detail-card">
            <h3>
              <font-awesome-icon :icon="['fas', 'chart-line']" /> Các Chỉ Số Gần Đây
            </h3>
            <div class="detail-content">
              <div class="detail-row">
                <span class="detail-label">Requests/giây:</span>
                <span class="detail-value">{{ healthDetails.metrics?.requestsPerSecond || 0 }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Avg Response Time:</span>
                <span class="detail-value">{{ healthDetails.metrics?.avgResponseTime || 0 }}ms</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Error Rate:</span>
                <span class="detail-value">{{ healthDetails.metrics?.errorRate || 0 }}%</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Active Sessions:</span>
                <span class="detail-value">{{ healthDetails.metrics?.activeSessions || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue'
import { useAuthError } from '@/composables/useAuthError'
import { useHealthMonitoring } from '@/composables/useHealthMonitoring'

const { handleAuthError } = useAuthError()

const healthMonitoring = useHealthMonitoring()

const {
  isLoading,
  errorMessage,
  lastUpdated,
  overallStatus,
  overallStatusText,
  livenessStatus,
  readinessStatus,
  databaseStatus,
  responseTime,
  healthDetails,
  formatUptime,
  getResourceClass
} = healthMonitoring

const fetchHealthStatus = () => healthMonitoring.fetchHealthStatus(handleAuthError)
const refresh = () => healthMonitoring.refresh(handleAuthError)

let refreshInterval = null

onMounted(() => {
  fetchHealthStatus()
  
  refreshInterval = setInterval(() => {
    fetchHealthStatus()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped src="@/styles/HealthMonitoringView.css"></style>
