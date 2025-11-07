// API Base URL - Thay đổi theo môi trường của bạn
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Debug mode - set to false in production
const DEBUG_MODE = import.meta.env.DEV

// Axios-like fetch wrapper
class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.token = null
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('token')
    }
    return this.token
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config = {
      ...options,
      headers,
    }

    try {
      if (DEBUG_MODE) {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
      }
      
      const response = await fetch(url, config)
      
      if (DEBUG_MODE) {
        console.log(`📡 API Response: ${response.status} ${response.statusText}`)
      }
      
      // Xử lý response
      if (!response.ok) {
        let error
        const contentType = response.headers.get('content-type')
        
        // Try to parse error as JSON
        if (contentType && contentType.includes('application/json')) {
          error = await response.json().catch(() => ({}))
        } else {
          // For non-JSON responses (like HTML error pages)
          const text = await response.text().catch(() => '')
          error = { message: text || response.statusText }
        }
        
        console.error(`❌ API Error:`, {
          status: response.status,
          statusText: response.statusText,
          url: url,
          error: error
        })
        
        // Throw structured error
        const apiError = {
          status: response.status,
          message: error.message || response.statusText,
          data: error,
          response: {
            status: response.status,
            statusText: response.statusText,
            data: error
          }
        }
        
        throw apiError
      }

      // Nếu response không có content (204 No Content), trả về null
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json') || response.status === 204) {
        if (DEBUG_MODE) {
          console.log(`✅ API Success: No content`)
        }
        return null
      }

      const data = await response.json()
      if (DEBUG_MODE) {
        console.log(`✅ API Success:`, data)
      }
      return data
    } catch (error) {
      // Network error or other errors
      if (!error.status) {
        console.error(`❌ Network Error:`, error)
        throw {
          status: 0,
          message: 'Network error. Please check your connection.',
          data: {},
          request: config
        }
      }
      
      // Handle 401 Unauthorized - Auto logout except for login endpoint
      if (error.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        console.warn('🔒 Unauthorized - Redirecting to login')
        this.setToken(null)
        localStorage.removeItem('user')
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
      
      throw error
    }
  }

  // GET request
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    })
  }

  // POST request
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
  }

  // PUT request
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    })
  }

  // DELETE request
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    })
  }

  // PATCH request
  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    })
  }
}

// Tạo instance
const apiService = new ApiService(API_BASE_URL)

export default apiService
