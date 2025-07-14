<template>
  <div class="home-page">
    <!-- Background Pattern -->
    <div class="background-pattern"></div>

    <div class="content-wrapper">
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="header-content">
            <!-- Logo -->
            <div class="logo-section">
              <div class="logo-icon">
                <span>迷</span>
              </div>
              <h1 class="logo-title">迷雾剧场</h1>
            </div>

            <!-- Search -->
            <div class="search-section">
              <div class="search-container">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  v-model="searchQuery"
                  @input="handleSearchChange"
                  placeholder="搜索剧本名称、作者或关键词..."
                  class="search-input"
                />
              </div>
            </div>

            <!-- User Menu -->
            <div class="user-menu">
              <div class="user-button">
                <div class="user-avatar">
                  <span>玩家</span>
                </div>
                <span class="user-name">神秘玩家</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Category Filter -->
      <div class="category-section">
        <div class="container">
          <div class="category-buttons">
            <button
              v-for="category in categories"
              :key="category"
              @click="handleCategoryChange(category)"
              :class="['category-button', { active: selectedCategory === category }]"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <div class="container">
          <div class="content-layout">
            <!-- Scripts Grid -->
            <div class="scripts-section">
              <div class="scripts-grid">
                <div
                  v-for="script in paginatedScripts"
                  :key="script.id"
                  @click="setSelectedScript(script)"
                  :class="['script-card', { selected: selectedScript?.id === script.id }]"
                >
                  <!-- Cover Image -->
                  <div class="script-cover">
                    <img
                      :src="script.cover || '/placeholder.svg'"
                      :alt="script.title"
                      class="cover-image"
                    />
                    <div class="cover-overlay">
                      <p class="overlay-text">点击查看详情</p>
                    </div>
                  </div>

                  <!-- Script Info -->
                  <div class="script-info">
                    <h3 class="script-title">{{ script.title }}</h3>

                    <!-- Tags -->
                    <div class="script-tags">
                      <span
                        v-for="tag in script.tags"
                        :key="tag"
                        class="tag"
                      >
                        {{ tag }}
                      </span>
                    </div>

                    <!-- Stats -->
                    <div class="script-stats">
                      <div class="stat-item">
                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>{{ script.players }}</span>
                      </div>
                      <div class="stat-item">
                        <div class="difficulty-stars">
                          <svg
                            v-for="i in 5"
                            :key="i"
                            :class="['star', { filled: i <= script.difficulty }]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                          </svg>
                        </div>
                        <span>难度</span>
                      </div>
                      <div class="stat-item">
                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        <span>{{ script.duration }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="pagination">
                <button
                  @click="setCurrentPage(Math.max(1, currentPage - 1))"
                  :disabled="currentPage === 1"
                  class="pagination-button"
                >
                  <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                  上一页
                </button>

                <div class="page-numbers">
                  <button
                    v-for="page in totalPages"
                    :key="page"
                    @click="setCurrentPage(page)"
                    :class="['page-button', { active: currentPage === page }]"
                  >
                    {{ page }}
                  </button>
                </div>

                <button
                  @click="setCurrentPage(Math.min(totalPages, currentPage + 1))"
                  :disabled="currentPage === totalPages"
                  class="pagination-button"
                >
                  下一页
                  <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Script Dossier -->
            <ScriptDossier
              :script="selectedScript"
              :visible="!!selectedScript"
              @close="selectedScript = null"
              @startGame="startGame"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ScriptDossier from './ScriptDossier.vue'

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

// 路由
const router = useRouter()

// 响应式数据
const selectedCategory = ref('All')
const selectedScript = ref<Script | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)

// 常量
const categories = ['All', 'Mystery', 'Hardcore', 'Horror', 'Emotional', 'Joyful']
const SCRIPTS_PER_PAGE = 8

// 剧本数据
const scripts: Script[] = [
  {
    id: "1",
    title: "午夜图书馆",
    cover: "/placeholder.svg?height=300&width=200",
    category: "Mystery",
    tags: ["悬疑", "本格", "微恐"],
    players: "6人 (3男3女)",
    difficulty: 4,
    duration: "约4小时",
    author: "神秘作者",
    description: "深夜的图书馆中，一位管理员神秘失踪。六位访客被困在这座古老的建筑中，必须在天亮前找出真相。每个人都有不可告人的秘密，而真相往往比想象中更加黑暗...",
    characters: [
      { name: "图书管理员", avatar: "/placeholder.svg?height=60&width=60", description: "知识渊博但性格孤僻的管理员" },
      { name: "文学教授", avatar: "/placeholder.svg?height=60&width=60", description: "优雅的中年教授，对古籍情有独钟" },
      { name: "神秘访客", avatar: "/placeholder.svg?height=60&width=60", description: "身份不明的年轻人，似乎在寻找什么" },
    ],
  },
  {
    id: "2",
    title: "雾都疑案",
    cover: "/placeholder.svg?height=300&width=200",
    category: "Hardcore",
    tags: ["硬核", "推理", "维多利亚"],
    players: "7人 (4男3女)",
    difficulty: 5,
    duration: "约5小时",
    author: "推理大师",
    description: "19世纪的伦敦，浓雾笼罩的街道上发生了一起离奇的谋杀案。作为苏格兰场的精英侦探们，你们必须在48小时内破解这个看似不可能的密室杀人案...",
    characters: [
      { name: "首席探长", avatar: "/placeholder.svg?height=60&width=60", description: "经验丰富的老探长，直觉敏锐" },
      { name: "法医专家", avatar: "/placeholder.svg?height=60&width=60", description: "年轻的法医，擅长尸体检验" },
    ],
  },
  {
    id: "3",
    title: "校园七不思议",
    cover: "/placeholder.svg?height=300&width=200",
    category: "Horror",
    tags: ["恐怖", "校园", "灵异"],
    players: "5人 (2男3女)",
    difficulty: 3,
    duration: "约3小时",
    author: "恐怖小说家",
    description: "深夜的学校里流传着七个恐怖传说。当五位学生因为各种原因被困在校园中过夜时，他们发现这些传说正在一个个变成现实...",
    characters: [
      { name: "学生会长", avatar: "/placeholder.svg?height=60&width=60", description: "责任感强的优等生" },
      { name: "问题学生", avatar: "/placeholder.svg?height=60&width=60", description: "叛逆的不良少年，实际上很善良" },
    ],
  },
  {
    id: "4",
    title: "豪门恩怨",
    cover: "/placeholder.svg?height=300&width=200",
    category: "Emotional",
    tags: ["情感", "家族", "商战"],
    players: "8人 (4男4女)",
    difficulty: 3,
    duration: "约4小时",
    author: "情感编剧",
    description: "富豪家族的继承人突然离世，巨额遗产的分配引发了家族内部的明争暗斗。每个人都有继承的理由，也都有杀人的动机...",
    characters: [
      { name: "大少爷", avatar: "/placeholder.svg?height=60&width=60", description: "表面风光的继承人，内心充满压力" },
      { name: "管家", avatar: "/placeholder.svg?height=60&width=60", description: "服务家族多年的忠诚管家" },
    ],
  },
  {
    id: "5",
    title: "太空站危机",
    cover: "/placeholder.svg?height=300&width=200",
    category: "Mystery",
    tags: ["科幻", "太空", "生存"],
    players: "6人 (3男3女)",
    difficulty: 4,
    duration: "约4小时",
    author: "科幻作家",
    description: "2087年，国际空间站上的科研人员发现了一个惊人的秘密。但随着通讯中断，他们意识到危险不仅来自外太空，更来自身边的同伴...",
    characters: [
      { name: "指挥官", avatar: "/placeholder.svg?height=60&width=60", description: "经验丰富的太空站指挥官" },
      { name: "科学家", avatar: "/placeholder.svg?height=60&width=60", description: "专注研究的天体物理学家" },
    ],
  },
  {
    id: "6",
    title: "古堡之谜",
    cover: "/placeholder.svg?height=300&width=200",
    category: "Joyful",
    tags: ["欢乐", "古堡", "轻松"],
    players: "6人 (3男3女)",
    difficulty: 2,
    duration: "约3小时",
    author: "喜剧编剧",
    description: "一群朋友受邀到古堡度假，却发现这里隐藏着一个有趣的宝藏谜题。在轻松愉快的氛围中，大家需要通过合作和推理来解开古堡的秘密...",
    characters: [
      { name: "古堡主人", avatar: "/placeholder.svg?height=60&width=60", description: "幽默风趣的古堡继承人" },
      { name: "历史学家", avatar: "/placeholder.svg?height=60&width=60", description: "对古代历史充满热情的学者" },
    ],
  },
  {
    id: "7",
    title: "深海实验室",
    cover: "/placeholder.svg?height=300&width=200",
    category: "Horror",
    tags: ["恐怖", "深海", "实验"],
    players: "7人 (4男3女)",
    difficulty: 4,
    duration: "约5小时",
    author: "恐怖大师",
    description: "深海研究站中，科学家们正在进行一项秘密实验。当实验失控时，他们发现自己被困在了海底，而更可怕的是，实验体似乎还活着...",
    characters: [
      { name: "首席科学家", avatar: "/placeholder.svg?height=60&width=60", description: "野心勃勃的研究者" },
      { name: "安全主管", avatar: "/placeholder.svg?height=60&width=60", description: "负责实验室安全的退役军人" },
    ],
  },
  {
    id: "8",
    title: "时光咖啡馆",
    cover: "/placeholder.svg?height=300&width=200",
    category: "Emotional",
    tags: ["情感", "时光", "温馨"],
    players: "5人 (2男3女)",
    difficulty: 2,
    duration: "约3小时",
    author: "温情作家",
    description: "一家神奇的咖啡馆，据说能让人回到过去的某个时刻。五位顾客各自带着遗憾来到这里，他们能否在这里找到内心的平静...",
    characters: [
      { name: "咖啡馆老板", avatar: "/placeholder.svg?height=60&width=60", description: "神秘而温和的老板娘" },
      { name: "失恋青年", avatar: "/placeholder.svg?height=60&width=60", description: "刚刚失恋的大学生" },
    ],
  }
]

// 计算属性
const filteredScripts = computed(() => {
  return scripts.filter((script) => {
    const matchesCategory = selectedCategory.value === 'All' || script.category === selectedCategory.value
    const matchesSearch =
      script.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      script.author.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      script.tags.some((tag) => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesCategory && matchesSearch
  })
})

const totalPages = computed(() => Math.ceil(filteredScripts.value.length / SCRIPTS_PER_PAGE))

const paginatedScripts = computed(() => {
  const startIndex = (currentPage.value - 1) * SCRIPTS_PER_PAGE
  return filteredScripts.value.slice(startIndex, startIndex + SCRIPTS_PER_PAGE)
})

// 方法
const handleCategoryChange = (category: string) => {
  selectedCategory.value = category
  currentPage.value = 1
  selectedScript.value = null
}

const handleSearchChange = () => {
  currentPage.value = 1
  selectedScript.value = null
}

const setSelectedScript = (script: Script) => {
  selectedScript.value = script
}

const setCurrentPage = (page: number) => {
  currentPage.value = page
}

const startGame = () => {
  if (selectedScript.value) {
    // 跳转到游戏界面，传递选中的剧本信息
    router.push({
      name: 'game',
      params: { scriptId: selectedScript.value.id }
    })
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
  position: relative;
}

.background-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23A5B4FC' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.content-wrapper {
  position: relative;
  z-index: 10;
}

/* Header Styles */
.header {
  border-bottom: 1px solid rgba(165, 180, 252, 0.1);
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
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

.logo-title {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(to right, #a5b4fc, #c4b5fd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.search-section {
  flex: 1;
  max-width: 500px;
  margin: 0 32px;
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 14px;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 12px;
  color: #cbd5e1;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.user-button:hover {
  background: rgba(51, 65, 85, 0.5);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.user-name {
  font-weight: 500;
}

/* Category Section */
.category-section {
  padding: 32px 0;
}

.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* 复古档案风格分类按钮 */
.category-button {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  font-family: 'Courier New', 'Monaco', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  cursor: pointer;
  /* 档案标签样式 */
  border: 2px solid rgba(139, 69, 19, 0.3);
  background:
    linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%),
    url('/background.png') center/cover;
  color: #2C1810;
  position: relative;
  /* 纸质阴影效果 */
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

/* 纸质纹理叠加 */
.category-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 25% 25%, rgba(139, 69, 19, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 75% 75%, rgba(139, 69, 19, 0.02) 0%, transparent 40%);
  border-radius: 2px;
  pointer-events: none;
}

.category-button:hover {
  border-color: rgba(139, 69, 19, 0.5);
  color: #1A0F08;
  background:
    linear-gradient(135deg, #F0E1CE 0%, #E3D0B2 100%),
    url('/background.png') center/cover;
  transform: translateY(-1px);
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.25),
    inset 0 1px 2px rgba(255, 255, 255, 0.4);
}

.category-button.active {
  /* 激活状态 - 墨水印章效果 */
  background:
    radial-gradient(ellipse at center, #2C1810 0%, #1A0F08 100%);
  color: #F5E6D3;
  border-color: #8B4513;
  box-shadow:
    0 0 8px rgba(44, 24, 16, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(245, 230, 211, 0.1);
  /* 墨水渗透效果 */
  filter: drop-shadow(0 2px 4px rgba(44, 24, 16, 0.4));
}

.category-button.active:hover {
  box-shadow:
    0 0 12px rgba(44, 24, 16, 0.8),
    0 3px 6px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(245, 230, 211, 0.15);
  transform: translateY(-1px);
}

/* Main Content */
.main-content {
  padding-bottom: 48px;
}

.content-layout {
  display: block;
}

.scripts-section {
  width: 100%;
}

.scripts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

/* 复古档案风格脚本卡片 */
.script-card {
  /* 档案文件夹样式 */
  background:
    linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%),
    url('/background.png') center/cover;
  border: 2px solid rgba(139, 69, 19, 0.3);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  /* 档案文件阴影 */
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -1px 2px rgba(139, 69, 19, 0.1);
}

/* 档案文件纹理叠加 */
.script-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(139, 69, 19, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(139, 69, 19, 0.03) 0%, transparent 50%),
    linear-gradient(45deg, transparent 48%, rgba(139, 69, 19, 0.02) 49%, rgba(139, 69, 19, 0.02) 51%, transparent 52%);
  pointer-events: none;
  z-index: 1;
}

.script-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.25),
    inset 0 1px 2px rgba(255, 255, 255, 0.4),
    inset 0 -1px 2px rgba(139, 69, 19, 0.15);
  border-color: rgba(139, 69, 19, 0.5);
  background:
    linear-gradient(135deg, #F0E1CE 0%, #E3D0B2 100%),
    url('/background.png') center/cover;
}

.script-card.selected {
  /* 选中状态 - 重要档案标记 */
  border: 3px solid #8B4513;
  box-shadow:
    0 0 12px rgba(139, 69, 19, 0.4),
    0 6px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.4);
  background:
    linear-gradient(135deg, #EDD8C0 0%, #E0CDA8 100%),
    url('/background.png') center/cover;
}

.script-cover {
  position: relative;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 192px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.script-card:hover .cover-image {
  transform: scale(1.1);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  padding: 16px;
}

.script-card:hover .cover-overlay {
  opacity: 1;
}

.overlay-text {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.script-info {
  padding: 20px;
}

.script-title {
  font-size: 18px;
  font-weight: bold;
  color: #f1f5f9;
  margin: 0 0 12px 0;
  transition: color 0.3s ease;
}

.script-card:hover .script-title {
  color: #a5b4fc;
}

.script-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 8px;
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.tag:hover {
  background: rgba(16, 185, 129, 0.2);
}

.script-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #94a3b8;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.difficulty-stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star {
  width: 12px;
  height: 12px;
  color: #64748b;
}

.star.filled {
  color: #fbbf24;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: 1px solid rgba(71, 85, 105, 0.5);
  background: transparent;
  color: #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background: rgba(51, 65, 85, 0.5);
  border-color: rgba(99, 102, 241, 0.5);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-icon {
  width: 16px;
  height: 16px;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-button {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(71, 85, 105, 0.5);
  background: transparent;
  color: #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-button:hover {
  background: rgba(51, 65, 85, 0.5);
  border-color: rgba(99, 102, 241, 0.5);
}

.page-button.active {
  background: linear-gradient(to right, #6366f1, #a855f7);
  color: white;
  border-color: transparent;
}



/* Responsive Design */
@media (max-width: 1024px) {
  .scripts-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .search-section {
    max-width: none;
    margin: 0;
    width: 100%;
  }

  .scripts-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .category-buttons {
    justify-content: center;
  }
}
</style>
