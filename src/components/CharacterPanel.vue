<template>
  <div class="character-portrait-stage">
    <transition name="character-fade">
      <div v-if="activeCharacter" :key="activeCharacter.characterId" class="character-container">
        <img
          :src="activeCharacter.portraitImageURL"
          :alt="activeCharacter.characterName"
          class="character-portrait"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

// 保持 props 定义，它只需要知道当前活跃角色即可
const props = defineProps<{
  activeCharacter: any | null;
}>();

// 添加监听器来调试角色切换
watch(() => props.activeCharacter, (newCharacter) => {
  if (newCharacter) {
    console.log(`[CharacterPanel] Switching to character: ${newCharacter.characterName}, Portrait: ${newCharacter.portraitImageURL}`);
  } else {
    console.log('[CharacterPanel] No active character');
  }
}, { immediate: true });
</script>

<style scoped>
.character-portrait-stage {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  justify-content: center; /* 或者 'flex-start' 靠左, 'flex-end' 靠右 */
  align-items: flex-end;
  pointer-events: none; /* 允许点击穿透 */
  z-index: 5; /* 确保在背景之上，对话框之下 */
}

.character-container {
  position: absolute;
  bottom: 0;
  left: 5%; /* 控制人物在屏幕左侧的位置 */
}

.character-portrait {
  max-height: 90vh; /* 人物最高占屏幕高度的90% */
  max-width: 600px; /* 防止图片过大 */
  object-fit: contain;
  object-position: bottom center;
}

/* 人物出现和消失的淡入淡出动画 */
.character-fade-enter-active,
.character-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.character-fade-enter-from,
.character-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
