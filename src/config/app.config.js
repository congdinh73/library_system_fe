// ⚙️ Cấu hình ứng dụng

// ==========================================
// API Configuration
// ==========================================

/**
 * Sử dụng Mock API hay Real API?
 * true = Mock API (fake data, không cần backend)
 * false = Real API (kết nối backend thật)
 */
export const USE_MOCK_API = true

/**
 * Hash password ở frontend trước khi gửi lên backend?
 * 
 * true = Hash bằng SHA-256 ở frontend
 *   - Dùng khi: Backend KHÔNG tự hash, hoặc cần bảo mật truyền tải
 *   - Password gửi đi: "240be518fabd2724..." (hash)
 * 
 * false = Gửi plain text password
 *   - Dùng khi: Backend TỰ hash (Spring Security, bcrypt, v.v.)
 *   - Password gửi đi: "admin123" (plain text)
 *   - ⚠️ Yêu cầu HTTPS trong production
 */
export const HASH_PASSWORD_ON_FRONTEND = false

/**
 * Mock API có dùng hashed password không?
 * (Chỉ áp dụng khi USE_MOCK_API = true)
 * 
 * Nên để giống với HASH_PASSWORD_ON_FRONTEND để test đúng
 */
export const MOCK_USE_HASHED_PASSWORD = false

// ==========================================
// API Endpoints
// ==========================================

/**
 * Base URL của backend API
 * Được lấy từ .env.local hoặc fallback về localhost:8080
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// ==========================================
// Authentication
// ==========================================

/**
 * Tên key để lưu token trong localStorage
 */
export const TOKEN_KEY = 'token'

/**
 * Tên key để lưu user info trong localStorage
 */
export const USER_KEY = 'user'

/**
 * JWT Token expiration time (milliseconds)
 * Default: 24 hours
 */
export const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000

// ==========================================
// UI Configuration
// ==========================================

/**
 * Thời gian delay cho Mock API (milliseconds)
 * Giả lập network latency
 */
export const MOCK_API_DELAY = 800

/**
 * Số items mặc định mỗi trang (pagination)
 */
export const DEFAULT_PAGE_SIZE = 10

/**
 * Timeout cho các API calls (milliseconds)
 */
export const API_TIMEOUT = 30000

// ==========================================
// Development
// ==========================================

/**
 * Bật/tắt debug logs
 */
export const DEBUG_MODE = import.meta.env.DEV

/**
 * Log API requests/responses
 */
export const LOG_API_CALLS = true

// ==========================================
// Export all as default
// ==========================================

export default {
  // API
  USE_MOCK_API,
  HASH_PASSWORD_ON_FRONTEND,
  MOCK_USE_HASHED_PASSWORD,
  API_BASE_URL,
  
  // Auth
  TOKEN_KEY,
  USER_KEY,
  TOKEN_EXPIRATION,
  
  // UI
  MOCK_API_DELAY,
  DEFAULT_PAGE_SIZE,
  API_TIMEOUT,
  
  // Dev
  DEBUG_MODE,
  LOG_API_CALLS
}
