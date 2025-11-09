<template>
  <div class="reset-password-container">
    <div class="reset-password-box">
      <div class="reset-password-header">
        <div class="logo">
          <font-awesome-icon :icon="['fas', 'lock-open']" class="logo-icon" />
          <h1>Đặt lại mật khẩu</h1>
        </div>
        <p>Nhập mã khôi phục và mật khẩu mới</p>
      </div>

      <form @submit.prevent="handleResetPassword" class="reset-password-form">
        <div class="form-group">
          <label for="token">Mã khôi phục (Refresh Token)</label>
          <input
            id="token"
            v-model="formData.token"
            type="text"
            placeholder="Nhập mã khôi phục từ email"
            required
          />
          <small>Mã này được gửi đến email của bạn</small>
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu mới</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="Nhập mật khẩu mới"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Xác nhận mật khẩu</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            required
            minlength="6"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <font-awesome-icon v-if="isLoading" :icon="['fas', 'spinner']" spin />
          <font-awesome-icon v-else :icon="['fas', 'check-circle']" />
          {{ isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu' }}
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>

      <div class="reset-password-footer">
        <p>
          <router-link to="/login">
            <font-awesome-icon :icon="['fas', 'arrow-left']" />
            Quay lại đăng nhập
          </router-link>
        </p>
        <p><router-link to="/forgot-password">Chưa nhận được mã?</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { readersAuthAPI } from '@/services/apiEndpoints'

const router = useRouter()

const formData = ref({
  token: '',
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleResetPassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Validate password match
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  // Validate password length
  if (formData.value.password.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }

  isLoading.value = true

  try {
    // Backend yêu cầu confirmPassword field
    const resetData = {
      refreshToken: formData.value.token,
      newPassword: formData.value.password,
      confirmPassword: formData.value.confirmPassword, // Field bắt buộc
      // Backup field names
      token: formData.value.token,
      password: formData.value.password
    }

    console.log('🔍 Sending reset password request')
    console.log('📤 Request data:', resetData)
    
    const response = await readersAuthAPI.resetPassword(resetData)
    
    console.log('✅ Reset password response:', response)

    successMessage.value = 'Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...'
    
    // Chờ 2 giây rồi chuyển đến trang login
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
  } catch (error) {
    console.error('❌ Reset password error:', error)
    console.error('📄 Error details:', {
      status: error.status,
      data: error.data,
      message: error.message
    })
    
    if (error.status === 400) {
      errorMessage.value = error.data?.message || 'Mã khôi phục không hợp lệ hoặc đã hết hạn'
    } else if (error.status === 404) {
      errorMessage.value = 'Mã khôi phục không tồn tại'
    } else if (error.status >= 500) {
      errorMessage.value = 'Lỗi server. Vui lòng thử lại sau'
    } else {
      errorMessage.value = error.data?.message || error.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.reset-password-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.reset-password-header {
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

.reset-password-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.reset-password-form {
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

.form-group small {
  color: #666;
  font-size: 12px;
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
}

.reset-password-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reset-password-footer p {
  margin: 0;
}

.reset-password-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.reset-password-footer a:hover {
  text-decoration: underline;
}
</style>
