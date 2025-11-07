// Crypto utilities for password hashing

/**
 * Hash password bằng SHA-256
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password in hex format
 */
export async function hashPassword(password) {
  // Convert string to ArrayBuffer
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  
  // Hash với SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

/**
 * Hash password bằng MD5 (nếu backend yêu cầu)
 * Note: MD5 không an toàn, chỉ dùng nếu backend yêu cầu
 */
export async function hashPasswordMD5(password) {
  // MD5 không có sẵn trong Web Crypto API
  // Cần dùng thư viện bên ngoài như crypto-js
  console.warn('MD5 is not secure. Consider using SHA-256 instead.')
  
  // Nếu cần MD5, cài đặt: npm install crypto-js
  // import CryptoJS from 'crypto-js'
  // return CryptoJS.MD5(password).toString()
  
  throw new Error('MD5 not implemented. Use SHA-256 or install crypto-js for MD5.')
}

/**
 * Hash password bằng bcrypt (client-side hashing không khuyến nghị)
 * Bcrypt nên được dùng ở backend
 */
export function shouldUseBcryptOnBackend() {
  console.warn('⚠️ Password hashing should be done on backend for better security')
  console.warn('Client-side hashing (SHA-256) chỉ để bảo mật truyền tải, không thay thế backend hashing')
}

/**
 * Tạo salt ngẫu nhiên
 */
export function generateSalt(length = 16) {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash với salt
 */
export async function hashWithSalt(password, salt) {
  const saltedPassword = password + salt
  return await hashPassword(saltedPassword)
}

/**
 * Verify password (for testing)
 */
export async function verifyPassword(password, hashedPassword) {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}

/**
 * Generate các hash mẫu cho testing
 */
export async function generateSampleHashes() {
  console.group('🔐 Sample Password Hashes')
  
  const passwords = ['admin123', 'user123', 'password123']
  
  for (const pwd of passwords) {
    const hash = await hashPassword(pwd)
    console.log(`"${pwd}" -> "${hash}"`)
  }
  
  console.groupEnd()
}

// Export default
export default {
  hashPassword,
  generateSalt,
  hashWithSalt,
  verifyPassword,
  generateSampleHashes
}
