<template>
  <div class="galgame-main-container">
    <!-- Left Panel: Main Game Area (70%) -->
    <div class="main-game-panel">
      <!-- Dynamic Background System -->
      <BackgroundSystem
        :current-scene-id="currentSceneId"
        :scene-backgrounds="sceneBackgrounds"
      />

      <!-- Character Display Panel -->
      <CharacterPanel
        :active-character="displayedCharacter"
        :is-character-speaking="isCharacterSpeaking"
        :is-ai-processing="isAIProcessing"
      />

      <!-- Dialogue System -->
      <DialogueSystem
        :is-ai-processing="isLoading"
        :current-dialogue="currentDialogue"
        :active-character="activeCharacter"
        :displayed-text="displayedDialogueText"
        :is-typing="isTypingActive"
        :can-continue="canContinue"
        :current-scene-index="currentSentenceIndex" :total-scenes="unifiedMonologueQueue.length" :processing-progress="0"
        :show-user-interface="showUserInterface"
        :user-input="userInputText"
        @skip-typing="skipTypingEffect"
        @continue-scene="handleContinue"
        @submit-input="submitUserInput"
        @update-input="userInputText = $event"
      />

      <!-- Scene Transition Overlay -->
      <SceneTransition
        :is-transitioning="isSceneTransitioning"
        :next-character="nextCharacterData"
      />

      <!-- Control Panel -->
      <ControlPanel
        :auto-advance="autoAdvanceEnabled"
        @go-home="goToHome"
        @restart="restartScript"
        @toggle-auto="toggleAutoAdvance"
        @show-history="showScriptHistory"
        @show-settings="showInterfaceSettings"
      />

      <!-- History Modal -->
      <HistoryModal
        :visible="historyModalVisible"
        :history="completedSceneHistory"
        @close="historyModalVisible = false"
      />
    </div>

    <!-- Resizable Divider -->
    <div
      class="resize-divider"
      @mousedown="startDragging"
      :class="{ 'dragging': isDragging }"
    ></div>

    <!-- Right Panel: Interactive Interrogation Sidebar -->
    <div class="interrogation-sidebar" :style="{ width: sidebarWidth + '%' }">
      <!-- Character Selection Area -->
      <div class="sidebar-section character-selection-section enhanced-dropdown">
        <!-- 简化标题，让组件本身说明一切 -->

        <!-- Dropdown Character Selector -->
        <div class="character-dropdown-container">
          <div
            class="character-dropdown-trigger"
            @click="toggleCharacterDropdown"
            :class="{
              'expanded': isCharacterDropdownOpen,
              'transitioning': isSceneTransitioning
            }"
          >
            <div class="selected-character-display">
              <div class="character-avatar-small">
                <img
                  :src="(selectedInterrogationCharacter || availableCharacters[0])?.characterImageURL"
                  :alt="(selectedInterrogationCharacter || availableCharacters[0])?.characterName"
                />
                <div class="character-status-dot online"></div>
              </div>
              <div class="character-details">
                <div class="character-name-small">
                  {{ (selectedInterrogationCharacter || availableCharacters[0])?.characterName }}
                </div>
                <div class="character-role-small">
                  {{ (selectedInterrogationCharacter || availableCharacters[0])?.characterRole }}
                </div>
              </div>
            </div>
            <div class="dropdown-arrow" :class="{ 'rotated': isCharacterDropdownOpen }">
              ▼
            </div>
          </div>

          <!-- Dropdown List -->
          <transition name="dropdown-slide">
            <div v-if="isCharacterDropdownOpen" class="character-dropdown-list">
              <div
                v-for="character in availableCharacters"
                :key="character.characterId"
                @click="selectCharacterFromDropdown(character)"
                class="character-dropdown-item"
                :class="{
                  'selected': selectedInterrogationCharacter?.characterId === character.characterId,
                  'active': activeCharacter?.characterId === character.characterId
                }"
                :style="{ '--character-color': character.themeColor }"
              >
                <div class="character-avatar-small">
                  <img :src="character.characterImageURL" :alt="character.characterName" />
                  <div class="character-status-dot online"></div>
                </div>
                <div class="character-details">
                  <div class="character-name-small">{{ character.characterName }}</div>
                  <div class="character-role-small">{{ character.characterRole }}</div>
                </div>
                <div v-if="selectedInterrogationCharacter?.characterId === character.characterId" class="selected-indicator">
                  ✓
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- History & Recommendations Section -->
      <div class="sidebar-section history-section">
        <div class="section-header">
          <h3 class="section-title">询问历史</h3>
          <p class="section-subtitle">最近的对话记录</p>
        </div>

        <!-- Recent Questions History -->
        <div class="history-list" v-if="questionHistory.length > 0">
          <div
            v-for="(item, index) in questionHistory.slice(-5)"
            :key="index"
            class="history-item"
          >
            <div class="history-question">
              <span class="history-icon">❓</span>
              <span class="history-text">{{ item.question }}</span>
            </div>
            <div class="history-answer" v-if="item.answer">
              <span class="history-icon">💬</span>
              <span class="history-text">{{ item.answer.substring(0, 100) }}{{ item.answer.length > 100 ? '...' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-history">
          <p>还没有询问记录</p>
          <p class="empty-subtitle">开始提问来查看历史记录</p>
        </div>

        <!-- Recommended Questions -->
        <div class="recommended-questions">
          <h4 class="recommendations-title">推荐问题</h4>
          <div class="recommendation-list">
            <button
              v-for="(question, index) in recommendedQuestions"
              :key="index"
              @click="handleQuestionSelection(question)"
              class="recommendation-button"
            >
              {{ question }}
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Question Input Section -->
      <div class="sidebar-section custom-question-section">
        <div class="section-header">
          <h3 class="section-title">自定义问题</h3>
          <p class="section-subtitle">输入你想问的问题</p>
        </div>

        <div class="custom-question-input-area">
          <textarea
            v-model="customQuestion"
            placeholder="输入你想问的问题..."
            class="custom-question-textarea-sidebar"
            rows="3"
          ></textarea>
          <button
            @click="askCustomQuestion"
            :disabled="!customQuestion.trim()"
            class="ask-question-btn"
          >
            <span class="btn-icon">💬</span>
            <span class="btn-text">提问</span>
          </button>
        </div>
      </div>

      <!-- Current Interrogation Status -->
      <div v-if="selectedInterrogationCharacter" class="sidebar-section interrogation-status-section">
        <div class="section-header">
          <h3 class="section-title">当前审讯</h3>
        </div>

        <div class="current-interrogation-info">
          <div class="interrogation-target">
            <img :src="selectedInterrogationCharacter.characterImageURL" :alt="selectedInterrogationCharacter.characterName" class="target-avatar" />
            <div class="target-info">
              <div class="target-name">{{ selectedInterrogationCharacter.characterName }}</div>
              <div class="target-role">{{ selectedInterrogationCharacter.characterRole }}</div>
              <div class="target-ai">{{ selectedInterrogationCharacter.llmName }}</div>
            </div>
          </div>
          <button @click="exitInterrogationMode" class="exit-interrogation-button">
            结束审讯
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackgroundSystem from './BackgroundSystem.vue'
import CharacterPanel from './CharacterPanel.vue'
import DialogueSystem from './DialogueSystem.vue'
import SceneTransition from './SceneTransition.vue'
import ControlPanel from './ControlPanel.vue'
import HistoryModal from './HistoryModal.vue'
import { useGameData, type CharacterData } from '@/composables/useGameData'
import { useDialogueSystem } from '@/composables/useDialogueSystem'
import { useSceneTransition } from '@/composables/useSceneTransition'
import { useAISelection } from '@/composables/useAISelection'
import { useQuestionTemplates } from '@/composables/useQuestionTemplates'
import { useInteractionSystem } from '@/composables/useInteractionSystem'
import { useGameLogic, type MonologueEntry } from '@/composables/useGameLogic' // 引入更新后的组合式函数

// 使用组合式函数
const { characterDatabase, sceneBackgrounds, scriptData } = useGameData()
const {
  currentSceneIndex,
  currentDialogue,
  displayedDialogueText,
  isTypingActive,
  isAIProcessing,
  processingProgress,
  startTypingEffect,
  skipTypingEffect
} = useDialogueSystem()

const {
  isSceneTransitioning,
  nextCharacterData,
  currentSceneId,
  transitionToScene
} = useSceneTransition()

// 交互系统
const {
  selectedAI,
  selectAI,
  mapCharacterToAI
} = useAISelection()

const {
  questionTemplates,
  addToRecentQuestions,
  getContextualQuestions
} = useQuestionTemplates()

const {
  processUserQuestion
} = useInteractionSystem()

// 使用更新后的核心游戏逻辑
const {
  sessionId,
  unifiedMonologueQueue,
  currentSentenceIndex,
  isLoading,
  error,
  startGame,
  advanceToNextSentence
} = useGameLogic()

// 历史记录类型定义
interface HistoryItem {
  character: {
    characterId: string
    characterName: string
    characterImageURL: string
    llmName: string
  }
  dialogueText: string
  timestamp: Date
}

// 组件状态
const showUserInterface = ref(false)
const historyModalVisible = ref(false)
const autoAdvanceEnabled = ref(false)
const userInputText = ref('')
const completedSceneHistory = ref<HistoryItem[]>([])

// 角色审讯系统状态
const selectedInterrogationCharacter = ref<CharacterData | null>(null)
const isInterrogationMode = ref(false)
const customQuestion = ref('')

// 新增：当前活跃角色状态
const activeCharacter = ref<any>(null) // 当前说话的角色信息
const canContinue = ref(false)

// 下拉选择器状态
const isCharacterDropdownOpen = ref(false)

// 可拖动侧边栏状态
const sidebarWidth = ref(30) // 默认30%
const isDragging = ref(false)

// 历史记录状态
interface QuestionHistoryItem {
  question: string
  answer: string
  timestamp: Date
  characterId: string
}

const questionHistory = ref<QuestionHistoryItem[]>([])

// 推荐问题
const recommendedQuestions = ref([
  '你能告诉我更多关于这个案件的细节吗？',
  '你当时在现场看到了什么？'
])

// 计算属性
// 当前显示的角色（优先显示审讯角色，否则显示剧情角色）
const displayedCharacter = computed(() => {
  return selectedInterrogationCharacter.value || activeCharacter.value
})

const isCharacterSpeaking = computed(() => {
  return !isLoading.value && currentDialogue.text && isTypingActive.value
})

// 新增计算属性
const contextualQuestions = computed(() => {
  // 在审讯模式下，显示所有问题类别
  if (isInterrogationMode.value) {
    return questionTemplates
  }
  // 否则显示基于场景的上下文问题
  return getContextualQuestions(currentSceneId.value, activeCharacter.value?.characterId || '')
})

// 可用角色列表
const availableCharacters = computed(() => {
  return Object.values(characterDatabase)
})

// 下拉选择器相关方法
const toggleCharacterDropdown = () => {
  isCharacterDropdownOpen.value = !isCharacterDropdownOpen.value
}

const selectCharacterFromDropdown = async (character: CharacterData) => {
  console.log('🎭 选择审讯角色:', character.characterName)
  console.log('当前剧情角色:', activeCharacter.value?.characterName)

  // 如果选择的是当前角色，直接关闭下拉框
  if (selectedInterrogationCharacter.value?.characterId === character.characterId) {
    isCharacterDropdownOpen.value = false
    return
  }

  // 开始角色切换过渡
  isSceneTransitioning.value = true
  nextCharacterData.value = character

  // 延迟一下以显示过渡效果
  setTimeout(() => {
    selectedInterrogationCharacter.value = character
    isInterrogationMode.value = true
    isCharacterDropdownOpen.value = false // 选择后关闭下拉框
    console.log('审讯模式已激活，审讯角色:', character.characterName)

    // 自动映射角色到对应的AI
    const mappedAI = mapCharacterToAI(character)
    selectAI(mappedAI)

    // 显示角色欢迎语
    const welcomeMessage = getCharacterWelcomeMessage(character)
    if (welcomeMessage) {
      currentDialogue.text = welcomeMessage
      currentDialogue.characterId = character.characterId
      startTypingEffect(welcomeMessage)
      console.log('显示欢迎语:', welcomeMessage)
    }

    // 结束过渡
    setTimeout(() => {
      isSceneTransitioning.value = false
      nextCharacterData.value = null
    }, 500)
  }, 300)
}

// 获取角色欢迎消息
const getCharacterWelcomeMessage = (character: CharacterData): string => {
  const welcomeMessages: Record<string, string> = {
    'sherlock': '很好，你想要询问什么？我的推理能力随时为你服务。',
    'watson': '医生在此，有什么医学相关的问题吗？',
    'moriarty': '有趣...你想从我这里得到什么信息呢？',
    'default': `你好，我是${character.characterName}。有什么想要了解的吗？`
  }

  return welcomeMessages[character.characterId] || welcomeMessages['default']
}

// 选择审讯角色 (保留原方法以兼容)
const selectCharacterForInterrogation = (character: CharacterData) => {
  selectCharacterFromDropdown(character)
}

/**
 * 处理 "继续" 按钮的点击事件
 */
const handleContinue = () => {
  if (isTypingActive.value) {
    skipTypingEffect()
    return
  }

  const nextEntry = advanceToNextSentence()

  if (nextEntry) {
    // 根据 characterId 找到角色的详细数据以显示头像等
    const characterData = characterDatabase[nextEntry.characterId]
    if (characterData) {
      activeCharacter.value = characterData
    } else {
      // 如果在数据库中找不到，使用默认数据
      activeCharacter.value = {
        characterId: nextEntry.characterId,
        characterName: nextEntry.characterId,
        characterImageURL: '/placeholder.svg',
        llmName: 'AI Model',
        characterRole: 'Unknown',
        llmProvider: 'Unknown',
        themeColor: '#667eea',
        characterMood: 'neutral',
        sceneId: 'default'
      }
    }

    // 更新对话内容为当前句子
    currentDialogue.text = nextEntry.sentence
    currentDialogue.characterId = nextEntry.characterId
    startTypingEffect(nextEntry.sentence)

    // 只要队列里还有话，就可以继续
    canContinue.value = true
  } else {
    // 所有独白结束，进入提问环节
    console.log("所有角色独白已完成，进入提问环节。")
    activeCharacter.value = null // 清空当前角色
    currentDialogue.text = "第一幕：所有角色介绍完毕。现在，你们可以开始自由讨论和提问了。"
    startTypingEffect(currentDialogue.text)

    // 禁用"继续"按钮，因为独白阶段结束了
    canContinue.value = false

    // 在这里可以添加逻辑来显示提问UI
    // showUserInterface.value = true
  }
}

// 拖动相关方法
const startDragging = (event: MouseEvent) => {
  isDragging.value = true
  const startX = event.clientX
  const startWidth = sidebarWidth.value

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = startX - e.clientX
    const containerWidth = window.innerWidth
    const newSidebarWidth = startWidth + (deltaX / containerWidth) * 100

    // 限制侧边栏宽度在20%到50%之间
    sidebarWidth.value = Math.max(20, Math.min(50, newSidebarWidth))
  }

  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 退出审讯模式
const exitInterrogationMode = () => {
  console.log('🔄 退出审讯模式开始')
  console.log('当前审讯角色:', selectedInterrogationCharacter.value?.characterName)
  console.log('当前剧情角色:', activeCharacter.value?.characterName)
  console.log('当前场景索引:', currentSceneIndex.value)

  selectedInterrogationCharacter.value = null
  isInterrogationMode.value = false
  customQuestion.value = ''

  // 恢复到当前剧情场景的对话状态
  const currentScene = scriptData[currentSceneIndex.value]
  console.log('当前场景数据:', currentScene)

  if (currentScene && currentScene.dialogueText) {
    currentDialogue.text = currentScene.dialogueText
    currentDialogue.characterId = currentScene.characterData?.characterId || ''
    console.log('恢复对话内容:', currentScene.dialogueText)
    console.log('恢复角色ID:', currentScene.characterData?.characterId)
    // 重新开始打字效果以显示当前剧情对话
    startTypingEffect(currentScene.dialogueText)
  } else {
    // 如果没有当前场景对话，清空对话显示
    currentDialogue.text = ''
    currentDialogue.characterId = ''
    displayedDialogueText.value = ''
    console.log('清空对话显示')
  }

  console.log('🔄 退出审讯模式完成')
}

// 提问自定义问题
const askCustomQuestion = async () => {
  if (!customQuestion.value.trim()) return

  const question = customQuestion.value.trim()
  customQuestion.value = ''

  // 处理自定义问题
  await handleQuestionSelection(question)
}

// 处理问题选择
const handleQuestionSelection = async (question: string) => {
  addToRecentQuestions(question)

  // 确定要审讯的角色
  const targetCharacter = selectedInterrogationCharacter.value || activeCharacter.value

  // 处理用户问题
  try {
    // 先添加用户问题到历史
    completedSceneHistory.value.push({
      character: {
        characterId: 'user',
        characterName: '调查员',
        characterImageURL: '/placeholder.svg?height=50&width=50&text=User',
        llmName: 'Human Player'
      },
      dialogueText: `问: ${question}`,
      timestamp: new Date()
    })

    const response = await processUserQuestion(question, selectedAI.value, {
      currentScene: scriptData[currentSceneIndex.value],
      character: targetCharacter
    })

    // 添加到问题历史记录
    questionHistory.value.push({
      question: question,
      answer: response,
      timestamp: new Date(),
      characterId: targetCharacter?.characterId || 'unknown'
    })

    // 将角色响应添加到对话历史
    completedSceneHistory.value.push({
      character: {
        characterId: targetCharacter?.characterId || 'ai_response',
        characterName: targetCharacter?.characterName || selectedAI.value.name,
        characterImageURL: targetCharacter?.characterImageURL || '/placeholder.svg?height=50&width=50&text=AI',
        llmName: targetCharacter?.llmName || selectedAI.value.name
      },
      dialogueText: response,
      timestamp: new Date()
    })

    // 在审讯模式下，更新当前对话显示
    if (isInterrogationMode.value && targetCharacter) {
      currentDialogue.text = response
      currentDialogue.characterId = targetCharacter.characterId
      startTypingEffect(response)
    }
  } catch (error) {
    console.error('处理问题时出错:', error)
  }
}

// 场景推进
const advanceToNextScene = () => {
  if (currentSceneIndex.value < scriptData.length - 1) {
    transitionToScene(currentSceneIndex.value + 1, {
      scriptData,
      currentSceneIndex,
      currentSceneId,
      currentDialogue,
      isAIProcessing,
      processingProgress,
      startTypingEffect,
      completedSceneHistory
    })
  } else {
    showUserInterface.value = true
  }
}

// 控制函数
const restartScript = () => {
  currentSceneIndex.value = 0
  completedSceneHistory.value = []
  showUserInterface.value = false
  currentDialogue.text = ''
  displayedDialogueText.value = ''
  transitionToScene(0, {
    scriptData,
    currentSceneIndex,
    currentSceneId,
    currentDialogue,
    isAIProcessing,
    processingProgress,
    startTypingEffect,
    completedSceneHistory
  })
}

const toggleAutoAdvance = () => {
  autoAdvanceEnabled.value = !autoAdvanceEnabled.value
}

const showScriptHistory = () => {
  historyModalVisible.value = true
}

const showInterfaceSettings = () => {
  console.log('Settings interface would be displayed here')
}

const submitUserInput = () => {
  if (!userInputText.value.trim()) return

  completedSceneHistory.value.push({
    character: {
      characterId: 'user',
      characterName: '调查员',
      characterImageURL: '/placeholder.svg?height=50&width=50&text=User',
      llmName: 'Human Player'
    },
    dialogueText: userInputText.value.trim(),
    timestamp: new Date()
  })

  userInputText.value = ''
  showUserInterface.value = false
}

// 监听自动推进
watch(() => isTypingActive.value, (newValue) => {
  if (!newValue && autoAdvanceEnabled.value && canContinue.value) {
    setTimeout(() => {
      advanceToNextScene()
    }, 2500)
  }
})

// 点击外部关闭下拉框
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const dropdown = document.querySelector('.character-dropdown-container')
  if (dropdown && !dropdown.contains(target)) {
    isCharacterDropdownOpen.value = false
  }
}

// 键盘快捷键处理
const handleKeydown = (event: KeyboardEvent) => {
  // ESC键关闭下拉框
  if (event.key === 'Escape' && isCharacterDropdownOpen.value) {
    isCharacterDropdownOpen.value = false
    event.preventDefault()
  }

  // 数字键快速选择角色 (1-9)
  if (event.key >= '1' && event.key <= '9' && !isCharacterDropdownOpen.value) {
    const index = parseInt(event.key) - 1
    if (index < availableCharacters.value.length) {
      selectCharacterFromDropdown(availableCharacters.value[index])
      event.preventDefault()
    }
  }
}

// 路由相关
const route = useRoute()
const router = useRouter()

// 获取路由参数中的剧本ID
const scriptId = computed(() => route.params.scriptId as string)

// 监听剧本ID变化，可以在这里根据不同的剧本加载不同的数据
watch(scriptId, (newScriptId) => {
  if (newScriptId) {
    console.log('选中的剧本ID:', newScriptId)
    // 这里可以根据剧本ID加载对应的剧本数据
    // 目前使用默认数据，后续可以扩展
  }
}, { immediate: true })

// 返回主页的方法
const goToHome = () => {
  router.push('/')
}

// 初始化游戏
onMounted(async () => {
  const scriptId = route.params.scriptId as string
  if (scriptId) {
    await startGame(scriptId)
    // 游戏数据加载完毕后，自动触发第一句话
    if (unifiedMonologueQueue.value.length > 0) {
      handleContinue()
    }
  }

  // 添加全局事件监听器
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('scroll', handleWindowResize)
})

// 窗口大小改变时关闭下拉框（简化处理）
const handleWindowResize = () => {
  if (isCharacterDropdownOpen.value) {
    isCharacterDropdownOpen.value = false
  }
}

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener('scroll', handleWindowResize)
})
</script>

<style scoped>
/* Two-Panel Layout */
.galgame-main-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

/* Left Panel: Main Game Area (70%) */
.main-game-panel {
  flex: 0 0 70%;
  position: relative;
  height: 100vh;
  overflow: hidden;
}

/* Right Panel: Interrogation Sidebar (30%) */
.interrogation-sidebar {
  flex: 0 0 30%;
  height: 100vh;
  background: linear-gradient(180deg, rgba(20, 20, 40, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%);
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  overflow-y: auto;
  overflow-x: visible; /* 确保下拉框不被水平裁剪 */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

/* Sidebar Sections */
.sidebar-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.section-header {
  margin-bottom: 1rem;
  text-align: center;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
}

.section-subtitle {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Character Selection Section */
.character-selection-section {
  flex-shrink: 0;
}

/* Enhanced Dropdown Section - 更亮的背景色和不同描边 */
.character-selection-section.enhanced-dropdown {
  background: rgba(255, 255, 255, 0.08); /* 比问题类别稍亮 */
  border: 2px solid rgba(102, 126, 234, 0.3); /* 不同的描边颜色 */
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);
  overflow: visible; /* 确保下拉框不被裁剪 */
  z-index: 1000; /* 提高section的层级 */
}

/* Character Dropdown Styles */
.character-dropdown-container {
  position: relative;
  z-index: 9999; /* 确保容器本身有足够高的层级 */
}

.character-dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.character-dropdown-trigger:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #667eea;
}

.character-dropdown-trigger.expanded {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.12);
}

.character-dropdown-trigger.transitioning {
  opacity: 0.7;
  pointer-events: none;
}

.character-dropdown-trigger.transitioning .selected-character-display {
  animation: pulse 1s infinite;
}

.selected-character-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.dropdown-arrow {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.character-dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(20, 20, 40, 0.98); /* 提高不透明度确保可见性 */
  border: 2px solid #667eea; /* 加粗边框提高可见性 */
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  backdrop-filter: blur(20px);
  z-index: 99999; /* 大幅提高z-index值 */
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); /* 添加阴影提高层次感 */
}

.character-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.character-dropdown-item:last-child {
  border-bottom: none;
}

.character-dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(2px);
}

.character-dropdown-item.selected {
  background: rgba(102, 126, 234, 0.2);
  border-left: 3px solid #667eea;
}

.selected-indicator {
  margin-left: auto;
  color: #667eea;
  font-weight: bold;
  font-size: 1rem;
}

/* Dropdown Animation */
.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: all 0.3s ease;
  transform-origin: top;
}

.dropdown-slide-enter-from {
  opacity: 0;
  transform: scaleY(0);
}

.dropdown-slide-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.character-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.character-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.character-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--character-color, #667eea);
  transform: translateX(2px);
}

.character-card.selected {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--character-color, #667eea);
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.3);
}

.character-avatar-small {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--character-color, #667eea);
  flex-shrink: 0;
}

.character-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.character-status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #333;
  border: 2px solid #fff;
}

.character-status-dot.online {
  background: #00ff88;
  animation: pulse 2s infinite;
}

.character-details {
  flex: 1;
  min-width: 0;
}

.character-name-small {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-role-small {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* History Section */
.history-section {
  flex: 1;
  overflow-y: auto;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 0.5rem;
}

.history-question,
.history-answer {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.history-question:last-child,
.history-answer:last-child {
  margin-bottom: 0;
}

.history-icon {
  font-size: 0.8rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.history-text {
  font-size: 0.75rem;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.8);
}

.history-question .history-text {
  color: #667eea;
  font-weight: 500;
}

.empty-history {
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-history p {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
}

.empty-subtitle {
  font-size: 0.75rem !important;
  opacity: 0.7;
}

.recommended-questions {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.recommendations-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.75rem 0;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recommendation-button {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  color: #ffffff;
  font-size: 0.75rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1.3;
}

.recommendation-button:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
  transform: translateX(2px);
}

.question-categories-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-category-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.75rem;
}

.category-header-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.category-icon-small {
  font-size: 1rem;
}

.category-title-small {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.question-list-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  color: #ffffff;
  font-size: 0.75rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1.3;
}

.question-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #667eea;
  transform: translateX(2px);
}

/* Custom Question Input Section */
.custom-question-section {
  flex-shrink: 0;
}

.custom-question-input-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.custom-question-textarea-sidebar {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 0.75rem;
  color: #ffffff;
  font-size: 0.8rem;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.custom-question-textarea-sidebar:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

.custom-question-textarea-sidebar::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.ask-question-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.ask-question-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.ask-question-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-size: 0.8rem;
}

/* Interrogation Status Section */
.interrogation-status-section {
  flex-shrink: 0;
}

.current-interrogation-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.interrogation-target {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.target-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #667eea;
}

.target-info {
  flex: 1;
}

.target-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.target-role {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
}

.target-ai {
  font-size: 0.65rem;
  color: #667eea;
  font-weight: 500;
}

.exit-interrogation-button {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: none;
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.exit-interrogation-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .galgame-main-container {
    flex-direction: column;
  }

  .main-game-panel {
    flex: 0 0 60%;
  }

  .interrogation-sidebar {
    flex: 0 0 40%;
    border-left: none;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
  }
}

@media (max-width: 768px) {
  .galgame-main-container {
    flex-direction: column;
  }

  .main-game-panel {
    flex: 0 0 50%;
  }

  .interrogation-sidebar {
    flex: 0 0 50%;
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .sidebar-section {
    padding: 0.75rem;
  }

  .section-title {
    font-size: 0.9rem;
  }

  .section-subtitle {
    font-size: 0.75rem;
  }

  .character-card {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .character-avatar-small {
    width: 32px;
    height: 32px;
  }

  .question-button {
    padding: 0.4rem 0.6rem;
    font-size: 0.7rem;
  }
}




</style>
