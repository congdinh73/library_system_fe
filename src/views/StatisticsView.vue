<template>
  <div class="statistics-container">
    <!-- Header -->
    <AdminHeader 
      title="Thống kê chi tiết" 
      icon="chart-line"
      :show-back-button="true"
    >
      <template #actions>
        <button @click="loadAllStats" class="refresh-btn" :disabled="isLoading">
          <font-awesome-icon :icon="['fas', 'sync-alt']" :class="{ 'fa-spin': isLoading }" /> {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </template>
    </AdminHeader>

    <!-- Main Content -->
    <main class="statistics-main">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải thống kê...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <!-- Statistics Content -->
      <div v-else class="statistics-content">
        <!-- Top Readers -->
        <section class="stats-section">
          <div class="section-header">
            <h2><font-awesome-icon :icon="['fas', 'users']" /> Top Độc Giả</h2>
            <span class="section-subtitle">Người dùng mượn sách nhiều nhất</span>
          </div>
          <div class="table-container">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Xếp hạng</th>
                  <th>Tên độc giả</th>
                  <th>Email</th>
                  <th>Tổng mượn</th>
                  <th>Đang mượn</th>
                  <th>Đã trả</th>
                  <th>Quá hạn</th>
                  <th>Tiền phạt</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(reader, index) in topReaders" :key="reader.readerId" :class="{ 'top-rank': index < 3 }">
                  <td>
                    <span class="rank-badge" :class="`rank-${index + 1}`">
                      <font-awesome-icon v-if="index === 0" :icon="['fas', 'trophy']" style="color: gold;" />
                      <font-awesome-icon v-else-if="index === 1" :icon="['fas', 'medal']" style="color: silver;" />
                      <font-awesome-icon v-else-if="index === 2" :icon="['fas', 'award']" style="color: #cd7f32;" />
                      <span v-else>{{ index + 1 }}</span>
                    </span>
                  </td>
                  <td class="name-cell">{{ reader.readerName }}</td>
                  <td>{{ reader.email }}</td>
                  <td><strong>{{ reader.totalLoans }}</strong></td>
                  <td><span class="badge active">{{ reader.activeLoans }}</span></td>
                  <td><span class="badge returned">{{ reader.returnedLoans }}</span></td>
                  <td><span class="badge overdue" v-if="reader.overdueLoans > 0">{{ reader.overdueLoans }}</span><span v-else>-</span></td>
                  <td><span v-if="reader.totalFines > 0">{{ formatCurrency(reader.totalFines) }}</span><span v-else>-</span></td>
                </tr>
                <tr v-if="topReaders.length === 0">
                  <td colspan="8" class="empty-row">Chưa có dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Top Categories -->
        <section class="stats-section">
          <div class="section-header">
            <h2><font-awesome-icon :icon="['fas', 'folder-open']" /> Top Danh Mục</h2>
            <span class="section-subtitle">Thể loại được mượn nhiều nhất</span>
          </div>
          <div class="table-container">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Xếp hạng</th>
                  <th>Tên danh mục</th>
                  <th>Tổng lượt mượn</th>
                  <th>Số đầu sách</th>
                  <th>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(category, index) in topCategories" :key="category.categoryId" :class="{ 'top-rank': index < 3 }">
                  <td>
                    <span class="rank-badge" :class="`rank-${index + 1}`">
                      <font-awesome-icon v-if="index === 0" :icon="['fas', 'trophy']" style="color: gold;" />
                      <font-awesome-icon v-else-if="index === 1" :icon="['fas', 'medal']" style="color: silver;" />
                      <font-awesome-icon v-else-if="index === 2" :icon="['fas', 'award']" style="color: #cd7f32;" />
                      <span v-else>{{ index + 1 }}</span>
                    </span>
                  </td>
                  <td class="name-cell">{{ category.categoryName }}</td>
                  <td><strong>{{ category.totalLoans }}</strong></td>
                  <td>{{ category.uniqueBooks }} đầu sách</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: getCategoryPercentage(category.totalLoans) + '%' }"></div>
                      <span class="progress-text">{{ getCategoryPercentage(category.totalLoans) }}%</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="topCategories.length === 0">
                  <td colspan="5" class="empty-row">Chưa có dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Top Books -->
        <section class="stats-section">
          <div class="section-header">
            <h2><font-awesome-icon :icon="['fas', 'book']" /> Top Sách</h2>
            <span class="section-subtitle">Đầu sách được mượn nhiều nhất</span>
          </div>
          <div class="table-container">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Xếp hạng</th>
                  <th>Tên sách</th>
                  <th>Nhà xuất bản</th>
                  <th>Ngôn ngữ</th>
                  <th>Phiên bản</th>
                  <th>Tổng mượn</th>
                  <th>Đang mượn</th>
                  <th>Còn lại</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(book, index) in topBooks" :key="book.bookId" :class="{ 'top-rank': index < 3 }">
                  <td>
                    <span class="rank-badge" :class="`rank-${index + 1}`">
                      <font-awesome-icon v-if="index === 0" :icon="['fas', 'trophy']" style="color: gold;" />
                      <font-awesome-icon v-else-if="index === 1" :icon="['fas', 'medal']" style="color: silver;" />
                      <font-awesome-icon v-else-if="index === 2" :icon="['fas', 'award']" style="color: #cd7f32;" />
                      <span v-else>{{ index + 1 }}</span>
                    </span>
                  </td>
                  <td class="name-cell">{{ book.title }}</td>
                  <td>{{ book.publisherName }}</td>
                  <td>{{ book.language }}</td>
                  <td>{{ book.edition }}</td>
                  <td><strong>{{ book.totalLoans }}</strong></td>
                  <td><span class="badge active">{{ book.currentlyBorrowed }}</span></td>
                  <td><span class="badge available">{{ book.availableCopies }}</span></td>
                </tr>
                <tr v-if="topBooks.length === 0">
                  <td colspan="8" class="empty-row">Chưa có dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue'
import { useStatistics } from '@/composables/useStatistics'

const {
  topReaders,
  topCategories,
  topBooks,
  isLoading,
  errorMessage,
  loadAllStats,
  getCategoryPercentage,
  formatCurrency
} = useStatistics()

onMounted(() => {
  loadAllStats()
})
</script>

<style scoped src="@/styles/StatisticsView.css"></style>
