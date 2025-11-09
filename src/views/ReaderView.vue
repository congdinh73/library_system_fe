<template>
  <div class="reader-container">
    <!-- Header -->
    <ReaderHeader />

    <!-- Main Content -->
    <main class="reader-main">
      <div class="content-header">
        <h2>Sách Hiện Có</h2>
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm sách..."
            @input="handleSearch"
          />
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
        </div>
      </div>

      <!-- Books Grid -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải danh sách sách...</p>
      </div>

      <div v-else-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <div v-else-if="filteredBooks.length === 0" class="empty-state">
        <p>{{ searchQuery ? 'Không tìm thấy sách phù hợp' : 'Chưa có sách nào' }}</p>
      </div>

      <div v-else class="books-grid">
        <div v-for="book in filteredBooks" :key="book.id" class="book-card">
          <div class="book-cover">
            <div class="book-icon-wrapper">
              <font-awesome-icon :icon="['fas', 'book']" class="book-icon" />
            </div>
            <div class="book-quantity-badge" :class="{ 'low-stock': book.availableCopies < 3, 'out-of-stock': book.availableCopies === 0 }">
              {{ book.availableCopies > 0 ? book.availableCopies : '0' }} cuốn
            </div>
          </div>
          <div class="book-info">
            <h3 class="book-title" :title="book.title">{{ book.title }}</h3>
            <div class="book-details">
              <p class="book-publisher">
                <font-awesome-icon :icon="['fas', 'building']" class="icon" />
                <span>{{ book.publisherName || 'N/A' }}</span>
              </p>
              <p class="book-language">
                <font-awesome-icon :icon="['fas', 'globe']" class="icon" />
                <span>{{ book.language }}</span>
              </p>
              <p class="book-edition">
                <font-awesome-icon :icon="['fas', 'bookmark']" class="icon" />
                <span>{{ book.edition }}</span>
              </p>
              <p class="book-year">
                <font-awesome-icon :icon="['fas', 'calendar']" class="icon" />
                <span>{{ book.publicationYear }}</span>
              </p>
            </div>
          </div>
          <div class="book-actions">
            <button
              @click="handleBorrow(book)"
              :disabled="book.availableCopies === 0 || book.isBorrowing"
              class="borrow-btn"
              :class="{ 'btn-disabled': book.availableCopies === 0 }"
            >
              <font-awesome-icon v-if="book.isBorrowing" :icon="['fas', 'spinner']" spin />
              <font-awesome-icon v-else-if="book.availableCopies === 0" :icon="['fas', 'times-circle']" />
              <font-awesome-icon v-else :icon="['fas', 'book-open']" />
              <span v-if="book.isBorrowing">Đang xử lý...</span>
              <span v-else-if="book.availableCopies === 0">Hết sách</span>
              <span v-else>Mượn sách</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && !errorMessage && totalPages > 1" class="pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="pagination-btn"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
          Trước
        </button>
        
        <div class="pagination-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['pagination-number', { active: currentPage === page }]"
          >
            {{ page + 1 }}
          </button>
        </div>
        
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages - 1"
          class="pagination-btn"
        >
          Sau
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </button>
      </div>

      <!-- Overdue Books Section -->
      <div v-if="overdueLoans.length > 0" class="my-loans-section overdue-section">
        <h2 class="overdue-title">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="warning-icon" />
          Sách Quá Hạn ({{ overdueLoans.length }})
        </h2>
        <div class="loans-list">
          <div v-for="loan in overdueLoans" :key="loan.id" class="loan-item overdue-item">
            <div class="loan-book-info">
              <font-awesome-icon :icon="['fas', 'book-open']" class="book-icon" />
              <div>
                <h4>{{ loan.bookTitle }}</h4>
                <p class="loan-dates">
                  <font-awesome-icon :icon="['fas', 'calendar-check']" class="date-icon" />
                  Ngày mượn: {{ formatDate(loan.borrowDate) }} | 
                  <font-awesome-icon :icon="['fas', 'calendar-xmark']" class="date-icon" />
                  Quá hạn từ: {{ formatDate(loan.dueDate) }}
                </p>
                <div class="overdue-info">
                  <font-awesome-icon :icon="['fas', 'clock']" class="warning-icon" />
                  <span class="overdue-text">Đã quá hạn {{ getOverdueDays(loan.dueDate) }} ngày</span>
                </div>
              </div>
            </div>
            <div class="loan-actions">
              <button
                @click="handleReturn(loan)"
                :disabled="loan.isReturning"
                class="return-btn urgent"
              >
                <font-awesome-icon v-if="loan.isReturning" :icon="['fas', 'spinner']" spin />
                <font-awesome-icon v-else :icon="['fas', 'undo']" />
                {{ loan.isReturning ? 'Đang xử lý...' : 'Trả ngay' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- My Loans Section -->
      <div class="my-loans-section">
        <h2>Sách Đang Mượn ({{ activeLoans.length }})</h2>
        <div v-if="isLoadingLoans" class="loading-small">
          <div class="spinner-small"></div>
        </div>
        <div v-else-if="activeLoans.length === 0" class="empty-state">
          <p>{{ myLoans.length === 0 ? 'Bạn chưa mượn sách nào' : 'Tất cả sách đều đã quá hạn' }}</p>
        </div>
        <div v-else class="loans-list">
          <div v-for="loan in activeLoans" :key="loan.id" class="loan-item">
            <div class="loan-book-info">
              <font-awesome-icon :icon="['fas', 'book-open']" class="book-icon" />
              <div>
                <h4>{{ loan.bookTitle }}</h4>
                <p class="loan-dates">
                  <font-awesome-icon :icon="['fas', 'calendar-check']" class="date-icon" />
                  Ngày mượn: {{ formatDate(loan.borrowDate) }} | 
                  <font-awesome-icon :icon="['fas', 'calendar-xmark']" class="date-icon" />
                  Hạn trả: {{ formatDate(loan.dueDate) }}
                </p>
                <div v-if="isLoanOverdue(loan)" class="overdue-warning">
                  <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="warning-icon" />
                  <span class="warning-text">Sách đã quá hạn!</span>
                </div>
              </div>
            </div>
            <div class="loan-actions">
              <button
                @click="handleReturn(loan)"
                :disabled="loan.isReturning"
                class="return-btn"
              >
                <font-awesome-icon v-if="loan.isReturning" :icon="['fas', 'spinner']" spin />
                <font-awesome-icon v-else :icon="['fas', 'undo']" />
                {{ loan.isReturning ? 'Đang xử lý...' : 'Trả sách' }}
              </button>
              <button
                @click="handleExtend(loan)"
                :disabled="loan.isExtending"
                class="extend-btn"
              >
                <font-awesome-icon v-if="loan.isExtending" :icon="['fas', 'spinner']" spin />
                <font-awesome-icon v-else :icon="['fas', 'clock']" />
                {{ loan.isExtending ? 'Đang xử lý...' : 'Gia hạn' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Success/Error Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useReader } from '@/composables/useReader'
import ReaderHeader from '@/components/ReaderHeader.vue'

const readerComposable = useReader()

const {
  user,
  books,
  myLoans,
  searchQuery,
  isLoading,
  isLoadingLoans,
  errorMessage,
  toast,
  currentPage,
  totalPages,
  totalElements,
  filteredBooks,
  visiblePages,
  formatDate,
  isLoanOverdue,
  handleSearch,
  goToPage,
  handleBorrow,
  handleReturn,
  handleExtend
} = readerComposable

// Separate overdue and active loans
const overdueLoans = computed(() => {
  return myLoans.value.filter(loan => isLoanOverdue(loan))
})

const activeLoans = computed(() => {
  return myLoans.value.filter(loan => !isLoanOverdue(loan))
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

// Lifecycle
onMounted(() => {
  readerComposable.initializeReader()
})
</script>

<style scoped src="@/styles/ReaderView.css"></style>
