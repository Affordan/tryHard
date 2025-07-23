<template>
  <div class="user-profile">
    <!-- Background Pattern -->
    <div class="background-blobs">
      <div class="blob purple"></div>
      <div class="blob yellow"></div>
      <div class="blob blue"></div>
    </div>
    <div class="background-pattern"></div>

    <div class="content-wrapper">
      <!-- Header -->
      <div class="header">
        <div class="container">
          <div class="header-content">
            <div class="logo-section">
              <div class="logo-icon">
                <span>Take</span>
              </div>
              <div class="logo-text">
                <h1>her scripts</h1>
                <p>个人中心</p>
              </div>
            </div>
            <div class="nav-actions">
              <button @click="goHome" class="nav-button">
                返回主页
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-content">
            <div class="profile-info">
              <div class="avatar">
                <img :src="userProfile.avatar" :alt="userProfile.name" />
                <div class="avatar-fallback">{{ userProfile.name.charAt(0) }}</div>
              </div>
              <div class="user-details">
                <h1 class="user-name">{{ userProfile.name }}</h1>
                <p class="username">@{{ userProfile.username }}</p>
                <div class="user-badges">
                  <div class="badge level-badge">
                    等级 {{ userProfile.level }}
                  </div>
                  <span class="join-date">
                    加入时间：{{ formatDate(userProfile.joinDate) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="stats-summary">
              <div class="stat-item">
                <div class="stat-value">100</div>
                <div class="stat-label">游戏场次</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">168h</div>
                <div class="stat-label">总游戏时长</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <div class="tabs-list">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="switchTab(tab.value)"
              :class="['tab-trigger', { active: activeTab === tab.value }]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Overview Tab -->
            <div v-if="activeTab === 'overview'" class="tab-panel">
              <!-- Loading State -->
              <div v-if="isLoading" class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">正在加载统计数据...</p>
              </div>

              <div v-else class="overview-grid">
                <!-- Win Rate Chart -->
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">
                      <span class="icon">📈</span>
                      胜率统计
                    </h3>
                  </div>
                  <div class="card-content">
                    <div class="chart-container">
                      <div class="pie-chart-wrapper" :key="`pie-${animationKey}`">
                        <div class="pie-chart interactive" @mouseenter="onPieHover" @mouseleave="onPieLeave">
                          <!-- 背景圆环 -->
                          <div class="pie-background"></div>
                          <!-- 胜利扇形 -->
                          <div class="pie-segment victory"
                               :style="{ '--percentage': performanceData.victory, '--delay': '0.3s' }">
                            <div class="segment-label">{{ performanceData.victory }}%</div>
                          </div>
                          <!-- 失败扇形 -->
                          <div class="pie-segment defeat"
                               :style="{ '--percentage': performanceData.defeat, '--delay': '0.6s' }">
                          </div>
                          <!-- 中心圆 -->
                          <div class="pie-center">
                            <div class="center-icon">📊</div>
                            <div class="center-text">胜率</div>
                          </div>
                          <!-- 悬浮提示 -->
                          <div class="pie-tooltip" v-show="showTooltip">
                            <div class="tooltip-content">
                              <div class="tooltip-item victory">
                                <span class="tooltip-dot"></span>
                                <span>胜利: {{ performanceData.victory }}%</span>
                              </div>
                              <div class="tooltip-item defeat">
                                <span class="tooltip-dot"></span>
                                <span>失败: {{ performanceData.defeat }}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="chart-legend animated-legend" :key="`legend-${animationKey}`">
                        <div class="legend-item victory" @click="highlightSegment('victory')">
                          <div class="legend-color victory"></div>
                          <span>胜利 {{ performanceData.victory }}%</span>
                          <div class="legend-bar">
                            <div class="legend-fill victory" :style="{ width: `${performanceData.victory}%` }"></div>
                          </div>
                        </div>
                        <div class="legend-item defeat" @click="highlightSegment('defeat')">
                          <div class="legend-color defeat"></div>
                          <span>失败 {{ performanceData.defeat }}%</span>
                          <div class="legend-bar">
                            <div class="legend-fill defeat" :style="{ width: `${performanceData.defeat}%` }"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="win-rate-summary">
                      <div class="win-rate-value animated-number" :key="`winrate-${animationKey}`">{{ performanceData.victory }}%</div>
                      <div class="win-rate-label">总体胜率</div>
                      <div class="win-rate-trend">
                        <span class="trend-icon">📈</span>
                        <span class="trend-text">较上月提升 3%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Monthly Progress -->
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">
                      <span class="icon">📅</span>
                      月度进展
                    </h3>
                  </div>
                  <div class="card-content">
                    <div class="progress-chart" :key="`progress-${animationKey}`">
                      <div
                        v-for="(month, index) in monthlyProgress"
                        :key="`${animationKey}-${index}`"
                        class="progress-bar"
                      >
                        <div class="bar-container">
                          <div class="bar games animated" :style="{ height: `${(month.games / 30) * 100}%`, '--delay': `${index * 0.1}s` }"></div>
                          <div class="bar wins animated" :style="{ height: `${(month.wins / 30) * 100}%`, '--delay': `${index * 0.1 + 0.05}s` }"></div>
                        </div>
                        <div class="bar-label">{{ month.month }}</div>
                      </div>
                    </div>
                    <div class="chart-legend">
                      <div class="legend-item">
                        <div class="legend-color games"></div>
                        <span>游戏场次</span>
                      </div>
                      <div class="legend-item">
                        <div class="legend-color wins"></div>
                        <span>胜利场次</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Difficulty Performance -->
              <div class="card full-width">
                <div class="card-header">
                  <h3 class="card-title">难度表现</h3>
                </div>
                <div class="card-content">
                  <div class="difficulty-stats" :key="`difficulty-${animationKey}`">
                    <div
                      v-for="(stat, index) in difficultyStats"
                      :key="`${animationKey}-${stat.difficulty}`"
                      class="difficulty-item"
                    >
                      <div class="difficulty-info">
                        <div class="difficulty-name">{{ stat.difficulty }}</div>
                        <div class="difficulty-games">{{ stat.games }} 场游戏</div>
                      </div>
                      <div class="difficulty-progress">
                        <div class="progress-bar-bg">
                          <div
                            class="progress-bar-fill animated"
                            :style="{ width: `${stat.winRate}%`, '--delay': `${index * 0.15}s` }"
                          ></div>
                        </div>
                        <div class="win-rate">{{ stat.winRate }}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- History Tab -->
            <div v-if="activeTab === 'history'" class="tab-panel">
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">
                    <span class="icon">🕐</span>
                    最近游戏
                  </h3>
                  <p class="card-description">您最近的游戏记录</p>
                </div>
                <div class="card-content">
                  <div class="game-history">
                    <div
                      v-for="game in recentGames"
                      :key="game.id"
                      class="game-item"
                    >
                      <div class="game-info">
                        <h4 class="game-name">{{ game.name }}</h4>
                        <div class="game-details">
                          <span>{{ formatDate(game.date) }}</span>
                          <span>{{ game.duration }}</span>
                          <span>{{ game.players }} 人游戏</span>
                          <div class="difficulty-badge">{{ game.difficulty }}</div>
                        </div>
                      </div>
                      <div class="game-result">
                        <div :class="['result-badge', game.result === '胜利' ? 'victory' : 'defeat']">
                          {{ game.result }}
                        </div>
                        <div class="game-score">得分: {{ game.score.toLocaleString() }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Achievements Tab -->
            <div v-if="activeTab === 'achievements'" class="tab-panel">
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">
                    <span class="icon">🏆</span>
                    成就系统
                  </h3>
                  <p class="card-description">您的游戏成就</p>
                </div>
                <div class="card-content">
                  <div class="achievements-grid">
                    <div
                      v-for="achievement in achievements"
                      :key="achievement.id"
                      :class="['achievement-item', { earned: achievement.earned }]"
                    >
                      <div class="achievement-icon">{{ achievement.icon }}</div>
                      <div class="achievement-info">
                        <div class="achievement-header">
                          <h4 class="achievement-name">{{ achievement.name }}</h4>
                          <div :class="['rarity-badge', achievement.rarity.toLowerCase()]">
                            {{ achievement.rarity }}
                          </div>
                        </div>
                        <p class="achievement-description">{{ achievement.description }}</p>
                        <div v-if="achievement.earned" class="earned-date">
                          获得时间：{{ formatDate(achievement.earnedDate!) }}
                        </div>
                        <div v-else class="progress-info">
                          <div class="progress-bar-bg">
                            <div
                              class="progress-bar-fill animated"
                              :style="{ width: `${achievement.progress}%`, '--delay': `${achievement.id * 0.1}s` }"
                              :key="`achievement-${animationKey}-${achievement.id}`"
                            ></div>
                          </div>
                          <div class="progress-text">{{ achievement.progress }}% 完成</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recommendations Tab -->
            <div v-if="activeTab === 'recommendations'" class="tab-panel">
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">
                    <span class="icon">⭐</span>
                    为您推荐
                  </h3>
                  <p class="card-description">根据您的喜好推荐的剧本</p>
                </div>
                <div class="card-content">
                  <div class="recommendations-grid">
                    <div
                      v-for="scenario in recommendedScenarios"
                      :key="scenario.id"
                      class="scenario-card"
                      @click="selectScenario(scenario)"
                    >
                      <div class="scenario-image">
                        <img :src="scenario.image" :alt="scenario.name" />
                      </div>
                      <div class="scenario-info">
                        <div class="scenario-header">
                          <h4 class="scenario-name">{{ scenario.name }}</h4>
                          <div class="scenario-rating">
                            <span class="star">⭐</span>
                            <span>{{ scenario.rating }}</span>
                          </div>
                        </div>
                        <p class="scenario-description">{{ scenario.description }}</p>
                        <div class="scenario-meta">
                          <div class="difficulty-badge">{{ scenario.difficulty }}</div>
                          <span>{{ scenario.duration }}</span>
                          <span>{{ scenario.players }} 人</span>
                        </div>
                        <div class="scenario-tags">
                          <div
                            v-for="(tag, index) in scenario.tags.slice(0, 2)"
                            :key="index"
                            class="tag"
                          >
                            {{ tag }}
                          </div>
                          <div v-if="scenario.tags.length > 2" class="tag more">
                            +{{ scenario.tags.length - 2 }}
                          </div>
                        </div>
                        <div class="match-reason">{{ scenario.matchReason }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scenario Detail Modal -->
    <div v-if="selectedScenario" class="modal-overlay" @click="closeScenarioDetail">
      <div class="modal-content" @click.stop>
        <button @click="closeScenarioDetail" class="modal-close">×</button>
        <div class="scenario-detail">
          <div class="scenario-image-large">
            <img :src="selectedScenario.image" :alt="selectedScenario.name" />
          </div>
          <div class="scenario-detail-info">
            <div class="scenario-detail-header">
              <h2>{{ selectedScenario.name }}</h2>
              <div class="scenario-rating">
                <span class="star">⭐</span>
                <span>{{ selectedScenario.rating }}</span>
              </div>
            </div>
            <p class="scenario-detail-description">{{ selectedScenario.description }}</p>
            <div class="scenario-detail-meta">
              <div class="meta-item">
                <span class="meta-icon">🎯</span>
                <div>
                  <div class="meta-value">{{ selectedScenario.difficulty }}</div>
                  <div class="meta-label">难度</div>
                </div>
              </div>
              <div class="meta-item">
                <span class="meta-icon">⏰</span>
                <div>
                  <div class="meta-value">{{ selectedScenario.duration }}</div>
                  <div class="meta-label">时长</div>
                </div>
              </div>
              <div class="meta-item">
                <span class="meta-icon">👥</span>
                <div>
                  <div class="meta-value">{{ selectedScenario.players }}</div>
                  <div class="meta-label">玩家</div>
                </div>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🏷️</span>
                <div>
                  <div class="meta-value">{{ selectedScenario.tags.length }}</div>
                  <div class="meta-label">标签</div>
                </div>
              </div>
            </div>
            <div class="scenario-tags-full">
              <div
                v-for="(tag, index) in selectedScenario.tags"
                :key="index"
                class="tag"
              >
                {{ tag }}
              </div>
            </div>
            <div class="match-reason-full">{{ selectedScenario.matchReason }}</div>
            <button class="start-game-button" @click="startGame">
              开始游戏
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <transition name="scroll-top-fade">
      <button
        v-show="scrollPosition > 300"
        @click="scrollToTop"
        class="scroll-to-top-btn"
        :class="{ 'scrolling': isScrolling }"
        aria-label="回到顶部"
      >
        <span class="scroll-icon">↑</span>
      </button>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/composables/useUserStore'

// 接口定义
interface UserProfile {
  name: string
  username: string
  avatar: string
  level: number
  totalGamesPlayed: number
  totalHoursPlayed: number
  joinDate: string
}

interface RecentGame {
  id: number
  name: string
  date: string
  duration: string
  result: string
  score: number
  difficulty: string
  players: number
}

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  earned: boolean
  rarity: string
  earnedDate?: string
  progress?: number
}

interface RecommendedScenario {
  id: number
  name: string
  description: string
  difficulty: string
  duration: string
  players: string
  rating: number
  tags: string[]
  image: string
  matchReason: string
}

// 路由和用户状态
const router = useRouter()
const { currentUser, isLoggedIn } = useUserStore()

// 响应式数据
const activeTab = ref('overview')
const selectedScenario = ref<RecommendedScenario | null>(null)

// 动画控制
const isAnimating = ref(false)
const animationKey = ref(0)
const animationTimeout = ref<number | null>(null)

// 交互控制
const showTooltip = ref(false)
const highlightedSegment = ref<string | null>(null)
const isLoading = ref(true)

// 用户资料数据 - 使用实际登录用户数据或默认数据
const userProfile = computed<UserProfile>(() => {
  if (currentUser.value) {
    return {
      name: currentUser.value.username,
      username: currentUser.value.username,
      avatar: currentUser.value.avatar || "/placeholder.svg?height=80&width=80",
      level: currentUser.value.level || 1,
      totalGamesPlayed: currentUser.value.totalGamesPlayed || 0,
      totalHoursPlayed: currentUser.value.totalHoursPlayed || 0,
      joinDate: currentUser.value.joinDate || new Date().toISOString().split('T')[0],
    }
  } else {
    // 未登录时的默认数据
    return {
      name: "神秘玩家",
      username: "Guest",
      avatar: "/placeholder.svg?height=80&width=80",
      level: 1,
      totalGamesPlayed: 0,
      totalHoursPlayed: 0,
      joinDate: new Date().toISOString().split('T')[0],
    }
  }
})

const recentGames: RecentGame[] = [
  {
    id: 1,
    name: "失落神庙之谜",
    date: "2024-01-15",
    duration: "2小时45分",
    result: "胜利",
    score: 8750,
    difficulty: "困难",
    players: 4,
  },
  {
    id: 2,
    name: "赛博朋克劫案",
    date: "2024-01-12",
    duration: "3小时20分",
    result: "胜利",
    score: 9200,
    difficulty: "专家",
    players: 6,
  },
  {
    id: 3,
    name: "中世纪探险",
    date: "2024-01-10",
    duration: "1小时55分",
    result: "失败",
    score: 4300,
    difficulty: "中等",
    players: 3,
  },
  {
    id: 4,
    name: "空间站危机",
    date: "2024-01-08",
    duration: "2小时30分",
    result: "胜利",
    score: 7800,
    difficulty: "困难",
    players: 5,
  },
  {
    id: 5,
    name: "鬼屋惊魂",
    date: "2024-01-05",
    duration: "2小时15分",
    result: "胜利",
    score: 6900,
    difficulty: "中等",
    players: 4,
  },
]

const performanceData = {
  victory: 68,
  defeat: 32,
}

const difficultyStats = [
  { difficulty: "简单", games: 25, winRate: 85 },
  { difficulty: "中等", games: 45, winRate: 72 },
  { difficulty: "困难", games: 35, winRate: 65 },
  { difficulty: "专家", games: 15, winRate: 45 },
]

const monthlyProgress = [
  { month: "9月", games: 12, wins: 8 },
  { month: "10月", games: 18, wins: 13 },
  { month: "11月", games: 22, wins: 15 },
  { month: "12月", games: 28, wins: 19 },
  { month: "1月", games: 24, wins: 17 },
]

const achievements: Achievement[] = [
  {
    id: 1,
    name: "首次胜利",
    description: "赢得您的第一场游戏",
    icon: "🏆",
    earned: true,
    rarity: "Common",
    earnedDate: "2023-03-20",
  },
  {
    id: 2,
    name: "速度之王",
    description: "在1小时内完成一个剧本",
    icon: "⚡",
    earned: true,
    rarity: "Rare",
    earnedDate: "2023-05-12",
  },
  {
    id: 3,
    name: "团队合作",
    description: "参与50场多人游戏",
    icon: "🤝",
    earned: true,
    rarity: "Epic",
    earnedDate: "2023-08-30",
  },
  {
    id: 4,
    name: "大师侦探",
    description: "解决10个推理剧本",
    icon: "🔍",
    earned: true,
    rarity: "Legendary",
    earnedDate: "2023-11-15",
  },
  {
    id: 5,
    name: "完美主义者",
    description: "在任何剧本中达到100%完成度",
    icon: "💎",
    earned: false,
    rarity: "Mythic",
    progress: 85,
  },
  {
    id: 6,
    name: "社交达人",
    description: "与25个不同的玩家游戏",
    icon: "🦋",
    earned: false,
    rarity: "Rare",
    progress: 60,
  },
]

const recommendedScenarios: RecommendedScenario[] = [
  {
    id: 1,
    name: "亚特兰蒂斯探险",
    description: "深入探索失落之城的奥秘",
    difficulty: "困难",
    duration: "3-4小时",
    players: "4-6人",
    rating: 4.8,
    tags: ["冒险", "推理", "探索"],
    image: "/1.jpg",
    matchReason: "基于您对推理剧本的喜爱",
  },
  {
    id: 2,
    name: "霓虹阴影",
    description: "在赛博朋克都市的黑暗街道中穿行",
    difficulty: "专家",
    duration: "2-3小时",
    players: "3-5人",
    rating: 4.9,
    tags: ["赛博朋克", "潜行", "动作"],
    image: "/2.jpg",
    matchReason: "完美适合赛博朋克爱好者",
  },
  {
    id: 3,
    name: "龙穴编年史",
    description: "在魔法领域中的史诗奇幻冒险",
    difficulty: "中等",
    duration: "2-3小时",
    players: "3-6人",
    rating: 4.7,
    tags: ["奇幻", "战斗", "魔法"],
    image: "/3.jpg",
    matchReason: "推荐给奇幻爱好者",
  },
]

const tabs = [
  { value: 'overview', label: '概览' },
  { value: 'history', label: '游戏历史' },
  { value: 'achievements', label: '成就' },
  { value: 'recommendations', label: '推荐' },
]

// 方法
const goHome = () => {
  router.push('/')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const selectScenario = (scenario: RecommendedScenario) => {
  selectedScenario.value = scenario
}

const closeScenarioDetail = () => {
  selectedScenario.value = null
}

const startGame = () => {
  if (selectedScenario.value) {
    // 这里可以跳转到游戏界面
    router.push({
      name: 'game',
      params: { scriptId: selectedScenario.value.id.toString() }
    })
  }
}

// 饼图交互函数
const onPieHover = () => {
  showTooltip.value = true
}

const onPieLeave = () => {
  showTooltip.value = false
  highlightedSegment.value = null
}

const highlightSegment = (segment: string) => {
  highlightedSegment.value = highlightedSegment.value === segment ? null : segment
}

// 标签页切换时触发动画
const switchTab = (tabValue: string) => {
  activeTab.value = tabValue
  // 如果切换到概览页面，重新触发动画
  if (tabValue === 'overview') {
    setTimeout(() => {
      triggerAnimations()
    }, 100)
  }
}

// 动画触发函数
const triggerAnimations = async () => {
  // 防止频繁触发动画
  if (isAnimating.value) return

  // 清除之前的定时器
  if (animationTimeout.value) {
    clearTimeout(animationTimeout.value)
  }

  isAnimating.value = true
  animationKey.value += 1

  // 等待DOM更新
  await nextTick()

  // 延迟一帧确保动画能正确触发
  requestAnimationFrame(() => {
    // 设置动画完成的定时器
    animationTimeout.value = window.setTimeout(() => {
      isAnimating.value = false
    }, 1500) // 1.5秒后允许下次动画
  })
}

// 滚动相关状态
const scrollPosition = ref(0)
const isScrolling = ref(false)
const scrollTimeout = ref<number | null>(null)

// 滚动处理函数
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollPosition.value = target.scrollTop

  // 滚动状态管理
  isScrolling.value = true

  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }

  scrollTimeout.value = window.setTimeout(() => {
    isScrolling.value = false
  }, 150)
}

// 平滑滚动到顶部
const scrollToTop = () => {
  const profileElement = document.querySelector('.user-profile')
  if (profileElement) {
    profileElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// 生命周期钩子
onMounted(() => {
  // 模拟数据加载
  setTimeout(() => {
    isLoading.value = false
    triggerAnimations()
  }, 300)

  // 添加滚动监听
  const profileElement = document.querySelector('.user-profile')
  if (profileElement) {
    profileElement.addEventListener('scroll', handleScroll, { passive: true })
  }
})

// 当组件被激活时（从缓存中恢复）
onActivated(() => {
  triggerAnimations()
})

// 组件卸载时清理
onUnmounted(() => {
  const profileElement = document.querySelector('.user-profile')
  if (profileElement) {
    profileElement.removeEventListener('scroll', handleScroll)
  }

  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
})
</script>

<style scoped>
/* 基础布局 */
.user-profile {
  min-height: 100vh;
  background-color: #0f1c2c;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  /* 确保内容可以正常滚动 */
  padding-bottom: 2rem; /* 底部留白，避免内容贴边 */

  /* 平滑滚动效果 */
  scroll-behavior: smooth;

  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
}

/* 个人中心专用滚动条样式 */
.user-profile::-webkit-scrollbar {
  width: 12px;
}

.user-profile::-webkit-scrollbar-track {
  background: rgba(15, 28, 44, 0.5);
  border-radius: 6px;
  border: 1px solid rgba(165, 180, 252, 0.1);
}

.user-profile::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg,
    rgba(165, 180, 252, 0.4) 0%,
    rgba(99, 102, 241, 0.6) 100%);
  border-radius: 6px;
  border: 1px solid rgba(165, 180, 252, 0.2);
  transition: all 0.3s ease;
}

.user-profile::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg,
    rgba(165, 180, 252, 0.6) 0%,
    rgba(99, 102, 241, 0.8) 100%);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
}

/* 滚动指示器动画 */
.user-profile::-webkit-scrollbar-thumb:active {
  background: linear-gradient(135deg,
    rgba(165, 180, 252, 0.8) 0%,
    rgba(99, 102, 241, 1) 100%);
}

/* 背景效果 - 与主页保持一致 */
.background-blobs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
  animation: blob-float 20s ease-in-out infinite;
  will-change: transform, opacity;
}

.blob.purple {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.blob.yellow {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  top: 60%;
  right: 20%;
  animation-delay: 7s;
}

.blob.blue {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  bottom: 20%;
  left: 50%;
  animation-delay: 14s;
}

@keyframes blob-float {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translate(30px, -50px) scale(1.1) rotate(90deg);
    opacity: 0.4;
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9) rotate(180deg);
    opacity: 0.35;
  }
  75% {
    transform: translate(50px, 10px) scale(1.05) rotate(270deg);
    opacity: 0.45;
  }
}

.background-pattern {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23A5B4FC' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  animation: pattern-breathe 12s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  will-change: opacity, transform;
}

@keyframes pattern-breathe {
  0%, 100% {
    opacity: 0.05;
    transform: scale(1) rotate(0deg);
  }
  25% {
    opacity: 0.06;
    transform: scale(1.01) rotate(0.5deg);
  }
  50% {
    opacity: 0.08;
    transform: scale(1.02) rotate(1deg);
  }
  75% {
    opacity: 0.06;
    transform: scale(1.01) rotate(0.5deg);
  }
}

/* 这个样式已经移动到container样式后面 */

/* Header样式 - 与主页保持一致 */
.header {
  border-bottom: 1px solid rgba(165, 180, 252, 0.1);
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  /* 确保容器在小屏幕上有适当的边距 */
}

/* 内容区域优化 */
.content-wrapper {
  position: relative;
  z-index: 10;
  padding-top: 0;
  /* 确保内容区域可以正常滚动 */
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.logo-icon span {
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.logo-text h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.logo-text p {
  margin: 0;
  font-size: 12px;
  color: rgba(165, 180, 252, 0.8);
  line-height: 1.2;
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.nav-button {
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  color: #a5b4fc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.nav-button:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-1px);
}

/* 个人资料头部 */
.profile-header {
  margin: 2rem 0;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(165, 180, 252, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.profile-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  overflow-y: auto;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(99, 102, 241, 0.5);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  font-size: 32px;
  font-weight: bold;
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.username {
  margin: 0 0 1rem 0;
  color: rgba(165, 180, 252, 0.8);
  font-size: 1rem;
}

.user-badges {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-badge {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.2));
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.join-date {
  font-size: 14px;
  color: rgba(165, 180, 252, 0.6);
}

.stats-summary {
  display: flex;
  gap: 2rem;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 14px;
  color: rgba(165, 180, 252, 0.6);
}

/* 标签页 */
.tabs-container {
  margin: 2rem 0;
}

.tabs-list {
  display: flex;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(165, 180, 252, 0.1);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
  backdrop-filter: blur(12px);
}

.tab-trigger {
  flex: 1;
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(165, 180, 252, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-trigger.active {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.tab-trigger:hover:not(.active) {
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
  transform: translateY(-1px);
}

.tab-trigger:active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}

.tab-content {
  min-height: 400px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 卡片样式 */
.card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(165, 180, 252, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-bottom: 1.5rem;
  animation: cardSlideIn 0.6s ease-out;
}

.card.full-width {
  width: 100%;
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-description {
  margin: 0;
  color: rgba(165, 180, 252, 0.8);
  font-size: 14px;
}

.icon {
  font-size: 1.2rem;
}

/* 概览网格 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* 饼图样式 */
.chart-container {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.pie-chart-wrapper {
  position: relative;
  animation: pieWrapperAppear 0.8s ease-out;
}

.pie-chart {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pie-chart.interactive:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
}

.pie-background {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(165, 180, 252, 0.2);
}

.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: all 0.3s ease;
  animation: segmentGrow 1.5s ease-out;
  animation-delay: var(--delay, 0s);
  animation-fill-mode: both;
}

.pie-segment.victory {
  background: conic-gradient(
    from 0deg,
    #22c55e 0deg calc(var(--percentage) * 3.6deg),
    transparent calc(var(--percentage) * 3.6deg) 360deg
  );
  z-index: 2;
}

.pie-segment.defeat {
  background: conic-gradient(
    from calc(var(--percentage) * 3.6deg),
    #ef4444 0deg calc((100 - var(--percentage)) * 3.6deg),
    transparent calc((100 - var(--percentage)) * 3.6deg) 360deg
  );
  z-index: 1;
}

.segment-label {
  position: absolute;
  top: 25%;
  left: 60%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: 700;
  font-size: 14px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  opacity: 0;
  animation: labelFadeIn 0.5s ease-out 1.8s forwards;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(30, 41, 59, 0.95);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(165, 180, 252, 0.3);
  z-index: 3;
  animation: centerPulse 2s ease-in-out infinite;
}

.center-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.center-text {
  font-size: 12px;
  color: rgba(165, 180, 252, 0.8);
  font-weight: 500;
}

.pie-tooltip {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  padding: 8px 12px;
  z-index: 10;
  animation: tooltipSlideIn 0.3s ease-out;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: white;
}

.tooltip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tooltip-item.victory .tooltip-dot {
  background: #22c55e;
}

.tooltip-item.defeat .tooltip-dot {
  background: #ef4444;
}

@keyframes pieWrapperAppear {
  from {
    opacity: 0;
    transform: scale(0.8) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes segmentGrow {
  from {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes labelFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes centerPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }
}

@keyframes tooltipSlideIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.animated-legend {
  animation: legendSlideIn 0.8s ease-out 0.5s both;
}

.legend-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateX(4px);
}

.legend-item > span {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.legend-color.victory {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.legend-color.defeat {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.legend-color.games {
  background: #3b82f6;
}

.legend-color.wins {
  background: #22c55e;
}

.legend-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.legend-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.8s ease-out;
  animation: legendBarFill 1.2s ease-out 1s both;
}

.legend-fill.victory {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.legend-fill.defeat {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

@keyframes legendSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes legendBarFill {
  from {
    width: 0 !important;
  }
}

.win-rate-summary {
  text-align: center;
}

.win-rate-value {
  font-size: 2rem;
  font-weight: 700;
  color: #22c55e;
}

.win-rate-value.animated-number {
  animation: numberCountUp 1.5s ease-out;
}

.win-rate-label {
  font-size: 14px;
  color: rgba(165, 180, 252, 0.6);
}

.win-rate-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 20px;
  animation: trendSlideIn 0.6s ease-out 2s both;
}

.trend-icon {
  font-size: 14px;
}

.trend-text {
  font-size: 12px;
  color: #22c55e;
  font-weight: 500;
}

@keyframes trendSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 加载动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: rgba(165, 180, 252, 0.8);
  font-size: 14px;
  margin: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}

@keyframes numberCountUp {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 进度图表 */
.progress-chart {
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 150px;
  margin-bottom: 1rem;
}

.progress-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-container {
  position: relative;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: end;
  gap: 4px;
}

.bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.8s ease-out;
}

.bar.animated {
  animation: barGrowUp 0.8s ease-out;
  animation-delay: var(--delay, 0s);
  animation-fill-mode: both;
}

.bar.games {
  background: #3b82f6;
}

.bar.wins {
  background: #22c55e;
}

.bar-label {
  font-size: 12px;
  color: rgba(165, 180, 252, 0.8);
}

@keyframes barGrowUp {
  from {
    height: 0 !important;
    transform: scaleY(0);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
    transform-origin: bottom;
  }
}

/* 难度统计 */
.difficulty-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.difficulty-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.difficulty-info {
  flex: 1;
}

.difficulty-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.difficulty-games {
  font-size: 14px;
  color: rgba(165, 180, 252, 0.6);
}

.difficulty-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 2;
}

.progress-bar-bg {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a855f7);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-bar-fill.animated {
  animation: progressFillIn 1s ease-out;
  animation-delay: var(--delay, 0s);
  animation-fill-mode: both;
}

@keyframes progressFillIn {
  from {
    width: 0 !important;
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.win-rate {
  font-size: 14px;
  font-weight: 600;
  color: #a855f7;
  min-width: 40px;
}

/* 游戏历史 */
.game-history {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.game-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
}

.game-info {
  flex: 1;
}

.game-name {
  margin: 0 0 0.5rem 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.game-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 14px;
  color: rgba(165, 180, 252, 0.6);
}

.difficulty-badge {
  padding: 4px 8px;
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.game-result {
  text-align: right;
}

.result-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.result-badge.victory {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.result-badge.defeat {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.game-score {
  font-size: 14px;
  color: rgba(165, 180, 252, 0.6);
}

/* 成就系统 */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.achievement-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.achievement-item.earned {
  opacity: 1;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(34, 197, 94, 0.3);
}

.achievement-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.achievement-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.achievement-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.rarity-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.rarity-badge.common {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
}

.rarity-badge.rare {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.rarity-badge.epic {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.rarity-badge.legendary {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.rarity-badge.mythic {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.achievement-description {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
  color: rgba(165, 180, 252, 0.6);
}

.earned-date {
  font-size: 12px;
  color: #22c55e;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.progress-text {
  font-size: 12px;
  color: rgba(165, 180, 252, 0.6);
}

/* 推荐剧本 */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.scenario-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(165, 180, 252, 0.1);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
}

.scenario-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(99, 102, 241, 0.3);
}

.scenario-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.scenario-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.scenario-card:hover .scenario-image img {
  transform: scale(1.05);
}

.scenario-info {
  padding: 1rem;
}

.scenario-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.scenario-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

.scenario-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 14px;
  color: #fbbf24;
}

.star {
  font-size: 12px;
}

.scenario-description {
  margin: 0 0 0.75rem 0;
  font-size: 14px;
  color: rgba(165, 180, 252, 0.6);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scenario-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 12px;
  color: rgba(165, 180, 252, 0.6);
}

.scenario-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tag {
  padding: 4px 8px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(14, 165, 233, 0.12));
  color: #67e8f9;
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag.more {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(165, 180, 252, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
}

.match-reason {
  font-size: 12px;
  color: #3b82f6;
  font-style: italic;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  position: relative;
  max-width: 800px;
  max-height: 90vh;
  width: 90%;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(165, 180, 252, 0.2);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.8);
  transform: scale(1.1);
}

.scenario-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.scenario-image-large {
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.scenario-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scenario-detail-info {
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
}

.scenario-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.scenario-detail-header h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.scenario-detail-description {
  margin: 0 0 1.5rem 0;
  font-size: 16px;
  color: rgba(165, 180, 252, 0.8);
  line-height: 1.6;
}

.scenario-detail-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-align: center;
}

.meta-icon {
  font-size: 1.5rem;
}

.meta-value {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.meta-label {
  font-size: 12px;
  color: rgba(165, 180, 252, 0.6);
}

.scenario-tags-full {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.match-reason-full {
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  color: #3b82f6;
  font-size: 14px;
  margin-bottom: 1.5rem;
}

.start-game-button {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-game-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

/* 性能优化 */
.pie-chart,
.bar,
.progress-bar-fill,
.card {
  will-change: transform, opacity;
}

/* 减少移动设备上的动画 */
@media (prefers-reduced-motion: reduce) {
  .pie-chart,
  .bar.animated,
  .progress-bar-fill.animated,
  .card,
  .animated-number {
    animation: none !important;
    transition: none !important;
  }

  .pie-chart.interactive:hover {
    transform: none !important;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    text-align: center;
  }

  .stats-summary {
    justify-content: center;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    flex-direction: column;
    gap: 1rem;
  }

  .pie-chart {
    width: 140px;
    height: 140px;
  }

  .recommendations-grid {
    grid-template-columns: 1fr;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }

  .scenario-detail {
    flex-direction: column;
  }

  .scenario-detail-meta {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 移动设备上简化动画 */
  .pie-segment {
    animation-duration: 1s;
  }

  .bar.animated {
    animation-duration: 0.6s;
  }

  .progress-bar-fill.animated {
    animation-duration: 0.8s;
  }
}
</style>
