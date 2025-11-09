import { ref, computed } from 'vue'
import { booksAPI, loansAPI } from '@/services/apiEndpoints'

/**
 * Composable for reader dashboard
 * Handles book browsing, loan management, and user interactions
 */
export function useReader() {
  const user = ref(null)
  const books = ref([])
  const myLoans = ref([])
  const searchQuery = ref('')
  const isLoading = ref(false)
  const isLoadingLoans = ref(false)
  const errorMessage = ref('')
  const toast = ref({ show: false, message: '', type: 'success' })

  // Pagination
  const currentPage = ref(0)
  const pageSize = ref(12)
  const totalPages = ref(0)
  const totalElements = ref(0)

  /**
   * Filter books based on search query
   */
  const filteredBooks = computed(() => {
    if (!searchQuery.value.trim()) return books.value
    
    const query = searchQuery.value.toLowerCase().trim()
    
    return books.value.filter(book => {
      const searchableText = [
        book.title,
        book.publisherName,
        book.language,
        book.edition,
        book.publicationYear
      ]
        .filter(Boolean) // Remove null/undefined values
        .join(' ')
        .toLowerCase()
      
      return searchableText.includes(query)
    })
  })

  /**
   * Visible pages for pagination (show max 5 pages)
   */
  const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(0, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible)
    
    // Adjust start if we're near the end
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible)
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i)
    }
    
    return pages
  })

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type: 'success' | 'error'
   */
  const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => {
      toast.value.show = false
    }, 3000)
  }

  /**
   * Format date string to Vietnamese locale
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  /**
   * Check if loan is overdue
   * @param {Object} loan - Loan object
   * @returns {boolean} true if overdue
   */
  const isLoanOverdue = (loan) => {
    if (!loan) return false
    
    const returnDate = loan.returnDate || loan.return_date
    if (returnDate) return false // Đã trả rồi thì không quá hạn
    
    const dueDate = loan.dueDate || loan.due_date
    return dueDate ? new Date(dueDate) < new Date() : false
  }

  /**
   * Load books with pagination
   * @param {number} page - Page number (0-based)
   */
  const loadBooks = async (page = 0) => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const response = await booksAPI.getAll({ page, size: pageSize.value })
      
      if (response.content && Array.isArray(response.content)) {
        books.value = response.content
        currentPage.value = response.number || 0
        totalPages.value = response.totalPages || 1
        totalElements.value = response.totalElements || response.content.length
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          books.value = response.data
        } else if (response.data.content) {
          books.value = response.data.content
        } else if (response.data.data) {
          books.value = Array.isArray(response.data.data) ? response.data.data : []
        } else {
          books.value = []
        }
      } else if (Array.isArray(response)) {
        books.value = response
      } else {
        books.value = []
      }
    } catch (error) {
      errorMessage.value = 'Không thể tải danh sách sách. Vui lòng thử lại sau.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load current user's active loans
   */
  const loadMyLoans = async () => {
    isLoadingLoans.value = true
    try {
      const response = await loansAPI.getMyActiveLoans()
      
      if (response.content && Array.isArray(response.content)) {
        myLoans.value = response.content
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          myLoans.value = response.data
        } else if (response.data.content) {
          myLoans.value = response.data.content
        } else if (response.data.data) {
          myLoans.value = Array.isArray(response.data.data) ? response.data.data : []
        } else {
          myLoans.value = []
        }
      } else if (Array.isArray(response)) {
        myLoans.value = response
      } else {
        myLoans.value = []
      }
    } catch (error) {
      // Silent error for loans
    } finally {
      isLoadingLoans.value = false
    }
  }

  /**
   * Handle search action
   * Reset to first page when searching
   */
  const handleSearch = () => {
    // Search is reactive through computed property
    // Reset to first page when searching
    if (currentPage.value !== 0) {
      goToPage(0)
    }
  }

  /**
   * Navigate to specific page
   * @param {number} page - Page number to navigate to
   */
  const goToPage = async (page) => {
    if (page < 0 || page >= totalPages.value) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
    await loadBooks(page)
  }

  /**
   * Handle book borrowing
   * @param {Object} book - Book object to borrow
   */
  const handleBorrow = async (book) => {
    if (book.quantity === 0) {
      showToast('Sách đã hết', 'error')
      return
    }

    book.isBorrowing = true
    try {
      const loanData = {
        bookId: book.id,
        readerId: user.value.id,
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days
      }

      await loansAPI.create(loanData)
      showToast('Mượn sách thành công!', 'success')
      
      await Promise.all([
        loadBooks(),
        loadMyLoans()
      ])
    } catch (error) {
      showToast('Không thể mượn sách. Vui lòng thử lại.', 'error')
    } finally {
      book.isBorrowing = false
    }
  }

  /**
   * Handle book return
   * @param {Object} loan - Loan object to return
   */
  const handleReturn = async (loan) => {
    loan.isReturning = true
    try {
      const loanId = loan.id || loan.loanId || loan.borrowId
      
      if (!loanId) {
        throw new Error('Không tìm thấy ID của phiếu mượn')
      }
      
      await loansAPI.returnBook(loanId, {
        returnDate: new Date().toISOString().split('T')[0]
      })
      showToast('Trả sách thành công!', 'success')
      
      await Promise.all([
        loadBooks(),
        loadMyLoans()
      ])
    } catch (error) {
      showToast('Không thể trả sách. Vui lòng thử lại.', 'error')
    } finally {
      loan.isReturning = false
    }
  }

  /**
   * Handle loan extension
   * @param {Object} loan - Loan object to extend
   */
  const handleExtend = async (loan) => {
    loan.isExtending = true
    try {
      const newDueDate = new Date(loan.dueDate)
      newDueDate.setDate(newDueDate.getDate() + 7) // Extend 7 days
      
      await loansAPI.extend(loan.id, {
        newDueDate: newDueDate.toISOString().split('T')[0]
      })
      showToast('Gia hạn thành công!', 'success')
      
      await loadMyLoans()
    } catch (error) {
      showToast('Không thể gia hạn. Vui lòng thử lại.', 'error')
    } finally {
      loan.isExtending = false
    }
  }

  /**
   * Initialize reader data
   * Load user from localStorage and fetch data
   */
  const initializeReader = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      user.value = JSON.parse(userStr)
    }
    
    loadBooks()
    loadMyLoans()
  }

  return {
    user,
    books,
    myLoans,
    searchQuery,
    isLoading,
    isLoadingLoans,
    errorMessage,
    toast,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    filteredBooks,
    visiblePages,
    showToast,
    formatDate,
    isLoanOverdue,
    loadBooks,
    loadMyLoans,
    handleSearch,
    goToPage,
    handleBorrow,
    handleReturn,
    handleExtend,
    initializeReader
  }
}
