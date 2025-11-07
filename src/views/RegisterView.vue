<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <div class="logo">
          <font-awesome-icon :icon="['fas', 'book-open']" class="logo-icon" />
          <h1>Thư Viện</h1>
        </div>
        <h2>Đăng ký tài khoản</h2>
        <p>Tạo tài khoản để bắt đầu mượn sách</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="fullName">Họ và tên</label>
          <input
            id="fullName"
            v-model="formData.fullName"
            type="text"
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Nhập email"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">Số điện thoại</label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            placeholder="Nhập số điện thoại"
            required
          />
        </div>

        <div class="form-group">
          <label for="address">Địa chỉ</label>
          <input
            id="address"
            v-model="formData.address"
            type="text"
            placeholder="Nhập địa chỉ"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="Nhập mật khẩu"
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
            placeholder="Nhập lại mật khẩu"
            required
            minlength="6"
          />
        </div>

        <button type="submit" class="register-btn" :disabled="isLoading">
          <font-awesome-icon v-if="isLoading" :icon="['fas', 'spinner']" spin />
          <font-awesome-icon v-else :icon="['fas', 'user-plus']" />
          {{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>

      <div class="register-footer">
        <p>Đã có tài khoản? <router-link to="/login">Đăng nhập ngay</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useRegister } from '@/composables/useRegister'

const router = useRouter()

const registerComposable = useRegister()

const {
  formData,
  isLoading,
  errorMessage,
  successMessage
} = registerComposable

const handleRegister = () => registerComposable.handleRegister(router)
</script>

<style scoped>
.register-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-header {
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
  font-size: 32px;
  color: #667eea;
  margin: 0;
}

.register-header h2 {
  font-size: 24px;
  margin: 0 0 10px 0;
  color: #333;
}

.register-header p {
  color: #666;
  margin: 0;
}

.register-form {
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

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.register-btn:disabled {
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

.register-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.register-footer p {
  color: #666;
  margin: 0;
}

.register-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-footer a:hover {
  text-decoration: underline;
}

/* Scrollbar styling */
.register-box::-webkit-scrollbar {
  width: 8px;
}

.register-box::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.register-box::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 10px;
}

.register-box::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}
</style>
