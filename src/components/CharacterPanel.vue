<template>
  <div class="character-portrait-stage">
    <transition name="character-slide-in">
      <div v-if="activeCharacter" :key="activeCharacter.characterId" class="character-container">
        <img
          :src="activeCharacter.portraitImageURL"
          :alt="activeCharacter.characterName"
          class="character-portrait"
          :style="{ '--glow-color': activeCharacter.themeColor || '#a5b4fc' }"
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

// 监听角色切换（用于调试，可在生产环境中移除）
watch(() => props.activeCharacter, (newCharacter) => {
  if (newCharacter) {
    console.log(`[CharacterPanel] Switching to character: ${newCharacter.characterName}, Portrait: ${newCharacter.portraitImageURL}`);
  }
}, { immediate: true });
</script>

<style scoped>
.character-portrait-stage {
  position: absolute;
  inset: 0; /* 铺满整个父容器 */
  overflow: hidden; /* 防止动画溢出 */
  display: flex;
  align-items: flex-end; /* 所有内容底部对齐 */
  pointer-events: none;
  z-index: 5;
}

.character-container {
  position: absolute;
  bottom: -2%; /* 1. 调整位置: 让人物稍微"走出"画面底部 */
  left: -5%;  /* 1. 调整位置: 向左偏移，打破居中 */
  transform: translateX(0);
}

.character-portrait {
  max-height: 76vh; /* 缩小到80%: 95vh * 0.8 = 76vh */
  max-width: 560px; /* 缩小到80%: 700px * 0.8 = 560px */
  object-fit: contain;
  object-position: bottom center;

  /* 原始样式，无特效 */
}

/* 4. 更丝滑的入场动画 */
.character-slide-in-enter-active,
.character-slide-in-leave-active {
  transition: all 0.7s cubic-bezier(0.25, 1, 0.5, 1); /* 使用缓出曲线 */
}

.character-slide-in-enter-from,
.character-slide-in-leave-to {
  opacity: 0;
  transform: translateX(-50px); /* 从更左边滑入 */
}

/* 呼吸动画的定义 */
@keyframes subtle-breathing {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01); /* 极其细微的放大 */
  }
  100% {
    transform: scale(1);
  }
}
</style>
