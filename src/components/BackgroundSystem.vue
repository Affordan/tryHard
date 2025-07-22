<template>
  <div class="background-system">
    <transition-group name="scene-fade" tag="div" class="background-layers">
      <div
        v-for="scene in sceneBackgrounds"
        :key="`scene-${scene.id}`"
        v-show="currentSceneId === scene.id"
        class="scene-layer"
        :style="{ backgroundImage: `url(${scene.backgroundImageURL})` }"
      >
        <div class="atmospheric-overlay" :class="`atmosphere-${scene.atmosphere}`"></div>
        <div v-if="scene.weatherEffect" class="weather-system">
          <div v-if="scene.weatherEffect === 'rain'" class="rain-system">
            <div 
              v-for="drop in 40" 
              :key="drop" 
              class="rain-drop" 
              :style="generateRainStyle(drop)"
            ></div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
defineProps({
  currentSceneId: String,
  sceneBackgrounds: Array
})

const generateRainStyle = (index) => {
  return {
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 2 + 's',
    animationDuration: (1.5 + Math.random() * 1.5) + 's'
  }
}
</script>

<style scoped>
.background-system {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-layers {
  position: relative;
  width: 100%;
  height: 100%;
}

.scene-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.scene-fade-enter-active,
.scene-fade-leave-active {
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.scene-fade-enter-from {
  opacity: 0;
  transform: scale(1.05);
}

.scene-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.atmospheric-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.atmosphere-mysterious {
  background: radial-gradient(circle at center, transparent 0%, rgba(44, 62, 80, 0.4) 100%);
}

.atmosphere-clinical {
  background: linear-gradient(135deg, rgba(116, 185, 255, 0.15) 0%, rgba(116, 185, 255, 0.05) 100%);
}

.weather-system {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.rain-system {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.rain-drop {
  position: absolute;
  width: 2px;
  height: 25px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.7), transparent);
  animation: rainDropFall linear infinite;
}

@keyframes rainDropFall {
  0% {
    transform: translateY(-100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) translateX(60px);
    opacity: 0;
  }
}
</style>
