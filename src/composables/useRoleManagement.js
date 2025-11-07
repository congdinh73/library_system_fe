import { ref } from 'vue'
import { rolesAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

export function useRoleManagement() {
  const roles = ref([])
  const isLoading = ref(false)
  const isInitializing = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const isEditMode = ref(false)
  const isSubmitting = ref(false)
  const modalError = ref('')

  const formData = ref({
    roleName: '',
    description: '',
    priority: 0
  })

  const roleToDelete = ref(null)

  const fetchRoles = async (handleAuthError) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await rolesAPI.getAll()
      
      if (Array.isArray(response)) {
        roles.value = response
      } else if (response.data && Array.isArray(response.data)) {
        roles.value = response.data
      } else if (response.content && Array.isArray(response.content)) {
        roles.value = response.content
      } else {
        roles.value = []
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      if (handleAuthError && handleAuthError(error)) return
      errorMessage.value = handleApiError(error, 'Không thể tải danh sách vai trò')
    } finally {
      isLoading.value = false
    }
  }

  const handleInitializeDefaults = async (handleAuthError) => {
    if (!confirm('Bạn có chắc muốn khởi tạo các vai trò mặc định (ADMIN, STAFF, READER)?')) {
      return
    }

    isInitializing.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      await rolesAPI.initializeDefaults()
      successMessage.value = 'Khởi tạo vai trò mặc định thành công!'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
      await fetchRoles(handleAuthError)
    } catch (error) {
      if (handleAuthError && handleAuthError(error)) return
      errorMessage.value = handleApiError(error, 'Không thể khởi tạo vai trò mặc định')
    } finally {
      isInitializing.value = false
    }
  }

  const getRoleBadgeClass = (roleName) => {
    const name = roleName?.toUpperCase()
    if (name === 'ADMIN') return 'role-admin'
    if (name === 'STAFF' || name === 'LIBRARIAN') return 'role-staff'
    if (name === 'READER') return 'role-reader'
    return 'role-default'
  }

  const openAddModal = () => {
    isEditMode.value = false
    formData.value = {
      roleName: '',
      description: '',
      priority: 0
    }
    modalError.value = ''
    showModal.value = true
  }

  const openEditModal = (role) => {
    isEditMode.value = true
    formData.value = {
      roleId: role.roleId,
      roleName: role.roleName,
      description: role.description || '',
      priority: role.priority
    }
    modalError.value = ''
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    formData.value = {
      roleName: '',
      description: '',
      priority: 0
    }
    modalError.value = ''
  }

  const handleSubmit = async (showToast, handleAuthError) => {
    modalError.value = ''
    isSubmitting.value = true

    try {
      if (isEditMode.value) {
        await rolesAPI.update(formData.value.roleId, {
          description: formData.value.description,
          priority: formData.value.priority
        })
        showToast('Cập nhật vai trò thành công!', 'success')
      } else {
        await rolesAPI.create({
          roleName: formData.value.roleName.toUpperCase(),
          description: formData.value.description,
          priority: formData.value.priority
        })
        showToast('Thêm vai trò thành công!', 'success')
      }

      closeModal()
      await fetchRoles(handleAuthError)
    } catch (error) {
      if (handleAuthError && handleAuthError(error)) return
      modalError.value = handleApiError(error, 'Không thể lưu vai trò')
    } finally {
      isSubmitting.value = false
    }
  }

  const confirmDelete = (role) => {
    roleToDelete.value = role
    modalError.value = ''
    showDeleteModal.value = true
  }

  const closeDeleteModal = () => {
    showDeleteModal.value = false
    roleToDelete.value = null
    modalError.value = ''
  }

  const handleDelete = async (showToast, handleAuthError) => {
    if (!roleToDelete.value) return

    isSubmitting.value = true

    try {
      await rolesAPI.delete(roleToDelete.value.roleId)
      showToast('Xóa vai trò thành công!', 'success')
      closeDeleteModal()
      await fetchRoles(handleAuthError)
    } catch (error) {
      if (handleAuthError && handleAuthError(error)) return
      const errorMsg = handleApiError(error, 'Không thể xóa vai trò')
      showToast(errorMsg, 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    roles,
    isLoading,
    isInitializing,
    errorMessage,
    successMessage,
    showModal,
    showDeleteModal,
    isEditMode,
    isSubmitting,
    modalError,
    formData,
    roleToDelete,
    fetchRoles,
    handleInitializeDefaults,
    getRoleBadgeClass,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmit,
    confirmDelete,
    closeDeleteModal,
    handleDelete
  }
}
