<template>
  <div class="readers-management-container">
    <AdminHeader title="Quản lý Độc giả" :show-back-button="true" />
    
    <div class="content-container">
      <div class="page-header">
        <h1>Quản lý Độc giả</h1>
        <button @click="showCreateModal = true" class="add-btn">
          <font-awesome-icon :icon="['fas', 'user-plus']" /> Thêm độc giả mới
        </button>
      </div>

      <div class="search-section">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            @input="handleSearch"
          />
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading">
        Đang tải dữ liệu...
      </div>

      <!-- Readers Table -->
      <div v-else class="readers-table-container">
          <table class="readers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reader in filteredReaders" :key="reader.readerId || reader.id">
                <td>{{ reader.readerId || reader.id }}</td>
                <td class="name-cell">{{ reader.fullName }}</td>
                <td>{{ reader.email }}</td>
                <td>{{ reader.phone }}</td>
                <td>{{ reader.address }}</td>
                <td>
                  <span :class="['status-badge', reader.isActive ? 'status-active' : 'status-inactive']">
                    <font-awesome-icon :icon="['fas', reader.isActive ? 'check-circle' : 'times-circle']" />
                    {{ reader.isActive ? ' Hoạt động' : ' Ngưng hoạt động' }}
                  </span>
                </td>
                <td>{{ formatDate(reader.createdAt) }}</td>
                <td class="actions-cell">
                  <button 
                    @click="toggleReaderStatus(reader)" 
                    :class="['btn-toggle', reader.isActive ? 'btn-deactivate' : 'btn-activate']"
                    :title="reader.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'"
                  >
                    <font-awesome-icon :icon="['fas', reader.isActive ? 'ban' : 'check']" />
                  </button>
                                    <button @click="editReader(reader)" class="action-btn edit-btn" title="Sửa">
                    <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                  </button>
                  <button @click="confirmDelete(reader)" class="action-btn delete-btn" title="Xóa">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredReaders.length === 0">
                <td colspan="8" class="empty-row">
                  {{ searchQuery ? 'Không tìm thấy độc giả phù hợp' : 'Chưa có độc giả nào' }}
                </td>
              </tr>
            </tbody>
          </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 0"
            class="page-btn"
          >
            ← Trước
          </button>
          
          <span class="page-info">
            Trang {{ currentPage + 1 }} / {{ totalPages }}
            (Tổng: {{ totalElements }} độc giả)
          </span>
          
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages - 1"
            class="page-btn"
          >
            Sau →
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showCreateModal ? 'Thêm độc giả mới' : 'Chỉnh sửa thông tin' }}</h3>
          <button @click="closeModals" class="close-btn">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </div>
        <form @submit.prevent="showCreateModal ? handleCreateReader() : handleUpdateReader()" class="modal-form">
          <div class="form-group">
            <label>Họ và tên <span class="required">*</span></label>
            <input v-model="form.fullName" type="text" required placeholder="Nhập họ và tên" />
          </div>
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input v-model="form.email" type="email" required placeholder="Nhập email" :disabled="showEditModal" />
            <small v-if="showEditModal">Email không thể thay đổi</small>
          </div>
          <div class="form-group">
            <label>Số điện thoại <span class="required">*</span></label>
            <input v-model="form.phone" type="tel" required placeholder="Nhập số điện thoại" />
          </div>
          <div class="form-group">
            <label>Địa chỉ</label>
            <textarea v-model="form.address" rows="3" placeholder="Nhập địa chỉ"></textarea>
          </div>
          <div v-if="showCreateModal" class="form-group">
            <label>Mật khẩu <span class="required">*</span></label>
            <input v-model="form.password" type="password" required minlength="6" placeholder="Nhập mật khẩu (ít nhất 6 ký tự)" />
          </div>
          <div v-if="formError" class="error-message">{{ formError }}</div>
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
      :message="`Bạn có chắc chắn muốn xóa độc giả <strong>${readerToDelete?.fullName}</strong>?`"
      warning="Hành động này không thể hoàn tác!"
      confirm-text="Xóa"
      :loading="isDeleting"
      loading-text="Đang xóa..."
      @confirm="handleDeleteReader"
      @close="showDeleteModal = false"
    />

    <!-- Toggle Status Confirmation Modal -->
    <ConfirmModal
      :show="showToggleModal"
      :title="readerToToggle?.isActive ? 'Xác nhận vô hiệu hóa' : 'Xác nhận kích hoạt'"
      :message="`Bạn có chắc muốn ${readerToToggle?.isActive ? 'vô hiệu hóa' : 'kích hoạt'} độc giả <strong>${readerToToggle?.fullName}</strong>?`"
      :confirm-text="readerToToggle?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'"
      :confirm-class="readerToToggle?.isActive ? 'btn-delete-confirm' : 'btn-save'"
      :loading="isToggling"
      loading-text="Đang xử lý..."
      @confirm="handleToggle"
      @close="showToggleModal = false"
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
import { useAuthError } from '@/composables/useAuthError'
import { useReadersManagement } from '@/composables/useReadersManagement'

const { toast: toastNotification, showToast } = useToast()
const { handleAuthError } = useAuthError()

const readersManagement = useReadersManagement()

const {
  readers,
  searchQuery,
  isLoading,
  errorMessage,
  currentPage,
  totalPages,
  totalElements,
  showCreateModal,
  showEditModal,
  showDeleteModal,
  showToggleModal,
  form,
  formError,
  isSubmitting,
  readerToDelete,
  readerToToggle,
  isDeleting,
  isToggling,
  filteredReaders,
  visiblePages,
  loadReaders,
  handleSearch,
  goToPage,
  editReader,
  toggleReaderStatus,
  confirmDelete,
  closeModals,
  formatDate
} = readersManagement

// Wrap handlers to pass dependencies
const handleCreateReader = () => readersManagement.handleCreate(showToast)
const handleUpdateReader = () => readersManagement.handleUpdate(showToast)
const handleDeleteReader = () => readersManagement.handleDelete(showToast)
const handleToggle = () => readersManagement.handleToggleStatus(showToast, handleAuthError)

onMounted(() => {
  loadReaders()
})
</script>

<style scoped src="@/styles/ReadersManagementView.css"></style>
