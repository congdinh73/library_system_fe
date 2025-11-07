import { ref, computed } from 'vue'
import { loansAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

export function useLoansManagement() {
  const loans = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  const currentPage = ref(0)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const pageSize = ref(20)

  const filters = ref({
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  })

  const fetchLoans = async (page = 0, handleAuthError) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await loansAPI.getAll(page, pageSize.value)
      
      if (response.content) {
        loans.value = response.content
        totalPages.value = response.totalPages || 0
        totalElements.value = response.totalElements || 0
        currentPage.value = response.number || 0
      } else {
        loans.value = []
      }
    } catch (error) {
      if (handleAuthError && handleAuthError(error)) return
      errorMessage.value = handleApiError(error, 'Không thể tải danh sách mượn trả')
    } finally {
      isLoading.value = false
    }
  }

  const isOverdue = (loan) => {
    if (loan.returnDate) return false
    return new Date(loan.dueDate) < new Date()
  }

  const filteredLoans = computed(() => {
    let result = [...loans.value]

    if (filters.value.status) {
      result = result.filter(loan => {
        if (filters.value.status === 'OVERDUE') {
          return isOverdue(loan) && !loan.returnDate
        }
        if (filters.value.status === 'ACTIVE') {
          return !loan.returnDate && !isOverdue(loan)
        }
        if (filters.value.status === 'RETURNED') {
          return !!loan.returnDate
        }
        return true
      })
    }

    if (filters.value.startDate) {
      const startDate = new Date(filters.value.startDate)
      result = result.filter(loan => new Date(loan.loanDate) >= startDate)
    }

    if (filters.value.endDate) {
      const endDate = new Date(filters.value.endDate)
      result = result.filter(loan => new Date(loan.loanDate) <= endDate)
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(loan => {
        const readerName = loan.reader?.fullName?.toLowerCase() || ''
        const readerEmail = loan.reader?.email?.toLowerCase() || ''
        const bookTitle = loan.book?.title?.toLowerCase() || ''
        
        return readerName.includes(search) || 
               readerEmail.includes(search) || 
               bookTitle.includes(search)
      })
    }

    return result
  })

  const changePage = (page, handleAuthError) => {
    if (page >= 0 && page < totalPages.value) {
      fetchLoans(page, handleAuthError)
    }
  }

  const applyFilters = () => {
    // Filters are applied via computed property
  }

  const resetFilters = () => {
    filters.value = {
      status: '',
      startDate: '',
      endDate: '',
      search: ''
    }
  }

  const getStatusClass = (loan) => {
    if (loan.returnDate) return 'status-returned'
    if (isOverdue(loan)) return 'status-overdue'
    return 'status-active'
  }

  const getStatusText = (loan) => {
    if (loan.returnDate) return 'Đã trả'
    if (isOverdue(loan)) return 'Quá hạn'
    return 'Đang mượn'
  }

  const getStatusCount = (status) => {
    return filteredLoans.value.filter(loan => {
      if (status === 'OVERDUE') return isOverdue(loan) && !loan.returnDate
      if (status === 'ACTIVE') return !loan.returnDate && !isOverdue(loan)
      if (status === 'RETURNED') return !!loan.returnDate
      return false
    }).length
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Độc giả', 'Email', 'Sách', 'Ngày mượn', 'Ngày hẹn trả', 'Ngày trả', 'Trạng thái', 'Phí phạt']
    
    const rows = filteredLoans.value.map(loan => [
      loan.loanId,
      loan.reader?.fullName || '',
      loan.reader?.email || '',
      loan.book?.title || '',
      formatDate(loan.loanDate),
      formatDate(loan.dueDate),
      formatDate(loan.returnDate),
      getStatusText(loan),
      loan.fine || 0
    ])

    let csvContent = headers.join(',') + '\n'
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n'
    })

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `loans_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    loans,
    isLoading,
    errorMessage,
    currentPage,
    totalPages,
    totalElements,
    filters,
    filteredLoans,
    fetchLoans,
    changePage,
    applyFilters,
    resetFilters,
    isOverdue,
    getStatusClass,
    getStatusText,
    getStatusCount,
    formatDate,
    formatCurrency,
    exportToCSV
  }
}
