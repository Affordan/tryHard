<template>
  <div class="control-panel">
    <button @click="$emit('goHome')" class="control-button" title="返回主页">
      🏠
    </button>
    <button @click="$emit('restart')" class="control-button" title="重新开始">
      🔄
    </button>
    <button
      @click="$emit('toggleAuto')"
      class="control-button"
      :class="{ 'auto-active': autoAdvance }"
      title="自动推进"
    >
      {{ autoAdvance ? '⏸' : '▶' }}
    </button>
    <button @click="$emit('showHistory')" class="control-button" title="历史记录">
      📜
    </button>
    <button @click="$emit('showSettings')" class="control-button" title="设置">
      ⚙️
    </button>
  </div>
</template>

<script setup>
defineProps({
  autoAdvance: Boolean
})

defineEmits(['goHome', 'restart', 'toggleAuto', 'showHistory', 'showSettings'])
</script>

<style scoped>
.control-panel {
  position: absolute;
  top: 25px;
  right: 25px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.control-button {
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.control-button:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.control-button.auto-active {
  background: rgba(102, 126, 234, 0.8);
  border-color: #667eea;
}
</style>
