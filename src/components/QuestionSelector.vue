<template>
  <div class="question-selector-container">
    <!-- 快速询问触发按钮 -->
    <button 
      @click="toggle" 
      class="question-selector-trigger"
      :class="{ 'active': isVisible }"
    >
      <span class="trigger-icon">💬</span>
      <span class="trigger-text">快速询问</span>
      <span class="dropdown-arrow">{{ isVisible ? '▲' : '▼' }}</span>
    </button>

    <!-- 问题选择面板 -->
    <transition name="question-panel-slide">
      <div v-if="isVisible" class="question-selection-panel">
        <div class="panel-header">
          <h3>选择询问内容</h3>
          <p>根据不同场景选择合适的问题</p>
        </div>
        
        <div class="question-categories">
          <div
            v-for="category in questionTemplates"
            :key="category.category"
            class="question-category"
          >
            <div class="category-header">
              <span class="category-icon">{{ category.icon }}</span>
              <h4 class="category-title">{{ category.category }}</h4>
            </div>
            
            <div class="question-list">
              <button
                v-for="(question, index) in category.questions"
                :key="index"
                @click="selectQuestion(question)"
                class="question-option"
              >
                <span class="question-text">{{ question }}</span>
                <span class="question-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="panel-footer">
          <div class="custom-question-section">
            <div class="custom-question-header">
              <span class="custom-icon">✏️</span>
              <span>或者输入自定义问题</span>
            </div>
            <div class="custom-question-input">
              <input
                v-model="customQuestion"
                @keyup.enter="submitCustomQuestion"
                type="text"
                placeholder="输入你想问的问题..."
                class="custom-input-field"
              />
              <button 
                @click="submitCustomQuestion"
                :disabled="!customQuestion.trim()"
                class="custom-submit-button"
              >
                <span>使用</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface QuestionCategory {
  category: string
  icon: string
  questions: string[]
}

interface Props {
  questionTemplates: QuestionCategory[]
  isVisible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: []
  selectQuestion: [question: string]
}>()

const customQuestion = ref('')

const toggle = () => {
  emit('toggle')
}

const selectQuestion = (question: string) => {
  emit('selectQuestion', question)
}

const submitCustomQuestion = () => {
  if (customQuestion.value.trim()) {
    emit('selectQuestion', customQuestion.value.trim())
    customQuestion.value = ''
  }
}
</script>

<style scoped>
.question-selector-container {
  position: relative;
  z-index: 40;
}

.question-selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  margin-bottom: 1rem;
}

.question-selector-trigger:hover,
.question-selector-trigger.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.trigger-icon {
  font-size: 1.5rem;
}

.trigger-text {
  flex: 1;
  text-align: left;
  margin-left: 1rem;
  font-weight: 600;
}

.dropdown-arrow {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.question-panel-slide-enter-active,
.question-panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.question-panel-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.question-panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.question-selection-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(0, 0, 0, 0.95));
  border-radius: 25px;
  padding: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(30px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-height: 70vh;
  overflow-y: auto;
}

.panel-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.panel-header h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #ffd93d;
}

.panel-header p {
  font-size: 1rem;
  opacity: 0.8;
}

.question-categories {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
}

.question-category {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  color: white;
}

.category-icon {
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.category-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd93d;
}

.question-list {
  display: grid;
  gap: 0.8rem;
}

.question-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.question-option:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(8px);
}

.question-text {
  flex: 1;
  font-size: 1rem;
  line-height: 1.4;
}

.question-arrow {
  font-size: 1.2rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.question-option:hover .question-arrow {
  opacity: 1;
  transform: translateX(5px);
}

.panel-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
}

.custom-question-section {
  color: white;
}

.custom-question-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
  font-weight: 600;
  opacity: 0.9;
}

.custom-icon {
  font-size: 1.3rem;
}

.custom-question-input {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.custom-input-field {
  flex: 1;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  color: white;
  font-size: 1rem;
  backdrop-filter: blur(10px);
}

.custom-input-field::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.custom-input-field:focus {
  outline: none;
  border-color: #ffd93d;
  box-shadow: 0 0 20px rgba(255, 217, 61, 0.3);
}

.custom-submit-button {
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #ffd93d, #ffb347);
  border: none;
  border-radius: 15px;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 217, 61, 0.4);
}

.custom-submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
