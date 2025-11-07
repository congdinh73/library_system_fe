<template>
  <div class="login-container">
    <div class="login-left">
      <div class="branding">
        <div class="logo-icon">🏛️</div>
        <h1>Hệ Thống Quản Lý Thư Viện</h1>
        <p class="tagline">Giải pháp quản lý thư viện hiện đại và hiệu quả</p>
        
        <div class="features">
          <div class="feature-item">
            <font-awesome-icon :icon="['fas', 'book']" class="feature-icon" />
            <span>Quản lý sách dễ dàng</span>
          </div>
          <div class="feature-item">
            <font-awesome-icon :icon="['fas', 'users']" class="feature-icon" />
            <span>Theo dõi độc giả</span>
          </div>
          <div class="feature-item">
            <font-awesome-icon :icon="['fas', 'chart-bar']" class="feature-icon" />
            <span>Thống kê chi tiết</span>
          </div>
          <div class="feature-item">
            <font-awesome-icon :icon="['fas', 'lock']" class="feature-icon" />
            <span>Bảo mật cao</span>
          </div>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <div class="login-header">
          <h2>Đăng nhập</h2>
          <p>Chào mừng bạn trở lại!</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Email</label>
            <div class="input-wrapper">
              <font-awesome-icon :icon="['fas', 'user']" class="input-icon" />
              <input
                id="username"
                v-model="formData.username"
                type="email"
                placeholder="Nhập email"
                required
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                placeholder="Nhập mật khẩu"
                required
                autocomplete="current-password"
              />
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="formData.rememberMe" type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <router-link to="/forgot-password" class="forgot-password">Quên mật khẩu?</router-link>
          </div>

          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="!isLoading">Đăng nhập</span>
            <span v-else>Đang xử lý...</span>
          </button>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>

        <div class="login-footer">
          <p>Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useLogin } from '@/composables/useLogin'

const router = useRouter()

const loginComposable = useLogin()

const {
  formData,
  isLoading,
  errorMessage
} = loginComposable

const handleLogin = () => loginComposable.handleLogin(router)
</script>

<style scoped src="@/styles/LoginView.css"></style>
