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
        :is-ai-processing="isLoading"
      />

      <!-- Dialogue System -->
      <DialogueSystem
        :is-ai-processing="isLoading"
        :current-dialogue="currentDialogue"
        :active-character="activeCharacter"
        :displayed-text="displayedDialogueText"
        :is-typing="isTypingActive"
        :can-continue="canContinue"
        :current-scene-index="currentSentenceIndex"
        :total-scenes="unifiedMonologueQueue.length"
        :processing-progress="0"
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

      <!-- Ending Overlay -->
      <div v-if="gamePhase === 'completed'" class="ending-overlay">
        <div class="ending-content">
          <h2>游戏结束</h2>
          <div class="ending-text">
            <p v-for="(paragraph, index) in finalEnding" :key="index">
              {{ paragraph }}
            </p>
          </div>
          <button @click="handleRestart" class="restart-button">
            重新开始
          </button>
        </div>
      </div>
    </div>

    <!-- Resizable Divider -->
    <div
      class="resize-divider"
      @mousedown="startDragging"
      :class="{ 'dragging': isDragging }"
    ></div>

    <div class="interrogation-sidebar">

      <div class="sidebar-section history-section">
        <h3 class="section-title">询问历史</h3>
        <div class="history-log" ref="historyLogRef">
          <div v-if="interactionHistory.length === 0" class="history-placeholder">
            还没有任何记录...
          </div>
          <div v-for="(entry, index) in interactionHistory" :key="index" :class="['history-entry', `entry-${entry.type}`]">
            <div v-if="entry.type === 'system'" class="system-message">{{ entry.content }}</div>
            <div v-else-if="entry.type === 'monologue'">
              <span class="history-speaker">{{ getDisplayName(entry.characterId, characters) }}: </span>
              <span class="history-content">{{ entry.content }}</span>
            </div>
            <div v-else-if="entry.type === 'question'">
              <span class="history-speaker player">{{ getDisplayName(entry.questionerId, characters) }}</span>
              <span> 对 </span>
              <span class="history-speaker">{{ getDisplayName(entry.targetCharacterId, characters) }}</span>
              <span> 说: </span>
              <span class="history-content question">"{{ entry.content }}"</span>
            </div>
            <div v-else-if="entry.type === 'answer'">
              <span class="history-speaker">{{ getDisplayName(entry.characterId, characters) }}: </span>
              <span class="history-content answer">{{ entry.content }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-section ask-section">
        <div class="section-header">
          <h3 class="section-title">提问 (第 {{ currentAct }}幕)</h3>
          <div class="qna-controls">
            <span class="question-counter">提问: {{ questionCount }} / 12</span>
            <button
              @click="handleAdvanceAct"
              :disabled="isLoading || gamePhase !== 'qna'"
              class="next-act-button"
            >
              {{ currentAct === 2 ? '查看最终结局' : '进入下一幕' }}
            </button>
          </div>
        </div>

        <div class="character-tabs">
          <button
            v-for="char in interrogationTargets"
            :key="char.id"
            @click="selectedCharacterId = char.id"
            :class="['tab-item', { active: selectedCharacterId === char.id }]"
            :disabled="gamePhase !== 'qna'"
          >
            {{ char.id }} </button>
        </div>
        <textarea
          v-model="customQuestion"
          placeholder="在此输入你对角色的提问..."
          class="custom-question-textarea"
          rows="4"
          :disabled="gamePhase !== 'qna' || isLoading"
        ></textarea>
        <button
          @click="handleAskQuestion"
          :disabled="!customQuestion.trim() || !selectedCharacterId || isLoading || gamePhase !== 'qna'"
          class="ask-question-button"
        >
          发送问题
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
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
// 引入最新的 useGame 和 getDisplayName
import { useGame, getDisplayName } from '@/composables/useGame';

// 使用组合式函数
const { characterDatabase, sceneBackgrounds } = useGameData()
const {
  currentSceneIndex,
  currentDialogue,
  displayedDialogueText,
  isTypingActive,
  startTypingEffect,
  skipTypingEffect
} = useDialogueSystem()

const {
  isSceneTransitioning,
  nextCharacterData,
  currentSceneId
} = useSceneTransition()

// --- 状态管理 ---
const route = useRoute();
const router = useRouter();
const {
  isLoading, gamePhase, characters, interactionHistory,
  interrogationTargets, // 使用过滤后的提问对象
  unifiedMonologueQueue,
  currentSentenceIndex,
  currentAct, // 新增
  questionCount, // 新增
  finalEnding, // 新增 finalEnding
  startGame, advanceMonologue, askQuestion, advanceAct, addHistoryEntry // 新增 advanceAct
} = useGame();

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
const customQuestion = ref('')

// 新增：当前活跃角色状态
const activeCharacter = ref<any>(null) // 当前说话的角色信息
const canContinue = ref(false)

// Q&A阶段状态
const selectedCharacterId = ref<string | null>(null)

// 可拖动侧边栏状态
const sidebarWidth = ref(30) // 默认30%
const isDragging = ref(false)

// --- 本地组件状态 ---
const historyLogRef = ref<HTMLElement | null>(null);

// 计算属性
// 当前显示的角色（优先显示审讯角色，否则显示剧情角色）
const displayedCharacter = computed(() => {
  return selectedInterrogationCharacter.value || activeCharacter.value
})

const isCharacterSpeaking = computed(() => {
  return !isLoading.value && currentDialogue.text && isTypingActive.value
})

// --- 方法 ---
/**
 * 处理独白条目的通用函数
 */
const processMonologueEntry = (entry: any) => {
  // 🔥 关键修改：在用户点击"继续"时才添加到历史记录
  addHistoryEntry({
    type: 'monologue',
    characterId: entry.characterId,
    content: entry.sentence
  })

  // 根据 characterId 找到角色的详细数据以显示头像等
  const characterData = characterDatabase[entry.characterId]
  if (characterData) {
    activeCharacter.value = characterData
  } else {
    // 如果在数据库中找不到，使用默认数据
    activeCharacter.value = {
      characterId: entry.characterId,
      characterName: entry.characterId,
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
  currentDialogue.text = entry.sentence
  currentDialogue.characterId = entry.characterId
  startTypingEffect(entry.sentence)

  // 只要队列里还有话，就可以继续
  canContinue.value = true
}

/**
 * 处理 "继续" 按钮的点击事件
 */
const handleContinue = () => {
  if (isTypingActive.value) {
    skipTypingEffect()
    return
  }

  // 如果当前是系统初始消息，直接开始第一个独白
  if (currentDialogue.characterId === 'system' && currentDialogue.text.includes('欢迎来到剧本杀游戏')) {
    // 开始第一个独白
    const firstEntry = advanceMonologue()
    if (firstEntry) {
      // 处理第一个独白条目
      processMonologueEntry(firstEntry)
    }
    return
  }

  const nextEntry = advanceMonologue()

  if (nextEntry) {
    processMonologueEntry(nextEntry)
  } else {
    // 所有独白结束，进入提问环节
    console.log("所有角色独白已完成，进入提问环节。")

    // 🔥 添加系统消息到历史记录，表示独白阶段结束
    addHistoryEntry({
      type: 'system',
      content: '所有角色独白完成，现在可以开始提问了！'
    })

    activeCharacter.value = null // 清空当前角色
    currentDialogue.text = "第一幕：所有角色介绍完毕。现在，你们可以开始自由讨论和提问了。"
    startTypingEffect(currentDialogue.text)

    // 禁用"继续"按钮，因为独白阶段结束了
    canContinue.value = false
  }
}

const handleAskQuestion = async () => {
  if (!customQuestion.value.trim() || !selectedCharacterId.value) return;
  await askQuestion(selectedCharacterId.value, customQuestion.value);
  customQuestion.value = '';

  // 检查是否达到提问上限
  if (questionCount.value >= 12) {
    // 可以在这里自动触发进入下一幕，或者只是提示用户
    console.log("已达到本幕提问上限，请点击'进入下一幕'。");
    // 可选：自动推进
    // handleAdvanceAct();
  }
};

// 新增：处理进入下一幕的点击事件
const handleAdvanceAct = async () => {
  await advanceAct();
  // 如果不是最终结局，则开始新一幕的独白
  if (gamePhase.value === 'monologue') {
    handleContinue();
  }
};

// 新增：处理重新开始的逻辑
const handleRestart = () => {
  // 简单地重新加载页面或调用startGame
  window.location.reload();
};

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

// 控制函数
const restartScript = () => {
  currentSceneIndex.value = 0
  completedSceneHistory.value = []
  showUserInterface.value = false
  currentDialogue.text = ''
  displayedDialogueText.value = ''
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

// 返回主页的方法
const goToHome = () => {
  router.push('/')
}

// 获取路由参数中的剧本ID
const scriptId = computed(() => route.params.scriptId as string)

// --- 生命周期与监听 ---
// 初始化游戏
onMounted(async () => {
  const scriptId = route.params.scriptId as string
  console.log('GalgameInterface mounted with scriptId:', scriptId)

  if (scriptId) {
    console.log('Starting game...')
    await startGame(scriptId, '神探李')
    console.log('Game started. unifiedMonologueQueue length:', unifiedMonologueQueue.value.length)

    // 游戏数据加载完毕后，设置初始欢迎消息
    if (unifiedMonologueQueue.value.length > 0) {
      console.log('Setting up initial dialogue...')
      // 设置初始对话状态，提示用户可以开始游戏
      currentDialogue.text = "欢迎来到剧本杀游戏！点击【继续】按钮开始角色独白。"
      currentDialogue.characterId = "system"
      console.log('Setting initial dialogue:', currentDialogue)
      startTypingEffect(currentDialogue.text)
      canContinue.value = true
      console.log('canContinue set to:', canContinue.value)

      // 设置一个系统角色用于显示初始消息
      activeCharacter.value = {
        characterId: 'system',
        characterName: '游戏系统',
        characterImageURL: '/placeholder.svg?height=60&width=60&text=🎭',
        llmName: '系统提示',
        characterRole: 'System',
        llmProvider: 'System',
        themeColor: '#667eea',
        characterMood: 'neutral',
        sceneId: 'default'
      }
      console.log('activeCharacter set to:', activeCharacter.value)
    } else {
      console.log('No monologue queue available, showing fallback message')
      // 如果没有独白队列，显示一个备用消息和测试数据
      currentDialogue.text = "游戏加载失败或后端不可用。这是测试模式，点击【继续】查看对话界面。"
      currentDialogue.characterId = "system"
      startTypingEffect(currentDialogue.text)
      canContinue.value = true

      // 设置一个系统角色用于显示测试消息
      activeCharacter.value = {
        characterId: 'system',
        characterName: '测试系统',
        characterImageURL: '/placeholder.svg?height=60&width=60&text=🎭',
        llmName: '测试模式',
        characterRole: 'System',
        llmProvider: 'Test',
        themeColor: '#667eea',
        characterMood: 'neutral',
        sceneId: 'default'
      }

      // 注意：无法直接修改 unifiedMonologueQueue，因为它是只读的
      console.log('Test mode: dialogue interface should still be visible')
    }
  }

  // 添加全局事件监听器
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('scroll', handleWindowResize)
})

// 监听自动推进
watch(() => isTypingActive.value, (newValue) => {
  if (!newValue && autoAdvanceEnabled.value && canContinue.value) {
    setTimeout(() => {
      handleContinue()
    }, 2500)
  }
})

// 监听剧本ID变化，可以在这里根据不同的剧本加载不同的数据
watch(scriptId, (newScriptId) => {
  if (newScriptId) {
    console.log('选中的剧本ID:', newScriptId)
    // 这里可以根据剧本ID加载对应的剧本数据
    // 目前使用默认数据，后续可以扩展
  }
}, { immediate: true })

watch(interactionHistory, () => {
  nextTick(() => {
    const logEl = historyLogRef.value;
    if (logEl) {
      logEl.scrollTop = logEl.scrollHeight;
    }
  });
}, { deep: true });

// 监听提问数，达到12次时可以给出提示
watch(questionCount, (newCount) => {
    if (newCount === 12) {
        // 在历史记录中添加系统提示
        addHistoryEntry({ type: 'system', content: '本幕提问已达上限，请点击"进入下一幕"继续。' });
    }
});

// 点击外部关闭下拉框
const handleClickOutside = (_event: Event) => {
  // 简化处理
}

// 键盘快捷键处理
const handleKeydown = (_event: KeyboardEvent) => {
  // 简化处理
}

// 窗口大小改变时关闭下拉框（简化处理）
const handleWindowResize = () => {
  // 简化处理
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
/* 严格按照新设计图的样式 */
:root {
  --sidebar-bg: #1a202c;
  --sidebar-section-bg: #2d3748;
  --sidebar-border-color: #4a5568;
  --text-primary: #e2e8f0;
  --text-secondary: #a0aec0;
  --accent-color: #4c51bf;
  --player-color: #38b2ac; /* 青色，用于玩家高亮 */
}

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

/* Resizable Divider */
.resize-divider {
  width: 4px;
  background: rgba(255, 255, 255, 0.2);
  cursor: col-resize;
  transition: background-color 0.2s;
}

.resize-divider:hover {
  background: rgba(255, 255, 255, 0.4);
}

.resize-divider.dragging {
  background: rgba(255, 255, 255, 0.6);
}

/* Right Panel: Interactive Interrogation Sidebar (30%) */
.interrogation-sidebar {
  flex: 0 0 30%;
  height: 100vh;
  background: var(--sidebar-bg);
  color: var(--text-primary);
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  overflow-y: auto;
  overflow-x: visible;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.sidebar-section {
  background: var(--sidebar-section-bg);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin: 0 0 1rem 0;
}

/* 历史记录样式 */
.history-section {
  flex-grow: 1;
  min-height: 0;
}

.history-log {
  overflow-y: auto;
  font-size: 0.875rem;
  line-height: 1.7;
  color: #cbd5e1;
  height: 100%;
  padding-right: 0.5rem;
}
.history-log::-webkit-scrollbar { width: 4px; }
.history-log::-webkit-scrollbar-thumb { background: #718096; border-radius: 2px; }

.history-placeholder { color: #718096; text-align: center; padding-top: 2rem; }
.history-entry { margin-bottom: 0.75rem; }

.history-speaker { font-weight: 600; color: #90cdf4; }
.history-speaker.player { color: var(--player-color); }
.history-content.question { color: #f6e05e; font-style: italic; }

.system-message {
    text-align: center;
    color: var(--text-secondary);
    font-style: italic;
    font-size: 0.8rem;
    padding: 0.5rem 0;
}

/* 提问区样式 */
.ask-section { flex-shrink: 0; }
.character-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.tab-item {
  padding: 0.5rem 0.75rem;
  background: var(--sidebar-border-color);
  border: none;
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}
.tab-item:hover:not(:disabled) { background: #718096; }
.tab-item:disabled { opacity: 0.5; cursor: not-allowed; }
.tab-item.active { background: var(--accent-color); color: white; font-weight: 600; }

.custom-question-textarea {
  width: 100%;
  background: #1a202c;
  border: 1px solid var(--sidebar-border-color);
  border-radius: 6px;
  padding: 0.75rem;
  color: white;
  font-size: 0.875rem;
  resize: none;
  margin-bottom: 0.75rem;
  transition: border-color 0.2s;
}
.custom-question-textarea:focus { outline: none; border-color: var(--accent-color); }

.ask-question-button {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-color);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.ask-question-button:hover:not(:disabled) { background: #434190; }
.ask-question-button:disabled { opacity: 0.5; cursor: not-allowed; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.qna-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.question-counter {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: #1a202c;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.next-act-button {
  padding: 0.4rem 0.8rem;
  background: #c0392b; /* 使用醒目的颜色 */
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;
}
.next-act-button:hover:not(:disabled) {
  background: #e74c3c;
  transform: translateY(-1px);
}
.next-act-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 新增：结局展示面板样式 */
.ending-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ending-content {
  background: var(--sidebar-section-bg);
  padding: 2rem 3rem;
  border-radius: 12px;
  border: 2px solid var(--accent-color);
  max-width: 600px;
  text-align: center;
  color: var(--text-primary);
}

.ending-content h2 {
  font-size: 2rem;
  color: var(--accent-color);
  margin-bottom: 1.5rem;
}

.ending-text {
  font-size: 1rem;
  line-height: 1.8;
  text-align: left;
  margin-bottom: 2rem;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 1rem;
}

.ending-text p {
  margin-bottom: 1rem;
}

.restart-button {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-color);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.restart-button:hover {
  background: #434190;
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

  .character-tabs {
    gap: 0.25rem;
  }

  .tab-item {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }
}
</style>