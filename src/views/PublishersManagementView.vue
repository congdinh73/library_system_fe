<template>
  <div class="publishers-management">
    <AdminHeader title="Quản lý Nhà Xuất Bản" :show-back-button="true" />
    
    <div class="content-container">
      <div class="page-header">
        <h1>Quản lý Nhà Xuất Bản</h1>
        <button @click="openAddModal" class="add-btn">
          <font-awesome-icon :icon="['fas', 'plus']" /> Thêm nhà xuất bản
        </button>
      </div>

      <div class="search-section">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm theo tên nhà xuất bản hoặc địa chỉ..."
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

      <div v-else class="publishers-table-container">
        <table class="publishers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhà xuất bản</th>
              <th>Địa chỉ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="publishers.length === 0">
              <td colspan="4" class="no-data">Không có dữ liệu</td>
            </tr>
            <tr v-for="publisher in publishers" :key="publisher.publisherId">
              <td>{{ publisher.publisherId }}</td>
              <td>{{ publisher.name }}</td>
              <td>{{ publisher.address }}</td>
              <td class="actions">
                <button @click="openEditModal(publisher)" class="action-btn edit-btn" title="Sửa">
                  <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                </button>
                <button @click="confirmDelete(publisher)" class="action-btn delete-btn" title="Xóa">
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
            (Tổng: {{ totalElements }} nhà xuất bản)
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
          <h2>{{ isEditMode ? 'Chỉnh sửa nhà xuất bản' : 'Thêm nhà xuất bản mới' }}</h2>
          <button @click="closeModal" class="close-btn">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="name">Tên nhà xuất bản <span class="required">*</span></label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Nhập tên nhà xuất bản"
              required
            />
          </div>

          <div class="form-group">
            <label for="address">Địa chỉ <span class="required">*</span></label>
            <input
              id="address"
              v-model="formData.address"
              type="text"
              placeholder="Nhập địa chỉ"
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
      :message="`Bạn có chắc chắn muốn xóa nhà xuất bản: <strong>${publisherToDelete?.name}</strong>?`"
      warning="Hành động này không thể hoàn tác!"
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
import { usePublishersManagement } from '@/composables/usePublishersManagement'

const { toast, showToast } = useToast()
const { handleAuthError } = useAuthError()

const publishersManagement = usePublishersManagement()

const {
  publishers,
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
  publisherToDelete,
  openAddModal,
  openEditModal,
  closeModal,
  confirmDelete,
  closeDeleteModal
} = publishersManagement

// Wrap handlers to pass dependencies
const fetchPublishers = (page) => publishersManagement.fetchPublishers(page, handleAuthError)
const handleSearch = () => publishersManagement.handleSearch(handleAuthError)
const changePage = (page) => publishersManagement.changePage(page, handleAuthError)
const handleSubmit = () => publishersManagement.handleSubmit(showToast, handleAuthError)
const handleDelete = () => publishersManagement.handleDelete(showToast, handleAuthError)

onMounted(() => {
  fetchPublishers()
})
</script>

<style scoped src="@/styles/PublishersManagementView.css"></style>
