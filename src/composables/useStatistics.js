import { ref, computed } from 'vue'
import { statsAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

export function useStatistics() {
  const topReaders = ref([])
  const topCategories = ref([])
  const topBooks = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  const maxCategoryLoans = computed(() => {
    if (topCategories.value.length === 0) return 0
    return Math.max(...topCategories.value.map(c => c.totalLoans))
  })

  const loadAllStats = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      // Load all stats in parallel
      const [readersResponse, categoriesResponse, booksResponse] = await Promise.all([
        statsAPI.getTopReaders(10),
        statsAPI.getTopCategories(10),
        statsAPI.getTopBooks(10)
      ])

      console.log('📊 Top Readers:', readersResponse)
      console.log('📊 Top Categories:', categoriesResponse)
      console.log('📊 Top Books:', booksResponse)

      // Parse responses
      topReaders.value = readersResponse.data || readersResponse
      topCategories.value = categoriesResponse.data || categoriesResponse
      topBooks.value = booksResponse.data || booksResponse

    } catch (error) {
      console.error('Error loading statistics:', error)
      errorMessage.value = handleApiError(error, 'Không thể tải thống kê')
    } finally {
      isLoading.value = false
    }
  }

  const getCategoryPercentage = (loans) => {
    if (maxCategoryLoans.value === 0) return 0
    return Math.round((loans / maxCategoryLoans.value) * 100)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0)
  }

  return {
    topReaders,
    topCategories,
    topBooks,
    isLoading,
    errorMessage,
    maxCategoryLoans,
    loadAllStats,
    getCategoryPercentage,
    formatCurrency
  }
}
