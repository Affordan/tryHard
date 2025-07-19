<template>
  <div class="dialogue-system">
    <!-- AI Processing State -->
    <div v-if="isAiProcessing" class="ai-processing-display">
      <div class="processing-header">
        <div class="processing-avatar">
          <img :src="activeCharacter?.characterImageURL" :alt="activeCharacter?.characterName" />
          <div class="processing-pulse"></div>
        </div>
        <div class="processing-information">
          <div class="processing-character-name">{{ activeCharacter?.characterName }}</div>
          <div class="processing-llm-info">{{ activeCharacter?.llmName }} 正在处理中...</div>
          <div class="processing-animation">
            <div class="processing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
        <div class="processing-progress-display">
          <div class="circular-progress">
            <svg class="progress-circle" width="70" height="70">
              <circle
                class="progress-track"
                cx="35"
                cy="35"
                r="30"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                stroke-width="4"
              />
              <circle
                class="progress-bar"
                cx="35"
                cy="35"
                r="30"
                fill="none"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
                :style="{ 
                  strokeDasharray: `${processingProgress * 1.88} 188`,
                  stroke: activeCharacter?.themeColor 
                }"
              />
            </svg>
            <div class="progress-percentage">{{ Math.round(processingProgress) }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialogue Display -->
    <div v-else-if="currentDialogue.text" class="dialogue-display-system">
      <div class="dialogue-header-section">
        <div class="speaker-identification">
          <div class="speaker-avatar">
            <img :src="activeCharacter?.characterImageURL" :alt="activeCharacter?.characterName" />
          </div>
          <div class="speaker-details">
            <div class="speaker-name">{{ activeCharacter?.characterName }}</div>
            <div class="speaker-llm">{{ activeCharacter?.llmName }}</div>
          </div>
        </div>
        
        <div class="dialogue-action-controls">
          <button 
            v-if="isTyping" 
            @click="$emit('skipTyping')" 
            class="action-button skip-button"
          >
            <span class="button-text">跳过</span>
            <span class="button-icon">⏭</span>
          </button>
          <button 
            v-else 
            @click="$emit('continueScene')" 
            class="action-button continue-button"
            :disabled="!canContinue"
          >
            <span class="button-text">继续</span>
            <span class="button-icon">▶</span>
          </button>
        </div>
      </div>

      <div class="dialogue-content-display">
        <div class="dialogue-text-area">
          <span
            v-for="(character, index) in displayedText"
            :key="`char-${index}`"
            class="dialogue-character"
            :class="{ 
              'character-highlight': index === displayedText.length - 1 && isTyping
            }"
            :style="{ 
              animationDelay: `${index * 0.025}s`,
              color: index === displayedText.length - 1 && isTyping ? activeCharacter?.themeColor : 'inherit'
            }"
          >{{ character }}</span>
          <span 
            v-if="isTyping" 
            class="typing-cursor"
            :style="{ color: activeCharacter?.themeColor }"
          >|</span>
        </div>
        
        <div class="dialogue-progress-info">
          <div class="scene-progress">
            场景 {{ currentSceneIndex + 1 }} / {{ totalScenes }}
          </div>
        </div>
      </div>
    </div>

    <!-- User Input Interface -->
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

    <!-- Debug fallback -->
    <div v-else class="debug-fallback">
      <h3>DialogueSystem Debug Info:</h3>
      <p>isAiProcessing: {{ isAiProcessing }}</p>
      <p>currentDialogue.text: "{{ currentDialogue?.text }}"</p>
      <p>showUserInterface: {{ showUserInterface }}</p>
      <p>Component is rendered but no condition matched</p>
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
.dialogue-system {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 50vh;
  min-height: 200px;
  /* Temporary debug background */
  background: rgba(255, 0, 0, 0.3);
  border: 5px solid red;
}

.ai-processing-display {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
  backdrop-filter: blur(30px);
  border-top: 4px solid var(--primary-color, #667eea);
  padding: 3rem;
}

.processing-header {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.processing-avatar {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--primary-color, #667eea);
}

.processing-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.processing-pulse {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 3px solid var(--primary-color, #667eea);
  border-radius: 50%;
  animation: processingPulse 2s ease-in-out infinite;
}

@keyframes processingPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.processing-information {
  flex: 1;
}

.processing-character-name {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--primary-color, #667eea);
}

.processing-llm-info {
  font-size: 1.2rem;
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.processing-animation {
  display: flex;
  align-items: center;
}

.processing-dots {
  display: flex;
  gap: 8px;
}

.processing-dots span {
  width: 12px;
  height: 12px;
  background: var(--primary-color, #667eea);
  border-radius: 50%;
  animation: processingDots 1.5s ease-in-out infinite;
}

.processing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.processing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes processingDots {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.2); }
}

.processing-progress-display {
  position: relative;
}

.circular-progress {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-percentage {
  position: absolute;
  font-size: 1rem;
  font-weight: bold;
  color: var(--primary-color, #667eea);
}

.dialogue-display-system {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
  backdrop-filter: blur(30px);
  border-top: 4px solid var(--primary-color, #667eea);
  padding: 2.5rem;
}

.dialogue-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.speaker-identification {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.speaker-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--primary-color, #667eea);
}

.speaker-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.speaker-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--primary-color, #667eea);
}

.speaker-llm {
  font-size: 1rem;
  opacity: 0.7;
}

.dialogue-action-controls {
  display: flex;
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.action-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialogue-content-display {
  margin-bottom: 1.5rem;
}

.dialogue-text-area {
  font-size: 1.3rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  min-height: 4rem;
}

.dialogue-character {
  display: inline;
  animation: characterAppear 0.1s ease-out forwards;
  opacity: 0;
}

@keyframes characterAppear {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.character-highlight {
  color: var(--primary-color, #667eea);
  text-shadow: 0 0 10px currentColor;
}

.typing-cursor {
  animation: cursorBlink 1s infinite;
  font-weight: bold;
}

@keyframes cursorBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.dialogue-progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  opacity: 0.7;
}

.user-input-interface {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
  backdrop-filter: blur(30px);
  border-top: 4px solid #667eea;
  padding: 2.5rem;
}

.input-header {
  margin-bottom: 2rem;
}

.input-prompt {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.prompt-icon {
  font-size: 2.5rem;
}

.prompt-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.prompt-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
}

.user-input-section {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
}

.user-input-field {
  flex: 1;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  color: white;
  font-size: 1.1rem;
  resize: vertical;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.user-input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.user-input-field::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.submit-input-button {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 15px;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.submit-input-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.submit-input-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.debug-fallback {
  background: rgba(255, 255, 0, 0.8);
  color: black;
  padding: 2rem;
  border: 3px solid orange;
  font-family: monospace;
}

.debug-fallback h3 {
  margin-top: 0;
  color: red;
}

.debug-fallback p {
  margin: 0.5rem 0;
}
</style>
