<template>
  <div class="dialogue-system-container">
    <!-- AI Processing State -->
    <div v-if="isAiProcessing" class="ai-processing-display">
      <div class="processing-content">
        <div class="processing-avatar">
          <img :src="activeCharacter?.characterImageURL" :alt="activeCharacter?.characterName" />
          <div class="processing-pulse"></div>
        </div>
        <div class="processing-text">
          <div class="processing-header">
            <span class="processing-name">{{ activeCharacter?.characterName }}</span>
            <span class="processing-model">{{ activeCharacter?.llmName }}</span>
          </div>
          <div class="processing-status">正在思考中...</div>
          <div class="processing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Elegant Dialogue Display -->
    <div v-else-if="currentDialogue.text" class="dialogue-display-system">
      <!-- Name Plate -->
      <div v-if="activeCharacter" class="speaker-name-plate">
        {{ activeCharacter.characterName }}
      </div>

      <!-- Dialogue Content -->
      <div class="dialogue-content-display">
        <div class="dialogue-text-area">
          <span
            v-for="(character, index) in displayedText"
            :key="`char-${index}`"
            class="dialogue-character"
          >{{ character }}</span>
          <span v-if="isTyping" class="typing-cursor">|</span>
        </div>
      
        <div class="dialogue-action-controls">
          <button 
            @click="$emit('continueScene')" 
            class="action-button continue-button"
            :disabled="!canContinue"
          >
            继续 ►
          </button>
        </div>
      </div>
    </div>

    <!-- User Input Interface (preserved for compatibility) -->
    <div v-else-if="showUserInterface" class="user-input-interface">
      <div class="input-header">
        <div class="input-prompt">
          <div class="prompt-icon">💭</div>
          <div class="prompt-text">
            <div class="prompt-title">请输入你的回应</div>
            <div class="prompt-subtitle">作为调查员，你想说什么？</div>
          </div>
        </div>
      </div>

      <div class="user-input-section">
        <textarea
          :value="userInput"
          @input="$emit('updateInput', $event.target.value)"
          @keydown.ctrl.enter="$emit('submitInput')"
          placeholder="输入你的回应... (Ctrl+Enter 发送)"
          class="user-input-field"
          rows="3"
        ></textarea>
        <button
          @click="$emit('submitInput')"
          :disabled="!userInput.trim()"
          class="submit-input-button"
        >
          <span class="button-text">发送</span>
          <span class="button-icon">📤</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  isAiProcessing: Boolean,
  currentDialogue: Object,
  activeCharacter: Object,
  displayedText: String,
  isTyping: Boolean,
  canContinue: Boolean,
  currentSceneIndex: Number,
  totalScenes: Number,
  processingProgress: Number,
  showUserInterface: Boolean,
  userInput: String
})

defineEmits(['skipTyping', 'continueScene', 'submitInput', 'updateInput'])

// Debug: Watch for changes in currentDialogue
watch(() => props.currentDialogue, (newVal) => {
  console.log('DialogueSystem received currentDialogue:', newVal)
}, { immediate: true, deep: true })

watch(() => props.canContinue, (newVal) => {
  console.log('DialogueSystem received canContinue:', newVal)
}, { immediate: true })
</script>

<style scoped>
/* 整个对话框区域的容器 */
.dialogue-system-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  padding: 2rem;
  pointer-events: none; /* 允许穿透点击 */
}

/* 对话框主体 */
.dialogue-display-system {
  width: 100%;
  max-width: 900px; /* 控制对话框最大宽度 */
  pointer-events: auto; /* 恢复自身的点击事件 */
  position: relative;
}

/* 姓名牌样式 */
.speaker-name-plate {
  position: absolute;
  top: 0;
  left: 2rem;
  transform: translateY(-50%);
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(8px);
  color: #a5b4fc; /* 主题色 */
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  border: 1px solid rgba(165, 184, 252, 0.4);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* 对话内容区样式 */
.dialogue-content-display {
  background: rgba(30, 41, 59, 0.75); /* 更透明的背景 */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 12px;
  padding: 2rem;
  padding-top: 2.5rem; /* 为姓名牌留出空间 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.dialogue-text-area {
  font-size: 1.25rem;
  line-height: 1.8;
  color: #e2e8f0;
  min-height: 5rem;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7); /* 文字阴影，增强可读性 */
}

.typing-cursor {
  animation: cursorBlink 1s infinite;
  font-weight: bold;
  color: #a5b4fc;
}

@keyframes cursorBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 继续按钮 */
.dialogue-action-controls {
  text-align: right;
}

.continue-button {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-button:hover:not(:disabled) {
  color: white;
  transform: translateX(5px);
}

.continue-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* AI处理状态的样式 */
.ai-processing-display {
  width: 100%;
  max-width: 600px;
  pointer-events: auto;
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.processing-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.processing-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
}

.processing-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.processing-pulse {
  position: absolute;
  inset: -4px;
  border: 2px solid #a5b4fc;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

.processing-text {
  flex: 1;
}

.processing-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.processing-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e2e8f0;
}

.processing-model {
  font-size: 0.9rem;
  color: #a5b4fc;
  background: rgba(165, 184, 252, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(165, 184, 252, 0.3);
}

.processing-status {
  color: #94a3b8;
  margin-bottom: 1rem;
}

.processing-dots {
  display: flex;
  gap: 0.5rem;
}

.processing-dots span {
  width: 8px;
  height: 8px;
  background: #a5b4fc;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.processing-dots span:nth-child(1) { animation-delay: -0.32s; }
.processing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* User Input Interface (preserved for compatibility) */
.user-input-interface {
  width: 100%;
  max-width: 900px;
  pointer-events: auto;
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.input-header {
  margin-bottom: 1.5rem;
}

.input-prompt {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.prompt-icon {
  font-size: 2rem;
}

.prompt-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.prompt-subtitle {
  color: #94a3b8;
  font-size: 0.9rem;
}

.user-input-section {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.user-input-field {
  flex: 1;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  padding: 1rem;
  color: #e2e8f0;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
}

.user-input-field:focus {
  outline: none;
  border-color: #a5b4fc;
  box-shadow: 0 0 0 2px rgba(165, 184, 252, 0.2);
}

.submit-input-button {
  background: #a5b4fc;
  color: #1e293b;
  border: none;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-input-button:hover:not(:disabled) {
  background: #8b9cf7;
  transform: translateY(-2px);
}

.submit-input-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
