// Helper để điều chỉnh request/response format giữa frontend và backend

// Một số backend có thể dùng field name khác
// Cấu hình mapping ở đây

export const REQUEST_FIELD_MAPPING = {
  // Frontend field -> Backend field
  username: 'username',  // Hoặc 'userName', 'user_name', 'email', v.v.
  password: 'password',  // Hoặc 'pass', 'pwd', v.v.
}

export const RESPONSE_FIELD_MAPPING = {
  // Backend field -> Frontend field
  token: 'token',        // Hoặc 'accessToken', 'access_token', v.v.
  username: 'username',  // Hoặc 'userName', 'user_name', v.v.
  email: 'email',
  id: 'id',              // Hoặc 'userId', 'user_id', v.v.
  role: 'role',          // Hoặc 'userRole', 'user_role', v.v.
}

// Transform request data theo format backend mong đợi
export function transformLoginRequest(data) {
  // Trường hợp 1: Backend dùng username/password (mặc định)
  return {
    username: data.username,
    password: data.password
  }
  
  // Trường hợp 2: Backend dùng email thay vì username
  // return {
  //   email: data.username,
  //   password: data.password
  // }
  
  // Trường hợp 3: Backend dùng camelCase
  // return {
  //   userName: data.username,
  //   password: data.password
  // }
  
  // Trường hợp 4: Backend dùng snake_case
  // return {
  //   user_name: data.username,
  //   password: data.password
  // }
}

// Transform response data từ backend
export function transformLoginResponse(response) {
  // Trường hợp 1: Response format chuẩn
  if (response.token && response.user) {
    return {
      token: response.token,
      user: {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        role: response.user.role
      }
    }
  }
  
  // Trường hợp 2: Token và user data ở cùng level
  if (response.token) {
    return {
      token: response.token,
      user: {
        id: response.id || response.userId,
        username: response.username || response.userName,
        email: response.email,
        role: response.role || response.userRole
      }
    }
  }
  
  // Trường hợp 3: Chỉ có accessToken
  if (response.accessToken || response.access_token) {
    return {
      token: response.accessToken || response.access_token,
      user: {
        id: response.user?.id || response.id,
        username: response.user?.username || response.username,
        email: response.user?.email || response.email,
        role: response.user?.role || response.role
      }
    }
  }
  
  // Trường hợp 4: Response trong data wrapper
  if (response.data) {
    return transformLoginResponse(response.data)
  }
  
  // Default: return as is
  return response
}

// Transform book data
export function transformBookRequest(data) {
  return {
    title: data.title,
    author: data.author,
    isbn: data.isbn,
    publisher: data.publisher,
    year: data.year,
    quantity: data.quantity
  }
}

export function transformBookResponse(response) {
  if (Array.isArray(response)) {
    return response.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      year: book.year,
      quantity: book.quantity,
      available: book.available
    }))
  }
  
  return response
}

// Validation helper
export function validateLoginData(data) {
  const errors = []
  
  if (!data.username || data.username.trim() === '') {
    errors.push('Username không được để trống')
  }
  
  if (!data.password || data.password.trim() === '') {
    errors.push('Password không được để trống')
  }
  
  if (data.username && data.username.length < 3) {
    errors.push('Username phải có ít nhất 3 ký tự')
  }
  
  if (data.password && data.password.length < 6) {
    errors.push('Password phải có ít nhất 6 ký tự')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export default {
  transformLoginRequest,
  transformLoginResponse,
  transformBookRequest,
  transformBookResponse,
  logRequestResponse,
  validateLoginData
}
