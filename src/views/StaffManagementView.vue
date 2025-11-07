<template>
  <div class="staff-management">
    <AdminHeader title="Quản lý Nhân viên" :show-back-button="true" />
    
    <div class="content-container">
      <div class="page-header">
        <h1>Quản lý Nhân viên</h1>
        <button @click="openCreateModal" class="add-btn">
          <font-awesome-icon :icon="['fas', 'plus']" /> Thêm nhân viên
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

      <div v-if="isLoading" class="loading">
        Đang tải dữ liệu...
      </div>

      <div v-else class="staff-table-container">
        <table class="staff-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredStaff.length === 0">
              <td colspan="6" class="no-data">Không có dữ liệu</td>
            </tr>
            <tr v-for="staffMember in filteredStaff" :key="staffMember.staffId || staffMember.id">
              <td>{{ staffMember.fullName }}</td>
              <td>{{ staffMember.email }}</td>
              <td>{{ staffMember.phone?.trim() || 'N/A' }}</td>
              <td>
                <span 
                  v-for="(roleItem, idx) in (staffMember.roles || [{ roleName: staffMember.role }])" 
                  :key="idx"
                  :class="['role-badge', getRoleBadgeClass(roleItem.roleName || roleItem)]"
                  style="margin-right: 5px;"
                >
                  <font-awesome-icon :icon="['fas', (roleItem.roleName || roleItem) === 'ADMIN' ? 'user-shield' : 'user-tie']" />
                  {{ roleItem.roleName || roleItem }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', staffMember.isActive ? 'status-active' : 'status-inactive']">
                  <font-awesome-icon :icon="['fas', staffMember.isActive ? 'check-circle' : 'times-circle']" />
                  {{ staffMember.isActive ? 'Hoạt động' : 'Vô hiệu' }}
                </span>
              </td>
              <td class="actions-cell">
                <button 
                  @click="openToggleModal(staffMember)" 
                  :class="['btn-toggle', staffMember.isActive ? 'btn-deactivate' : 'btn-activate']"
                  :title="staffMember.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'"
                >
                  <font-awesome-icon :icon="['fas', staffMember.isActive ? 'ban' : 'check']" />
                </button>
                <button @click="openEditModal(staffMember)" class="action-btn edit-btn" title="Sửa">
                  <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                </button>
                <button @click="openDeleteModal(staffMember)" class="action-btn delete-btn" title="Xóa">
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 0"
            class="page-btn"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" />
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            :class="['page-btn', { active: page === currentPage }]"
          >
            {{ page + 1 }}
          </button>

          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage >= totalPages - 1"
            class="page-btn"
          >
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ modalMode === 'create' ? 'Thêm nhân viên mới' : 'Chỉnh sửa nhân viên' }}</h2>
          <button @click="closeModal" class="close-btn">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit(showToast)" class="modal-body">
          <div v-if="errorMessage" class="form-error">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label for="fullName">Họ tên <span class="required">*</span></label>
            <input
              id="fullName"
              v-model="formData.fullName"
              type="text"
              placeholder="Nhập họ tên"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email <span class="required">*</span></label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Nhập email"
              :disabled="modalMode === 'edit'"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">
              Mật khẩu {{ modalMode === 'create' ? '*' : '(để trống nếu không đổi)' }}
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="Nhập mật khẩu"
              :required="modalMode === 'create'"
            />
          </div>

          <div class="form-group">
            <label for="phone">Số điện thoại</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div class="form-group">
            <label for="role">Vai trò <span class="required">*</span></label>
            
            <div v-if="roles.length === 0" style="padding: 10px; background: #fff3cd; border-radius: 8px; color: #856404;">
              Đang tải danh sách vai trò...
            </div>
            
            <div v-else class="role-options">
              <label 
                v-for="role in roles" 
                :key="role.roleId" 
                class="role-option"
              >
                <input 
                  type="radio" 
                  :value="role.roleName" 
                  v-model="formData.role"
                  name="role"
                  required
                />
                <span class="role-label">{{ role.roleName }}</span>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Hủy</button>
            <button type="submit" :disabled="isLoading" class="submit-btn">
              {{ modalMode === 'create' ? 'Thêm' : 'Cập nhật' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Xác nhận xóa"
      :message="`Bạn có chắc chắn muốn xóa nhân viên <strong>${staffToDelete?.fullName}</strong>?`"
      warning="Hành động này không thể hoàn tác!"
      confirm-text="Xóa"
      :loading="isDeleting"
      loading-text="Đang xóa..."
      @confirm="confirmDelete"
      @close="showDeleteModal = false"
    />

    <!-- Toggle Status Confirmation Modal -->
    <ConfirmModal
      :show="showToggleModal"
      :title="staffToToggle?.isActive ? 'Xác nhận vô hiệu hóa' : 'Xác nhận kích hoạt'"
      :message="`Bạn có chắc muốn ${staffToToggle?.isActive ? 'vô hiệu hóa' : 'kích hoạt'} nhân viên <strong>${staffToToggle?.fullName}</strong>?`"
      :icon="staffToToggle?.isActive ? 'warning' : 'success'"
      :confirm-text="staffToToggle?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'"
      :confirm-class="staffToToggle?.isActive ? 'btn-delete-confirm' : 'btn-save'"
      :confirm-icon="staffToToggle?.isActive ? 'ban' : 'check'"
      :loading="isToggling"
      loading-text="Đang xử lý..."
      @confirm="confirmToggleStatus"
      @close="showToggleModal = false"
    />

    <!-- Toast -->
    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useStaffManagement } from '@/composables/useStaffManagement'

const staffManagement = useStaffManagement()

const {
  staff,
  roles,
  isLoading,
  errorMessage,
  searchQuery,
  showModal,
  modalMode,
  formData,
  currentPage,
  totalPages,
  totalElements,
  filteredStaff,
  visiblePages,
  openCreateModal,
  openEditModal,
  closeModal,
  handleSubmit,
  handleToggleStatus,
  handleSearch,
  changePage,
  getRoleBadgeClass,
  getStatusBadgeClass,
  formatDate
} = staffManagement

// Delete modal state
const showDeleteModal = ref(false)
const staffToDelete = ref(null)
const isDeleting = ref(false)

// Toggle status modal state
const showToggleModal = ref(false)
const staffToToggle = ref(null)
const isToggling = ref(false)

// Open delete modal
const openDeleteModal = (staffMember) => {
  staffToDelete.value = staffMember
  showDeleteModal.value = true
}

// Open toggle status modal
const openToggleModal = (staffMember) => {
  staffToToggle.value = staffMember
  showToggleModal.value = true
}

// Confirm delete
const confirmDelete = async () => {
  if (!staffToDelete.value) return
  
  isDeleting.value = true
  try {
    await staffManagement.handleDelete(staffToDelete.value, showToast)
    showDeleteModal.value = false
    staffToDelete.value = null
  } finally {
    isDeleting.value = false
  }
}

// Confirm toggle status
const confirmToggleStatus = async () => {
  if (!staffToToggle.value) return
  
  isToggling.value = true
  try {
    await handleToggleStatus(staffToToggle.value, showToast)
    showToggleModal.value = false
    staffToToggle.value = null
  } finally {
    isToggling.value = false
  }
}

// Toast
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

onMounted(() => {
  staffManagement.loadStaff()
  staffManagement.loadRoles()
})
</script>

<style scoped src="@/styles/StaffManagementView.css"></style>

