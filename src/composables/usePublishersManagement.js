import { ref } from 'vue'
import { publishersAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

export function usePublishersManagement() {
  const publishers = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const searchQuery = ref('')

  // Pagination
  const currentPage = ref(0)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const pageSize = ref(5)

  // Modal states
  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const isEditMode = ref(false)
  const isSubmitting = ref(false)
  const modalError = ref('')

  const formData = ref({
    name: '',
    address: ''
  })

  const publisherToDelete = ref(null)

  // Normalize function to ensure consistent field names
  const normalizePublisher = (pub) => ({
    publisherId: pub.publisherId || pub.id,
    name: pub.name,
    address: pub.address
  })

  const fetchPublishers = async (page = 0, handleAuthError) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const params = { page, size: pageSize.value }
      if (searchQuery.value.trim()) {
        params.search = searchQuery.value.trim()
      }
      const response = await publishersAPI.getAll(params)
      
      // Handle different response formats
      if (response.content && Array.isArray(response.content)) {
        publishers.value = response.content.map(normalizePublisher)
        totalPages.value = response.totalPages || 0
        totalElements.value = response.totalElements || 0
        currentPage.value = response.number || 0
      } else if (Array.isArray(response)) {
        publishers.value = response.map(normalizePublisher)
        totalPages.value = 1
        totalElements.value = response.length
        currentPage.value = 0
      } else if (response.data) {
        if (response.data.content && Array.isArray(response.data.content)) {
          publishers.value = response.data.content.map(normalizePublisher)
          totalPages.value = response.data.totalPages || 0
          totalElements.value = response.data.totalElements || 0
          currentPage.value = response.data.number || 0
        } else if (Array.isArray(response.data)) {
          publishers.value = response.data.map(normalizePublisher)
          totalPages.value = 1
          totalElements.value = response.data.length
          currentPage.value = 0
        }
      } else {
        publishers.value = []
        totalPages.value = 0
        totalElements.value = 0
      }
    } catch (error) {
      console.error('Error fetching publishers:', error)
      if (handleAuthError && handleAuthError(error)) return
      errorMessage.value = handleApiError(error, 'Không thể tải danh sách nhà xuất bản')
    } finally {
      isLoading.value = false
    }
  }

  let searchTimeout
  const handleSearch = (handleAuthError) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage.value = 0
      fetchPublishers(0, handleAuthError)
    }, 500)
  }

  const changePage = (page, handleAuthError) => {
    if (page >= 0 && page < totalPages.value) {
      fetchPublishers(page, handleAuthError)
    }
  }

  const openAddModal = () => {
    isEditMode.value = false
    formData.value = {
      name: '',
      address: ''
    }
    modalError.value = ''
    showModal.value = true
  }

  const openEditModal = (publisher) => {
    isEditMode.value = true
    formData.value = {
      publisherId: publisher.publisherId,
      name: publisher.name,
      address: publisher.address
    }
    modalError.value = ''
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    formData.value = {
      name: '',
      address: ''
    }
    modalError.value = ''
  }

  const handleSubmit = async (showToast, handleAuthError) => {
    modalError.value = ''
    isSubmitting.value = true

    try {
      if (isEditMode.value) {
        await publishersAPI.update(formData.value.publisherId, {
          name: formData.value.name,
          address: formData.value.address
        })
        showToast('Cập nhật nhà xuất bản thành công!', 'success')
      } else {
        await publishersAPI.create({
          name: formData.value.name,
          address: formData.value.address
        })
        showToast('Thêm nhà xuất bản thành công!', 'success')
      }

      closeModal()
      await fetchPublishers(currentPage.value, handleAuthError)
    } catch (error) {
      if (handleAuthError && handleAuthError(error)) return
      modalError.value = handleApiError(error, 'Không thể lưu nhà xuất bản')
    } finally {
      isSubmitting.value = false
    }
  }

  const confirmDelete = (publisher) => {
    publisherToDelete.value = publisher
    modalError.value = ''
    showDeleteModal.value = true
  }

  const closeDeleteModal = () => {
    showDeleteModal.value = false
    publisherToDelete.value = null
    modalError.value = ''
  }

  const handleDelete = async (showToast, handleAuthError) => {
    if (!publisherToDelete.value) return

    isSubmitting.value = true

    try {
      await publishersAPI.delete(publisherToDelete.value.publisherId)
      showToast('Xóa nhà xuất bản thành công!', 'success')
      closeDeleteModal()
      
      // If current page becomes empty after delete, go to previous page
      if (publishers.value.length === 1 && currentPage.value > 0) {
        await fetchPublishers(currentPage.value - 1, handleAuthError)
      } else {
        await fetchPublishers(currentPage.value, handleAuthError)
      }
    } catch (error) {
      if (handleAuthError && handleAuthError(error)) return
      const errorMsg = handleApiError(error, 'Không thể xóa nhà xuất bản')
      showToast(errorMsg, 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    publishers,
    isLoading,
    errorMessage,
    searchQuery,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    showModal,
    showDeleteModal,
    isEditMode,
    isSubmitting,
    modalError,
    formData,
    publisherToDelete,
    fetchPublishers,
    handleSearch,
    changePage,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmit,
    confirmDelete,
    closeDeleteModal,
    handleDelete
  }
}
