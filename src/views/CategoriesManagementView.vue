<template>
  <div class="categories-management">
    <AdminHeader title="Quản lý Thể Loại" :show-back-button="true" />
    
    <div class="content-container">
      <div class="page-header">
        <h1>Quản lý Thể Loại Sách</h1>
        <button @click="openAddModal" class="add-btn">
          <font-awesome-icon :icon="['fas', 'plus']" /> Thêm thể loại
        </button>
      </div>

      <div class="search-section">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm theo tên thể loại..."
            @input="handleSearch"
          />
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="isLoading" class="loading">
        Đang tải dữ liệu...
      </div>

      <div v-else class="categories-table-container">
        <table class="categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên thể loại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="categories.length === 0">
              <td colspan="3" class="no-data">Không có dữ liệu</td>
            </tr>
            <tr v-for="category in categories" :key="category.categoryId">
              <td>{{ category.categoryId }}</td>
              <td>{{ category.name }}</td>
              <td class="actions">
                <button @click="openEditModal(category)" class="action-btn edit-btn" title="Sửa">
                  <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                </button>
                <button @click="confirmDelete(category)" class="action-btn delete-btn" title="Xóa">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
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
            (Tổng: {{ totalElements }} thể loại)
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
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới' }}</h2>
          <button @click="closeModal" class="close-btn">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="name">Tên thể loại <span class="required">*</span></label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Nhập tên thể loại (VD: Văn học, Khoa học, Lịch sử...)"
              required
            />
          </div>

          <div v-if="modalError" class="error-message">
            {{ modalError }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Hủy
            </button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Thêm mới') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Xác nhận xóa"
      :message="`Bạn có chắc chắn muốn xóa thể loại: <strong>${categoryToDelete?.name}</strong>?`"
      warning="Không thể xóa nếu có sách thuộc thể loại này! Hành động này không thể hoàn tác!"
      icon="danger"
      confirm-text="Xóa"
      :loading="isSubmitting"
      loading-text="Đang xóa..."
      @confirm="handleDelete"
      @close="closeDeleteModal"
    />

    <!-- Toast Notification -->
    <ToastNotification
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import { useToast } from '@/composables/useToast'
import { useAuthError } from '@/composables/useAuthError'
import AdminHeader from '@/components/AdminHeader.vue'
import { useCategoriesManagement } from '@/composables/useCategoriesManagement'

const { toast, showToast } = useToast()
const { handleAuthError } = useAuthError()

const categoriesManagement = useCategoriesManagement()

const {
  categories,
  isLoading,
  errorMessage,
  searchQuery,
  currentPage,
  totalPages,
  totalElements,
  showModal,
  showDeleteModal,
  isEditMode,
  isSubmitting,
  modalError,
  formData,
  categoryToDelete,
  openAddModal,
  openEditModal,
  closeModal,
  confirmDelete,
  closeDeleteModal
} = categoriesManagement

const fetchCategories = (page) => categoriesManagement.fetchCategories(page, handleAuthError)
const handleSearch = () => categoriesManagement.handleSearch(handleAuthError)
const changePage = (page) => categoriesManagement.changePage(page, handleAuthError)
const handleSubmit = () => categoriesManagement.handleSubmit(showToast, handleAuthError)
const handleDelete = () => categoriesManagement.handleDelete(showToast, handleAuthError)

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped src="@/styles/CategoriesManagementView.css"></style>
