<template>
  <div v-if="visible" class="history-modal-overlay" @click="$emit('close')">
    <div class="history-modal-content" @click.stop>
      <h3 class="history-modal-title">剧本历史记录</h3>
      <div class="history-timeline-display">
        <div
          v-for="(historyItem, index) in history"
          :key="index"
          class="history-timeline-item"
        >
          <div class="history-scene-number">{{ index + 1 }}</div>
          <div class="history-character-avatar">
            <img :src="historyItem.character.characterImageURL" :alt="historyItem.character.characterName" />
          </div>
          <div class="history-content-section">
            <div class="history-speaker-info">
              <span class="history-character-name">{{ historyItem.character.characterName }}</span>
              <span class="history-llm-name">({{ historyItem.character.llmName }})</span>
            </div>
            <div class="history-dialogue-text">{{ historyItem.dialogueText }}</div>
            <div class="history-timestamp">{{ formatTimestamp(historyItem.timestamp) }}</div>
          </div>
        </div>
      </div>
      <button @click="$emit('close')" class="history-close-button">关闭</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  history: Array
})

defineEmits(['close'])

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<style scoped>
.history-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(15px);
}

.history-modal-content {
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(0, 0, 0, 0.95));
  border-radius: 30px;
  padding: 3rem;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  color: white;
  border: 4px solid rgba(255, 215, 0, 0.4);
  backdrop-filter: blur(30px);
}

.history-modal-title {
  text-align: center;
  margin-bottom: 2.5rem;
  font-size: 2.5rem;
  color: #ffd93d;
  font-weight: bold;
}

.history-timeline-display {
  max-height: 550px;
  overflow-y: auto;
  margin-bottom: 2.5rem;
}

.history-timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 25px;
  border-left: 6px solid #ffd93d;
  transition: all 0.4s ease;
}

.history-timeline-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(8px);
}

.history-scene-number {
  background: #ffd93d;
  color: #333;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  flex-shrink: 0;
}

.history-character-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.history-character-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-content-section {
  flex: 1;
}

.history-speaker-info {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1rem;
}

.history-character-name {
  font-weight: bold;
  color: #ffd93d;
  font-size: 1.2rem;
}

.history-llm-name {
  font-size: 1rem;
  opacity: 0.75;
}

.history-dialogue-text {
  line-height: 1.7;
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
}

.history-timestamp {
  font-size: 0.9rem;
  opacity: 0.6;
}

.history-close-button {
  display: block;
  margin: 0 auto;
  padding: 1.2rem 3rem;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: none;
  border-radius: 35px;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.4s ease;
  font-size: 1.2rem;
}

.history-close-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.5);
}
</style>
