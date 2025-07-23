<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <div class="modal-icon-wrapper" :class="`icon-bg-${type}`">
          <span v-if="type === 'welcome'" class="icon">🎉</span>
          <span v-else-if="type === 'confirm'" class="icon">🤔</span>
          <span v-else class="icon">💡</span>
        </div>

        <div class="modal-content">
          <h2 class="modal-title">{{ title }}</h2>
          <p class="modal-message">{{ message }}</p>
        </div>

        <div class="modal-actions">
          <button v-if="type === 'confirm'" @click="handleCancel" class="action-button cancel">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" class="action-button confirm" :class="`button-${type}`">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean;
  type?: 'welcome' | 'confirm' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  persistent?: boolean; // If true, clicking overlay doesn't close
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  confirmText: '确认',
  cancelText: '取消',
  persistent: false,
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};

const handleOverlayClick = () => {
  if (!props.persistent) {
    emit('cancel'); // Or a specific 'close' event
  }
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(10, 15, 25, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 400px;
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.modal-icon-wrapper {
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
}
.modal-icon-wrapper.icon-bg-welcome {
  background: linear-gradient(135deg, #a855f7, #6366f1);
}
.modal-icon-wrapper.icon-bg-confirm {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.4);
}
.modal-icon-wrapper.icon-bg-info {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}
.modal-icon-wrapper .icon {
  font-size: 2.5rem;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

.modal-message {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 2.5rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  flex: 1;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-button.confirm {
  color: white;
}
.action-button.button-welcome {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}
.action-button.button-confirm {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
}
.action-button.button-info {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}
.action-button.confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}
.action-button.button-confirm:hover {
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

.action-button.cancel {
  background: rgba(71, 85, 105, 0.4);
  color: #cbd5e1;
}
.action-button.cancel:hover {
  background: rgba(71, 85, 105, 0.6);
  transform: translateY(-1px);
}
</style>
