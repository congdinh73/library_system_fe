<template>
  <div class="loans-management">
    <AdminHeader title="Quản lý Mượn Trả" :show-back-button="true" />
    
    <div class="content-container">
            <div class="page-header">
        <h1>Quản lý Mượn Trả Sách</h1>
        <div class="header-actions">
          <button @click="exportToCSV" class="export-btn" :disabled="loans.length === 0">
            <font-awesome-icon :icon="['fas', 'file-csv']" /> Xuất CSV
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Trạng thái:</label>
          <select v-model="filters.status" @change="applyFilters">
            <option value="">Tất cả</option>
            <option value="ACTIVE">Đang mượn</option>
            <option value="RETURNED">Đã trả</option>
            <option value="OVERDUE">Quá hạn</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Từ ngày:</label>
          <input type="date" v-model="filters.startDate" @change="applyFilters" />
        </div>

        <div class="filter-group">
          <label>Đến ngày:</label>
          <input type="date" v-model="filters.endDate" @change="applyFilters" />
        </div>

        <div class="filter-group search-group">
          <label>Tìm kiếm:</label>
          <input 
            type="text" 
            v-model="filters.search" 
            placeholder="Tên độc giả, tên sách, email..."
            @input="applyFilters"
          />
        </div>

        <button @click="resetFilters" class="reset-btn">
          <font-awesome-icon :icon="['fas', 'redo']" /> Đặt lại
        </button>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="isLoading" class="loading">
        Đang tải dữ liệu...
      </div>

      <div v-else class="loans-table-container">
        <table class="loans-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Độc giả</th>
              <th>Email</th>
              <th>Sách</th>
              <th>Ngày mượn</th>
              <th>Ngày hẹn trả</th>
              <th>Ngày trả thực tế</th>
              <th>Trạng thái</th>
              <th>Phí phạt</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredLoans.length === 0">
              <td colspan="9" class="no-data">Không có dữ liệu</td>
            </tr>
            <tr v-for="loan in filteredLoans" :key="loan.loanId">
              <td>{{ loan.loanId }}</td>
              <td class="reader-name">{{ loan.reader?.fullName || 'N/A' }}</td>
              <td>{{ loan.reader?.email || 'N/A' }}</td>
              <td class="book-title">{{ loan.book?.title || 'N/A' }}</td>
              <td>{{ formatDate(loan.loanDate) }}</td>
              <td>{{ formatDate(loan.dueDate) }}</td>
              <td>{{ loan.returnDate ? formatDate(loan.returnDate) : '-' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(loan)]">
                  {{ getStatusText(loan) }}
                </span>
              </td>
              <td>
                <span v-if="loan.fine > 0" class="fine-amount">
                  {{ formatCurrency(loan.fine) }}
                </span>
                <span v-else class="no-fine">-</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 0"
            class="page-btn"
          >
            ← Trước
          </button>
          
          <span class="page-info">
            Trang {{ currentPage + 1 }} / {{ totalPages }}
            (Tổng: {{ totalElements }} giao dịch)
          </span>
          
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage >= totalPages - 1"
            class="page-btn"
          >
            Sau →
          </button>
        </div>
      </div>

            <!-- Statistics Summary -->
      <div v-if="!isLoading" class="summary-cards">
        
        <div class="summary-card">
          <div class="card-icon">
            <font-awesome-icon :icon="['fas', 'chart-bar']" />
          </div>
          <div class="card-content">
            <h3>Tổng số giao dịch</h3>
            <p class="card-number">{{ totalElements }}</p>
          </div>
        </div>        <div class="summary-card">
          <div class="card-icon">
            <font-awesome-icon :icon="['fas', 'book-open']" />
          </div>
          <div class="card-content">
            <h3>Đang mượn</h3>
            <p class="card-number">{{ getStatusCount('ACTIVE') }}</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon">
            <font-awesome-icon :icon="['fas', 'check-circle']" />
          </div>
          <div class="card-content">
            <h3>Đã trả</h3>
            <p class="card-number">{{ getStatusCount('RETURNED') }}</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
          </div>
          <div class="card-content">
            <h3>Quá hạn</h3>
            <p class="card-number">{{ getStatusCount('OVERDUE') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue'
import { useAuthError } from '@/composables/useAuthError'
import { useLoansManagement } from '@/composables/useLoansManagement'

const { handleAuthError } = useAuthError()

const loansManagement = useLoansManagement()

const {
  loans,
  isLoading,
  errorMessage,
  currentPage,
  totalPages,
  totalElements,
  filters,
  filteredLoans,
  applyFilters,
  resetFilters,
  getStatusClass,
  getStatusText,
  getStatusCount,
  formatDate,
  formatCurrency,
  exportToCSV
} = loansManagement

const fetchLoans = (page) => loansManagement.fetchLoans(page, handleAuthError)
const changePage = (page) => loansManagement.changePage(page, handleAuthError)

onMounted(() => {
  fetchLoans()
})
</script>

<style scoped src="@/styles/LoansManagementView.css"></style>
