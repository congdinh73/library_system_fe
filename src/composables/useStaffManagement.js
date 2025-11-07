import { ref, computed } from 'vue'
import { staffAPI, rolesAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

/**
 * Composable for Staff Management
 * Handles CRUD operations for staff accounts (Admin only)
 */
export function useStaffManagement() {
  const staff = ref([])
  const roles = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const searchQuery = ref('')

  // Modal state
  const showModal = ref(false)
  const modalMode = ref('create')
  const currentStaff = ref(null)

  // Form data
  const formData = ref({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 'STAFF'
  })

  // Pagination
  const currentPage = ref(0)
  const pageSize = ref(10)
  const totalPages = ref(0)
  const totalElements = ref(0)

  /**
   * Filter staff by search query
   */
  const filteredStaff = computed(() => {
    if (!searchQuery.value.trim()) return staff.value

    const query = searchQuery.value.toLowerCase().trim()

    return staff.value.filter(s => {
      const searchableText = [
        s.fullName,
        s.email,
        s.phone,
        s.address,
        s.role
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(query)
    })
  })

  /**
   * Visible pages for pagination
   */
  const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(0, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible)

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible)
    }

    for (let i = start; i < end; i++) {
      pages.push(i)
    }

    return pages
  })

  /**
   * Load staff list with pagination
   */
  const loadStaff = async (page = 0) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await staffAPI.getAll({ page, size: pageSize.value })

      if (response.content && Array.isArray(response.content)) {
        staff.value = response.content
        currentPage.value = response.number || 0
        totalPages.value = response.totalPages || 1
        totalElements.value = response.totalElements || response.content.length
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          staff.value = response.data
          totalPages.value = 1
          totalElements.value = response.data.length
        } else if (response.data.content) {
          staff.value = response.data.content
          currentPage.value = response.data.number || 0
          totalPages.value = response.data.totalPages || 1
          totalElements.value = response.data.totalElements || response.data.content.length
        } else {
          staff.value = []
        }
      } else if (Array.isArray(response)) {
        staff.value = response
        totalPages.value = 1
        totalElements.value = response.length
      } else {
        staff.value = []
      }
    } catch (error) {
      errorMessage.value = handleApiError(error, 'Không thể tải danh sách nhân viên')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load available roles
   */
  const loadRoles = async () => {
    try {
      const response = await rolesAPI.getAll()
      
      if (response.data && Array.isArray(response.data)) {
        roles.value = response.data
      } else if (Array.isArray(response)) {
        roles.value = response
      } else {
        roles.value = []
      }
    } catch (error) {
      errorMessage.value = handleApiError(error, 'Không thể tải danh sách vai trò')
      // Use default roles if API fails
      roles.value = [
        { id: 1, name: 'ADMIN', priority: 1 },
        { id: 2, name: 'STAFF', priority: 2 }
      ]
    }
  }

  /**
   * Reset form data
   */
  const resetForm = () => {
    formData.value = {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      role: 'STAFF'
    }
    currentStaff.value = null
    errorMessage.value = ''
  }

  /**
   * Open modal for creating new staff
   */
  const openCreateModal = () => {
    resetForm()
    modalMode.value = 'create'
    showModal.value = true
  }

  /**
   * Open modal for editing existing staff
   */
  const openEditModal = (staffMember) => {
    currentStaff.value = staffMember
    
    // Get role from roles array or fallback to role string
    let roleName = 'STAFF'
    if (staffMember.roles && staffMember.roles.length > 0) {
      roleName = staffMember.roles[0].roleName
    } else if (staffMember.role) {
      roleName = staffMember.role
    }
    
    formData.value = {
      fullName: staffMember.fullName || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      address: staffMember.address || '',
      password: '', // Don't populate password for edit
      role: roleName
    }
    modalMode.value = 'edit'
    showModal.value = true
  }

  /**
   * Close modal
   */
  const closeModal = () => {
    showModal.value = false
    resetForm()
  }

  /**
   * Validate form data
   */
  const validateForm = () => {
    if (!formData.value.fullName.trim()) {
      errorMessage.value = 'Vui lòng nhập họ tên'
      return false
    }

    if (!formData.value.email.trim()) {
      errorMessage.value = 'Vui lòng nhập email'
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.value.email)) {
      errorMessage.value = 'Email không hợp lệ'
      return false
    }

    // Password required for create mode
    if (modalMode.value === 'create' && !formData.value.password) {
      errorMessage.value = 'Vui lòng nhập mật khẩu'
      return false
    }

    if (formData.value.password && formData.value.password.length < 6) {
      errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự'
      return false
    }

    return true
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (showToast) => {
    if (!validateForm()) {
      return
    }

    isLoading.value = true

    try {
      // Find the roleId for the selected role name
      const selectedRole = roles.value.find(r => r.roleName === formData.value.role)
      
      const submitData = {
        fullName: formData.value.fullName,
        email: formData.value.email,
        phone: formData.value.phone || null,
        address: formData.value.address || null,
        roleIds: selectedRole ? [selectedRole.roleId] : []
      }

      // Only include password if provided
      if (formData.value.password) {
        submitData.password = formData.value.password
      }

      if (modalMode.value === 'create') {
        await staffAPI.create(submitData)
        showToast('Thêm nhân viên thành công!', 'success')
      } else {
        const staffId = currentStaff.value.staffId || currentStaff.value.id
        await staffAPI.update(staffId, submitData)
        showToast('Cập nhật nhân viên thành công!', 'success')
      }

      closeModal()
      await loadStaff(currentPage.value)
    } catch (error) {
      errorMessage.value = handleApiError(error, 'Không thể lưu thông tin nhân viên')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Handle staff deletion
   */
  const handleDelete = async (staffMember, showToast) => {
    isLoading.value = true

    try {
      await staffAPI.delete(staffMember.staffId || staffMember.id)
      showToast('Xóa nhân viên thành công!', 'success')
      await loadStaff(currentPage.value)
    } catch (error) {
      const errorMsg = handleApiError(error, 'Không thể xóa nhân viên')
      showToast(errorMsg, 'error')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Handle staff status toggle
   */
  const handleToggleStatus = async (staffMember, showToast) => {
    const newStatus = !staffMember.isActive
    const action = newStatus ? 'kích hoạt' : 'vô hiệu hóa'

    try {
      const staffId = staffMember.staffId || staffMember.id
      await staffAPI.toggleStatus(staffId, newStatus)
      
      showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công!`, 'success')
      await loadStaff(currentPage.value)
    } catch (error) {
      // Xử lý lỗi 404 đặc biệt
      if (error.response?.status === 404) {
        showToast('Nhân viên không tồn tại hoặc đã bị xóa. Đang tải lại danh sách...', 'error')
        await loadStaff(currentPage.value)
        return
      }
      
      const errorMsg = handleApiError(error, `Không thể ${action} tài khoản`)
      showToast(errorMsg, 'error')
    }
  }

  /**
   * Handle search
   */
  const handleSearch = () => {
    // Search is reactive through computed property
    if (currentPage.value !== 0) {
      currentPage.value = 0
    }
  }

  /**
   * Navigate to page
   */
  const changePage = async (page) => {
    if (page < 0 || page >= totalPages.value) return
    await loadStaff(page)
  }

  /**
   * Get role badge class
   */
  const getRoleBadgeClass = (role) => {
    const classes = {
      ADMIN: 'bg-red-100 text-red-800',
      STAFF: 'bg-blue-100 text-blue-800',
      LIBRARIAN: 'bg-green-100 text-green-800'
    }
    return classes[role] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Get status badge class
   */
  const getStatusBadgeClass = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  return {
    staff,
    roles,
    isLoading,
    errorMessage,
    searchQuery,
    showModal,
    modalMode,
    formData,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    filteredStaff,
    visiblePages,
    loadStaff,
    loadRoles,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleSearch,
    changePage,
    getRoleBadgeClass,
    getStatusBadgeClass,
    formatDate
  }
}
