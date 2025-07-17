<template>
  <div class="home-page">
    <!-- Background Pattern -->
    <div class="background-blobs">
      <div class="blob purple"></div>
      <div class="blob yellow"></div>
      <div class="blob blue"></div>
    </div>
    <div class="background-pattern"></div>

    <div class="content-wrapper">
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="header-content">
            <!-- Logo -->
            <div class="logo-section">
              <div class="logo-icon">
                <span>Take</span>
              </div>
              <h1 class="logo-title">her script</h1>
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
              <button @click="goToProfile" class="user-button">
                <div class="user-avatar">
                  <span>玩家</span>
                </div>
                <span class="user-name">神秘玩家</span>
              </button>
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
              <!-- Loading State -->
              <div v-if="isLoading" class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">正在加载剧本数据...</p>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="error-container">
                <div class="error-icon">⚠️</div>
                <p class="error-text">{{ error }}</p>
                <button @click="fetchScripts" class="retry-button">重试</button>
              </div>

              <!-- Scripts Grid -->
              <div v-else class="scripts-grid">
                <div
                  v-for="script in paginatedScripts"
                  :key="script.id"
                  @click="setSelectedScript(script)"
                  :class="['script-card', { selected: selectedScript?.id === script.id }]"
                >
                  <!-- Cover Image -->
                  <div class="script-cover">
                    <img
                      :src="getFullImageUrl(script.cover)"
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

              <!-- 调试信息 -->
  

              <!-- Pagination -->
              <div v-if="!isLoading && !error && scripts.length > 0" class="pagination">
                <button
                  @click="setCurrentPage(Math.max(1, currentPage - 1))"
                  :disabled="currentPage === 1 || isLoading"
                  class="pagination-button"
                >
                  <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                  上一页
                </button>

                <div class="page-numbers">
                  <button
                    v-for="page in Math.max(1, totalPages)"
                    :key="page"
                    @click="setCurrentPage(page)"
                    :disabled="isLoading"
                    :class="['page-button', { active: currentPage === page }]"
                  >
                    {{ page }}
                  </button>
                </div>

                <button
                  @click="setCurrentPage(Math.min(Math.max(1, totalPages), currentPage + 1))"
                  :disabled="currentPage >= Math.max(1, totalPages) || isLoading"
                  class="pagination-button"
                >
                  下一页
                  <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </div>

              <!-- 分页状态信息 -->
              <div v-if="!isLoading && !error && scripts.length > 0" class="pagination-info">
                <span class="pagination-status">
                  第 {{ currentPage }} 页，共 {{ Math.max(1, totalPages) }} 页 |
                  显示 {{ scripts.length }} 个剧本
                </span>
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
import axios from 'axios'
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
  created_at?: string
  updated_at?: string
}

// API 响应接口
interface ScriptsResponse {
  scripts: Script[]
  total_pages: number
  current_page: number
}

// 路由
const router = useRouter()

// 响应式数据
const selectedCategory = ref('All')
const selectedScript = ref<Script | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(6)
const scripts = ref<Script[]>([])
const totalPages = ref(0)
const isLoading = ref(false)
const error = ref<string | null>(null)

// 常量
const categories = ['All', 'Mystery', 'Hardcore', 'Horror', 'Emotional', 'Joyful']
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'

// 定义后端静态资源基地址常量
const BACKEND_STATIC_URL = 'http://127.0.0.1:8000'

// 创建URL拼接辅助方法
const getFullImageUrl = (path: string | undefined | null): string => {
  if (!path) {
    return '/placeholder.svg' // 无路径时返回占位图
  }
  if (path.startsWith('http')) {
    return path // 已是完整URL直接返回
  }
  // 拼接后端地址和相对路径
  return `${BACKEND_STATIC_URL}${path}`
}

// API 调用函数
const fetchScripts = async () => {
  try {
    isLoading.value = true
    error.value = null

    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      page_size: pageSize.value.toString()
    })

    // 添加分类过滤
    if (selectedCategory.value !== 'All') {
      params.append('category', selectedCategory.value)
    }

    // 添加搜索查询
    if (searchQuery.value.trim()) {
      params.append('search', searchQuery.value.trim())
    }

    const apiUrl = `${API_BASE_URL}/scripts?${params}`
    console.log('正在调用 API:', apiUrl)
    console.log('请求参数:', {
      page: currentPage.value,
      page_size: pageSize.value,
      category: selectedCategory.value !== 'All' ? selectedCategory.value : undefined,
      search: searchQuery.value.trim() || undefined
    })

    const response = await axios.get<ScriptsResponse>(apiUrl)

    console.log('API 响应:', response.data)

    // 处理不同的API响应格式
    let scriptsData: Script[] = []
    let totalPagesData = 1
    let currentPageData = currentPage.value;

    if (response.data.scripts) {
      // 格式1: { scripts: [], total_pages: number, current_page: number }
      scriptsData = response.data.scripts
      totalPagesData = response.data.total_pages || 1
      
    } else if (Array.isArray(response.data)) {
      // 格式2: 直接返回数组，需要前端分页
      scriptsData = response.data
      totalPagesData = Math.ceil(scriptsData.length / pageSize.value)
      
    } else {
      // 其他格式，尝试直接使用
      scriptsData = response.data.scripts || []
      totalPagesData = 1
      currentPageData = 1
    }

 

    scripts.value = scriptsData
    totalPages.value = totalPagesData
    currentPage.value = currentPageData

  } catch (err) {
    error.value = '获取剧本数据失败，请稍后重试'
    console.error('API 调用失败:', err)
    scripts.value = []
    totalPages.value = 0
  } finally {
    isLoading.value = false
  }
}

// 计算属性
const paginatedScripts = computed(() => {
  return scripts.value
})

// 方法
const handleCategoryChange = (category: string) => {
  selectedCategory.value = category
  currentPage.value = 1
  selectedScript.value = null
  fetchScripts()
}

const handleSearchChange = () => {
  currentPage.value = 1
  selectedScript.value = null
  fetchScripts()
}

const setSelectedScript = (script: Script) => {
  selectedScript.value = script
}

const setCurrentPage = (page: number) => {
  currentPage.value = page
  fetchScripts()
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

const goToProfile = () => {
  router.push({ name: 'profile' })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchScripts()
})
</script>

<style scoped>

.home-page {
  min-height: 100vh;
  /* 呼吸灯背景设置 */
  overflow: hidden;
  background-color: #0f1c2c;
  position: relative;
  overflow-y: auto;
}
/* 在 <style> 区域中 - 添加这些新样式 */

.background-blobs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* 将它放置在基础背景之上 */
}

.blob {
  position: absolute; /* 使用绝对定位，让它们可以自由移动 */
  border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; /* 圆形 */
  /* 使用模糊滤镜来模拟柔和的边缘，效果类似径向渐变 */
  filter: blur(30px);
  /* 这是一个给浏览器的优化提示，告诉它这两个属性即将改变 */
  will-change: transform, opacity, border-radius;
  animation: morph 8s ease-in-out infinite;
  transform-origin: center center;
}
@keyframes morph {
  0%, 100% {
    border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%;
  }
  50% {
    border-radius: 30% 70% 40% 60% / 60% 50% 50% 40%;
  }
}
/* 定义每个色块的颜色、尺寸和动画 */
.blob.purple {
  width: 600px;
  height: 600px;
  background: rgba(80, 31, 214, 0.3);
  animation: move-purple 5s infinite cubic-bezier(0.4, 0, 0.6, 1),
             morph 8s ease-in-out infinite;
}

.blob.yellow {
  width: 800px;
  height: 700px;
  background: rgba(232, 183, 58, 0.2);
  animation: move-yellow 8s infinite cubic-bezier(0.4, 0, 0.6, 1),
  morph 8s ease-in-out infinite;
}

.blob.blue {
  width: 750px;
  height: 450px;
  background: rgba(48, 118, 232, 0.15);
  animation: move-blue 10s infinite cubic-bezier(0.4, 0, 0.6, 1),
             morph 8s ease-in-out infinite;
}

@keyframes move-purple {
  0%, 100% {
    /* 初始状态：增加一个初始旋转角度 */
    transform: translate(10vw, 10vh) scale(1) rotate(-15deg);
    opacity: 0.3;
  }
  50% {
    /* 中间状态：改变位置、缩放，并旋转到另一个角度 */
    transform: translate(25vw, -20vh) scale(1.2) rotate(20deg);
    opacity: 0.4;
  }
}

@keyframes move-yellow {
  0%, 100% {
    transform: translate(80vw, 70vh) scale(1) rotate(10deg);
    opacity: 0.2;
  }
  50% {
    transform: translate(60vw, 90vh) scale(0.8) rotate(-25deg);
    opacity: 0.3;
  }
}

@keyframes move-blue {
  0%, 100% {
    transform: translate(40vw, 20vh) scale(1) rotate(5deg);
    opacity: 0.15;
  }
  50% {
    transform: translate(50vw, 30vh) scale(1.3) rotate(30deg);
    opacity: 0.25;
  }
}

/* 调整内容的 z-index 以确保它显示在最上层 */
.content-wrapper {
  position: relative;
  z-index: 10;
}

.background-pattern {
  position: absolute;
  inset: 0;
  /* 提升 z-index，让它位于色块和内容之间 */
  z-index: 2;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23A5B4FC' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  animation: pattern-breathe 12s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  will-change: opacity, transform;
}


.background-pattern {
  position: absolute;
  inset: 0;
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
  transition: all 0.3s ease;
  background: transparent;
  border: 1px solid rgba(71, 85, 105, 0.3);
  backdrop-filter: blur(8px);
}

.user-button:hover {
  background: rgba(51, 65, 85, 0.5);
  border-color: rgba(99, 102, 241, 0.5);
  color: #a5b4fc;
  transform: translateY(-1px);
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

.category-button {
  padding: 8px 24px;
  border-radius: 24px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(71, 85, 105, 0.5);
  background: transparent;
  color: #cbd5e1;
}

.category-button:hover {
  border-color: rgba(99, 102, 241, 0.5);
  color: #a5b4fc;
  background: rgba(51, 65, 85, 0.3);
}

.category-button.active {
  background: linear-gradient(to right, #6366f1, #a855f7);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.category-button.active:hover {
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
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

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(165, 180, 252, 0.2);
  border-top: 4px solid #a5b4fc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #cbd5e1;
  font-size: 16px;
  margin: 0;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-text {
  color: #f87171;
  font-size: 16px;
  margin: 0 0 24px 0;
}

.retry-button {
  padding: 12px 24px;
  background: linear-gradient(to right, #6366f1, #a855f7);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Script Card */
.script-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.script-card:hover {
  transform: scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(99, 102, 241, 0.3);
}

.script-card.selected {
  border: 2px solid rgba(99, 102, 241, 0.5);
  box-shadow: 0 12px 24px rgba(99, 102, 241, 0.2);
  background: rgba(51, 65, 85, 0.6);
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
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  will-change: transform, box-shadow;

  /* 统一的青色系配色方案 */
  background: linear-gradient(135deg,
    rgba(6, 182, 212, 0.18) 0%,
    rgba(14, 165, 233, 0.12) 50%,
    rgba(59, 130, 246, 0.15) 100%);
  color: #67e8f9;
  border: 1px solid rgba(6, 182, 212, 0.25);
  box-shadow:
    0 2px 8px rgba(6, 182, 212, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: left;
}

.tag:hover {
  transform: translateY(-3px) scale(1.08);
  background: linear-gradient(135deg,
    rgba(6, 182, 212, 0.28) 0%,
    rgba(14, 165, 233, 0.22) 50%,
    rgba(59, 130, 246, 0.25) 100%);
  border-color: rgba(6, 182, 212, 0.4);
  box-shadow:
    0 8px 25px rgba(6, 182, 212, 0.15),
    0 4px 12px rgba(14, 165, 233, 0.1),
    0 0 30px rgba(6, 182, 212, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  color: #a7f3d0;
}

.tag:hover::before {
  left: 100%;
}

.tag:active {
  transform: translateY(-1px) scale(1.05);
  transition: all 0.1s ease;
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

/* 分页状态信息 */
.pagination-info {
  text-align: center;
  margin-top: 16px;
}

.pagination-status {
  color: #94a3b8;
  font-size: 14px;
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
