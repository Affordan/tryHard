<template>
  <div class="scene-transition-overlay" :class="{ 'transition-active': isTransitioning }">
    <div class="transition-content-display">
      <div class="transition-character-preview">
        <img 
          v-if="nextCharacter" 
          :src="nextCharacter.characterImageURL" 
          :alt="nextCharacter.characterName" 
        />
        <div 
          class="transition-character-glow" 
          :style="{ '--transition-glow': nextCharacter?.themeColor }"
        ></div>
      </div>
      <div class="transition-information-display">
        <h3 class="transition-character-name">{{ nextCharacter?.characterName }}</h3>
        <p class="transition-llm-name">{{ nextCharacter?.llmName }}</p>
        <div class="transition-provider-name">{{ nextCharacter?.llmProvider }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isTransitioning: Boolean,
  nextCharacter: Object
})
</script>

<style scoped>
.scene-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.8s ease;
}

.scene-transition-overlay.transition-active {
  opacity: 1;
  pointer-events: all;
}

.transition-content-display {
  text-align: center;
  color: white;
}

.transition-character-preview {
  position: relative;
  width: 280px;
  height: 400px;
  margin: 0 auto 2.5rem;
  border-radius: 25px;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.transition-character-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.transition-character-glow {
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  background: radial-gradient(circle, var(--transition-glow, #667eea) 0%, transparent 70%);
  border-radius: 30px;
  opacity: 0.7;
  z-index: -1;
  animation: transitionGlowAnimation 2.5s ease-in-out infinite;
}

@keyframes transitionGlowAnimation {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}

.transition-information-display {
  animation: transitionSlideUpAnimation 1s ease-out;
}

@keyframes transitionSlideUpAnimation {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.transition-character-name {
  font-size: 2.8rem;
  font-weight: bold;
  margin-bottom: 0.8rem;
  color: var(--transition-glow, #667eea);
}

.transition-llm-name {
  font-size: 1.5rem;
  opacity: 0.85;
  margin-bottom: 0.6rem;
}

.transition-provider-name {
  font-size: 1.2rem;
  opacity: 0.65;
}
</style>
