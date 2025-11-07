import { ref } from 'vue'
import { readersAPI } from '@/services/apiEndpoints'
import { handleApiError } from '@/utils/errorHandler'

/**
 * Composable for user registration
 * Handles form state, validation, and API communication
 */
export function useRegister() {
  const formData = ref({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  })

  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  /**
   * Validate password requirements
   * @returns {boolean} true if valid, false otherwise (sets errorMessage)
   */
  const validatePassword = () => {
    errorMessage.value = ''
    
    if (formData.value.password !== formData.value.confirmPassword) {
      errorMessage.value = 'Mật khẩu xác nhận không khớp'
      return false
    }

    if (formData.value.password.length < 6) {
      errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự'
      return false
    }

    return true
  }

  /**
   * Handle user registration
   * @param {Object} router - Vue Router instance for navigation
   */
  const handleRegister = async (router) => {
    errorMessage.value = ''
    successMessage.value = ''

    // Validate password before submitting
    if (!validatePassword()) {
      return
    }

    isLoading.value = true

    try {
      const registerData = {
        fullName: formData.value.fullName,
        email: formData.value.email,
        phone: formData.value.phone,
        address: formData.value.address,
        password: formData.value.password
      }
      
      await readersAPI.register(registerData)

      successMessage.value = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...'
      
      // Wait 2 seconds then redirect to login
      setTimeout(() => {
        router.push({ name: 'login' })
      }, 2000)
    } catch (error) {
      errorMessage.value = handleApiError(error, 'Đăng ký thất bại. Vui lòng thử lại')
    } finally {
      isLoading.value = false
    }
  }

  return {
    formData,
    isLoading,
    errorMessage,
    successMessage,
    handleRegister
  }
}
