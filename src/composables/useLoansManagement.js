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
  const pageSize = ref(10)

  // Statistics data
  const statistics = ref({
    total: 0,
    borrowed: 0,
    returned: 0,
    overdue: 0
  })

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
      const params = {
        page: page,
        size: pageSize.value,
        sort: 'borrowDate,desc'
      }
      
      // Thêm tham số tìm kiếm nếu có
      if (filters.value.search && filters.value.search.trim()) {
        const searchTerm = filters.value.search.trim()
        // Thử nhiều field name có thể cho search
        params.search = searchTerm
        params.keyword = searchTerm
        params.q = searchTerm
      }
      if (filters.value.status && filters.value.status !== 'all' && filters.value.status !== '') {
        // Xử lý OVERDUE đặc biệt vì nó không phải status riêng trong backend
        if (filters.value.status === 'OVERDUE') {
          params.status = 'BORROWED'
          params.isOverdue = true
        } else {
          params.status = filters.value.status
        }
      }
      if (filters.value.startDate) {
        params.startDate = filters.value.startDate
      }
      if (filters.value.endDate) {
        params.endDate = filters.value.endDate
      }
      
      const response = await loansAPI.getAll(params)
      
            // API trả về dữ liệu trong response.data
      if (response.data && response.data.content) {
        loans.value = response.data.content
        totalPages.value = response.data.totalPages || 0
        totalElements.value = response.data.totalElements || 0
        currentPage.value = response.data.number || 0
      } else if (response.content) {
        // Fallback cho trường hợp khác
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

  const fetchStatistics = async (handleAuthError) => {
    try {
      // Fetch tất cả để tính statistics
      const [borrowedResponse, returnedResponse, overdueResponse] = await Promise.all([
        loansAPI.getAll({ status: 'BORROWED', size: 1 }),
        loansAPI.getAll({ status: 'RETURNED', size: 1 }),
        loansAPI.getAll({ status: 'BORROWED', isOverdue: true, size: 1 })
      ])

      statistics.value.borrowed = borrowedResponse.data?.totalElements || 0
      statistics.value.returned = returnedResponse.data?.totalElements || 0  
      statistics.value.overdue = overdueResponse.data?.totalElements || 0
      statistics.value.total = statistics.value.borrowed + statistics.value.returned

    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const isOverdue = (loan) => {
    // Sử dụng trực tiếp field isOverdue từ backend nếu có
    if (loan.isOverdue !== undefined && loan.isOverdue !== null) {
      return loan.isOverdue
    }
    
    // Fallback: tính toán cho các API cũ
    const returnDate = loan.returnDate || loan.return_date
    if (returnDate) return false
    
    const dueDate = loan.dueDate || loan.due_date
    return new Date(dueDate) < new Date()
  }

  const filteredLoans = computed(() => {
    // Vì giờ filter được xử lý từ server-side, chỉ cần return loans trực tiếp
    return loans.value
  })

  const changePage = (page, handleAuthError) => {
    if (page >= 0 && page < totalPages.value) {
      fetchLoans(page, handleAuthError)
    }
  }

  const applyFilters = (handleAuthError) => {
    // Reset về trang đầu khi apply filter
    currentPage.value = 0
    fetchLoans(0, handleAuthError)
  }

  const resetFilters = (handleAuthError) => {
    filters.value = {
      status: '',
      startDate: '',
      endDate: '',
      search: ''
    }
    // Fetch lại dữ liệu sau khi reset
    currentPage.value = 0
    fetchLoans(0, handleAuthError)
  }

  const getStatusClass = (loan) => {
    // Sử dụng trực tiếp field status từ backend nếu có
    if (loan.status) {
      switch (loan.status.toUpperCase()) {
        case 'BORROWED':
          return loan.isOverdue ? 'status-overdue' : 'status-active'
        case 'RETURNED':
          return 'status-returned'
        case 'OVERDUE':
          return 'status-overdue'
        default:
          return 'status-active'
      }
    }
    
    // Fallback: logic cũ
    const returnDate = loan.returnDate || loan.return_date
    if (returnDate) return 'status-returned'
    if (isOverdue(loan)) return 'status-overdue'
    return 'status-active'
  }

  const getStatusText = (loan) => {
    // Sử dụng trực tiếp field status từ backend nếu có
    if (loan.status) {
      switch (loan.status.toUpperCase()) {
        case 'BORROWED':
          return loan.isOverdue ? 'Quá hạn' : 'Đang mượn'
        case 'RETURNED':
          return 'Đã trả'
        case 'OVERDUE':
          return 'Quá hạn'
        default:
          return loan.status
      }
    }
    
    // Fallback: logic cũ
    const returnDate = loan.returnDate || loan.return_date
    if (returnDate) return 'Đã trả'
    if (isOverdue(loan)) return 'Quá hạn'
    return 'Đang mượn'
  }

  const getStatusCount = (status) => {
    // Sử dụng statistics data thay vì tính từ current page
    switch (status) {
      case 'OVERDUE':
        return statistics.value.overdue
      case 'BORROWED':
        return statistics.value.borrowed
      case 'RETURNED':
        return statistics.value.returned
      default:
        return 0
    }
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

  const exportToCSV = async (handleAuthError) => {
    try {
      // Fetch tất cả data để export (không phân trang)
      const exportParams = {
        size: 10000, // Lấy số lượng lớn để chắc chắn lấy hết
        sort: 'borrowDate,desc'
      }
      
      // Áp dụng cùng filters hiện tại
      if (filters.value.search && filters.value.search.trim()) {
        const searchTerm = filters.value.search.trim()
        exportParams.search = searchTerm
        exportParams.keyword = searchTerm
        exportParams.q = searchTerm
      }
      if (filters.value.status && filters.value.status !== 'all' && filters.value.status !== '') {
        if (filters.value.status === 'OVERDUE') {
          exportParams.status = 'BORROWED'
          exportParams.isOverdue = true
        } else {
          exportParams.status = filters.value.status
        }
      }
      if (filters.value.startDate) {
        exportParams.startDate = filters.value.startDate
      }
      if (filters.value.endDate) {
        exportParams.endDate = filters.value.endDate
      }
      
      const response = await loansAPI.getAll(exportParams)
      const allLoans = response.data?.content || response.content || []
      
      const headers = ['Độc giả', 'Email', 'Sách', 'Ngày mượn', 'Ngày hẹn trả', 'Ngày trả', 'Trạng thái', 'Phí phạt']
      
      const rows = allLoans.map(loan => [
        loan.reader?.fullName || loan.reader?.name || loan.readerName || loan.reader_name || '',
        loan.reader?.email || loan.readerEmail || loan.reader_email || '',
        loan.book?.title || loan.bookTitle || loan.book_title || '',
        formatDate(loan.loanDate || loan.borrowDate || loan.borrow_date),
        formatDate(loan.dueDate || loan.due_date),
        formatDate(loan.returnDate || loan.return_date),
        getStatusText(loan),
        loan.fineAmount || loan.fine || 0
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
      
      console.log(`📊 Exported ${allLoans.length} loan records to CSV`)
      
    } catch (error) {
      if (handleAuthError && handleAuthError(error)) return
      console.error('Error exporting CSV:', error)
      alert('Không thể xuất file CSV. Vui lòng thử lại.')
    }
  }

  return {
    loans,
    isLoading,
    errorMessage,
    currentPage,
    totalPages,
    totalElements,
    filters,
    statistics,
    filteredLoans,
    fetchLoans,
    fetchStatistics,
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
