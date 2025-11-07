import { ref } from 'vue'
import { statsAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

export function useDashboard() {
  const stats = ref({
    totalBooks: 0,
    totalReaders: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalRevenue: 0,
    pendingFines: 0
  })
  const isLoading = ref(false)
  const errorMessage = ref('')

  const loadDashboard = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await statsAPI.getDashboard()
      
      console.log('📊 Dashboard response:', response)
      
      if (response.data) {
        stats.value = response.data
      } else if (response.success && response.data) {
        stats.value = response.data
      } else {
        stats.value = response
      }
      
      console.log('📊 Stats loaded:', stats.value)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      errorMessage.value = handleApiError(error, 'Không thể tải thống kê')
    } finally {
      isLoading.value = false
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0)
  }

  return {
    stats,
    isLoading,
    errorMessage,
    loadDashboard,
    formatCurrency
  }
}
