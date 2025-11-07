import { useRouter } from 'vue-router'
import { useToast } from './useToast'

export function useAuthError() {
  const router = useRouter()
  const { showToast } = useToast()

  const handleAuthError = (error) => {
    if (error.status === 401) {
      // Clear stored auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Show notification
      showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error', 4000)
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 1500)
      
      return true
    }
    return false
  }

  return {
    handleAuthError
  }
}
