<template>
  <div class="game-wait-container">
    <!-- Animated Background -->
    <div class="background-overlay">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>
      <div class="bg-gradient-overlay"></div>
    </div>

    <div class="main-content">
        <!-- Dynamic Animated Title -->
        <div class="title-section">
          <h1 class="main-title">
            夏洛克·福尔摩斯
          </h1>
          <h2 class="sub-title">
            {{ scriptId ? `剧本 ${scriptId}` : '雨夜杀机' }}
          </h2>
          <div class="title-divider"></div>
        </div>

        <!-- Typewriter Synopsis -->
        <div class="synopsis-container">
          <div class="synopsis-card">
            <p class="synopsis-text">
              {{ displayText }}
              <span class="cursor">|</span>
            </p>
          </div>
        </div>

        <!-- Match Success Status -->
        <div v-if="matchStatus === 'success'" class="match-success">
          <p class="success-text">匹配成功</p>
        </div>

        <!-- Player Slots -->
        <div class="players-container">
          <div
            v-for="player in players"
            :key="player.id"
            class="player-slot"
          >
            <div
              :class="[
                'player-card',
                getSlotStyleClass(player)
              ]"
            >
              <div v-if="player.status !== 'empty'" class="player-avatar-wrapper">
                <div class="player-avatar">
                  <img
                    :src="player.avatar || '/placeholder.svg'"
                    :alt="player.name"
                    class="avatar-image"
                    @error="handleImageError"
                  />
                </div>
                <div
                  v-if="player.status === 'confirmed'"
                  class="status-indicator confirmed"
                >
                  <CheckIcon class="check-icon" />
                </div>
              </div>
              <div v-else class="empty-slot">
                <UserIcon class="empty-icon" />
                <p class="empty-text">等待加入</p>
              </div>
            </div>
            <div class="player-info">
              <p :class="['player-name', player.isCurrentUser ? 'current-user' : '']">{{ player.name }}</p>
              <p v-if="player.status === 'confirmed'" class="player-status">已确认</p>
            </div>
          </div>
        </div>

        <!-- Dynamic Taglines -->
        <div class="taglines-section">
          <div class="tagline-container">
            <p
              :key="currentTagline"
              class="tagline-text"
            >
              {{ taglines[currentTagline] }}
            </p>
          </div>
          <div class="tagline-indicators">
            <div
              v-for="(_, index) in taglines"
              :key="index"
              :class="[
                'indicator-dot',
                index === currentTagline ? 'active' : ''
              ]"
            />
          </div>
        </div>

        <!-- Match Status and Confirmation Info - Bottom -->
        <div class="status-container">
          <!-- Waiting State -->
          <div
            v-if="matchStatus === 'waiting'"
            class="status-card waiting"
          >
            <div class="status-content">
              <div class="status-motto">细节决定成败</div>
              <div class="status-count">{{ confirmedCount }}/5</div>
              <div class="status-description">
                {{ confirmedCount === 5 ? '所有玩家已确认' : `等待 ${5 - confirmedCount} 名AI玩家加入` }}
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${(confirmedCount / 5) * 100}%` }"
                ></div>
              </div>
              <!-- 取消等待按钮 -->
              <div class="cancel-button-container">
                <button
                  @click="goToHome"
                  class="cancel-button"
                >
                  取消等待
                </button>
              </div>
            </div>
          </div>

          <!-- Success State -->
          <div
            v-else-if="matchStatus === 'success'"
            class="status-card success"
          >
            <div class="status-content">
              <div class="success-title">匹配成功！</div>
              <div class="success-count">5/5 玩家已确认</div>
              <div class="success-message">游戏即将开始...</div>
              <div class="loading-spinner-container">
                <div class="loading-spinner"></div>
              </div>
            </div>
          </div>

          <!-- Failed State -->
          <div
            v-else-if="matchStatus === 'failed'"
            class="status-card failed"
          >
            <div class="status-content">
              <div class="failed-title">匹配失败</div>
              <div class="failed-count">{{ confirmedCount }}/5 玩家确认</div>
              <div class="failed-message">超时未满员，5秒后返回主页</div>
              <div class="failed-button-container">
                <button
                  @click="goToHome"
                  class="failed-button"
                >
                  立即返回
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User as UserIcon, Check as CheckIcon } from 'lucide-vue-next'

// 路由相关
const route = useRoute()
const router = useRouter()

// 获取路由参数中的剧本ID
const scriptId = computed(() => route.params.scriptId)

// Reactive data
const players = ref([
  {
    id: 0,
    status: 'confirmed',
    name: 'You',
    avatar: '/placeholder.svg',
    isCurrentUser: true,
  },
  ...Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    status: 'empty'
  })),
])

const countdown = ref(30)
const matchStatus = ref('waiting')
const currentTagline = ref(0)
const usedNames = ref([])
const displayText = ref('')
const currentIndex = ref(0)

// Constants
const taglines = [
  '冷静推理',
  '不放过任何一个蛛丝马迹',
  '真相只有一个',
  '逻辑是最强的武器',
  '细节决定成败',
  '观察入微，推理精准',
  '智慧与勇气并存',
]

const aiPlayerNames = ['qwen', 'openai', 'kimi', 'deepseek']

const fullText = `"The rain lashed against the windows, mirroring the storm in my gut." 在这个阴雨绵绵的夜晚，贝克街221B号再次迎来了一个扑朔迷离的案件。一位神秘的访客在暴风雨中消失，留下的只有血迹和未解的谜团。`

// Computed properties
const confirmedCount = computed(() => 
  players.value.filter(p => p.status === 'confirmed').length
)

// Methods
const getRandomAIName = () => {
  const availableNames = aiPlayerNames.filter(name => !usedNames.value.includes(name))
  if (availableNames.length === 0) return 'AI Player'
  const randomName = availableNames[Math.floor(Math.random() * availableNames.length)]
  usedNames.value.push(randomName)
  return randomName
}

const getSlotStyleClass = (player) => {
  switch (player.status) {
    case 'empty':
      return 'empty'
    case 'joining':
      return 'joining'
    case 'confirmed':
      if (player.isCurrentUser) {
        return 'confirmed current-user'
      }
      return 'confirmed'
    default:
      return 'empty'
  }
}



const handleImageError = (event) => {
  event.target.src = '/placeholder.svg'
}

// 跳转到游戏界面的方法
const startGame = () => {
  if (scriptId.value) {
    router.push({
      name: 'game',
      params: { scriptId: scriptId.value }
    })
  } else {
    // 如果没有剧本ID，跳转到默认游戏界面
    router.push({ name: 'game' })
  }
}

// 返回主页的方法
const goToHome = () => {
  router.push('/')
}

// Intervals
let taglineInterval = null
let playerJoinInterval = null
let playerConfirmInterval = null
let countdownInterval = null
let typewriterInterval = null

// Lifecycle hooks
onMounted(() => {
  // Typewriter effect
  const startTypewriter = () => {
    if (currentIndex.value < fullText.length) {
      typewriterInterval = setTimeout(() => {
        displayText.value = fullText.slice(0, currentIndex.value + 1)
        currentIndex.value++
        startTypewriter()
      }, 50)
    }
  }
  startTypewriter()

  // Rotate taglines
  taglineInterval = setInterval(() => {
    currentTagline.value = (currentTagline.value + 1) % taglines.length
  }, 3000)

  // Simulate players joining
  playerJoinInterval = setInterval(() => {
    const emptySlots = players.value.filter(p => p.status === 'empty' && !p.isCurrentUser)
    if (emptySlots.length > 0 && Math.random() > 0.65) {
      const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)]
      const aiName = getRandomAIName()
      
      players.value = players.value.map(p =>
        p.id === randomSlot.id
          ? {
              ...p,
              status: 'joining',
              name: aiName,
              avatar: `/placeholder.svg`,
            }
          : p
      )
    }
  }, 1800)

  // Auto-confirm joining players
  playerConfirmInterval = setInterval(() => {
    const joiningSlots = players.value.filter(p => p.status === 'joining' && !p.isCurrentUser)
    if (joiningSlots.length > 0 && Math.random() > 0.4) {
      const randomSlot = joiningSlots[Math.floor(Math.random() * joiningSlots.length)]
      players.value = players.value.map(p =>
        p.id === randomSlot.id ? { ...p, status: 'confirmed' } : p
      )
    }
  }, 2000)

  // Countdown timer
  const startCountdown = () => {
    if (countdown.value > 0 && matchStatus.value === 'waiting') {
      countdownInterval = setTimeout(() => {
        countdown.value--
        startCountdown()
      }, 1000)
    } else if (countdown.value === 0 && matchStatus.value === 'waiting') {
      const confirmed = players.value.filter(p => p.status === 'confirmed').length
      matchStatus.value = confirmed === 5 ? 'success' : 'failed'
      // 处理匹配结果
      handleMatchStatusChange()
    }
  }
  startCountdown()

  // Watch for all players confirmed
  const checkAllConfirmed = () => {
    const confirmed = players.value.filter(p => p.status === 'confirmed').length
    if (confirmed === 5 && matchStatus.value === 'waiting') {
      matchStatus.value = 'success'
      // 匹配成功后延迟3秒跳转到游戏界面
      setTimeout(() => {
        startGame()
      }, 3000)
    }
    if (matchStatus.value === 'waiting') {
      setTimeout(checkAllConfirmed, 500)
    }
  }
  checkAllConfirmed()

  // 监听匹配状态变化，处理自动跳转
  const handleMatchStatusChange = () => {
    if (matchStatus.value === 'success') {
      // 匹配成功后延迟3秒跳转
      setTimeout(() => {
        startGame()
      }, 3000)
    } else if (matchStatus.value === 'failed') {
      // 匹配失败后延迟5秒返回主页
      setTimeout(() => {
        goToHome()
      }, 5000)
    }
  }
})

onUnmounted(() => {
  if (taglineInterval) clearInterval(taglineInterval)
  if (playerJoinInterval) clearInterval(playerJoinInterval)
  if (playerConfirmInterval) clearInterval(playerConfirmInterval)
  if (countdownInterval) clearTimeout(countdownInterval)
  if (typewriterInterval) clearTimeout(typewriterInterval)
})
</script>

<style scoped>
/* 主容器样式 */
.game-wait-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow: hidden;
}

/* 背景动画层 */
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.2;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.bg-orb-1 {
  top: 2.5rem;
  left: 2.5rem;
  width: 8rem;
  height: 8rem;
  background: rgba(59, 130, 246, 0.2);
  filter: blur(40px);
}

.bg-orb-2 {
  top: 33.33%;
  right: 5rem;
  width: 6rem;
  height: 6rem;
  background: rgba(6, 182, 212, 0.2);
  filter: blur(30px);
  animation-delay: 1s;
}

.bg-orb-3 {
  bottom: 5rem;
  left: 25%;
  width: 10rem;
  height: 10rem;
  background: rgba(147, 51, 234, 0.2);
  filter: blur(60px);
  animation-delay: 2s;
}

.bg-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%);
}

/* 主内容区域 */
.main-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
}

/* 标题部分 */
.title-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-title {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%);
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  line-height: 1.2;
  animation: gradient-shift 4s ease infinite;
}

.sub-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #cbd5e1;
  letter-spacing: 0.05em;
}

.title-divider {
  width: 6rem;
  height: 0.25rem;
  background: linear-gradient(90deg, #22d3ee, #3b82f6);
  margin: 0 auto;
  border-radius: 9999px;
  animation: pulse 2s infinite;
}

/* 简介卡片 */
.synopsis-container {
  width: 100%;
  max-width: 64rem;
}

.synopsis-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
  backdrop-filter: blur(16px);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.synopsis-text {
  color: #e2e8f0;
  line-height: 1.75;
  font-size: 1.125rem;
  font-weight: 500;
  text-align: center;
}

.cursor {
  color: #22d3ee;
  margin-left: 0.25rem;
  animation: pulse 1s infinite;
}

/* 匹配成功状态 */
.match-success {
  margin: 1rem 0;
}

.success-text {
  font-size: 1.875rem;
  font-weight: 600;
  color: white;
}

/* 玩家容器 */
.players-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.player-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.player-slot:hover {
  transform: translateY(-2px);
}

.player-card {
  position: relative;
  width: 7rem;
  height: 7rem;
  border-radius: 1rem;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.player-card.empty {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
  border-color: rgba(71, 85, 105, 0.5);
}

.player-card.joining {
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(30, 64, 175, 0.6) 100%);
  border-color: rgba(96, 165, 250, 0.7);
  animation: pulse 2s infinite;
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.3);
}

.player-card.confirmed {
  background: linear-gradient(135deg, rgba(20, 83, 45, 0.6) 0%, rgba(5, 46, 22, 0.6) 100%);
  border-color: rgba(74, 222, 128, 0.7);
  box-shadow: 0 20px 25px -5px rgba(34, 197, 94, 0.3);
}

.player-card.confirmed.current-user {
  box-shadow: 0 20px 25px -5px rgba(34, 197, 94, 0.3), 0 0 0 2px rgba(34, 211, 238, 0.5);
}

.player-avatar-wrapper {
  position: relative;
}

.player-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  background: #374151;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #1e293b;
}

.status-indicator.confirmed {
  background: #22c55e;
}

.check-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

.empty-slot {
  color: #94a3b8;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto;
  opacity: 0.6;
}

.empty-text {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.player-info {
  text-align: center;
}

.player-name {
  font-weight: 600;
  color: #e2e8f0;
}

.player-name.current-user {
  color: #67e8f9;
}

.player-status {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .main-title {
    font-size: 4rem;
  }

  .sub-title {
    font-size: 1.875rem;
  }

  .synopsis-text {
    font-size: 1.25rem;
  }

  .player-card {
    width: 8rem;
    height: 8rem;
  }

  .player-avatar {
    width: 7rem;
    height: 7rem;
  }

  .players-container {
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .main-title {
    font-size: 4.5rem;
  }

  .players-container {
    gap: 2.5rem;
  }
}

/* 标语部分 */
.taglines-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0;
}

.tagline-container {
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tagline-text {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(90deg, #22d3ee, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: fadeIn 0.8s ease-in-out;
  padding: 0 1rem;
}

.tagline-indicators {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.indicator-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: #475569;
  transition: all 0.5s ease;
}

.indicator-dot.active {
  background: #22d3ee;
  transform: scale(1.5);
  box-shadow: 0 4px 14px 0 rgba(34, 211, 238, 0.5);
}

/* 状态容器 */
.status-container {
  width: 100%;
  max-width: 28rem;
  margin-top: auto;
}

.status-card {
  backdrop-filter: blur(16px);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.status-card.waiting {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
  border-color: rgba(71, 85, 105, 0.5);
}

.status-card.success {
  background: linear-gradient(135deg, rgba(22, 101, 52, 0.7) 0%, rgba(20, 83, 45, 0.7) 100%);
  border-color: rgba(34, 197, 94, 0.4);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.status-card.failed {
  background: linear-gradient(135deg, rgba(127, 29, 29, 0.8) 0%, rgba(159, 18, 57, 0.8) 100%);
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.2);
}

.status-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 等待状态样式 */
.status-motto {
  color: #22d3ee;
  font-size: 1.125rem;
  font-weight: 600;
}

.status-count {
  font-size: 2.25rem;
  font-weight: bold;
  color: white;
  letter-spacing: 0.1em;
}

.status-description {
  color: #cbd5e1;
  font-size: 1rem;
}

.progress-bar {
  background: rgba(55, 65, 81, 0.5);
  border-radius: 9999px;
  height: 1rem;
  overflow: hidden;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #3b82f6);
  transition: all 0.7s ease-out;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cancel-button-container {
  padding-top: 1rem;
}

.cancel-button {
  padding: 0.5rem 1.5rem;
  background: #475569;
  color: #e2e8f0;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
}

.cancel-button:hover {
  background: #64748b;
}

/* 成功状态样式 */
.success-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
}

.success-count {
  font-size: 1rem;
  color: #bbf7d0;
}

.success-message {
  font-size: 0.875rem;
  color: rgba(187, 247, 208, 0.8);
}

.loading-spinner-container {
  display: flex;
  justify-content: center;
  padding-top: 0.25rem;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 失败状态样式 */
.failed-title {
  color: #fca5a5;
  font-size: 2.25rem;
  font-weight: bold;
}

.failed-count {
  color: #fecaca;
  font-size: 1.5rem;
}

.failed-message {
  color: #cbd5e1;
  font-size: 1.125rem;
}

.failed-button-container {
  display: flex;
  justify-content: center;
}

.failed-button {
  padding: 0.5rem 1.5rem;
  background: #ef4444;
  color: white;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;
}

.failed-button:hover {
  background: #dc2626;
}

/* 动画定义 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式调整 */
@media (min-width: 768px) {
  .tagline-text {
    font-size: 1.875rem;
  }
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(56, 189, 248, 0.8);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(56, 189, 248, 0.8);
}

/* 玩家槽位优化样式 */
.player-slot {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.player-slot:hover {
  transform: translateY(-2px);
}

/* 图标尺寸优化 */
.player-icon {
  flex-shrink: 0;
  transition: all 0.2s ease-in-out;
}

.status-indicator {
  backdrop-filter: blur(4px);
  transition: all 0.2s ease-in-out;
}

.status-indicator:hover {
  transform: scale(1.1);
}

/* 响应式图标调整 */
@media (max-width: 768px) {
  .player-slot {
    min-width: 6rem;
    flex-shrink: 0;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .player-slot {
    min-width: 7rem;
    flex-shrink: 0;
  }
}

@media (min-width: 1025px) {
  .player-slot {
    min-width: 8rem;
    flex-shrink: 0;
  }
}

/* 头像容器优化 */
.avatar-container {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.player-slot:hover .avatar-container::before {
  transform: translateX(100%);
}

/* 确保图标在小屏幕上不会太小 */
@media (max-width: 640px) {
  .player-icon {
    min-width: 3rem;
    min-height: 3rem;
  }

  .status-indicator {
    min-width: 2.5rem;
    min-height: 2.5rem;
  }
}

/* 优化中等屏幕的显示 */
@media (min-width: 641px) and (max-width: 1024px) {
  .player-icon {
    min-width: 3.5rem;
    min-height: 3.5rem;
  }

  .status-indicator {
    min-width: 2.75rem;
    min-height: 2.75rem;
  }
}

/* 大屏幕优化 */
@media (min-width: 1025px) {
  .player-icon {
    min-width: 4rem;
    min-height: 4rem;
  }

  .status-indicator {
    min-width: 3rem;
    min-height: 3rem;
  }
}

/* 防止图标变形 */
.player-icon svg,
.status-indicator svg {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
}

/* 增强状态指示器的可见性 */
.status-indicator {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 玩家槽位的微妙阴影效果 */
.player-slot > div:first-child {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1);
}

.player-slot:hover > div:first-child {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 玩家槽位容器水平滚动优化 */
.player-slots-container {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.player-slots-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 确保在小屏幕上玩家槽位不会被压缩 */
@media (max-width: 640px) {
  .player-slots-container {
    padding: 0 1rem;
  }

  .player-slot {
    min-width: 5.5rem !important;
  }
}
</style>