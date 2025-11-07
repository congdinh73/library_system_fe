/**
 * Centralized error handler for API responses
 * Maps backend error codes and English messages to user-friendly Vietnamese messages
 */

// Error code mappings
const ERROR_MESSAGES = {
  // Auth errors
  VALIDATION_FAILED: 'Dữ liệu đầu vào không hợp lệ',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác',
  ACCOUNT_DISABLED: 'Tài khoản đã bị vô hiệu hóa',
  INVALID_REFRESH_TOKEN: 'Phiên đăng nhập đã hết hạn',
  INVALID_REQUEST: 'Yêu cầu không hợp lệ',
  EMAIL_ALREADY_EXISTS: 'Email đã tồn tại trong hệ thống',
  
  // Staff errors
  STAFF_NOT_FOUND: 'Không tìm thấy nhân viên',
  ROLES_NOT_FOUND: 'Một hoặc nhiều vai trò không tồn tại',
  INVALID_INPUT: 'Dữ liệu đầu vào không hợp lệ',
  CANNOT_DISABLE_OWN_ACCOUNT: 'Không thể vô hiệu hóa tài khoản của chính mình',
  
  // Role errors
  ROLE_NOT_FOUND: 'Không tìm thấy vai trò',
  ROLE_NAME_EXISTS: 'Tên vai trò đã tồn tại',
  CANNOT_DELETE_ROLE: 'Không thể xóa vai trò đang được gán cho nhân viên',
  
  // Reader errors
  READER_NOT_FOUND: 'Không tìm thấy độc giả',
  VALIDATION_ERROR: 'Lỗi xác thực dữ liệu',
  INVALID_TOKEN: 'Token không hợp lệ hoặc đã hết hạn',
  
  // Publisher errors
  PUBLISHER_NOT_FOUND: 'Không tìm thấy nhà xuất bản',
  PUBLISHER_ALREADY_EXISTS: 'Nhà xuất bản đã tồn tại',
  CANNOT_DELETE: 'Không thể xóa nhà xuất bản có phụ thuộc',
  
  // Category errors
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục',
  CATEGORY_ALREADY_EXISTS: 'Danh mục đã tồn tại',
  CATEGORY_UPDATE_CONFLICT: 'Cập nhật danh mục xung đột với dữ liệu hiện có',
  CANNOT_DELETE_CATEGORY: 'Không thể xóa danh mục do có phụ thuộc',
  INVALID_ID: 'ID không hợp lệ',
  
  // Book errors
  BOOK_NOT_FOUND: 'Không tìm thấy sách',
  BOOK_ALREADY_EXISTS: 'Sách đã tồn tại',
  BOOK_UPDATE_CONFLICT: 'Cập nhật sách xung đột với dữ liệu hiện có',
  CANNOT_DELETE_BOOK: 'Không thể xóa sách có phụ thuộc',
  QUANTITY_MUST_BE_ZERO: 'Số lượng phải bằng 0 để xóa sách',
  
  // Loan errors
  LOAN_NOT_FOUND: 'Không tìm thấy khoản mượn',
  BORROW_LIMIT_EXCEEDED: 'Vượt quá giới hạn mượn sách',
  BOOK_NOT_AVAILABLE: 'Sách không có sẵn hoặc đã được mượn',
  BOOK_ALREADY_RETURNED: 'Sách đã được trả',
  
  // Auth/Permission errors
  UNAUTHORIZED: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn',
  FORBIDDEN: 'Bạn không có quyền truy cập tài nguyên này',
  
  // Health check errors
  HEALTH_CHECK_FAILED: 'Kiểm tra sức khỏe ứng dụng thất bại',
  SERVICE_UNAVAILABLE: 'Dịch vụ không khả dụng',
  
  // Generic errors
  INTERNAL_ERROR: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau',
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet',
  TIMEOUT_ERROR: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại'
}

// English to Vietnamese message translation
const MESSAGE_TRANSLATIONS = {
  // Generic messages
  'Invalid input data': 'Dữ liệu đầu vào không hợp lệ',
  'Validation error': 'Lỗi xác thực dữ liệu',
  'Invalid ID supplied': 'ID không hợp lệ',
  'Internal server error': 'Lỗi máy chủ nội bộ',
  'Bad request': 'Yêu cầu không hợp lệ',
  'Bad Request': 'Yêu cầu không hợp lệ',
  'Not found': 'Không tìm thấy',
  'Not Found': 'Không tìm thấy',
  'Conflict': 'Xung đột dữ liệu',
  'Method not allowed': 'Phương thức không được phép',
  'Method Not Allowed': 'Phương thức không được phép',
  'Request timeout': 'Yêu cầu quá thời gian chờ',
  'Service unavailable': 'Dịch vụ không khả dụng',
  'Gateway timeout': 'Cổng kết nối quá thời gian chờ',
  
  // Auth messages
  'Unauthorized - Missing or invalid authentication token': 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn',
  'Unauthorized': 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn',
  'Missing or invalid authentication token': 'Thiếu hoặc token xác thực không hợp lệ',
  'Authentication token is required': 'Yêu cầu token xác thực',
  'Forbidden - Insufficient permissions to access this resource': 'Bạn không có quyền truy cập tài nguyên này',
  'Forbidden': 'Bạn không có quyền thực hiện thao tác này',
  'Insufficient permissions': 'Không đủ quyền truy cập',
  'Access denied': 'Truy cập bị từ chối',
  'You do not have permission': 'Bạn không có quyền',
  "You don't have permission to access this resource": 'Bạn không có quyền truy cập tài nguyên này',
  'You do not have permission to access this resource': 'Bạn không có quyền truy cập tài nguyên này',
  'Permission denied': 'Quyền truy cập bị từ chối',
  'Invalid credentials': 'Email hoặc mật khẩu không chính xác',
  'Account disabled': 'Tài khoản đã bị vô hiệu hóa',
  'Invalid or expired refresh token': 'Phiên đăng nhập đã hết hạn',
  'Invalid or expired token': 'Token không hợp lệ hoặc đã hết hạn',
  'Token expired': 'Token đã hết hạn',
  'Token invalid': 'Token không hợp lệ',
  'Session expired': 'Phiên làm việc đã hết hạn',
  'Password reset email sent': 'Email đặt lại mật khẩu đã được gửi',
  'Password reset successful': 'Đặt lại mật khẩu thành công',
  
  // Staff messages
  'Staff not found': 'Không tìm thấy nhân viên',
  'Staff created successfully': 'Tạo nhân viên thành công',
  'Staff updated successfully': 'Cập nhật nhân viên thành công',
  'Staff deleted successfully': 'Xóa nhân viên thành công',
  'Staff registered successfully': 'Đăng ký nhân viên thành công',
  'Staff list retrieved successfully': 'Lấy danh sách nhân viên thành công',
  'Staff retrieved successfully': 'Lấy thông tin nhân viên thành công',
  'One or more roles not found': 'Một hoặc nhiều vai trò không tồn tại',
  'Cannot disable own account': 'Không thể vô hiệu hóa tài khoản của chính mình',
  'Staff account status updated successfully': 'Cập nhật trạng thái tài khoản nhân viên thành công',
  'Staff account activated successfully': 'Kích hoạt tài khoản nhân viên thành công',
  'Staff account deactivated successfully': 'Vô hiệu hóa tài khoản nhân viên thành công',
  'Staff account status retrieved successfully': 'Lấy trạng thái tài khoản nhân viên thành công',
  
  // Role messages
  'Role not found': 'Không tìm thấy vai trò',
  'Role name already exists': 'Tên vai trò đã tồn tại',
  'Cannot delete role assigned to staff': 'Không thể xóa vai trò đang được gán cho nhân viên',
  'Role created successfully': 'Tạo vai trò thành công',
  'Role updated successfully': 'Cập nhật vai trò thành công',
  'Role deleted successfully': 'Xóa vai trò thành công',
  'Roles retrieved successfully': 'Lấy danh sách vai trò thành công',
  'Roles initialized successfully': 'Khởi tạo vai trò mặc định thành công',
  
  // Reader messages
  'Reader not found': 'Không tìm thấy độc giả',
  'Reader created successfully': 'Tạo độc giả thành công',
  'Reader updated successfully': 'Cập nhật độc giả thành công',
  'Reader deleted successfully': 'Xóa độc giả thành công',
  'Reader registered successfully': 'Đăng ký độc giả thành công',
  'Readers retrieved successfully': 'Lấy danh sách độc giả thành công',
  'Reader retrieved successfully': 'Lấy thông tin độc giả thành công',
  'Profile retrieved successfully': 'Lấy thông tin cá nhân thành công',
  'Profile updated successfully': 'Cập nhật thông tin cá nhân thành công',
  'Reader account status updated successfully': 'Cập nhật trạng thái tài khoản độc giả thành công',
  'Reader account activated successfully': 'Kích hoạt tài khoản độc giả thành công',
  'Reader account deactivated successfully': 'Vô hiệu hóa tài khoản độc giả thành công',
  'Reader account status retrieved successfully': 'Lấy trạng thái tài khoản độc giả thành công',
  
  // Publisher messages
  'Publisher not found': 'Không tìm thấy nhà xuất bản',
  'Publisher already exists': 'Nhà xuất bản đã tồn tại',
  'Cannot delete publisher with existing dependencies': 'Không thể xóa nhà xuất bản có phụ thuộc',
  'Publisher created': 'Tạo nhà xuất bản thành công',
  'Publisher updated': 'Cập nhật nhà xuất bản thành công',
  'Publisher deleted': 'Xóa nhà xuất bản thành công',
  'Publishers retrieved': 'Lấy danh sách nhà xuất bản thành công',
  'Publisher retrieved': 'Lấy thông tin nhà xuất bản thành công',
  
  // Category messages
  'Category not found': 'Không tìm thấy danh mục',
  'Category already exists': 'Danh mục đã tồn tại',
  'Category update conflicts with existing data': 'Cập nhật danh mục xung đột với dữ liệu hiện có',
  'Category cannot be deleted due to existing dependencies': 'Không thể xóa danh mục do có phụ thuộc',
  'Category created successfully': 'Tạo danh mục thành công',
  'Category updated successfully': 'Cập nhật danh mục thành công',
  'Category deleted successfully': 'Xóa danh mục thành công',
  'Categories retrieved successfully': 'Lấy danh sách danh mục thành công',
  'Category retrieved successfully': 'Lấy thông tin danh mục thành công',
  
  // Book messages
  'Book not found': 'Không tìm thấy sách',
  'Book already exists': 'Sách đã tồn tại',
  'Book update conflicts with existing data': 'Cập nhật sách xung đột với dữ liệu hiện có',
  'Cannot delete book with existing dependencies': 'Không thể xóa sách có phụ thuộc',
  'Cannot delete book with available quantity': 'Không thể xóa sách còn số lượng khả dụng',
  'Current quantity': 'Số lượng hiện tại',
  'Need quantity = 0 to delete the book': 'Cần số lượng = 0 để xóa sách',
  'Book created successfully': 'Tạo sách thành công',
  'Book updated successfully': 'Cập nhật sách thành công',
  'Book deleted successfully': 'Xóa sách thành công',
  'Books retrieved successfully': 'Lấy danh sách sách thành công',
  'Book retrieved successfully': 'Lấy thông tin sách thành công',
  
  // Book constraint errors
  'chk_books_available_copies_limit': 'Số bản sẵn có không được lớn hơn tổng số lượng sách',
  'violates check constraint': 'Vi phạm ràng buộc dữ liệu',
  'available_copies': 'số bản sẵn có',
  'could not execute statement': 'Không thể thực hiện cập nhật dữ liệu',
  
  // Loan messages
  'Loan not found': 'Không tìm thấy khoản mượn',
  'Borrow limit exceeded': 'Vượt quá giới hạn mượn sách',
  'Book not available or already borrowed': 'Sách không có sẵn hoặc đã được mượn',
  'Book already returned': 'Sách đã được trả',
  'Book borrowed successfully': 'Mượn sách thành công',
  'Book returned successfully': 'Trả sách thành công',
  'Loan retrieved successfully': 'Lấy thông tin mượn sách thành công',
  'Loans retrieved successfully': 'Lấy danh sách mượn sách thành công',
  'Active loans retrieved successfully': 'Lấy danh sách sách đang mượn thành công',
  
  // Email messages
  'Email already exists': 'Email đã tồn tại trong hệ thống',
  
  // Health check messages
  'Application health check failed': 'Kiểm tra sức khỏe ứng dụng thất bại',
  'Service unavailable': 'Dịch vụ không khả dụng',
  'Application is healthy and running': 'Ứng dụng đang hoạt động bình thường',
  'Application is ready to serve requests': 'Ứng dụng sẵn sàng phục vụ',
  'Application is alive': 'Ứng dụng đang hoạt động',
  'Application is not ready': 'Ứng dụng chưa sẵn sàng',
  'Application is not responding': 'Ứng dụng không phản hồi',
  'Detailed health information retrieved successfully': 'Lấy thông tin chi tiết về sức khỏe thành công',
  'Service unavailable - one or more components are down': 'Dịch vụ không khả dụng - một hoặc nhiều thành phần bị lỗi',
  
  // Login/Logout messages
  'Login successful': 'Đăng nhập thành công',
  'Logout successful': 'Đăng xuất thành công',
  'Token refreshed successfully': 'Làm mới token thành công',
  
  // Static resource error
  'No static resource': 'Không tìm thấy tài nguyên',
  'Resource not found': 'Không tìm thấy tài nguyên',
  
  // Method not supported
  "Request method 'PATCH' is not supported": 'Phương thức PATCH không được hỗ trợ',
  "Request method 'PUT' is not supported": 'Phương thức PUT không được hỗ trợ',
  "Request method 'POST' is not supported": 'Phương thức POST không được hỗ trợ',
  "Request method 'DELETE' is not supported": 'Phương thức DELETE không được hỗ trợ'
}

const STATUS_MESSAGES = {
  400: 'Yêu cầu không hợp lệ',
  401: 'Bạn cần đăng nhập để thực hiện thao tác này',
  403: 'Bạn không có quyền thực hiện thao tác này',
  404: 'Không tìm thấy tài nguyên',
  405: 'Phương thức không được phép',
  408: 'Yêu cầu quá thời gian chờ',
  409: 'Dữ liệu xung đột',
  422: 'Dữ liệu không thể xử lý',
  429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau',
  500: 'Lỗi máy chủ. Vui lòng thử lại sau',
  502: 'Lỗi cổng kết nối',
  503: 'Dịch vụ tạm thời không khả dụng',
  504: 'Cổng kết nối quá thời gian chờ'
}

/**
 * Translate English message to Vietnamese
 * @param {string} message - English message from backend
 * @returns {string} - Vietnamese translation
 */
function translateMessage(message) {
  if (!message) return null
  
  // Exact match
  if (MESSAGE_TRANSLATIONS[message]) {
    return MESSAGE_TRANSLATIONS[message]
  }
  
  // Handle complex messages with dynamic values
  // Example: "Cannot delete book with available quantity. Current quantity: 15"
  if (message.includes('Cannot delete book with available quantity')) {
    const match = message.match(/Current quantity:\s*(\d+)/)
    if (match) {
      return `Không thể xóa sách còn số lượng khả dụng. Số lượng hiện tại: ${match[1]}`
    }
    return 'Không thể xóa sách còn số lượng khả dụng'
  }
  
  // Partial match - check if message contains known phrases
  // Replace all known phrases in the message
  let translatedMessage = message
  for (const [english, vietnamese] of Object.entries(MESSAGE_TRANSLATIONS)) {
    if (translatedMessage.includes(english)) {
      translatedMessage = translatedMessage.replace(english, vietnamese)
    }
  }
  
  // Return translated message if any translation occurred, otherwise original
  return translatedMessage !== message ? translatedMessage : message
}

/**
 * Handle API errors and return user-friendly message
 * @param {Error} error - The error object from API
 * @param {string} defaultMessage - Default message if no specific error found
 * @returns {string} - User-friendly error message in Vietnamese
 */
export function handleApiError(error, defaultMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.') {
  // Network error
  if (!error.response && error.request) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }
  
  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT_ERROR
  }
  
  // No response from server
  if (!error.response) {
    return ERROR_MESSAGES.INTERNAL_ERROR
  }
  
  const { status, data } = error.response
  
  // Try to get error code from response
  const errorCode = data?.errorCode || data?.code || data?.error
  
  // Check if we have a specific message for this error code
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode]
  }
  
  // Translate backend message to Vietnamese
  if (data?.message) {
    const translatedMessage = translateMessage(data.message)
    if (translatedMessage) {
      return translatedMessage
    }
  }
  
  // Check validation errors
  if (data?.validationErrors && Array.isArray(data.validationErrors) && data.validationErrors.length > 0) {
    const firstError = data.validationErrors[0]
    return `${firstError.field}: ${firstError.message}`
  }
  
  // Fall back to status code message
  if (STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status]
  }
  
  // Use default message
  return defaultMessage
}

/**
 * Handle validation errors from backend
 * @param {Object} error - The error object from API
 * @returns {Object|null} - Validation errors object or null
 */
export function getValidationErrors(error) {
  if (error.response?.data?.validationErrors) {
    return error.response.data.validationErrors
  }
  
  if (error.response?.data?.errors) {
    return error.response.data.errors
  }
  
  return null
}

/**
 * Check if error is authentication related
 * @param {Error} error - The error object from API
 * @returns {boolean}
 */
export function isAuthError(error) {
  if (!error.response) return false
  
  const status = error.response.status
  const errorCode = error.response.data?.errorCode || error.response.data?.code
  
  return status === 401 || 
         errorCode === 'UNAUTHORIZED' || 
         errorCode === 'INVALID_REFRESH_TOKEN' ||
         errorCode === 'ACCOUNT_DISABLED'
}

/**
 * Check if error is permission related
 * @param {Error} error - The error object from API
 * @returns {boolean}
 */
export function isPermissionError(error) {
  if (!error.response) return false
  
  const status = error.response.status
  const errorCode = error.response.data?.errorCode || error.response.data?.code
  
  return status === 403 || errorCode === 'FORBIDDEN'
}

/**
 * Check if error is not found related
 * @param {Error} error - The error object from API
 * @returns {boolean}
 */
export function isNotFoundError(error) {
  if (!error.response) return false
  
  const status = error.response.status
  return status === 404
}

/**
 * Check if error is conflict related
 * @param {Error} error - The error object from API
 * @returns {boolean}
 */
export function isConflictError(error) {
  if (!error.response) return false
  
  const status = error.response.status
  return status === 409
}

/**
 * Get detailed error info for debugging
 * @param {Error} error - The error object from API
 * @returns {Object} - Detailed error information
 */
export function getErrorDetails(error) {
  return {
    status: error.status || error.response?.status,
    message: error.message || error.response?.data?.message,
    errorCode: error.response?.data?.errorCode || error.response?.data?.code,
    validationErrors: error.response?.data?.validationErrors,
    timestamp: error.response?.data?.timestamp,
    path: error.response?.data?.path
  }
}

/**
 * Log error to console with formatting
 * @param {Error} error - The error object from API
 * @param {string} context - Context where error occurred
 */
export function logError(error, context = '') {
  console.group(`❌ Error ${context ? `in ${context}` : ''}`)
  console.error('Error object:', error)
  console.error('Error details:', getErrorDetails(error))
  console.groupEnd()
}

/**
 * Handle global API errors with automatic actions
 * @param {Error} error - The error object from API
 * @param {Function} showToast - Toast notification function (optional)
 * @returns {string} - Error message
 */
export function handleGlobalError(error, showToast = null) {
  const errorMessage = handleApiError(error)
  
  // Log error for debugging
  logError(error)
  
  // Show toast if function provided
  if (showToast) {
    if (isAuthError(error)) {
      showToast(errorMessage, 'error')
    } else if (isPermissionError(error)) {
      showToast(errorMessage, 'warning')
    } else if (isNotFoundError(error)) {
      showToast(errorMessage, 'warning')
    } else if (isConflictError(error)) {
      showToast(errorMessage, 'warning')
    } else {
      showToast(errorMessage, 'error')
    }
  }
  
  return errorMessage
}

export default {
  handleApiError,
  getValidationErrors,
  isAuthError,
  isPermissionError,
  isNotFoundError,
  isConflictError,
  getErrorDetails,
  logError,
  handleGlobalError,
  translateMessage
}
