<template>
  <div class="profile-container">
    <!-- Header -->
    <header class="profile-header">
      <div class="header-left">
        <button @click="goBack" class="back-btn">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          Quay lại
        </button>
      </div>
      <div class="header-right">
        <button @click="handleLogout" class="logout-btn">
          <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
          Đăng xuất
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="profile-main">
      <div class="profile-card">
        <div class="profile-avatar">
          <div class="avatar-circle">
            <font-awesome-icon :icon="['fas', 'user-circle']" class="avatar-icon" />
          </div>
          <h2 class="profile-name">{{ user?.name || user?.email || 'Người dùng' }}</h2>
          <p class="profile-role">{{ getRoleLabel(user?.role) }}</p>
        </div>

        <!-- Profile Info -->
        <div class="profile-info">
          <h3>Thông Tin Cá Nhân</h3>
          
          <div v-if="isLoadingProfile" class="loading-stats">
            <div class="spinner-small"></div>
            <p>Đang tải thông tin...</p>
          </div>

          <div v-else class="info-grid">
            <div class="info-item">
              <span class="info-label">
                <font-awesome-icon :icon="['fas', 'user']" />
                Họ tên
              </span>
              <span class="info-value">{{ user?.name || 'N/A' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">
                <font-awesome-icon :icon="['fas', 'envelope']" />
                Email
              </span>
              <span class="info-value">{{ user?.email || 'N/A' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">
                <font-awesome-icon :icon="['fas', 'id-card']" />
                {{ user?.role === 'READER' ? 'Reader ID' : 'Staff ID' }}
              </span>
              <span class="info-value">{{ user?.id || 'N/A' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">
                <font-awesome-icon :icon="['fas', 'phone']" />
                Số điện thoại
              </span>
              <span class="info-value">{{ user?.phone || 'Chưa cập nhật' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">
                <font-awesome-icon :icon="['fas', 'home']" />
                Địa chỉ
              </span>
              <span class="info-value">{{ user?.address || 'Chưa cập nhật' }}</span>
            </div>
          </div>
        </div>

        <!-- Statistics (Only for Reader) -->
        <div v-if="user?.role === 'READER'" class="profile-stats">
          <h3>Thống Kê Mượn Sách</h3>
          
          <div v-if="isLoadingStats" class="loading-stats">
            <div class="spinner-small"></div>
            <p>Đang tải thống kê...</p>
          </div>

          <div v-else class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <font-awesome-icon :icon="['fas', 'book']" />
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ stats.totalBorrowed || 0 }}</span>
                <span class="stat-label">Tổng sách đã mượn</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <font-awesome-icon :icon="['fas', 'book-open']" />
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ stats.currentBorrowing || 0 }}</span>
                <span class="stat-label">Đang mượn</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <font-awesome-icon :icon="['fas', 'check-circle']" />
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ stats.returned || 0 }}</span>
                <span class="stat-label">Đã trả</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ stats.overdue || 0 }}</span>
                <span class="stat-label">Quá hạn</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="profile-actions">
          <button @click="showChangePassword = true" class="action-btn primary">
            <font-awesome-icon :icon="['fas', 'lock']" />
            Đổi mật khẩu
          </button>
          <button 
            v-if="stats.overdue > 0" 
            @click="showOverdueBooks = true" 
            class="action-btn warning"
          >
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
            Trả sách quá hạn ({{ stats.overdue }})
          </button>
          <button @click="showEditProfile = true" class="action-btn secondary">`
            <font-awesome-icon :icon="['fas', 'edit']" />
            Chỉnh sửa thông tin
          </button>
        </div>
      </div>

      <!-- Recent Loans (Only for Reader) -->
      <div v-if="user?.role === 'READER'" class="recent-loans">
        <div class="section-header">
          <h3>Lịch Sử Mượn Sách Gần Đây</h3>
          <button @click="openAllLoansModal" class="view-all-btn" v-if="recentLoans.length > 0">
            <font-awesome-icon :icon="['fas', 'eye']" />
            Xem tất cả
          </button>
        </div>
        
        <div v-if="isLoadingLoans" class="loading-small">
          <div class="spinner-small"></div>
        </div>

        <div v-else-if="recentLoans.length === 0" class="empty-state">
          <p>Chưa có lịch sử mượn sách</p>
        </div>

        <div v-else class="loans-timeline">
          <div v-for="loan in recentLoans" :key="loan.id" class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>{{ loan.bookTitle }}</h4>
              <div class="timeline-meta">
                <span>
                  <font-awesome-icon :icon="['fas', 'calendar-check']" />
                  Mượn: {{ formatDate(loan.borrowDate) }}
                </span>
                <span v-if="loan.returnDate || loan.return_date">
                  <font-awesome-icon :icon="['fas', 'check']" />
                  Trả: {{ formatDate(loan.returnDate || loan.return_date) }}
                </span>
                <span v-else-if="isOverdue(loan)" class="overdue">
                  <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
                  Quá hạn
                </span>
                <span v-else>
                  <font-awesome-icon :icon="['fas', 'calendar-xmark']" />
                  Hạn: {{ formatDate(loan.dueDate || loan.due_date) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Overdue Books Modal -->
    <div v-if="showOverdueBooks" class="modal-overlay" @click="showOverdueBooks = false">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>Sách Quá Hạn Cần Trả</h3>
          <button @click="showOverdueBooks = false" class="close-btn">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingLoans" class="loading-center">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>

          <div v-else-if="overdueBooks.length === 0" class="empty-state">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="empty-icon" />
            <p>Bạn không có sách quá hạn nào!</p>
          </div>

          <div v-else>
            <!-- Overdue Books List -->
            <div class="loans-list">
              <div v-for="loan in overdueBooks" :key="loan.id || loan.loanId || loan.loan_id" class="loan-item overdue-item">
                <div class="loan-book">
                  <h4>{{ loan.bookTitle || loan.book?.title }}</h4>
                  <p class="book-author">{{ loan.bookAuthor || loan.book?.author }}</p>
                </div>
                <div class="loan-dates">
                  <div class="date-item">
                    <span class="date-label">
                      <font-awesome-icon :icon="['fas', 'calendar-plus']" />
                      Ngày mượn
                    </span>
                    <span class="date-value">{{ formatDate(loan.borrowDate || loan.loanDate) }}</span>
                  </div>
                  <div class="date-item">
                    <span class="date-label">
                      <font-awesome-icon :icon="['fas', 'calendar-xmark']" />
                      Đã quá hạn từ
                    </span>
                    <span class="date-value overdue-date">{{ formatDate(loan.dueDate) }}</span>
                  </div>
                  <div class="date-item">
                    <span class="date-label">
                      <font-awesome-icon :icon="['fas', 'clock']" />
                      Số ngày quá hạn
                    </span>
                    <span class="date-value overdue-days">{{ getOverdueDays(loan.dueDate) }} ngày</span>
                  </div>
                </div>
                <div class="loan-actions">
                  <button 
                    @click="handleReturnOverdueBook(loan)"
                    :disabled="loan.isReturning"
                    class="action-btn warning"
                  >
                    <font-awesome-icon v-if="loan.isReturning" :icon="['fas', 'spinner']" spin />
                    <font-awesome-icon v-else :icon="['fas', 'undo']" />
                    {{ loan.isReturning ? 'Đang trả...' : 'Trả sách ngay' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Loans Modal -->
    <div v-if="showAllLoans" class="modal-overlay" @click="showAllLoans = false">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>Toàn Bộ Lịch Sử Mượn Sách</h3>
          <button @click="showAllLoans = false" class="close-btn">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingLoans" class="loading-center">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>

          <div v-else-if="allLoans.length === 0" class="empty-state">
            <font-awesome-icon :icon="['fas', 'book-open']" class="empty-icon" />
            <p>Chưa có lịch sử mượn sách</p>
          </div>

          <div v-else>
            <!-- Loans List -->
            <div class="loans-list">
              <div v-for="loan in allLoans" :key="loan.id" class="loan-item">
                <div class="loan-book">
                  <h4>{{ loan.bookTitle }}</h4>
                  <p class="book-author">{{ loan.bookAuthor }}</p>
                </div>
                <div class="loan-dates">
                  <div class="date-item">
                    <span class="date-label">
                      <font-awesome-icon :icon="['fas', 'calendar-plus']" />
                      Ngày mượn
                    </span>
                    <span class="date-value">{{ formatDate(loan.borrowDate) }}</span>
                  </div>
                  <div class="date-item">
                    <span class="date-label">
                      <font-awesome-icon :icon="['fas', 'calendar-xmark']" />
                      Hạn trả
                    </span>
                    <span class="date-value">{{ formatDate(loan.dueDate) }}</span>
                  </div>
                  <div class="date-item" v-if="loan.returnDate || loan.return_date">
                    <span class="date-label">
                      <font-awesome-icon :icon="['fas', 'calendar-check']" />
                      Đã trả
                    </span>
                    <span class="date-value">{{ formatDate(loan.returnDate || loan.return_date) }}</span>
                  </div>
                </div>
                <div class="loan-status">
                  <span v-if="loan.returnDate || loan.return_date" class="status returned">
                    <font-awesome-icon :icon="['fas', 'check']" />
                    Đã trả
                  </span>
                  <span v-else-if="isOverdue(loan)" class="status overdue">
                    <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
                    Quá hạn
                  </span>
                  <span v-else class="status borrowing">
                    <font-awesome-icon :icon="['fas', 'clock']" />
                    Đang mượn
                  </span>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="pagination" v-if="loansPagination.totalPages > 1">
              <button 
                @click="previousPage" 
                :disabled="loansPagination.isFirst"
                class="pagination-btn"
              >
                <font-awesome-icon :icon="['fas', 'chevron-left']" />
                Trước
              </button>

              <div class="pagination-info">
                <span>
                  Trang {{ loansPagination.page }} / {{ loansPagination.totalPages }}
                </span>
                <small>
                  ({{ loansPagination.totalElements }} bản ghi)
                </small>
              </div>

              <button 
                @click="nextPage" 
                :disabled="loansPagination.isLast"
                class="pagination-btn"
              >
                Sau
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePassword" class="modal-overlay" @click="showChangePassword = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Đổi Mật Khẩu</h3>
          <button @click="showChangePassword = false" class="close-btn">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        <form @submit.prevent="handleChangePassword" class="modal-form">
          <div class="form-group">
            <label>Mật khẩu hiện tại</label>
            <input v-model="passwordForm.current" type="password" required />
          </div>
          <div class="form-group">
            <label>Mật khẩu mới</label>
            <input v-model="passwordForm.new" type="password" required />
          </div>
          <div class="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input v-model="passwordForm.confirm" type="password" required />
          </div>
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
          <div class="modal-actions">
            <button type="button" @click="showChangePassword = false" class="btn-cancel">Hủy</button>
            <button type="submit" :disabled="isChangingPassword" class="btn-submit">
              {{ isChangingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditProfile" class="modal-overlay" @click="showEditProfile = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Chỉnh Sửa Thông Tin</h3>
          <button @click="showEditProfile = false" class="close-btn">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        <form @submit.prevent="handleUpdateProfile" class="modal-form">
          <div class="form-group">
            <label>Họ tên</label>
            <input v-model="profileForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input v-model="profileForm.phone" type="tel" />
          </div>
          <div class="form-group">
            <label>Địa chỉ</label>
            <textarea v-model="profileForm.address" rows="3"></textarea>
          </div>
          <div v-if="profileError" class="error-message">{{ profileError }}</div>
          <div class="modal-actions">
            <button type="button" @click="showEditProfile = false" class="btn-cancel">Hủy</button>
            <button type="submit" :disabled="isUpdatingProfile" class="btn-submit">
              {{ isUpdatingProfile ? 'Đang xử lý...' : 'Cập nhật' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfile } from '@/composables/useProfile'
import { loansAPI } from '@/services/apiEndpoints'

const router = useRouter()

const profileComposable = useProfile()

const {
  user,
  isLoadingProfile,
  stats,
  recentLoans,
  allLoans,
  loansPagination,
  isLoadingStats,
  isLoadingLoans,
  toast,
  showChangePassword,
  showEditProfile,
  showAllLoans,
  passwordForm,
  profileForm,
  passwordError,
  profileError,
  isChangingPassword,
  isUpdatingProfile,
  formatDate,
  getRoleLabel,
  isOverdue,
  handleChangePassword,
  handleUpdateProfile,
  loadAllLoans,
  nextPage,
  previousPage
} = profileComposable

const goBack = () => router.back()
const handleLogout = () => profileComposable.handleLogout(router)

// Additional state for overdue books
const showOverdueBooks = ref(false)
const overdueBooks = computed(() => {
  return recentLoans.value.filter(loan => {
    const returnDate = loan.returnDate || loan.return_date
    if (returnDate) return false
    return isOverdue(loan)
  })
})

// Calculate overdue days
const getOverdueDays = (dueDate) => {
  if (!dueDate) return 0
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = today - due
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

// Handle return overdue book
const handleReturnOverdueBook = async (loan) => {
  if (loan.isReturning) return
  
  // Debug loan structure
  console.log('🔍 Loan object:', loan)
  
  const loanId = loan.id || loan.loanId || loan.loan_id
  if (!loanId) {
    console.error('❌ No valid loan ID found:', loan)
    profileComposable.showToast('Không thể xác định ID của sách. Vui lòng thử lại.', 'error')
    return
  }
  
  loan.isReturning = true
  try {
    const returnData = {
      returnDate: new Date().toISOString().split('T')[0]
    }
    
    console.log('📤 Returning loan:', loanId, returnData)
    await loansAPI.returnBook(loanId, returnData)
    
    // Reload data
    profileComposable.loadRecentLoans()
    profileComposable.loadStats()
    
    // Show success toast
    profileComposable.showToast('Trả sách thành công!', 'success')
    
    // Close modal if no more overdue books
    if (overdueBooks.value.length <= 1) {
      showOverdueBooks.value = false
    }
  } catch (error) {
    console.error('❌ Error returning book:', error)
    profileComposable.showToast('Không thể trả sách. Vui lòng thử lại.', 'error')
  } finally {
    loan.isReturning = false
  }
}

// Open all loans modal and load first page
const openAllLoansModal = async () => {
  showAllLoans.value = true
  await loadAllLoans(1)
}

// Watch for modal open
import { watch } from 'vue'
watch(showAllLoans, (newVal) => {
  if (newVal) {
    loadAllLoans(1)
  }
})

// Lifecycle
onMounted(() => {
  profileComposable.initializeProfile()
})
</script>

<style scoped src="@/styles/ProfileView.css"></style>
