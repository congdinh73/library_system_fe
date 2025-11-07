import { ref } from 'vue'
import { authAPI } from '@/services/apiEndpoints'
import apiService from '@/services/api'
import { handleApiError } from '@/utils/errorHandler'

export function useLogin() {
  const HASH_PASSWORD_ON_FRONTEND = false

  const formData = ref({
    username: '',
    password: '',
    rememberMe: false
  })

  const isLoading = ref(false)
  const errorMessage = ref('')

  async function hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  const handleLogin = async (router) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const password = HASH_PASSWORD_ON_FRONTEND 
        ? await hashPassword(formData.value.password)
        : formData.value.password
      
      const loginData = {
        email: formData.value.username,
        password: password
      }
      
      const response = await authAPI.login(loginData)

      const token = response.token || response.data?.token || response.accessToken || response.data?.accessToken
      if (token) {
        apiService.setToken(token)
        localStorage.setItem('token', token)
      }
      
      const rolesArray = response.data?.roles || response.user?.roles || response.roles || ['READER']
      const userRole = rolesArray[0] || 'READER'
      
      const userData = {
        username: response.data?.email || response.user?.username || response.username || formData.value.username,
        email: response.data?.email || response.user?.email || response.email,
        id: response.data?.id || response.data?.readerId || response.data?.staffId || response.user?.id || response.id,
        readerId: response.data?.readerId,
        staffId: response.data?.staffId,
        name: response.data?.fullName || response.user?.name || response.name,
        role: userRole,
        roles: rolesArray
      }
      
      localStorage.setItem('user', JSON.stringify(userData))

      if (userRole === 'READER') {
        router.push({ name: 'reader' })
      } else if (userRole === 'STAFF') {
        // STAFF can only access books management
        router.push({ name: 'books' })
      } else {
        // ADMIN, LIBRARIAN go to dashboard
        router.push({ name: 'dashboard' })
      }
    } catch (error) {
      errorMessage.value = handleApiError(error, 'Đăng nhập thất bại. Vui lòng thử lại')
    } finally {
      isLoading.value = false
    }
  }

  return {
    formData,
    isLoading,
    errorMessage,
    handleLogin
  }
}
