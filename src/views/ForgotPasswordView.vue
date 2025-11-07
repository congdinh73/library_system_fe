<template>
  <div class="forgot-password-container">
    <div class="forgot-password-box">
      <div class="forgot-password-header">
        <div class="logo">
          <font-awesome-icon :icon="['fas', 'key']" class="logo-icon" />
          <h1>Quên mật khẩu</h1>
        </div>
        <p>Nhập email của bạn để nhận mã khôi phục</p>
      </div>

      <form @submit.prevent="handleForgotPassword" class="forgot-password-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Nhập email của bạn"
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <font-awesome-icon v-if="isLoading" :icon="['fas', 'spinner']" spin />
          <font-awesome-icon v-else :icon="['fas', 'paper-plane']" />
          {{ isLoading ? 'Đang xử lý...' : 'Gửi mã khôi phục' }}
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>

      <div class="forgot-password-footer">
        <p>
          <router-link to="/login">
            <font-awesome-icon :icon="['fas', 'arrow-left']" />
            Quay lại đăng nhập
          </router-link>
        </p>
        <p>
          <router-link to="/reset-password">
            Đã có mã khôi phục? Đặt lại mật khẩu
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { readersAPI } from '@/services/apiEndpoints'

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleForgotPassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value) {
    errorMessage.value = 'Vui lòng nhập email'
    return
  }

  isLoading.value = true

  try {
    console.log('🔍 Sending forgot password request for:', email.value)
    
    const response = await readersAPI.forgotPassword(email.value)
    
    console.log('✅ Forgot password response:', response)

    successMessage.value = 'Mã khôi phục đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (và cả thư mục spam).'
    
    // Clear email field
    email.value = ''
  } catch (error) {
    console.error('❌ Forgot password error:', error)
    
    if (error.status === 404) {
      errorMessage.value = 'Email không tồn tại trong hệ thống'
    } else if (error.status === 400) {
      errorMessage.value = error.data?.message || 'Email không hợp lệ'
    } else if (error.status >= 500) {
      errorMessage.value = 'Lỗi server. Vui lòng thử lại sau'
    } else {
      errorMessage.value = error.data?.message || error.message || 'Không thể gửi mã khôi phục. Vui lòng thử lại'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.forgot-password-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-password-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 48px;
  color: #667eea;
}

.logo h1 {
  font-size: 28px;
  color: #667eea;
  margin: 0;
}

.forgot-password-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input {
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.success-message {
  background: #efe;
  border: 1px solid #cfc;
  color: #3c3;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
}

.forgot-password-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.forgot-password-footer p {
  margin: 0;
}

.forgot-password-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.forgot-password-footer a:hover {
  text-decoration: underline;
}
</style>
