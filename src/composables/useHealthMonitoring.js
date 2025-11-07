import { ref } from 'vue'
import { healthAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

export function useHealthMonitoring() {
  const isLoading = ref(false)
  const errorMessage = ref('')
  const lastUpdated = ref('')

  const overallStatus = ref('unknown')
  const overallStatusText = ref('Đang kiểm tra...')
  const livenessStatus = ref('unknown')
  const readinessStatus = ref('unknown')
  const databaseStatus = ref('unknown')
  const responseTime = ref(0)

  const healthDetails = ref(null)

  const fetchHealthStatus = async (handleAuthError) => {
    isLoading.value = true
    errorMessage.value = ''
    
    const startTime = Date.now()

    try {
      const healthResponse = await healthAPI.check()
      responseTime.value = Date.now() - startTime
      
      const healthData = healthResponse.data || healthResponse
      
      overallStatus.value = healthData.status === 'UP' ? 'healthy' : 'unhealthy'
      overallStatusText.value = healthData.status === 'UP' ? '✓ Hệ thống hoạt động tốt' : '✗ Hệ thống có vấn đề'
      
      try {
        await healthAPI.liveness()
        livenessStatus.value = 'healthy'
      } catch {
        livenessStatus.value = 'unhealthy'
      }
      
      try {
        await healthAPI.readiness()
        readinessStatus.value = 'healthy'
      } catch {
        readinessStatus.value = 'unhealthy'
      }
      
      try {
        const detailsResponse = await healthAPI.details()
        const healthData = detailsResponse.data || detailsResponse
        
        healthDetails.value = healthData
        
        const dbStatus = healthData.database?.status || healthData.components?.db?.status
        databaseStatus.value = dbStatus === 'UP' ? 'healthy' : 'unhealthy'
      } catch (error) {
        console.error('❌ Error fetching health details:', error)
        healthDetails.value = null
        databaseStatus.value = 'unknown'
      }
      
      lastUpdated.value = new Date().toLocaleTimeString('vi-VN')
    } catch (error) {
      if (handleAuthError && handleAuthError(error)) return
      
      overallStatus.value = 'unhealthy'
      overallStatusText.value = '✗ Không thể kết nối với server'
      
      if (error.status === 403) {
        errorMessage.value = 'Bạn không có quyền truy cập chức năng này'
      } else if (error.status >= 500) {
        errorMessage.value = 'Lỗi server'
      } else {
        errorMessage.value = error.data?.message || 'Không thể kiểm tra sức khỏe hệ thống'
      }
    } finally {
      isLoading.value = false
    }
  }

  const refresh = (handleAuthError) => {
    fetchHealthStatus(handleAuthError)
  }

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A'
    
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days} ngày ${hours} giờ`
    if (hours > 0) return `${hours} giờ ${minutes} phút`
    return `${minutes} phút`
  }

  const getResourceClass = (usage) => {
    if (usage >= 90) return 'critical'
    if (usage >= 70) return 'warning'
    return 'normal'
  }

  return {
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
    fetchHealthStatus,
    refresh,
    formatUptime,
    getResourceClass
  }
}
