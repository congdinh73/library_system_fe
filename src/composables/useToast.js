import { ref } from 'vue'

const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

let timeoutId = null

export function useToast() {
  const showToast = (message, type = 'success', duration = 3000) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    toast.value = {
      show: true,
      message,
      type
    }

    timeoutId = setTimeout(() => {
      toast.value.show = false
    }, duration)
  }

  return {
    toast,
    showToast
  }
}
