import { ref } from 'vue'
import { authAPI, loansAPI, readersAPI, staffAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

/**
 * Composable for user profile management
 * Handles profile loading, editing, password change, and stats
 */
export function useProfile() {
  const user = ref(null)
  const isLoadingProfile = ref(false)
  const stats = ref({
    totalBorrowed: 0,
    currentBorrowing: 0,
    returned: 0,
    overdue: 0
  })
  const recentLoans = ref([])
  const allLoans = ref([])
  const isLoadingStats = ref(false)
  const isLoadingLoans = ref(false)
  const toast = ref({ show: false, message: '', type: 'success' })

  // Pagination for loans
  const loansPagination = ref({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true
  })

  // Modals
  const showChangePassword = ref(false)
  const showEditProfile = ref(false)
  const showAllLoans = ref(false)

  // Forms
  const passwordForm = ref({ current: '', new: '', confirm: '' })
  const profileForm = ref({ name: '', phone: '', address: '' })
  const passwordError = ref('')
  const profileError = ref('')
  const isChangingPassword = ref(false)
  const isUpdatingProfile = ref(false)

  /**
   * Helper function to check if user is staff
   * @returns {boolean} true if user has ADMIN or STAFF role
   */
  const isStaff = () => {
    // Get role from localStorage since user.value might not be loaded yet
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const role = currentUser?.role
    return role === 'ADMIN' || role === 'STAFF'
  }

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
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  /**
   * Get role label in Vietnamese
   * @param {string} role - Role enum value
   * @returns {string} Vietnamese role label
   */
  const getRoleLabel = (role) => {
    const labels = {
      READER: 'Độc giả',
      LIBRARIAN: 'Thủ thư',
      ADMIN: 'Quản trị viên'
    }
    return labels[role] || 'Người dùng'
  }

  /**
   * Check if loan is overdue
   * @param {Object|string} loan - Loan object or due date string
   * @returns {boolean} true if overdue
   */
  const isOverdue = (loan) => {
    // Nếu truyền vào là string (dueDate), giữ logic cũ
    if (typeof loan === 'string') {
      return loan ? new Date(loan) < new Date() : false
    }
    
    // Nếu truyền vào là object, kiểm tra returnDate trước
    if (typeof loan === 'object' && loan !== null) {
      const returnDate = loan.returnDate || loan.return_date
      if (returnDate) return false // Đã trả rồi thì không quá hạn
      
      const dueDate = loan.dueDate || loan.due_date
      return dueDate ? new Date(dueDate) < new Date() : false
    }
    
    return false
  }

  /**
   * Handle user logout
   * @param {Object} router - Vue Router instance
   */
  const handleLogout = (router) => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push({ name: 'login' })
  }

  /**
   * Load user profile from API
   */
  const loadProfile = async () => {
    isLoadingProfile.value = true
    try {
      let response
      
      if (isStaff()) {
        response = await staffAPI.getMe()
      } else {
        response = await readersAPI.getMe()
      }
      
      const profileData = response.data || response
      
      if (isStaff()) {
        user.value = {
          id: profileData.staffId || profileData.id,
          name: profileData.fullName || profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          role: profileData.role || 'ADMIN'
        }
      } else {
        user.value = {
          id: profileData.readerId || profileData.id,
          name: profileData.fullName || profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          role: 'READER'
        }
      }
      
      localStorage.setItem('user', JSON.stringify(user.value))
      
      profileForm.value = {
        name: user.value.name || '',
        phone: user.value.phone || '',
        address: user.value.address || ''
      }
    } catch (error) {
      const errorMsg = handleApiError(error, 'Không thể tải thông tin cá nhân')
      showToast(errorMsg, 'error')
    } finally {
      isLoadingProfile.value = false
    }
  }

  /**
   * Load loan statistics for reader
   */
  const loadStats = async () => {
    isLoadingStats.value = true
    try {
      // Use API: /loan/my-loan to get all history
      const response = await loansAPI.getMyLoans()
      
      // Process response
      let loans = []
      if (response.content && Array.isArray(response.content)) {
        loans = response.content
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          loans = response.data
        } else if (response.data.content) {
          loans = response.data.content
        } else {
          loans = []
        }
      } else if (Array.isArray(response)) {
        loans = response
      }

      // Calculate stats
      stats.value.totalBorrowed = loans.length
      stats.value.currentBorrowing = loans.filter(loan => {
        const returnDate = loan.returnDate || loan.return_date
        return !returnDate
      }).length
      stats.value.returned = loans.filter(loan => {
        const returnDate = loan.returnDate || loan.return_date
        return !!returnDate
      }).length
      stats.value.overdue = loans.filter(loan => {
        const returnDate = loan.returnDate || loan.return_date
        if (returnDate) return false // Đã trả rồi
        return isOverdue(loan) // Truyền cả object loan
      }).length
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      isLoadingStats.value = false
    }
  }

  /**
   * Load recent loans for reader
   */
  const loadRecentLoans = async () => {
    isLoadingLoans.value = true
    try {
      // Use API: /loan/my-loan to get all history
      const response = await loansAPI.getMyLoans()
      
      // Process response
      let loans = []
      if (response.content && Array.isArray(response.content)) {
        loans = response.content
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          loans = response.data
        } else if (response.data.content) {
          loans = response.data.content
        } else {
          loans = []
        }
      } else if (Array.isArray(response)) {
        loans = response
      }
      
      // Sort by borrow date and take recent 10
      recentLoans.value = loans
        .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
        .slice(0, 10)
    } catch (error) {
      console.error('Error loading recent loans:', error)
    } finally {
      isLoadingLoans.value = false
    }
  }

  /**
   * Load all loans with pagination
   */
  const loadAllLoans = async (page = 1) => {
    isLoadingLoans.value = true
    try {
      const params = {
        page: page - 1, // API sử dụng 0-based index
        size: loansPagination.value.size,
        sort: 'borrowDate,desc'
      }
      
      const response = await loansAPI.getMyLoans(params)
      
      // Process response
      if (response.data) {
        allLoans.value = response.data.content || []
        loansPagination.value = {
          page: response.data.number + 1, // Convert về 1-based
          size: response.data.size,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
          isFirst: response.data.first,
          isLast: response.data.last
        }
      } else if (response.content) {
        allLoans.value = response.content
        loansPagination.value = {
          page: response.number + 1,
          size: response.size,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          isFirst: response.first,
          isLast: response.last
        }
      } else if (Array.isArray(response)) {
        // Fallback khi không có pagination
        allLoans.value = response
        loansPagination.value = {
          page: 1,
          size: response.length,
          totalPages: 1,
          totalElements: response.length,
          isFirst: true,
          isLast: true
        }
      }
    } catch (error) {
      console.error('Error loading all loans:', error)
      allLoans.value = []
    } finally {
      isLoadingLoans.value = false
    }
  }

  /**
   * Go to specific page
   */
  const goToPage = async (page) => {
    if (page >= 1 && page <= loansPagination.value.totalPages) {
      await loadAllLoans(page)
    }
  }

  /**
   * Go to next page
   */
  const nextPage = async () => {
    if (!loansPagination.value.isLast) {
      await goToPage(loansPagination.value.page + 1)
    }
  }

  /**
   * Go to previous page
   */
  const previousPage = async () => {
    if (!loansPagination.value.isFirst) {
      await goToPage(loansPagination.value.page - 1)
    }
  }

  /**
   * Handle password change
   */
  const handleChangePassword = async () => {
    passwordError.value = ''
    
    if (passwordForm.value.new !== passwordForm.value.confirm) {
      passwordError.value = 'Mật khẩu mới không khớp'
      return
    }

    if (passwordForm.value.new.length < 6) {
      passwordError.value = 'Mật khẩu mới phải có ít nhất 6 ký tự'
      return
    }

    isChangingPassword.value = true
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.value.current,
        newPassword: passwordForm.value.new
      })

      showToast('Đổi mật khẩu thành công!', 'success')
      showChangePassword.value = false
      passwordForm.value = { current: '', new: '', confirm: '' }
    } catch (error) {
      console.error('❌ Error changing password:', error)
      passwordError.value = error.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.'
    } finally {
      isChangingPassword.value = false
    }
  }

  /**
   * Handle profile update
   */
  const handleUpdateProfile = async () => {
    profileError.value = ''
    isUpdatingProfile.value = true

    try {
      // Prepare data to send to API
      const updateData = {
        fullName: profileForm.value.name,
        phone: profileForm.value.phone,
        address: profileForm.value.address
      }

      console.log('🔍 Updating profile:', updateData)
      
      // Call appropriate API based on role
      let response
      if (isStaff()) {
        response = await staffAPI.updateMe(updateData)
      } else {
        response = await readersAPI.updateMe(updateData)
      }
      
      console.log('✅ Profile updated:', response)
      
      // Reload profile to get fresh data from server
      await loadProfile()

      showToast('Cập nhật thông tin thành công!', 'success')
      showEditProfile.value = false
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      profileError.value = error.data?.message || error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.'
    } finally {
      isUpdatingProfile.value = false
    }
  }

  /**
   * Initialize profile data
   * Load from localStorage first, then fetch from API
   */
  const initializeProfile = async () => {
    // Load basic user info from localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      user.value = JSON.parse(userStr)
    }

    // Load profile data from API
    await loadProfile()
    
    // Only load stats and loans for Reader role
    if (user.value?.role === 'READER') {
      loadStats()
      loadRecentLoans()
    }
  }

  return {
    user,
    isLoadingProfile,
    stats,
    recentLoans,
    allLoans,
    loansPagination,
    isLoadingStats,
    isLoadingLoans,
    toast,
    showChangePassword,
    showEditProfile,
    showAllLoans,
    passwordForm,
    profileForm,
    passwordError,
    profileError,
    isChangingPassword,
    isUpdatingProfile,
    isStaff,
    showToast,
    formatDate,
    getRoleLabel,
    isOverdue,
    handleLogout,
    loadProfile,
    loadStats,
    loadRecentLoans,
    loadAllLoans,
    goToPage,
    nextPage,
    previousPage,
    handleChangePassword,
    handleUpdateProfile,
    initializeProfile
  }
}
