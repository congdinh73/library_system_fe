<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content confirm-modal" @click.stop>
      <div class="modal-header">
        <div class="header-icon-wrapper" :class="iconWrapperClass">
          <font-awesome-icon :icon="iconName" class="header-icon" />
        </div>
        <h2>{{ title }}</h2>
        <button @click="handleClose" class="close-btn">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>
      <div class="modal-body">
        <p class="confirm-message" v-html="message"></p>
        <div v-if="warning" class="warning-box">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
          <span>{{ warning }}</span>
        </div>
      </div>
      <div class="modal-actions">
        <button @click="handleClose" :disabled="loading" class="cancel-btn">
          <font-awesome-icon :icon="['fas', 'xmark']" />
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm" 
          :disabled="loading" 
          :class="['confirm-btn', confirmClass]"
        >
          <font-awesome-icon :icon="['fas', loading ? 'spinner' : confirmIcon]" :spin="loading" />
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Xác nhận'
  },
  message: {
    type: String,
    required: true
  },
  warning: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'trash' // trash, warning, info, question, success
  },
  confirmText: {
    type: String,
    default: 'Xác nhận'
  },
  cancelText: {
    type: String,
    default: 'Hủy'
  },
  loadingText: {
    type: String,
    default: 'Đang xử lý...'
  },
  loading: {
    type: Boolean,
    default: false
  },
  confirmClass: {
    type: String,
    default: 'btn-delete'
  },
  confirmIcon: {
    type: String,
    default: 'check'
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const iconName = computed(() => {
  const iconMap = {
    'trash': ['fas', 'trash-can'],
    'warning': ['fas', 'triangle-exclamation'],
    'info': ['fas', 'circle-info'],
    'question': ['fas', 'circle-question'],
    'success': ['fas', 'circle-check']
  }
  return iconMap[props.icon] || iconMap['trash']
})

const iconWrapperClass = computed(() => {
  const classMap = {
    'trash': 'icon-danger',
    'warning': 'icon-warning',
    'info': 'icon-info',
    'question': 'icon-question',
    'success': 'icon-success'
  }
  return classMap[props.icon] || 'icon-danger'
})

const handleConfirm = () => {
  emit('confirm')
}

const handleClose = () => {
  emit('close')
  emit('cancel')
}

const handleOverlayClick = () => {
  handleClose()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  padding: 20px;
}

.modal-content.confirm-modal {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.confirm-modal .modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 30px 20px;
  border-bottom: 2px solid #ecf0f1;
  position: relative;
}

.confirm-modal .header-icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  animation: scaleIn 0.3s ease;
}

.confirm-modal .header-icon-wrapper.icon-danger {
  background: linear-gradient(135deg, #fee 0%, #fcc 100%);
}

.confirm-modal .header-icon-wrapper.icon-warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
}

.confirm-modal .header-icon-wrapper.icon-info {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
}

.confirm-modal .header-icon-wrapper.icon-success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.confirm-modal .header-icon-wrapper.icon-question {
  background: linear-gradient(135deg, #e2e3e5 0%, #d6d8db 100%);
}

.confirm-modal .header-icon {
  font-size: 32px;
}

.confirm-modal .icon-danger .header-icon {
  color: #e74c3c;
}

.confirm-modal .icon-warning .header-icon {
  color: #f59e0b;
}

.confirm-modal .icon-info .header-icon {
  color: #17a2b8;
}

.confirm-modal .icon-success .header-icon {
  color: #28a745;
}

.confirm-modal .icon-question .header-icon {
  color: #6c757d;
}

.confirm-modal .modal-header h2 {
  margin: 0;
  font-size: 22px;
  color: #2c3e50;
  font-weight: 600;
  text-align: center;
}

.confirm-modal .close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #95a5a6;
  cursor: pointer;
  padding: 5px;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.confirm-modal .close-btn:hover {
  color: #2c3e50;
  background: #f3f4f6;
}

.confirm-modal .modal-body {
  padding: 30px;
  text-align: center;
}

.confirm-modal .confirm-message {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #2c3e50;
  line-height: 1.8;
}

.confirm-modal .confirm-message:last-child {
  margin-bottom: 0;
}

.confirm-modal .warning-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 20px;
  background: #fff3cd;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

.confirm-modal .warning-box svg {
  font-size: 18px;
  color: #f59e0b;
}

.confirm-modal .modal-actions {
  padding: 0 30px 30px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-modal .cancel-btn,
.confirm-modal .confirm-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
}

.confirm-modal .cancel-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

.confirm-modal .cancel-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.confirm-modal .confirm-btn {
  color: white;
}

.confirm-modal .confirm-btn.btn-delete {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.confirm-modal .confirm-btn.btn-delete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.confirm-modal .confirm-btn.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.confirm-modal .confirm-btn.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.confirm-modal .confirm-btn.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.confirm-modal .confirm-btn.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.confirm-modal .confirm-btn.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.confirm-modal .confirm-btn.btn-warning:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.confirm-modal .confirm-btn:disabled,
.confirm-modal .cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
