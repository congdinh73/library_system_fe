import { ref } from 'vue'
import { categoriesAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

export function useCategoriesManagement() {
  const categories = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const searchQuery = ref('')

  const currentPage = ref(0)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const pageSize = ref(5)

  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const isEditMode = ref(false)
  const isSubmitting = ref(false)
  const modalError = ref('')

  const formData = ref({ name: '' })
  const categoryToDelete = ref(null)

  const normalizeCategory = (cat) => ({
    categoryId: cat.categoryId || cat.id,
    name: cat.name
  })

  const fetchCategories = async (page = 0, handleAuthError) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const params = { page, size: pageSize.value }
      if (searchQuery.value.trim()) {
        params.search = searchQuery.value.trim()
      }
      const response = await categoriesAPI.getAll(params)
      
      if (response.content && Array.isArray(response.content)) {
        categories.value = response.content.map(normalizeCategory)
        totalPages.value = response.totalPages || 0
        totalElements.value = response.totalElements || 0
        currentPage.value = response.number || 0
      } else if (Array.isArray(response)) {
        categories.value = response.map(normalizeCategory)
        totalPages.value = 1
        totalElements.value = response.length
        currentPage.value = 0
      } else if (response.data) {
        if (response.data.content && Array.isArray(response.data.content)) {
          categories.value = response.data.content.map(normalizeCategory)
          totalPages.value = response.data.totalPages || 0
          totalElements.value = response.data.totalElements || 0
          currentPage.value = response.data.number || 0
        } else if (Array.isArray(response.data)) {
          categories.value = response.data.map(normalizeCategory)
          totalPages.value = 1
          totalElements.value = response.data.length
          currentPage.value = 0
        }
      } else {
        categories.value = []
        totalPages.value = 0
        totalElements.value = 0
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      if (handleAuthError && handleAuthError(error)) return
      errorMessage.value = handleApiError(error, 'Không thể tải danh sách thể loại')
    } finally {
      isLoading.value = false
    }
  }

  let searchTimeout
  const handleSearch = (handleAuthError) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage.value = 0
      fetchCategories(0, handleAuthError)
    }, 500)
  }

  const changePage = (page, handleAuthError) => {
    if (page >= 0 && page < totalPages.value) {
      fetchCategories(page, handleAuthError)
    }
  }

  const openAddModal = () => {
    isEditMode.value = false
    formData.value = { name: '' }
    modalError.value = ''
    showModal.value = true
  }

  const openEditModal = (category) => {
    isEditMode.value = true
    formData.value = {
      categoryId: category.categoryId,
      name: category.name
    }
    modalError.value = ''
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    formData.value = { name: '' }
    modalError.value = ''
  }

  const handleSubmit = async (showToast, handleAuthError) => {
    modalError.value = ''
    isSubmitting.value = true

    try {
      if (isEditMode.value) {
        await categoriesAPI.update(formData.value.categoryId, {
          name: formData.value.name
        })
        showToast('Cập nhật thể loại thành công!', 'success')
      } else {
        await categoriesAPI.create({
          name: formData.value.name
        })
        showToast('Thêm thể loại thành công!', 'success')
      }

      closeModal()
      await fetchCategories(currentPage.value, handleAuthError)
    } catch (error) {
      if (handleAuthError && handleAuthError(error)) return
      modalError.value = handleApiError(error, 'Không thể lưu thể loại')
    } finally {
      isSubmitting.value = false
    }
  }

  const confirmDelete = (category) => {
    categoryToDelete.value = category
    modalError.value = ''
    showDeleteModal.value = true
  }

  const closeDeleteModal = () => {
    showDeleteModal.value = false
    categoryToDelete.value = null
    modalError.value = ''
  }

  const handleDelete = async (showToast, handleAuthError) => {
    if (!categoryToDelete.value) return

    isSubmitting.value = true

    try {
      await categoriesAPI.delete(categoryToDelete.value.categoryId)
      showToast('Xóa thể loại thành công!', 'success')
      closeDeleteModal()
      await fetchCategories(currentPage.value, handleAuthError)
    } catch (error) {
      if (handleAuthError && handleAuthError(error)) return
      const errorMsg = handleApiError(error, 'Không thể xóa thể loại')
      showToast(errorMsg, 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    categories,
    isLoading,
    errorMessage,
    searchQuery,
    currentPage,
    totalPages,
    totalElements,
    showModal,
    showDeleteModal,
    isEditMode,
    isSubmitting,
    modalError,
    formData,
    categoryToDelete,
    fetchCategories,
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
