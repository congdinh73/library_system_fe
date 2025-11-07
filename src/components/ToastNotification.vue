<template>
  <Transition name="toast">
    <div v-if="show" :class="['toast-notification', type]">
      <i :class="['toast-icon', icon]"></i>
      <span class="toast-message">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  }
})

const icon = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-times-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[props.type] || '✓'
})
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  min-width: 300px;
  max-width: 500px;
  font-size: 14px;
  font-weight: 500;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
}

/* Success */
.toast-notification.success {
  background: #10b981;
  color: white;
}

.toast-notification.success .toast-icon {
  background: rgba(255, 255, 255, 0.2);
}

/* Error */
.toast-notification.error {
  background: #ef4444;
  color: white;
}

.toast-notification.error .toast-icon {
  background: rgba(255, 255, 255, 0.2);
}

/* Warning */
.toast-notification.warning {
  background: #f59e0b;
  color: white;
}

.toast-notification.warning .toast-icon {
  background: rgba(255, 255, 255, 0.2);
}

/* Info */
.toast-notification.info {
  background: #3b82f6;
  color: white;
}

.toast-notification.info .toast-icon {
  background: rgba(255, 255, 255, 0.2);
}

/* Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
