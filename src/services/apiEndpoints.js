import apiService from './api'

// Authentication API
export const authAPI = {
  login(credentials) {
    return apiService.post('/auth/login', credentials)
  },

  register(userData) {
    return apiService.post('/auth/register', userData)
  },

  logout(refreshToken) {
    return apiService.post('/auth/logout', { refreshToken })
  },

  refreshToken(refreshToken) {
    return apiService.post('/auth/refresh', { refreshToken })
  }
}

// Readers Authentication API (separate endpoints)
export const readersAuthAPI = {
  register(userData) {
    return apiService.post('/readers/register', userData)
  },

  forgotPassword(email) {
    return apiService.post('/readers/forgot-password', { email })
  },

  resetPassword(data) {
    return apiService.post('/readers/reset-password', data)
  }
}

// Books API
export const booksAPI = {
  // Lấy danh sách sách
  getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/books${queryString ? `?${queryString}` : ''}`)
  },

  // Lấy chi tiết một quyển sách
  getById(id) {
    return apiService.get(`/books/${id}`)
  },

  // Tạo sách mới
  create(bookData) {
    return apiService.post('/books', bookData)
  },

  // Cập nhật sách
  update(id, bookData) {
    return apiService.put(`/books/${id}`, bookData)
  },

  // Xóa sách
  delete(id) {
    return apiService.delete(`/books/${id}`)
  },

  // Tìm kiếm sách
  search(keyword) {
    return apiService.get(`/books/search?q=${encodeURIComponent(keyword)}`)
  }
}

// Readers API (Độc giả)
export const readersAPI = {
  // Lấy thông tin reader hiện tại
  getMe() {
    return apiService.get('/readers/me')
  },

  // Cập nhật thông tin reader hiện tại
  updateMe(readerData) {
    return apiService.put('/readers/me', readerData)
  },

  getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/readers${queryString ? `?${queryString}` : ''}`)
  },

  getById(id) {
    return apiService.get(`/readers/${id}`)
  },

  create(readerData) {
    return apiService.post('/readers', readerData)
  },

  update(id, readerData) {
    return apiService.put(`/readers/${id}`, readerData)
  },

  delete(id) {
    return apiService.delete(`/readers/${id}`)
  },

  // Đăng ký tài khoản mới
  register(userData) {
    return apiService.post('/readers/register', userData)
  },

  // Quên mật khẩu - gửi email để nhận refresh token
  forgotPassword(email) {
    return apiService.post('/readers/forgot-password', { email })
  },

  // Reset mật khẩu bằng refresh token
  resetPassword(data) {
    return apiService.post('/readers/reset-password', data)
  }
}

// Loans API (Mượn/Trả sách)
export const loansAPI = {
  // Lấy tất cả lịch sử mượn sách của user hiện tại
  getMyLoans(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/loans/my-loans${queryString ? `?${queryString}` : ''}`)
  },

  // Lấy danh sách sách đang mượn (chưa trả) của user hiện tại
  getMyActiveLoans(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/loans/my-active-loans${queryString ? `?${queryString}` : ''}`)
  },

  // Lấy danh sách mượn sách (admin/librarian)
  getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/loans${queryString ? `?${queryString}` : ''}`)
  },

  // Lấy chi tiết một giao dịch mượn
  getById(id) {
    return apiService.get(`/loans/${id}`)
  },

  // Tạo phiếu mượn mới (Reader mượn sách)
  create(loanData) {
    return apiService.post('/loans/borrow', loanData)
  },

  // Trả sách
  returnBook(id, returnData) {
    return apiService.put(`/loans/${id}/return`, returnData)
  },

  // Gia hạn
  extend(id, extensionData) {
    return apiService.post(`/loans/${id}/extend`, extensionData)
  },

  // Lấy lịch sử mượn của độc giả (admin/librarian)
  getByReader(readerId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/readers/${readerId}/loans${queryString ? `?${queryString}` : ''}`)
  }
}

// Staff API (Admin/Staff)
export const staffAPI = {
  // Lấy thông tin staff hiện tại - sử dụng email từ localStorage
  async getMe() {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.email) {
        // Sử dụng endpoint /staff/email/{email} thay vì /staff/{staffId}
        return apiService.get(`/staff/email/${user.email}`)
      }
      return Promise.reject(new Error('Email not found in user data. Please log in again.'))
    }
    return Promise.reject(new Error('User not found in localStorage. Please log in again.'))
  },

  // Cập nhật thông tin staff hiện tại
  async updateMe(staffData) {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      // Nếu có staffId trong user data thì dùng, không thì lấy từ getMe() trước
      let staffId = user.staffId
      
      if (!staffId) {
        // Lấy staffId từ API trước
        const response = await this.getMe()
        staffId = response.data?.staffId
      }
      
      if (staffId) {
        return apiService.put(`/staff/${staffId}`, staffData)
      }
      return Promise.reject(new Error('Staff ID not found. Please log in again.'))
    }
    return Promise.reject(new Error('User not found in localStorage. Please log in again.'))
  },

  // Lấy danh sách tất cả staff (Admin only)
  getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/staff${queryString ? `?${queryString}` : ''}`)
  },

  // Lấy thông tin staff theo ID
  getById(id) {
    return apiService.get(`/staff/${id}`)
  },

  // Tạo staff mới (Admin only)
  create(staffData) {
    return apiService.post('/staff', staffData)
  },

  // Cập nhật thông tin staff
  update(id, staffData) {
    return apiService.put(`/staff/${id}`, staffData)
  },

  // Xóa staff (Admin only)
  delete(id) {
    return apiService.delete(`/staff/${id}`)
  },

  // Toggle staff status
  async toggleStatus(staffId, isActive) {
    const requestData = {
      staffId: staffId,
      readerId: 0,
      isActive: isActive,
      reason: isActive ? 'Kích hoạt tài khoản' : 'Vô hiệu hóa tài khoản'
    }
    
    return await apiService.put('/admin/accounts/staff/toggle-status', requestData)
  }
}

// Statistics API
export const statsAPI = {
  // Dashboard statistics
  getDashboard() {
    return apiService.get('/statistics/dashboard')
  },

  // Dashboard overview
  getDashboard() {
    return apiService.get('/statistics/dashboard')
  },

  // Top sách được mượn nhiều nhất
  getTopBooks(limit = 5) {
    return apiService.get(`/statistics/top-books?limit=${limit}`)
  },

  // Top sách ít được mượn nhất
  getLeastBorrowedBooks(limit = 5) {
    return apiService.get(`/statistics/least-borrowed-books?limit=${limit}`)
  },

  // Top độc giả mượn nhiều nhất
  getTopReaders(limit = 10) {
    return apiService.get(`/statistics/top-readers?limit=${limit}`)
  },

  // Top danh mục được mượn nhiều nhất
  getTopCategories(limit = 5) {
    return apiService.get(`/statistics/top-categories?limit=${limit}`)
  },

  // Revenue statistics
  getDailyRevenue(startDate, endDate) {
    return apiService.get(`/statistics/revenue/daily?startDate=${startDate}&endDate=${endDate}`)
  },

  getWeeklyRevenue(year, week) {
    return apiService.get(`/statistics/revenue/weekly?year=${year}&week=${week}`)
  },

  getMonthlyRevenue(year) {
    return apiService.get(`/statistics/revenue/monthly?year=${year}`)
  },

  getYearlyRevenue() {
    return apiService.get('/statistics/revenue/yearly')
  }
}

// Publishers API
export const publishersAPI = {
  getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/publishers${queryString ? `?${queryString}` : ''}`)
  },

  getList(page = 0, size = 10) {
    return apiService.get(`/publishers/list?page=${page}&size=${size}`)
  },

  getById(id) {
    return apiService.get(`/publishers/${id}`)
  },

  create(data) {
    return apiService.post('/publishers', data)
  },

  update(id, data) {
    return apiService.put(`/publishers/${id}`, data)
  },

  delete(id) {
    return apiService.delete(`/publishers/${id}`)
  }
}

// Categories API
export const categoriesAPI = {
  getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/categories${queryString ? `?${queryString}` : ''}`)
  },

  getById(id) {
    return apiService.get(`/categories/${id}`)
  },

  create(data) {
    return apiService.post('/categories', data)
  },

  update(id, data) {
    return apiService.put(`/categories/${id}`, data)
  },

  delete(id) {
    return apiService.delete(`/categories/${id}`)
  }
}

// Book-Categories API
export const bookCategoriesAPI = {
  getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/book-categories${queryString ? `?${queryString}` : ''}`)
  }
}

// Roles API
export const rolesAPI = {
  getAll() {
    return apiService.get('/roles')
  },

  getById(id) {
    return apiService.get(`/roles/${id}`)
  },

  create(data) {
    return apiService.post('/roles', data)
  },

  update(id, data) {
    return apiService.put(`/roles/${id}`, data)
  },

  delete(id) {
    return apiService.delete(`/roles/${id}`)
  },

  initializeDefaults() {
    return apiService.post('/roles/initialize')
  }
}

// Account Management API (Admin only)
export const accountManagementAPI = {
  // Staff accounts
  getStaffStatus(staffId) {
    return apiService.get(`/admin/accounts/staff/${staffId}/status`)
  },

  toggleStaffStatus(data) {
    return apiService.put('/admin/accounts/staff/toggle-status', data)
  },

  activateStaff(staffId) {
    return apiService.post(`/admin/accounts/staff/${staffId}/activate`)
  },

  deactivateStaff(staffId, reason = '') {
    return apiService.post(`/admin/accounts/staff/${staffId}/deactivate`, null, {
      params: { reason }
    })
  },

  // Reader accounts
  getReaderStatus(readerId) {
    return apiService.get(`/admin/accounts/reader/${readerId}/status`)
  },

  toggleReaderStatus(data) {
    return apiService.put('/admin/accounts/reader/toggle-status', data)
  },

  activateReader(readerId) {
    return apiService.post(`/admin/accounts/reader/${readerId}/activate`)
  },

  deactivateReader(readerId, reason = '') {
    return apiService.post(`/admin/accounts/reader/${readerId}/deactivate`, null, {
      params: { reason }
    })
  }
}

// Health Check API
export const healthAPI = {
  check() {
    return apiService.get('/health')
  },

  liveness() {
    return apiService.get('/health/live')
  },

  readiness() {
    return apiService.get('/health/ready')
  },

  details() {
    return apiService.get('/health/details')
  }
}

export default {
  auth: authAPI,
  readersAuth: readersAuthAPI,
  books: booksAPI,
  readers: readersAPI,
  staff: staffAPI,
  loans: loansAPI,
  stats: statsAPI,
  publishers: publishersAPI,
  categories: categoriesAPI,
  bookCategories: bookCategoriesAPI,
  roles: rolesAPI,
  accountManagement: accountManagementAPI,
  health: healthAPI
}
