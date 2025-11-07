import { ref, computed } from 'vue'
import { readersAPI, accountManagementAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

export function useReadersManagement() {
  const readers = ref([])
  const searchQuery = ref('')
  const isLoading = ref(false)
  const errorMessage = ref('')

  // Pagination
  const currentPage = ref(0)
  const pageSize = ref(20)
  const totalPages = ref(0)
  const totalElements = ref(0)

  // Modals
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const showToggleModal = ref(false)

  // Forms
  const form = ref({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  })
  const formError = ref('')
  const isSubmitting = ref(false)

  // Delete and Toggle
  const readerToDelete = ref(null)
  const readerToToggle = ref(null)
  const isDeleting = ref(false)
  const isToggling = ref(false)

  const filteredReaders = computed(() => {
    if (!searchQuery.value.trim()) return readers.value
    
    const query = searchQuery.value.toLowerCase().trim()
    
    return readers.value.filter(reader => {
      const searchableText = [
        reader.fullName,
        reader.email,
        reader.phone,
        reader.address
      ].filter(Boolean).join(' ').toLowerCase()
      
      return searchableText.includes(query)
    })
  })

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

  const loadReaders = async (page = 0) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const params = {
        page: page,
        size: pageSize.value
      }
      
      const response = await readersAPI.getAll(params)
      
      console.log('👥 Readers response:', response)
      
      // Parse response (Spring Boot Page format)
      if (response.data?.content && Array.isArray(response.data.content)) {
        readers.value = response.data.content
        currentPage.value = response.data.number || 0
        totalPages.value = response.data.totalPages || 1
        totalElements.value = response.data.totalElements || response.data.content.length
      } else if (response.content && Array.isArray(response.content)) {
        readers.value = response.content
        currentPage.value = response.number || 0
        totalPages.value = response.totalPages || 1
        totalElements.value = response.totalElements || response.content.length
      } else if (Array.isArray(response)) {
        readers.value = response
        totalPages.value = 1
        totalElements.value = response.length
      } else if (response.data && Array.isArray(response.data)) {
        readers.value = response.data
        totalPages.value = 1
        totalElements.value = response.data.length
      } else {
        readers.value = []
      }
      
      console.log('👥 Total readers loaded:', readers.value.length)
    } catch (error) {
      console.error('Error loading readers:', error)
      errorMessage.value = handleApiError(error, 'Không thể tải danh sách độc giả')
    } finally {
      isLoading.value = false
    }
  }

  const handleSearch = () => {
    // Local search - no need to call API
  }

  const goToPage = (page) => {
    if (page >= 0 && page < totalPages.value) {
      loadReaders(page)
    }
  }

  const editReader = (reader) => {
    form.value = {
      fullName: reader.fullName,
      email: reader.email,
      phone: reader.phone,
      address: reader.address,
      password: ''
    }
    readerToDelete.value = reader
    showEditModal.value = true
  }

  const toggleReaderStatus = async (reader) => {
    readerToToggle.value = reader
    showToggleModal.value = true
  }

  const handleToggleStatus = async (showToast, handleAuthError) => {
    if (!readerToToggle.value) return
    
    isToggling.value = true
    const reader = readerToToggle.value
    const action = reader.isActive ? 'vô hiệu hóa' : 'kích hoạt'

    try {
      const readerId = reader.readerId || reader.id
      console.log(`👤 Toggling reader status: ID=${readerId}, current isActive=${reader.isActive}, action=${action}`)
      
      let response
      if (reader.isActive) {
        response = await accountManagementAPI.deactivateReader(readerId)
        showToast(`Đã vô hiệu hóa độc giả thành công`, 'success')
        reader.isActive = false
      } else {
        response = await accountManagementAPI.activateReader(readerId)
        showToast(`Đã kích hoạt độc giả thành công`, 'success')
        reader.isActive = true
      }
      
      // Force reactivity update
      readers.value = [...readers.value]
      
      // Close modal
      showToggleModal.value = false
      readerToToggle.value = null
    } catch (error) {
      console.error('Error toggling reader status:', error)
      if (handleAuthError && handleAuthError(error)) return
      const errorMsg = handleApiError(error, 'Không thể thay đổi trạng thái độc giả')
      showToast(errorMsg, 'error')
    } finally {
      isToggling.value = false
    }
  }

  const confirmDelete = (reader) => {
    readerToDelete.value = reader
    showDeleteModal.value = true
  }

  const handleCreate = async (showToast) => {
    formError.value = ''
    isSubmitting.value = true

    try {
      const createData = {
        fullName: form.value.fullName,
        email: form.value.email,
        phone: form.value.phone,
        address: form.value.address,
        password: form.value.password
      }

      console.log('➕ Creating reader:', createData)
      
      await readersAPI.create(createData)
      
      showToast('Thêm độc giả thành công!', 'success')
      closeModals()
      loadReaders(currentPage.value)
    } catch (error) {
      console.error('Error creating reader:', error)
      formError.value = handleApiError(error, 'Không thể thêm độc giả')
    } finally {
      isSubmitting.value = false
    }
  }

  const handleUpdate = async (showToast) => {
    formError.value = ''
    isSubmitting.value = true

    try {
      const updateData = {
        fullName: form.value.fullName,
        phone: form.value.phone,
        address: form.value.address
      }

      const readerId = readerToDelete.value.readerId || readerToDelete.value.id

      console.log('✏️ Updating reader:', readerId, updateData)
      
      await readersAPI.update(readerId, updateData)
      
      showToast('Cập nhật thông tin thành công!', 'success')
      closeModals()
      loadReaders(currentPage.value)
    } catch (error) {
      console.error('Error updating reader:', error)
      formError.value = handleApiError(error, 'Không thể cập nhật thông tin')
    } finally {
      isSubmitting.value = false
    }
  }

  const handleDelete = async (showToast) => {
    isDeleting.value = true

    try {
      const readerId = readerToDelete.value.readerId || readerToDelete.value.id

      console.log('🗑️ Deleting reader:', readerId)
      
      await readersAPI.delete(readerId)
      
      showToast('Xóa độc giả thành công!', 'success')
      showDeleteModal.value = false
      readerToDelete.value = null
      loadReaders(currentPage.value)
    } catch (error) {
      console.error('Error deleting reader:', error)
      const errorMsg = handleApiError(error, 'Không thể xóa độc giả')
      showToast(errorMsg, 'error')
    } finally {
      isDeleting.value = false
    }
  }

  const closeModals = () => {
    showCreateModal.value = false
    showEditModal.value = false
    formError.value = ''
    form.value = {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      password: ''
    }
    readerToDelete.value = null
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  return {
    readers,
    searchQuery,
    isLoading,
    errorMessage,
    currentPage,
    totalPages,
    totalElements,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showToggleModal,
    form,
    formError,
    isSubmitting,
    readerToDelete,
    readerToToggle,
    isDeleting,
    isToggling,
    filteredReaders,
    visiblePages,
    loadReaders,
    handleSearch,
    goToPage,
    editReader,
    toggleReaderStatus,
    handleToggleStatus,
    confirmDelete,
    handleCreate,
    handleUpdate,
    handleDelete,
    closeModals,
    formatDate
  }
}
