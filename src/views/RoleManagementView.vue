<template>
  <div class="role-management">
    <AdminHeader title="Quản lý Vai Trò" :show-back-button="true" />
    
    <div class="content-container">
      <div class="page-header">
        <h1>Quản lý Vai Trò</h1>
        <div class="header-actions">
          <button @click="initializeDefaultRoles" class="init-btn" :disabled="isInitializing">
            <font-awesome-icon :icon="['fas', 'sync-alt']" /> {{ isInitializing ? 'Đang khởi tạo...' : 'Khởi tạo vai trò mặc định' }}
          </button>
          <button @click="openAddModal" class="add-btn">
            <font-awesome-icon :icon="['fas', 'user-tag']" /> Thêm vai trò
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div v-if="isLoading" class="loading">
        Đang tải dữ liệu...
      </div>

      <div v-else class="roles-table-container">
        <table class="roles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên vai trò</th>
              <th>Mô tả</th>
              <th>Độ ưu tiên</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="roles.length === 0">
              <td colspan="5" class="no-data">Không có dữ liệu</td>
            </tr>
            <tr v-for="role in roles" :key="role.roleId">
              <td>{{ role.roleId }}</td>
              <td>
                <span class="role-badge" :class="getRoleBadgeClass(role.roleName)">
                  {{ role.roleName }}
                </span>
              </td>
              <td>{{ role.description || 'N/A' }}</td>
              <td>
                <span class="priority-badge">{{ role.priority }}</span>
              </td>
              <td class="actions">
                <button @click="openEditModal(role)" class="action-btn edit-btn" title="Sửa">
                  <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                </button>
                <button @click="confirmDelete(role)" class="action-btn delete-btn" title="Xóa">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới' }}</h2>
          <button @click="closeModal" class="close-btn">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="roleName">Tên vai trò <span class="required">*</span></label>
            <input
              id="roleName"
              v-model="formData.roleName"
              type="text"
              placeholder="VD: ADMIN, STAFF, READER"
              required
              :disabled="isEditMode"
            />
            <small v-if="isEditMode">Không thể thay đổi tên vai trò</small>
          </div>

          <div class="form-group">
            <label for="description">Mô tả</label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Nhập mô tả vai trò"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="priority">Độ ưu tiên <span class="required">*</span></label>
            <input
              id="priority"
              v-model.number="formData.priority"
              type="number"
              placeholder="Nhập độ ưu tiên (số càng cao càng quan trọng)"
              required
              min="0"
            />
            <small>Số càng cao thì vai trò càng quan trọng</small>
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
      message="Bạn có chắc chắn muốn xóa vai trò này?"
      warning="Không thể xóa nếu có nhân viên đang sử dụng vai trò này! Hành động này không thể hoàn tác!"
      icon="danger"
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
import AdminHeader from '@/components/AdminHeader.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import { useToast } from '@/composables/useToast'
import { useAuthError } from '@/composables/useAuthError'
import { useRoleManagement } from '@/composables/useRoleManagement'

const { toast, showToast } = useToast()
const { handleAuthError } = useAuthError()

const roleManagement = useRoleManagement()

const {
  roles,
  isLoading,
  isInitializing,
  errorMessage,
  successMessage,
  showModal,
  showDeleteModal,
  isEditMode,
  isSubmitting,
  modalError,
  formData,
  roleToDelete,
  getRoleBadgeClass,
  openAddModal,
  openEditModal,
  closeModal,
  confirmDelete,
  closeDeleteModal
} = roleManagement

const fetchRoles = () => roleManagement.fetchRoles(handleAuthError)
const handleInitializeDefaults = () => roleManagement.handleInitializeDefaults(handleAuthError)
const handleSubmit = () => roleManagement.handleSubmit(showToast, handleAuthError)
const handleDelete = () => roleManagement.handleDelete(showToast, handleAuthError)

onMounted(() => {
  fetchRoles()
})
</script>

<style scoped src="@/styles/RoleManagementView.css"></style>
