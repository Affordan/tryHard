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

/* 复古档案风格控制按钮 */
.control-button {
  width: 60px;
  height: 60px;
  /* 复古纸质卡片背景 */
  background:
    linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%),
    url('/background.png') center/cover;
  /* 档案文件边框效果 */
  border: 2px solid rgba(139, 69, 19, 0.4);
  border-radius: 8px;
  color: #2C1810;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  /* 纸质阴影和纹理 */
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -1px 2px rgba(139, 69, 19, 0.1);
  /* 档案标签质感 */
  position: relative;
  font-family: 'Courier New', 'Monaco', monospace;
}

/* 纸质纹理叠加 */
.control-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 30% 30%, rgba(139, 69, 19, 0.05) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 70%, rgba(139, 69, 19, 0.03) 0%, transparent 50%);
  border-radius: 6px;
  pointer-events: none;
}

.control-button:hover {
  background:
    linear-gradient(135deg, #F0E1CE 0%, #E3D0B2 100%),
    url('/background.png') center/cover;
  transform: translateY(-2px);
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.4),
    inset 0 -1px 2px rgba(139, 69, 19, 0.15);
  border-color: rgba(139, 69, 19, 0.6);
}

.control-button.auto-active {
  background:
    linear-gradient(135deg, #DCC5A0 0%, #D4B896 100%),
    url('/background.png') center/cover;
  border-color: #8B4513;
  color: #5D4037;
  /* 激活状态的印章效果 */
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(139, 69, 19, 0.2),
    inset 0 -2px 4px rgba(255, 255, 255, 0.1);
}
</style>
