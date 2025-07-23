<template>
  <div class="demo-container">
    <div class="demo-content">
      <h1>SystemModal 演示</h1>
      <p>点击下面的按钮来测试不同类型的弹窗</p>
      
      <div class="button-group">
        <button @click="showWelcomeModal" class="demo-btn welcome">
          显示欢迎弹窗
        </button>
        <button @click="showConfirmModal" class="demo-btn confirm">
          显示确认弹窗
        </button>
        <button @click="showInfoModal" class="demo-btn info">
          显示信息弹窗
        </button>
      </div>
    </div>

    <!-- SystemModal 组件 -->
    <SystemModal
      :visible="isModalVisible"
      :type="modalType"
      :title="modalTitle"
      :message="modalMessage"
      :confirm-text="modalConfirmText"
      :cancel-text="modalCancelText"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SystemModal from './SystemModal.vue'

const isModalVisible = ref(false)
const modalType = ref('info')
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmText = ref('确认')
const modalCancelText = ref('取消')

// 显示欢迎弹窗
const showWelcomeModal = () => {
  modalType.value = 'welcome'
  modalTitle.value = '欢迎回来！'
  modalMessage.value = '准备好开始一场新的冒险了吗？让我们立即启程吧！'
  modalConfirmText.value = '开始游戏'
  isModalVisible.value = true
}

// 显示确认弹窗
const showConfirmModal = () => {
  modalType.value = 'confirm'
  modalTitle.value = '确认退出'
  modalMessage.value = '你确定要离开这场精彩的冒险吗？所有未保存的进度将会丢失。'
  modalConfirmText.value = '确认退出'
  modalCancelText.value = '继续游戏'
  isModalVisible.value = true
}

// 显示信息弹窗
const showInfoModal = () => {
  modalType.value = 'info'
  modalTitle.value = '系统提示'
  modalMessage.value = '这是一个信息提示弹窗，用于显示重要的系统消息和通知。'
  modalConfirmText.value = '我知道了'
  isModalVisible.value = true
}

// 处理弹窗确认
const handleModalConfirm = () => {
  console.log(`用户确认了 ${modalType.value} 弹窗`)
  isModalVisible.value = false
}

// 处理弹窗取消
const handleModalCancel = () => {
  console.log(`用户取消了 ${modalType.value} 弹窗`)
  isModalVisible.value = false
}
</script>

<style scoped>
.demo-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.demo-content {
  background: rgba(30, 41, 59, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  text-align: center;
  max-width: 500px;
}

.demo-content h1 {
  color: #f8fafc;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.demo-content p {
  color: #94a3b8;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.demo-btn {
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.demo-btn.welcome {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.demo-btn.confirm {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
}

.demo-btn.info {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}

.demo-btn.confirm:hover {
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

.demo-btn.info:hover {
  box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4);
}
</style>
