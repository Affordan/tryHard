<template>
  <div class="character-panel">
    <transition name="character-slide" mode="out-in">
      <div
        v-if="activeCharacter"
        :key="activeCharacter.characterId"
        class="character-container"
        :class="`character-theme-${activeCharacter.characterId}`"
        :style="{ '--primary-color': activeCharacter.themeColor }"
      >
        <div class="character-portrait-section">
          <div class="portrait-frame">
            <img
              :src="activeCharacter.characterImageURL"
              :alt="activeCharacter.characterName"
              class="character-portrait"
              :class="{ 'speaking-state': isCharacterSpeaking }"
            />
            <div 
              class="character-glow" 
              :style="{ '--glow-color': activeCharacter.themeColor }"
            ></div>
            <div v-if="isCharacterSpeaking" class="speaking-indicators">
              <div class="sound-visualization">
                <div 
                  v-for="bar in 6" 
                  :key="bar" 
                  class="sound-bar" 
                  :style="{ animationDelay: `${bar * 0.1}s` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="character-info-panel">
          <h2 class="character-name-display">
            {{ activeCharacter.characterName }}
          </h2>
          <div class="character-role">
            {{ activeCharacter.characterRole }}
          </div>
          <div class="llm-information-badge">
            <div class="llm-badge" :class="`llm-${activeCharacter.llmProvider.toLowerCase()}`">
              <div class="llm-icon-container">
                <span class="llm-icon">{{ getLLMIcon(activeCharacter.llmProvider) }}</span>
              </div>
              <div class="llm-details">
                <div class="llm-name-display">{{ activeCharacter.llmName }}</div>
                <div class="llm-provider-display">{{ activeCharacter.llmProvider }}</div>
              </div>
              <div class="llm-status-indicator" :class="{ 'active': isAiProcessing }">
                <div class="status-dot"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  activeCharacter: Object,
  isCharacterSpeaking: Boolean,
  isAiProcessing: Boolean
})

const getLLMIcon = (provider) => {
  const iconMap = {
    'DeepSeek': '🧠',
    'OpenAI': '🤖',
    'Alibaba': '🔮',
    'Anthropic': '🎭',
    'Google': '🌟'
  }
  return iconMap[provider] || '🤖'
}
</script>

<style scoped>
.character-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 450px;
  height: 100%;
  z-index: 10;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 70%, transparent 100%);
  backdrop-filter: blur(20px);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.character-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.character-slide-enter-active,
.character-slide-leave-active {
  transition: all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.character-slide-enter-from {
  opacity: 0;
  transform: translateX(-120px) scale(0.8);
}

.character-slide-leave-to {
  opacity: 0;
  transform: translateX(120px) scale(1.2);
}

.character-portrait-section {
  position: relative;
  margin-bottom: 2.5rem;
}

.portrait-frame {
  position: relative;
  width: 320px;
  height: 480px;
}

.character-portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 25px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.7);
  transition: all 0.4s ease;
}

.character-portrait.speaking-state {
  transform: scale(1.03);
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.9), 0 0 40px var(--primary-color, #667eea);
}

.character-glow {
  position: absolute;
  top: -25px;
  left: -25px;
  right: -25px;
  bottom: -25px;
  background: radial-gradient(circle, var(--glow-color, #667eea) 0%, transparent 70%);
  border-radius: 35px;
  opacity: 0.4;
  z-index: -1;
  animation: characterGlowPulse 4s ease-in-out infinite;
}

@keyframes characterGlowPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.04); }
}

.speaking-indicators {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
}

.sound-visualization {
  display: flex;
  gap: 5px;
  align-items: end;
}

.sound-bar {
  width: 6px;
  height: 20px;
  background: linear-gradient(to top, var(--primary-color, #667eea), rgba(255, 255, 255, 0.8));
  border-radius: 3px;
  animation: soundBarAnimation 1.5s ease-in-out infinite;
}

@keyframes soundBarAnimation {
  0%, 100% { height: 8px; opacity: 0.6; }
  50% { height: 25px; opacity: 1; }
}

.character-info-panel {
  width: 100%;
}

.character-name-display {
  font-size: 2.4rem;
  font-weight: bold;
  margin-bottom: 0.8rem;
  color: var(--primary-color, #667eea);
  text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
}

.character-role {
  font-size: 1.4rem;
  opacity: 0.85;
  margin-bottom: 2.5rem;
  font-weight: 500;
}

.llm-information-badge {
  margin-bottom: 2.5rem;
}

.llm-badge {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 25px;
  padding: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  transition: all 0.4s ease;
}

.llm-icon-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-color, #667eea);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.llm-details {
  flex: 1;
}

.llm-name-display {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.llm-provider-display {
  font-size: 1rem;
  opacity: 0.7;
}

.llm-status-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: relative;
}

.status-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #666;
  transition: all 0.4s ease;
}

.llm-status-indicator.active .status-dot {
  background: #00ff88;
  box-shadow: 0 0 20px #00ff88;
  animation: statusPulseAnimation 2.5s ease-in-out infinite;
}

@keyframes statusPulseAnimation {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.character-theme-detective {
  --primary-color: #2c3e50;
}

.character-theme-doctor_gpt {
  --primary-color: #74b9ff;
}

.character-theme-doctor_qwen {
  --primary-color: #ff6b6b;
}
</style>
