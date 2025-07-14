<template>
  <div v-if="visible" class="dossier-overlay" @click="handleOverlayClick">
    <div class="dossier-container" @click.stop>
      <!-- 关闭按钮 -->
      <button class="close-button" @click="closeDossier">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- 书本主体 -->
      <div class="book-container" :class="{ 'book-opening': isOpening, 'book-open': isOpen }">
        <!-- 书脊中缝 -->
        <div class="book-spine"></div>
        
        <!-- 左页：核心档案 -->
        <div class="left-page">
          <div class="page-content">
            <!-- 剧本主视觉图 -->
            <div class="cover-section">
              <div class="cover-frame">
                <img 
                  :src="script.cover || '/placeholder.svg'" 
                  :alt="script.title"
                  class="cover-image"
                />
                <div class="photo-clip"></div>
              </div>
            </div>

            <!-- 标题与作者 -->
            <div class="title-section">
              <h1 class="script-title">{{ script.title }}</h1>
              <p class="script-author">{{ script.author }}</p>
            </div>

            <!-- 核心信息标签 -->
            <div class="info-stamps">
              <div class="stamp-item">
                <span class="stamp-label">案件密级：</span>
                <div class="difficulty-stars">
                  <span 
                    v-for="i in 5" 
                    :key="i" 
                    class="star"
                    :class="{ active: i <= script.difficulty }"
                  >★</span>
                </div>
              </div>
              
              <div class="stamp-item">
                <span class="stamp-label">探员人数：</span>
                <span class="stamp-value">{{ script.players }}</span>
              </div>
              
              <div class="stamp-item">
                <span class="stamp-label">预计时长：</span>
                <span class="stamp-value">{{ script.duration }}</span>
              </div>

              <!-- 标签戳 -->
              <div class="tag-stamps">
                <span 
                  v-for="tag in script.tags" 
                  :key="tag"
                  class="tag-stamp"
                >{{ tag }}</span>
              </div>
            </div>

            <!-- 行动召唤按钮 -->
            <div class="action-section">
              <button class="wax-seal-button" @click="startGame">
                <div class="seal-content">
                  <div class="flame-icon">🔥</div>
                  <span class="seal-text">封缄启程</span>
                </div>
                <div class="wax-effect"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- 右页：故事与角色 -->
        <div class="right-page">
          <div class="page-content">
            <!-- 故事简介 -->
            <div class="story-section">
              <h2 class="section-title">故事简介</h2>
              <div class="story-content" :class="{ 'show-character': hoveredCharacter }">
                <p v-if="!hoveredCharacter" class="story-text">
                  <span class="drop-cap">{{ getFirstChar(script.description) }}</span>{{ getRestText(script.description) }}
                </p>
                <div v-else class="character-detail">
                  <h3 class="character-name">{{ hoveredCharacter.name }}</h3>
                  <p class="character-description">{{ hoveredCharacter.description }}</p>
                </div>
              </div>
            </div>

            <!-- 角色列表 -->
            <div class="characters-section">
              <h3 class="characters-title">人物档案</h3>
              <div class="character-photos">
                <div 
                  v-for="character in script.characters" 
                  :key="character.name"
                  class="character-photo"
                  @mouseenter="hoveredCharacter = character"
                  @mouseleave="hoveredCharacter = null"
                >
                  <img 
                    :src="character.avatar || '/placeholder.svg'" 
                    :alt="character.name"
                    class="character-avatar"
                  />
                  <div class="photo-pin"></div>
                  <span class="character-label">{{ character.name }}</span>
                </div>
              </div>
            </div>

            <!-- 页码 -->
            <div class="page-number">02</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 接口定义
interface Script {
  id: string
  title: string
  cover: string
  category: string
  tags: string[]
  players: string
  difficulty: number
  duration: string
  description: string
  author: string
  characters: {
    name: string
    avatar: string
    description: string
  }[]
}

// Props
const props = defineProps<{
  script: Script | null
  visible: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
  startGame: [script: Script]
}>()

// 响应式数据
const isOpening = ref(false)
const isOpen = ref(false)
const hoveredCharacter = ref<{ name: string; avatar: string; description: string } | null>(null)

// 监听visible变化，触发动画
watch(() => props.visible, (newVisible) => {
  if (newVisible && props.script) {
    isOpening.value = true
    setTimeout(() => {
      isOpening.value = false
      isOpen.value = true
    }, 800) // 动画持续时间
  } else {
    isOpen.value = false
    isOpening.value = false
  }
})

// 方法
const handleOverlayClick = () => {
  closeDossier()
}

const closeDossier = () => {
  isOpen.value = false
  setTimeout(() => {
    emit('close')
  }, 500) // 关闭动画时间
}

const startGame = () => {
  if (props.script) {
    emit('startGame', props.script)
  }
}

const getFirstChar = (text: string) => {
  return text.charAt(0)
}

const getRestText = (text: string) => {
  return text.slice(1)
}
</script>

<style scoped>
/* 导入字体 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap');

/* 遮罩层 */
.dossier-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 档案容器 */
.dossier-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

/* 关闭按钮 */
.close-button {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 40px;
  height: 40px;
  background: rgba(139, 69, 19, 0.9);
  border: 2px solid #8B4513;
  border-radius: 50%;
  color: #F5E6D3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.close-button:hover {
  background: rgba(160, 82, 45, 0.9);
  transform: scale(1.1);
}

.close-button svg {
  width: 20px;
  height: 20px;
}

/* 书本容器 */
.book-container {
  display: flex;
  width: 1200px;
  height: 800px;
  position: relative;
  transform-style: preserve-3d;
  perspective: 2000px;
}

/* 书本打开动画 */
.book-container.book-opening {
  animation: bookOpening 0.8s ease-out forwards;
}

.book-container.book-open {
  transform: rotateY(0deg);
}

@keyframes bookOpening {
  0% {
    transform: scale(0.3) rotateY(-15deg);
    opacity: 0;
  }
  50% {
    transform: scale(0.7) rotateY(-8deg);
    opacity: 0.7;
  }
  100% {
    transform: scale(1) rotateY(0deg);
    opacity: 1;
  }
}

/* 书脊中缝 */
.book-spine {
  position: absolute;
  left: 50%;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom,
    rgba(139, 69, 19, 0.8) 0%,
    rgba(160, 82, 45, 0.6) 50%,
    rgba(139, 69, 19, 0.8) 100%);
  transform: translateX(-50%);
  box-shadow:
    -2px 0 4px rgba(0, 0, 0, 0.3),
    2px 0 4px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

/* 页面基础样式 */
.left-page, .right-page {
  width: 50%;
  height: 100%;
  position: relative;
  background:
    radial-gradient(circle at 20% 80%, rgba(245, 230, 211, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(222, 184, 135, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%);
  box-shadow: inset 0 0 50px rgba(139, 69, 19, 0.1);
}

.left-page {
  border-radius: 12px 0 0 12px;
  border-right: 1px solid rgba(139, 69, 19, 0.2);
}

.right-page {
  border-radius: 0 12px 12px 0;
  border-left: 1px solid rgba(139, 69, 19, 0.2);
}

/* 页面内容 */
.page-content {
  padding: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Noto Serif SC', serif;
  color: #3C2415;
}

/* 左页样式 */
.cover-section {
  text-align: center;
  margin-bottom: 30px;
}

.cover-frame {
  position: relative;
  display: inline-block;
  width: 200px;
  height: 280px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(139, 69, 19, 0.2);
  filter: sepia(10%) contrast(1.1);
}

/* 照片夹子效果 */
.photo-clip {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 40px;
  background: linear-gradient(45deg, #C0C0C0, #E8E8E8);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transform: rotate(15deg);
}

.photo-clip::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 30px;
  background: #999;
  transform: translate(-50%, -50%);
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 30px;
}

.script-title {
  font-size: 28px;
  font-weight: 700;
  color: #2C1810;
  margin: 0 0 8px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

.script-author {
  font-size: 16px;
  color: #8B4513;
  margin: 0;
  font-style: italic;
}

/* 信息标签区域 */
.info-stamps {
  margin-bottom: 40px;
}

.stamp-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
}

.stamp-label {
  color: #5D4037;
  margin-right: 8px;
  font-weight: 600;
}

.stamp-value {
  color: #3C2415;
  background: rgba(139, 69, 19, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px dashed rgba(139, 69, 19, 0.3);
}

/* 难度星级 */
.difficulty-stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #DDD;
  font-size: 16px;
  transition: color 0.3s ease;
}

.star.active {
  color: #D4AF37;
  text-shadow: 0 0 4px rgba(212, 175, 55, 0.5);
}

/* 标签戳 */
.tag-stamps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag-stamp {
  background: radial-gradient(circle, rgba(220, 20, 60, 0.8) 0%, rgba(139, 0, 0, 0.9) 100%);
  color: #F5E6D3;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: rotate(-2deg);
  transition: transform 0.3s ease;
}

.tag-stamp:nth-child(even) {
  transform: rotate(1deg);
}

.tag-stamp:hover {
  transform: rotate(0deg) scale(1.05);
}

/* 行动按钮区域 */
.action-section {
  margin-top: auto;
  text-align: center;
}

.wax-seal-button {
  position: relative;
  width: 120px;
  height: 120px;
  border: none;
  border-radius: 50%;
  background: radial-gradient(circle, #8B0000 0%, #DC143C  50%, #8B0000 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
}

.wax-seal-button:hover {
  transform: scale(1.05);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}

.wax-seal-button:active {
  transform: scale(0.95);
}

.seal-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #F5E6D3;
}

.flame-icon {
  font-size: 24px;
  margin-bottom: 4px;
  animation: flicker 2s infinite alternate;
}

@keyframes flicker {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.seal-text {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
}

.wax-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

/* 右页样式 */
.story-section {
  flex: 1;
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2C1810;
  margin: 0 0 20px 0;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: linear-gradient(to right, transparent, #8B4513, transparent);
}

.story-content {
  position: relative;
  min-height: 200px;
}

.story-text {
  font-size: 16px;
  line-height: 1.8;
  color: #3C2415;
  margin: 0;
  text-align: justify;
  text-indent: 0;
}

/* 首字下沉效果 */
.drop-cap {
  float: left;
  font-size: 72px;
  line-height: 60px;
  padding-right: 8px;
  padding-top: 4px;
  font-weight: 700;
  color: #8B4513;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

/* 角色详情显示 */
.character-detail {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(245, 230, 211, 0.9);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(139, 69, 19, 0.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.character-name {
  font-size: 18px;
  font-weight: 600;
  color: #2C1810;
  margin: 0 0 12px 0;
  text-align: center;
}

.character-description {
  font-size: 14px;
  line-height: 1.6;
  color: #5D4037;
  margin: 0;
  text-align: justify;
}

/* 角色区域 */
.characters-section {
  margin-bottom: 20px;
}

.characters-title {
  font-size: 16px;
  font-weight: 600;
  color: #2C1810;
  margin: 0 0 16px 0;
  text-align: center;
}

.character-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.character-photo {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.character-photo:hover {
  transform: scale(1.05) rotate(2deg);
}

.character-avatar {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 0 0 2px rgba(245, 230, 211, 0.8);
  filter: sepia(20%) contrast(1.1);
}

/* 图钉效果 */
.photo-pin {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, #C0C0C0 0%, #808080 100%);
  border-radius: 50%;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.character-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #5D4037;
  white-space: nowrap;
  background: rgba(245, 230, 211, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

/* 页码 */
.page-number {
  position: absolute;
  bottom: 20px;
  right: 30px;
  font-size: 14px;
  color: #8B4513;
  font-weight: 600;
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .book-container {
    width: 1000px;
    height: 700px;
  }

  .cover-frame {
    width: 160px;
    height: 220px;
  }

  .script-title {
    font-size: 24px;
  }
}

@media (max-width: 1200px) {
  .book-container {
    width: 900px;
    height: 600px;
  }

  .page-content {
    padding: 30px;
  }

  .cover-frame {
    width: 140px;
    height: 200px;
  }

  .script-title {
    font-size: 22px;
  }

  .wax-seal-button {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 1024px) {
  .book-container {
    flex-direction: column;
    width: 600px;
    height: 800px;
  }

  .left-page, .right-page {
    width: 100%;
    height: 50%;
  }

  .left-page {
    border-radius: 12px 12px 0 0;
    border-right: none;
    border-bottom: 1px solid rgba(139, 69, 19, 0.2);
  }

  .right-page {
    border-radius: 0 0 12px 12px;
    border-left: none;
    border-top: 1px solid rgba(139, 69, 19, 0.2);
  }

  .book-spine {
    left: 0;
    top: 50%;
    width: 100%;
    height: 4px;
    transform: translateY(-50%);
  }

  .page-content {
    padding: 20px;
  }

  .cover-section {
    margin-bottom: 20px;
  }

  .cover-frame {
    width: 120px;
    height: 160px;
  }

  .info-stamps {
    margin-bottom: 20px;
  }

  .story-content {
    min-height: 120px;
  }
}

@media (max-width: 768px) {
  .dossier-container {
    max-width: 95vw;
    max-height: 95vh;
  }

  .book-container {
    width: 500px;
    height: 700px;
  }

  .page-content {
    padding: 16px;
  }

  .script-title {
    font-size: 20px;
  }

  .drop-cap {
    font-size: 48px;
    line-height: 40px;
  }

  .character-photos {
    gap: 12px;
  }

  .character-avatar {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .book-container {
    width: 400px;
    height: 600px;
  }

  .page-content {
    padding: 12px;
  }

  .cover-frame {
    width: 100px;
    height: 140px;
  }

  .script-title {
    font-size: 18px;
  }

  .wax-seal-button {
    width: 80px;
    height: 80px;
  }

  .flame-icon {
    font-size: 18px;
  }

  .seal-text {
    font-size: 10px;
  }
}
</style>
