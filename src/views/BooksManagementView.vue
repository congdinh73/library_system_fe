<template>
  <div class="books-management-container">
    <AdminHeader title="Quản lý Sách" :show-back-button="true" />
    
    <div class="content-container">
      <div class="page-header">
        <h1>Quản lý Sách</h1>
                <button @click="showAddModal" class="add-btn">
          <font-awesome-icon :icon="['fas', 'plus']" /> Thêm sách mới
        </button>
      </div>

      <!-- Search and Filter -->
      <div class="search-filter-section">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm theo tên sách, nhà xuất bản, ngôn ngữ..."
            @input="handleSearch"
          />
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
        </div>
        <button @click="showFilters = !showFilters" class="filter-btn" :class="{ active: hasActiveFilters }">
          <font-awesome-icon :icon="['fas', 'filter']" /> Bộ lọc {{ hasActiveFilters ? `(${activeFilterCount})` : '' }}
        </button>
      </div>

      <!-- Advanced Filters Panel -->
      <div v-if="showFilters" class="filters-panel">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Ngôn ngữ</label>
            <select v-model="filters.language">
              <option value="">Tất cả</option>
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Tiếng Pháp">Tiếng Pháp</option>
              <option value="Tiếng Hoa">Tiếng Hoa</option>
              <option value="Tiếng Nhật">Tiếng Nhật</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Nhà xuất bản</label>
            <select v-model="filters.publisherId">
              <option value="">Tất cả</option>
              <option v-for="pub in publishers" :key="pub.publisherId" :value="pub.publisherId">
                {{ pub.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Thể loại</label>
            <select v-model="filters.categoryId">
              <option value="">Tất cả</option>
              <option v-for="cat in categories" :key="cat.categoryId" :value="cat.categoryId">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Năm xuất bản từ</label>
            <input type="number" v-model.number="filters.yearFrom" placeholder="VD: 2000" min="1800" :max="new Date().getFullYear()">
          </div>

          <div class="filter-group">
            <label>Năm xuất bản đến</label>
            <input type="number" v-model.number="filters.yearTo" placeholder="VD: 2024" min="1800" :max="new Date().getFullYear()">
          </div>

          <div class="filter-group">
            <label>Trạng thái</label>
            <select v-model="filters.availability">
              <option value="">Tất cả</option>
              <option value="available">Còn sách</option>
              <option value="low">Sắp hết (< 5)</option>
              <option value="out">Hết sách</option>
            </select>
          </div>
        </div>

        <div class="filter-actions">
          <button @click="resetFilters" class="btn-reset">
            <font-awesome-icon :icon="['fas', 'redo']" /> Đặt lại bộ lọc
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải danh sách sách...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <!-- Books Grid -->
      <div v-else class="books-grid">
        <div v-for="book in filteredBooks" :key="book.id" class="book-card">
          <div class="book-header">
            <div class="book-icon">
              <font-awesome-icon :icon="['fas', 'book']" />
            </div>
            <div class="book-status">
              <span class="quantity-badge" :class="{ 'low-stock': book.availableCopies < 5, 'out-of-stock': book.availableCopies === 0 }">
                {{ book.availableCopies }}/{{ book.quantity }} có sẵn
              </span>
            </div>
          </div>
          <div class="book-content">
            <h3 class="book-title" :title="book.title">{{ book.title }}</h3>
            <div class="book-categories" v-if="book.categories && book.categories.length > 0">
              <span v-for="category in book.categories.filter(c => c && c.id)" :key="category.id" class="category-badge">
                {{ category.name }}
              </span>
            </div>
            <div class="book-details">
              <p><strong>Nhà XB:</strong> {{ book.publisherName }}</p>
              <p><strong>Ngôn ngữ:</strong> {{ book.language }}</p>
              <p><strong>Phiên bản:</strong> {{ book.edition }}</p>
              <p><strong>Năm XB:</strong> {{ book.publicationYear }}</p>
            </div>
          </div>
          <div class="book-actions">
                        <button @click="editBook(book)" class="action-btn edit-btn">
              <font-awesome-icon :icon="['fas', 'pen-to-square']" /> Sửa
            </button>
            <button @click="confirmDelete(book)" class="action-btn delete-btn">
              <font-awesome-icon :icon="['fas', 'trash']" /> Xóa
            </button>
          </div>
        </div>

        <div v-if="filteredBooks.length === 0" class="empty-state">
          <p>{{ searchQuery ? 'Không tìm thấy sách phù hợp' : 'Chưa có sách nào' }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && !errorMessage && totalPages > 1" class="pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="pagination-btn"
        >
          ← Trước
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
          :disabled="currentPage >= totalPages - 1"
          class="pagination-btn"
        >
          Sau →
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showCreateModal ? 'Thêm sách mới' : 'Chỉnh sửa thông tin sách' }}</h3>
          <button @click="closeModals" class="close-btn">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </div>
        <form @submit.prevent="showCreateModal ? handleCreateBook() : handleUpdateBook()" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Tên sách <span class="required">*</span></label>
              <input v-model="form.title" type="text" required placeholder="Nhập tên sách" />
            </div>
            <div class="form-group">
              <label>Năm xuất bản <span class="required">*</span></label>
              <input v-model="form.publicationYear" type="text" required placeholder="YYYY-MM-DD" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Ngôn ngữ <span class="required">*</span></label>
              <input v-model="form.language" type="text" required placeholder="Tiếng Việt, English, etc." />
            </div>
            <div class="form-group">
              <label>Phiên bản <span class="required">*</span></label>
              <input v-model="form.edition" type="text" required placeholder="Tái bản lần 1, 1st Edition, etc." />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Số lượng <span class="required">*</span></label>
              <input v-model.number="form.quantity" type="number" required min="0" placeholder="Tổng số sách" />
            </div>
            <div class="form-group">
              <label>Nhà xuất bản <span class="required">*</span></label>
              <select v-model.number="form.publisherId" required>
                <option :value="null" disabled>-- Chọn nhà xuất bản --</option>
                <option v-for="publisher in publishers" :key="publisher.id" :value="publisher.id">
                  {{ publisher.name }}
                </option>
              </select>
              <small v-if="publishers.length === 0" class="text-muted">Chưa có nhà xuất bản. Vui lòng thêm nhà xuất bản trước.</small>
            </div>
          </div>

            <div class="form-group full-width">
              <label>Thể loại</label>
              <div class="categories-selector">
                <label v-for="category in categories" :key="'cat-' + category.id" class="category-checkbox">
                  <input 
                    type="checkbox" 
                    :id="'category-' + category.id"
                    :value="category.id" 
                    v-model="form.selectedCategories"
                  />
                  <span>{{ category.name }}</span>
                </label>
              </div>
              <small v-if="categories.length === 0" class="text-muted">Chưa có thể loại nào...</small>
            </div>          <div v-if="formError" class="error-message">{{ formError }}</div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn-cancel">Hủy</button>
            <button type="submit" :disabled="isSubmitting" class="btn-submit">
              {{ isSubmitting ? 'Đang xử lý...' : (showCreateModal ? 'Thêm mới' : 'Cập nhật') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Xác nhận xóa"
      :message="`Bạn có chắc chắn muốn xóa sách <strong>${bookToDelete?.title}</strong>?`"
      warning="Hành động này không thể hoàn tác!"
      confirm-text="Xóa"
      :loading="isDeleting"
      loading-text="Đang xóa..."
      @confirm="handleDeleteBook"
      @close="showDeleteModal = false"
    />

    <!-- Toast Notification -->
    <ToastNotification
      :show="toastNotification.show"
      :message="toastNotification.message"
      :type="toastNotification.type"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import { useToast } from '@/composables/useToast'
import { useBooksManagement } from '@/composables/useBooksManagement'

const { toast: toastNotification, showToast } = useToast()

const booksManagement = useBooksManagement()

const {
  books,
  categories,
  publishers,
  searchQuery,
  isLoading,
  errorMessage,
  showFilters,
  filters,
  currentPage,
  totalPages,
  totalElements,
  showCreateModal,
  showEditModal,
  showDeleteModal,
  form,
  formError,
  isSubmitting,
  bookToDelete,
  isDeleting,
  filteredBooks,
  hasActiveFilters,
  activeFilterCount,
  visiblePages,
  resetFilters,
  loadBooks,
  loadCategories,
  loadPublishers,
  handleSearch,
  goToPage,
  editBook,
  confirmDelete,
  closeModals
} = booksManagement

// Wrap handlers to pass showToast
const handleCreateBook = () => {
  booksManagement.handleCreate(showToast)
}
const handleUpdateBook = () => {
  booksManagement.handleUpdate(showToast)
}
const handleDeleteBook = () => booksManagement.handleDelete(showToast)

// Add function to show add modal
const showAddModal = () => {
  // Reset form to default values (update properties individually to maintain reactivity)
  form.value.title = ''
  form.value.publicationYear = ''
  form.value.language = ''
  form.value.edition = ''
  form.value.quantity = 0
  form.value.publisherId = null
  form.value.selectedCategories = []
  formError.value = ''
  showCreateModal.value = true
}

onMounted(() => {
  loadCategories()
  loadPublishers()
  loadBooks()
})
</script>

<style scoped src="@/styles/BooksManagementView.css"></style>
