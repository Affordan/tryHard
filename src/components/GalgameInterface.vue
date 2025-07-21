<template>
  <div class="galgame-main-container">
    <!-- Left Panel: Main Game Area (70%) -->
    <div class="main-game-panel" :class="{ 'maximized': isMaximized }">
      <!-- Dynamic Background System -->
      <BackgroundSystem
        :current-scene-id="currentBackgroundId"
        :scene-backgrounds="sceneBackgrounds"
      />

      <!-- Character Display Panel -->
      <CharacterPanel
        :active-character="activeCharacter"
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

      <!-- 临时测试按钮 -->
      <div style="position: absolute; top: 10px; right: 10px; z-index: 100;">
        <button @click="testEndingDisplay" style="padding: 8px 16px; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;">
          测试结局显示
        </button>
      </div>

      <!-- History Modal -->
      <HistoryModal
        :visible="historyModalVisible"
        :history="completedSceneHistory"
        @close="historyModalVisible = false"
      />

      <!-- Ending Scene Component -->
      <EndingScene
        :visible="gamePhase === 'completed'"
        :ending="finalEnding"
        @close="handleRestart"
      />
    </div>

    <div class="resize-divider" @mousedown="startResize"></div>

    <div class="right-control-panel">
      <button
        @click="toggleSidebar"
        class="control-button"
        :title="isSidebarVisible ? '隐藏侧边栏' : '显示侧边栏'"
      >
        <svg v-if="isSidebarVisible" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm13.793 4.293a1 1 0 00-1.414 1.414L15.414 12l1.979 1.979a1 1 0 101.414-1.414L17.414 12l1.979-1.979a1 1 0 00-1.414-1.414L17.414 10.586l-1.979-1.979zM7 12a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm8.707 7.707a1 1 0 01-1.414-1.414L10.586 12l-1.979-1.979a1 1 0 011.414-1.414L12 10.586l1.979-1.979a1 1 0 111.414 1.414L13.414 12l1.979 1.979a1 1 0 01-1.414 1.414L12 13.414l-1.979 1.979z" clip-rule="evenodd" />
        </svg>
      </button>
      <button
        @click="toggleMaximize"
        class="control-button"
        :title="isMaximized ? '恢复' : '最大化对话'"
      >
        <svg v-if="isMaximized" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M5 5a3 3 0 013-3h8a3 3 0 013 3v2a1 1 0 11-2 0V5a1 1 0 00-1-1H8a1 1 0 00-1 1v14a1 1 0 102 0v-2a1 1 0 112 0v2a1 1 0 001 1h8a1 1 0 001-1v-2a1 1 0 112 0v2a3 3 0 01-3 3H8a3 3 0 01-3-3v-2a1 1 0 112 0v2z" clip-rule="evenodd" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm1 1h14v12H4V6z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div
      class="right-ui-container"
      :style="{ width: isSidebarVisible ? sidebarWidth + 'px' : '0px' }"
      :class="{ 'is-hidden': !isSidebarVisible }"
    >
      <div class="sidebar-toggles-inner">
        <button
          @click="toggleHistoryPanel"
          class="toggle-button inner"
          :class="{ active: isHistoryVisible }"
          title="询问历史"
        >
          📜
        </button>
        <button
          @click="toggleScriptPanel"
          class="toggle-button inner"
          :class="{ active: isScriptVisible }"
          title="我的剧本"
        >
          📖
        </button>
        <button
          @click="toggleAskPanel"
          class="toggle-button inner"
          :class="{ active: isAskVisible }"
          title="提问"
        >
          💡
        </button>
      </div>

      <div
        class="interrogation-sidebar"
        :class="{
          'two-visible': (isHistoryVisible && isScriptVisible) || (isHistoryVisible && isAskVisible) || (isScriptVisible && isAskVisible),
          'three-visible': isHistoryVisible && isScriptVisible && isAskVisible
        }"
      >
        <transition name="panel-slide">
          <div v-if="isHistoryVisible" class="sidebar-section history-section">
            <h3 class="section-title">
              <span class="title-icon">📜</span>
              询问历史
            </h3>
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
        </transition>

        <transition name="panel-slide">
          <div v-if="isScriptVisible" class="sidebar-section script-section">
            <h3 class="section-title">
              <span class="title-icon">📖</span>
              我的剧本
            </h3>
            <div class="script-content">
              <!-- 角色背景卡片 -->
              <div class="script-card character-info-card">
                <div class="card-header">
                  <span class="card-icon character-icon">🕵️</span>
                  <h4 class="card-title">角色档案</h4>
                  <div class="card-expand-btn" @click="toggleCardExpanded('character')">
                    <span class="expand-icon" :class="{ expanded: expandedCards.character }">⌄</span>
                  </div>
                </div>
                <div class="card-content" :class="{ expanded: expandedCards.character }">
                  <div class="character-profile">
                    <div class="character-header">
                      <div class="character-avatar">👩‍⚕️</div>
                      <div class="character-info">
                        <div class="character-name">许苗苗</div>
                        <div class="character-role">医生 (29岁)</div>
                        <div class="character-badge">💊 医疗专家</div>
                      </div>
                    </div>

                    <div class="character-details">
                      <div class="detail-section">
                        <h5 class="detail-title">👨‍👩‍👧‍👦 家庭关系</h5>
                        <div class="family-info">
                          <div class="family-member">
                            <span class="member-role">丈夫:</span>
                            <span class="member-name">朱丰震 (老二)</span>
                          </div>
                          <div class="family-member">
                            <span class="member-role">公公:</span>
                            <span class="member-name">朱大强</span>
                          </div>
                          <div class="family-member">
                            <span class="member-role">大哥:</span>
                            <span class="member-name">朱丰翰</span>
                          </div>
                          <div class="family-member">
                            <span class="member-role">妹妹:</span>
                            <span class="member-name">朱玲玲</span>
                          </div>
                        </div>
                      </div>

                      <div class="detail-section">
                        <h5 class="detail-title">📋 角色背景</h5>
                        <p class="character-description">
                          你是朱家老二的媳妇，一名收入不错的医生。嫁到朱家后，全家人都对你很好，
                          尤其是公公朱大强对你无微不至。你的丈夫朱丰震一直想创业但没有成功，
                          家里的经济主要靠你的工资维持。你有一笔秘密积蓄，是为了给丈夫创业失败后的保障。
                        </p>
                      </div>

                      <div class="detail-section">
                        <h5 class="detail-title">🔍 关键线索</h5>
                        <ul class="investigation-principles">
                          <li>最近给娘家汇了20万应急</li>
                          <li>对朱丰翰有莫名的依靠感</li>
                          <li>对自己的名字感到陌生</li>
                          <li>记忆中有个特别喜欢的男人但想不起来</li>
                          <li>全家自驾游时你父亲身体不适留在家中</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 当前目标卡片 -->
              <div class="script-card objectives-card">
                <div class="card-header">
                  <span class="card-icon objectives-icon">🎯</span>
                  <h4 class="card-title">任务目标</h4>
                  <div class="card-expand-btn" @click="toggleCardExpanded('objectives')">
                    <span class="expand-icon" :class="{ expanded: expandedCards.objectives }">⌄</span>
                  </div>
                </div>
                <div class="card-content" :class="{ expanded: expandedCards.objectives }">
                  <div class="objectives-overview">
                    <!-- 主要目标 -->
                    <div class="primary-objective">
                      <div class="objective-header">
                        <span class="objective-priority">🔥 核心任务</span>
                        <span class="objective-status-badge" :class="gamePhase">
                          {{ gamePhase === 'completed' ? '✅ 已完成' : '🔄 进行中' }}
                        </span>
                      </div>
                      <div class="objective-description">
                        <h5>调查真相</h5>
                        <div class="main-objectives">
                          <div class="objective-item">
                            <span class="objective-number">1.</span>
                            <span class="objective-text">调查清楚是谁拿走了这20万？</span>
                          </div>
                          <div class="objective-item">
                            <span class="objective-number">2.</span>
                            <span class="objective-text">你的身边究竟发生了什么事？</span>
                          </div>
                        </div>
                        <p class="objective-detail">
                          {{ gamePhase === 'monologue' ? '仔细观察每个角色的言行，寻找关于20万失踪的线索' :
                             gamePhase === 'qna' ? '通过提问深入了解家庭成员的动机和行为' :
                             gamePhase === 'completed' ? '恭喜！你已经揭开了事件的真相' : '准备开始调查工作' }}
                        </p>
                      </div>
                    </div>

                    <!-- 统计信息 -->
                    <div class="objectives-stats">
                      <div class="stat-item">
                        <div class="stat-icon">💭</div>
                        <div class="stat-content">
                          <span class="stat-label">提问次数</span>
                          <span class="stat-value">{{ questionCount }}</span>
                        </div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                          <span class="stat-label">调查进度</span>
                          <span class="stat-value">{{ storyProgressPercentage }}%</span>
                        </div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-icon">🎭</div>
                        <div class="stat-content">
                          <span class="stat-label">可询问角色</span>
                          <span class="stat-value">{{ interrogationTargets.length }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 次要目标 -->
                    <div class="secondary-objectives" v-if="expandedCards.objectives">
                      <h5 class="section-subtitle">📋 调查要点</h5>
                      <div class="objective-checklist">
                        <div class="checklist-item" :class="{ completed: questionCount > 0 }">
                          <span class="check-icon">{{ questionCount > 0 ? '✅' : '⭕' }}</span>
                          <span class="check-text">询问家庭成员关于20万的去向</span>
                        </div>
                        <div class="checklist-item" :class="{ completed: questionCount >= 3 }">
                          <span class="check-icon">{{ questionCount >= 3 ? '✅' : '⭕' }}</span>
                          <span class="check-text">深入了解家庭关系和动机</span>
                        </div>
                        <div class="checklist-item" :class="{ completed: storyProgressPercentage >= 50 }">
                          <span class="check-icon">{{ storyProgressPercentage >= 50 ? '✅' : '⭕' }}</span>
                          <span class="check-text">探索记忆中的疑点</span>
                        </div>
                        <div class="checklist-item" :class="{ completed: gamePhase === 'completed' }">
                          <span class="check-icon">{{ gamePhase === 'completed' ? '✅' : '⭕' }}</span>
                          <span class="check-text">揭开身份和事件的真相</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 剧本背景卡片 -->
              <div class="script-card narrative-card">
                <div class="card-header">
                  <span class="card-icon narrative-icon">📖</span>
                  <h4 class="card-title">剧本背景</h4>
                  <div class="card-expand-btn" @click="toggleCardExpanded('narrative')">
                    <span class="expand-icon" :class="{ expanded: expandedCards.narrative }">⌄</span>
                  </div>
                </div>
                <div class="card-content" :class="{ expanded: expandedCards.narrative }">
                  <div class="narrative-section">
                    <!-- 当前情况概述 -->
                    <div class="current-situation">
                      <h5 class="section-subtitle">🏠 当前情况</h5>
                      <p class="narrative-text">
                        你父亲朱大强丢了一个20万的存折，他认为肯定是自家人偷的。
                        这笔钱原本是他打算用来出远门送远方表亲朱立杰的。
                        现在他要求所有人都来家里，把事情交代清楚。
                      </p>
                    </div>

                    <!-- 详细背景 -->
                    <div class="detailed-background" v-if="expandedCards.narrative">
                      <h5 class="section-subtitle">📚 详细背景</h5>
                      <div class="background-timeline">
                        <div class="timeline-item">
                          <span class="timeline-marker">🚗</span>
                          <div class="timeline-content">
                            <strong>全家自驾游：</strong>你因父亲身体不适没有参加，丈夫朱丰震留下陪伴父亲
                          </div>
                        </div>
                        <div class="timeline-item">
                          <span class="timeline-marker">💰</span>
                          <div class="timeline-content">
                            <strong>秘密汇款：</strong>你给娘家汇了20万应急，这是你的秘密积蓄
                          </div>
                        </div>
                        <div class="timeline-item">
                          <span class="timeline-marker">📮</span>
                          <div class="timeline-content">
                            <strong>噩耗传来：</strong>除夕收到远方表亲朱立杰过世的消息，父亲伤心过度昏睡
                          </div>
                        </div>
                        <div class="timeline-item">
                          <span class="timeline-marker">📞</span>
                          <div class="timeline-content">
                            <strong>紧急召集：</strong>第二天父亲发现20万存折丢失，召集所有人回家
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 关键疑点 -->
                    <div class="key-mysteries" v-if="expandedCards.narrative">
                      <h5 class="section-subtitle">❓ 关键疑点</h5>
                      <div class="mystery-list">
                        <div class="mystery-item">
                          <span class="mystery-icon">🤔</span>
                          <span class="mystery-text">为什么你对自己的名字感到陌生？</span>
                        </div>
                        <div class="mystery-item">
                          <span class="mystery-icon">💭</span>
                          <span class="mystery-text">记忆中那个特别喜欢的男人是谁？</span>
                        </div>
                        <div class="mystery-item">
                          <span class="mystery-icon">💔</span>
                          <span class="mystery-text">为什么看到朱大强会有痛心的感觉？</span>
                        </div>
                        <div class="mystery-item">
                          <span class="mystery-icon">🤝</span>
                          <span class="mystery-text">对朱丰翰的依靠感从何而来？</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 故事进展卡片 -->
              <div class="script-card progress-card">
                <div class="card-header">
                  <span class="card-icon progress-icon">📈</span>
                  <h4 class="card-title">调查进度</h4>
                  <div class="card-expand-btn" @click="toggleCardExpanded('progress')">
                    <span class="expand-icon" :class="{ expanded: expandedCards.progress }">⌄</span>
                  </div>
                </div>
                <div class="card-content" :class="{ expanded: expandedCards.progress }">
                  <div class="progress-section">
                    <!-- 主要进度显示 -->
                    <div class="main-progress">
                      <div class="progress-header">
                        <div class="progress-stats">
                          <span class="progress-current">{{ currentSentenceIndex + 1 }}</span>
                          <span class="progress-separator">/</span>
                          <span class="progress-total">{{ unifiedMonologueQueue.length }}</span>
                        </div>
                        <div class="progress-percentage">{{ storyProgressPercentage }}%</div>
                      </div>
                      <div class="progress-bar-container">
                        <div class="progress-bar">
                          <div
                            class="progress-fill"
                            :style="{ width: storyProgressPercentage + '%' }"
                          >
                            <div class="progress-shimmer"></div>
                          </div>
                        </div>
                      </div>
                      <div class="progress-label">案件调查完成度</div>
                    </div>

                    <!-- 详细进度信息 -->
                    <div class="detailed-progress" v-if="expandedCards.progress">
                      <div class="progress-milestones">
                        <h5 class="section-subtitle">🏁 调查里程碑</h5>
                        <div class="milestone-list">
                          <div class="milestone-item" :class="{ reached: storyProgressPercentage >= 25 }">
                            <span class="milestone-icon">🚀</span>
                            <span class="milestone-text">调查启动 (25%)</span>
                            <span class="milestone-status">{{ storyProgressPercentage >= 25 ? '✅' : '⏳' }}</span>
                          </div>
                          <div class="milestone-item" :class="{ reached: storyProgressPercentage >= 50 }">
                            <span class="milestone-icon">🔍</span>
                            <span class="milestone-text">深入调查 (50%)</span>
                            <span class="milestone-status">{{ storyProgressPercentage >= 50 ? '✅' : '⏳' }}</span>
                          </div>
                          <div class="milestone-item" :class="{ reached: storyProgressPercentage >= 75 }">
                            <span class="milestone-icon">🧩</span>
                            <span class="milestone-text">线索汇总 (75%)</span>
                            <span class="milestone-status">{{ storyProgressPercentage >= 75 ? '✅' : '⏳' }}</span>
                          </div>
                          <div class="milestone-item" :class="{ reached: storyProgressPercentage >= 100 }">
                            <span class="milestone-icon">🎯</span>
                            <span class="milestone-text">真相大白 (100%)</span>
                            <span class="milestone-status">{{ storyProgressPercentage >= 100 ? '✅' : '⏳' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </transition>

        <transition name="panel-slide">
          <div v-if="isAskVisible" class="sidebar-section ask-section">
            <h3 class="section-title">
              <span class="title-icon">💡</span>
              提问
            </h3>
            <button
              @click="handleAdvanceAct"
              :disabled="isLoading"
              class="skip-qna-button"
              >
              {{ currentAct >= 2 ? '查看最终结局' : '进入下一幕' }}
            </button>
            <div class="custom-dropdown" :class="{ 'is-open': isDropdownOpen }">
              <button @click="toggleDropdown" class="dropdown-toggle" :disabled="gamePhase !== 'qna'">
                <span class="selected-value">
                  {{ selectedCharacterId ? getDisplayName(selectedCharacterId, characters) : '选择一个角色' }}
                </span>
                <span class="dropdown-arrow">▼</span>
              </button>
              <transition name="dropdown-fade">
                <div v-if="isDropdownOpen" class="dropdown-menu">
                  <div
                    v-for="char in interrogationTargets"
                    :key="char.id"
                    class="dropdown-item"
                    @click="selectCharacter(char.id)"
                  >
                    {{ char.displayName }}
                  </div>
                </div>
              </transition>
            </div>
            <textarea
              v-model="customQuestion"
              placeholder="在此输入你对角色的提问..."
              class="custom-question-textarea"
              :disabled="gamePhase !== 'qna' || isLoading"
            ></textarea>
            <button
              @click="handleAskQuestion"
              :disabled="!customQuestion.trim() || !selectedCharacterId || isLoading || gamePhase !== 'qna'"
              class="ask-question-button"
            >
              <span class="button-text">发送问题</span>
              <span class="button-icon">➤</span>
            </button>
          </div>
        </transition>
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
// (新增) 导入新的结局组件
import EndingScene from './EndingScene.vue'
import { useGameData, type CharacterData } from '@/composables/useGameData'
import { useDialogueSystem } from '@/composables/useDialogueSystem'
import { useSceneTransition } from '@/composables/useSceneTransition'
// 引入最新的 useGame 和 getDisplayName
import { useGame, getDisplayName, type HistoryEntry } from '@/composables/useGame';

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
  playerCharacterId, // 确保解构了 playerCharacterId
  finalEnding, // 新增最终结局状态
  currentBackgroundId, // 新增：从 useGame 中解构出 currentBackgroundId
  startGame, advanceMonologue, askQuestion, advanceAct, addHistoryEntry, // 新增 advanceAct
  incrementQuestionCount, // 引入新的计数函数
  testEndingDisplay // 临时测试函数
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

// 新增：用于控制下拉菜单的 ref
const isDropdownOpen = ref(false);

// 新增：一个 ref 用于暂存已显示但尚未记录的问答对
const pendingQA = ref<{ question: HistoryEntry; answer: HistoryEntry } | null>(null);

// 新的侧边栏控制状态
const isSidebarVisible = ref(false);
const isMaximized = ref(false);
const sidebarWidth = ref(400); // 默认宽度
const minSidebarWidth = 200;
const maxSidebarWidth = 600;
let startX = 0;

// 面板可见性控制
const isHistoryVisible = ref(false);
const isScriptVisible = ref(false);
const isAskVisible = ref(false);

// 卡片展开状态控制
const expandedCards = ref({
  character: false,
  objectives: false,
  narrative: false,
  progress: false
});

// 可拖动侧边栏状态（保留原有的）
const isDragging = ref(false)

// --- 本地组件状态 ---
const historyLogRef = ref<HTMLElement | null>(null);

// 新增：历史区和提问区高度，初始60/40
const historyHeight = ref(60);
let isSidebarDividerDragging = false;

const startSidebarDividerDrag = (event: MouseEvent) => {
  isSidebarDividerDragging = true;
  const startY = event.clientY;
  const startHeight = historyHeight.value;
  const sidebar = document.querySelector('.sidebar-flex-container') as HTMLElement;
  const sidebarRect = sidebar?.getBoundingClientRect();
  const sidebarHeight = sidebarRect?.height || 1;

  const onMouseMove = (e: MouseEvent) => {
    if (!isSidebarDividerDragging) return;
    const deltaY = e.clientY - startY;
    let newHistoryHeight = startHeight + (deltaY / sidebarHeight) * 100;
    newHistoryHeight = Math.max(20, Math.min(80, newHistoryHeight));
    historyHeight.value = newHistoryHeight;
  };
  const onMouseUp = () => {
    isSidebarDividerDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// 新增：一个辅助函数，用于将暂存的问答记录到历史中
const logPendingQA = () => {
  if (pendingQA.value) {
    addHistoryEntry(pendingQA.value.question);
    addHistoryEntry(pendingQA.value.answer);
    incrementQuestionCount(); // 只有在正式记录后才增加计数
    pendingQA.value = null; // 清空暂存
  }
};

// 计算属性
// 当前显示的角色（优先显示审讯角色，否则显示剧情角色）
const displayedCharacter = computed(() => {
  return selectedInterrogationCharacter.value || activeCharacter.value
})

// 故事进度计算
const storyProgressPercentage = computed(() => {
  if (unifiedMonologueQueue.value.length === 0) return 0
  return Math.round(((currentSentenceIndex.value + 1) / unifiedMonologueQueue.value.length) * 100)
})

// 当前游戏阶段描述
const currentPhaseDescription = computed(() => {
  switch (gamePhase.value) {
    case 'monologue':
      return '观看剧情发展'
    case 'qna':
      return '询问角色获取线索'
    case 'completed':
      return '案件已结束'
    default:
      return '准备开始调查'
  }
})

const isCharacterSpeaking = computed(() => {
  return !isLoading.value && currentDialogue.text && isTypingActive.value
})

// --- 方法 ---
// 新增：切换下拉菜单的显示/隐藏
const toggleDropdown = () => {
  if (gamePhase.value === 'qna') {
    isDropdownOpen.value = !isDropdownOpen.value;
  }
};

// 新增：处理角色选择的函数
const selectCharacter = (characterId: string) => {
  selectedCharacterId.value = characterId;
  isDropdownOpen.value = false; // 选择后自动关闭
};

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
 * (已更新) 处理 "继续" 按钮的点击事件
 */
 const handleContinue = () => {
  // 如果打字机正在播放，点击则立即完成显示
  if (isTypingActive.value) {
    skipTypingEffect();
    return;
  }

  // 1. 记录【上一句】已经显示完成的独白
  //    通过检查确保它是一个真正的角色独白，而不是系统提示
  if (gamePhase.value === 'monologue' && currentDialogue.characterId && currentDialogue.characterId !== 'system') {
    addHistoryEntry({
      type: 'monologue',
      characterId: currentDialogue.characterId,
      content: currentDialogue.text,
    });
  }

  // 2. 获取【下一句】独白来进行显示
  const nextEntry = advanceMonologue();

  // 3. 如果还有下一句独白
  if (nextEntry) {
    // 准备显示下一句独白，但【不】在这里记录它
    const characterData = characterDatabase[nextEntry.characterId];
    if (characterData) {
      activeCharacter.value = characterData;
    }

    currentDialogue.text = nextEntry.sentence;
    currentDialogue.characterId = nextEntry.characterId;
    startTypingEffect(nextEntry.sentence);
    canContinue.value = true;

  } else {
    // 4. 如果所有独白都已结束
    console.log("所有角色独白已完成，进入提问环节。");
    
    // 添加一条系统消息到历史记录，标记阶段转换
    addHistoryEntry({
      type: 'system',
      content: '所有角色独白完成，现在可以开始提问了！'
    });
    
    // 清理对话框并显示提示信息
    activeCharacter.value = null; 
    currentDialogue.text = "第一幕：所有角色介绍完毕。现在，你们可以开始自由讨论和提问了。";
    currentDialogue.characterId = 'system';
    startTypingEffect(currentDialogue.text);
    
    // 在Q&A阶段，禁用“继续”按钮
    canContinue.value = false;
  }
};


// (已更新) 提问按钮的核心逻辑
const handleAskQuestion = async () => {
  if (!customQuestion.value.trim() || !selectedCharacterId.value || !playerCharacterId.value) return;

  // 步骤 1: 将【上一轮】暂存的问答记录到历史中
  logPendingQA();

  // 步骤 2: 准备本次提问所需的数据
  const currentQuestionText = customQuestion.value.trim();
  const currentTargetId = selectedCharacterId.value;

  customQuestion.value = ''; // 立即清空输入框

  // 步骤 3: 调用API获取回答，这个函数现在只返回回答文本
  const answerText = await askQuestion(currentTargetId, currentQuestionText);

  // 步骤 4: 如果成功获取回答
  if (answerText) {
    // a. 在左侧对话框中用打字机效果显示回答
    const characterDetails = characterDatabase[currentTargetId];
    if (characterDetails) {
      activeCharacter.value = characterDetails;
    }
    currentDialogue.text = answerText;
    currentDialogue.characterId = currentTargetId;
    startTypingEffect(answerText);
    canContinue.value = false;

    // b. 将【本次】的问答数据存入 pendingQA 中，等待下一次行动时再记录
    pendingQA.value = {
      question: {
        type: 'question',
        questionerId: playerCharacterId.value,
        targetCharacterId: currentTargetId,
        content: currentQuestionText,
      },
      answer: {
        type: 'answer',
        characterId: currentTargetId,
        content: answerText,
      },
    };
  } else {
    // 如果提问失败，直接在历史记录中显示一条系统错误消息
    addHistoryEntry({
        type: 'system',
        content: `向 ${currentTargetId} 的提问失败，请重试。`
    });
  }
};

// (已更新) 处理进入下一幕的点击事件
const handleAdvanceAct = async () => {
  logPendingQA(); // 在推进幕次前，先将可能存在的上一轮问答记录下来
  await advanceAct();
  // 推进幕次后，第一个独白会自动开始（如果存在）
  if (gamePhase.value === 'monologue') {
    handleContinue();
  }
};

// 新的拖动调整宽度方法
const startResize = (e: MouseEvent) => {
  startX = e.clientX;
  window.addEventListener('mousemove', resize);
  window.addEventListener('mouseup', stopResize);
};

// 拖动进行中
const resize = (e: MouseEvent) => {
  if (!startX) return;
  const newWidth = sidebarWidth.value - (e.clientX - startX);
  sidebarWidth.value = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newWidth));
};

// 拖动结束
const stopResize = () => {
  startX = 0;
  window.removeEventListener('mousemove', resize);
  window.removeEventListener('mouseup', stopResize);
};

// 切换侧边栏可见性
const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
  // 点击显示时，如果之前没有打开过任何面板，可以默认打开一个（可选）
  if (isSidebarVisible.value && !isHistoryVisible.value && !isScriptVisible.value && !isAskVisible.value) {
    isScriptVisible.value = true; // 默认显示剧本面板
  }
  isMaximized.value = false; // 关闭侧边栏时取消最大化
};

// 切换最大化状态
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value;
  isSidebarVisible.value = !isMaximized.value; // 最大化时隐藏侧边栏，恢复时显示之前的状态
  if (isSidebarVisible.value && !isHistoryVisible.value && !isScriptVisible.value && !isAskVisible.value) {
    isScriptVisible.value = true; // 恢复时如果侧边栏可见且没有打开面板，默认打开剧本面板
  }
};

// 内部按钮点击时确保侧边栏可见
const toggleHistoryPanel = () => {
  isHistoryVisible.value = !isHistoryVisible.value;
  if (!isSidebarVisible.value) {
    isSidebarVisible.value = true;
  }
  isMaximized.value = false;
};

const toggleScriptPanel = () => {
  isScriptVisible.value = !isScriptVisible.value;
  if (!isSidebarVisible.value) {
    isSidebarVisible.value = true;
  }
  isMaximized.value = false;
};

const toggleAskPanel = () => {
  isAskVisible.value = !isAskVisible.value;
  if (!isSidebarVisible.value) {
    isSidebarVisible.value = true;
  }
  isMaximized.value = false;
};

// 卡片展开/收缩控制
const toggleCardExpanded = (cardType: keyof typeof expandedCards.value) => {
  expandedCards.value[cardType] = !expandedCards.value[cardType];
};

// 保留原有的拖动方法（用于兼容性）
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

// 处理结局组件的重启请求
const handleRestart = () => {
  // 这里可以定义返回主页或重新加载的逻辑
  window.location.reload();
};

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
  --sidebar-bg: rgba(30, 41, 59, 0.6);
  --sidebar-section-bg: rgba(15, 23, 42, 0.6);
  --sidebar-border-color: rgba(71, 85, 105, 0.5);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --accent-color: #6366f1;
  --player-color: #22d3ee;
  --glow-color: rgba(99, 102, 241, 0.5);
}

.galgame-main-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

/* 全局滚动增强 */
* {
  scroll-behavior: smooth;
}

/* 确保所有可滚动容器都支持鼠标滚轮 */
.script-content,
.history-log,
.card-content,
.sidebar-section {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.main-game-panel, .resize-divider, .interrogation-sidebar {
  height: 100vh;
}

.main-game-panel {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  transition: flex-grow 0.3s ease;
  border: none !important;
  box-shadow: none !important;
}

.main-game-panel.maximized {
  flex-grow: 100 !important; /* 确保完全占据空间 */
}

/* 可拖动条 */
.resize-divider {
  width: 5px;
  background: rgba(71, 85, 105, 0.3);
  cursor: col-resize;
  position: relative;
  z-index: 50;
  transition: background-color 0.3s ease;
}

.resize-divider:hover {
  background: var(--glow-color);
}

/* 右侧控制面板（显示/隐藏/最大化按钮） */
.right-control-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px 5px;
  background: rgba(15, 23, 42, 0.3);
  border-left: 1px solid var(--sidebar-border-color);
  z-index: 60;
}

.right-control-panel .control-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid transparent;
  background: rgba(51, 65, 85, 0.5);
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.right-control-panel .control-button:hover {
  background: var(--accent-color);
  color: white;
  transform: scale(1.1);
}

/* 右侧UI容器（包含切换按钮和实际侧边栏） */
.right-ui-container {
  display: flex;
  transition: width 0.3s ease;
}

.right-ui-container.is-hidden {
  display: none;
}

/* 内部切换按钮（位于侧边栏内部） */
.right-ui-container .sidebar-toggles-inner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 0.5rem;
  background: rgba(15, 23, 42, 0.5);
  border-left: 1px solid var(--sidebar-border-color);
  z-index: 10;
}

.right-ui-container .sidebar-toggles-inner .toggle-button.inner {
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  border-radius: 50%;
  border: 1px solid transparent;
  background: rgba(51, 65, 85, 0.5);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.right-ui-container .sidebar-toggles-inner .toggle-button.inner:hover,
.right-ui-container .sidebar-toggles-inner .toggle-button.inner.active {
  background: var(--accent-color);
  color: white;
  transform: scale(1.1);
}

.sidebar-divider {
  height: 12px;
  background: linear-gradient(90deg, #6366f1 0%, #22d3ee 100%);
  cursor: row-resize;
  margin: 0.5rem 0;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(99,102,241,0.18);
  position: relative;
  z-index: 2;
  transition: background 0.2s, box-shadow 0.2s;
}
.sidebar-divider:hover,
.sidebar-divider:active {
  background: linear-gradient(90deg, #a5b4fc 0%, #38bdf8 100%);
  box-shadow: 0 4px 24px 0 rgba(99,102,241,0.28);
}

/* 侧边栏主体 */
.interrogation-sidebar {
  width: 100%; /* 内部宽度 */
  height: 100vh;
  background: var(--sidebar-bg);
  backdrop-filter: blur(12px);
  border-left: 1px solid var(--sidebar-border-color);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow: hidden;
}

.interrogation-sidebar.is-hidden {
  display: none;
}

.sidebar-flex-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-height: 0;
}

.interrogation-sidebar .sidebar-section {
  flex-grow: 1;
  min-height: 0;
  background: var(--sidebar-section-bg);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--sidebar-border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.interrogation-sidebar .sidebar-section:hover {
  border-color: var(--glow-color);
}

/* 动态高度分配 */
.interrogation-sidebar.two-visible .history-section,
.interrogation-sidebar.two-visible .script-section {
  flex-basis: 60%;
}

.interrogation-sidebar.two-visible .ask-section {
  flex-basis: 40%;
}

.interrogation-sidebar.three-visible .history-section {
  flex-basis: 40%;
}

.interrogation-sidebar.three-visible .script-section {
  flex-basis: 30%;
}

.interrogation-sidebar.three-visible .ask-section {
  flex-basis: 30%;
}

/* 面板滑入滑出动画 */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.panel-slide-leave-active {
  position: absolute; /* 避免动画时页面跳动 */
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 1.2rem;
}

/* 历史记录区 */
.history-section {
  flex-grow: 1;
  min-height: 0;
}

.history-log {
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 0.875rem;
  line-height: 1.7;
  color: #cbd5e1;
  height: 100%;
  padding-right: 0.5rem;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

/* 美化历史记录滚动条 */
.history-log::-webkit-scrollbar { width: 6px; }
.history-log::-webkit-scrollbar-track { background: transparent; }
.history-log::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
.history-log::-webkit-scrollbar-thumb:hover { background: var(--accent-color); }

.history-placeholder { color: var(--text-secondary); text-align: center; padding-top: 2rem; }
.history-entry { margin-bottom: 0.75rem; }
.history-speaker { font-weight: 600; color: #a5b4fc; }
.history-speaker.player { color: var(--player-color); }
.history-content.question { color: #facc15; font-style: italic; }
.system-message { text-align: center; color: var(--text-secondary); font-style: italic; font-size: 0.8rem; padding: 0.5rem 0;}

/* 提问区 */
.ask-section { flex-shrink: 0; }

/* 自定义下拉框 */
.custom-dropdown {
  position: relative;
  margin-bottom: 1rem;
}

.dropdown-toggle {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(51, 65, 85, 0.8);
  border: 1px solid var(--sidebar-border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.dropdown-toggle:hover:not(:disabled) {
  border-color: var(--accent-color);
}
.dropdown-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.custom-dropdown.is-open .dropdown-toggle {
  border-color: var(--accent-color);
  box-shadow: 0 0 12px var(--glow-color);
}

.dropdown-arrow {
  transition: transform 0.3s ease;
}
.custom-dropdown.is-open .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  margin-top: 0.5rem;
  left: 0;
  right: 0;
  background: #1e293b;
  border: 1px solid var(--accent-color);
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.dropdown-item {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--accent-color);
  color: white;
}

/* 可拖动提问框 */
.custom-question-textarea {
  width: 100%;
  background: rgba(36, 54, 80, 0.92);
  border: 1.5px solid #6366f1;
  border-radius: 12px;
  padding: 1rem;
  color: #e0e7ef;
  font-size: 1rem;
  margin-bottom: 1.2rem;
  transition: border 0.25s, box-shadow 0.25s, background 0.25s;
  resize: vertical;
  min-height: 80px;
  max-height: 200px;
  box-shadow: 0 2px 12px 0 rgba(99,102,241,0.08);
}
.custom-question-textarea:focus {
  outline: none;
  border-color: #38bdf8;
  background: rgba(36, 54, 80, 0.98);
  box-shadow: 0 0 16px 0 #38bdf844;
}

/* 发送按钮 */
.ask-question-button {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(90deg, #6366f1 0%, #22d3ee 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1.08rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.25s, box-shadow 0.25s, transform 0.15s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
  box-shadow: 0 2px 12px 0 rgba(99,102,241,0.10);
  letter-spacing: 1px;
}
.ask-question-button:hover:not(:disabled) {
  background: linear-gradient(90deg, #818cf8 0%, #38bdf8 100%);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 32px 0 #38bdf888;
}
.ask-question-button:active:not(:disabled) {
  background: linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%);
  transform: scale(0.98);
}
.ask-question-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(90deg, #64748b 0%, #334155 100%);
}

/* 剧本面板样式 - 优化版本 */
.script-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.25rem;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

/* 自定义滚动条样式 */
.script-content::-webkit-scrollbar {
  width: 6px;
}

.script-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.script-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.script-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 卡片基础样式 - 玻璃拟态效果 */
.script-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.script-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  position: relative;
}

/* 卡片展开按钮 */
.card-expand-btn {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.card-expand-btn:hover {
  background: rgba(99, 102, 241, 0.3);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}

.expand-icon {
  font-size: 0.875rem;
  color: var(--accent-color);
  transition: transform 0.3s ease;
  font-weight: bold;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.card-icon {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.2);
  box-shadow:
    0 0 20px rgba(99, 102, 241, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.card-icon:hover {
  box-shadow:
    0 0 30px rgba(99, 102, 241, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex-grow: 1;

}

.card-content {
  padding: 0 1.25rem 1.25rem;
  overflow-y: auto; /* 始终允许垂直滚动 */
  overflow-x: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 300px; /* 默认收缩高度，增加到300px以显示更多内容 */
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

.card-content.expanded {
  max-height: 600px; /* 展开高度，调整为更合理的高度 */
}

/* 卡片内容滚动条样式 - 应用于所有卡片内容 */
.card-content::-webkit-scrollbar {
  width: 6px;
}

.card-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.card-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.card-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* 角色信息卡片 */
.character-profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.character-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.character-avatar {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 50%;
  border: 2px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.character-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.character-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--player-color);
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
  margin: 0;
}

.character-role {
  font-size: 0.875rem;
  color: var(--accent-color);
  font-weight: 500;
  opacity: 0.9;
}

.character-badge {
  font-size: 0.75rem;
  color: #fbbf24;
  font-weight: 600;
  background: rgba(251, 191, 36, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  width: fit-content;
}

.character-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
}

.detail-section {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(71, 85, 105, 0.2);
}

.detail-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  font-size: 0.75rem;
  color: var(--text-primary);
  background: rgba(99, 102, 241, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  font-weight: 500;
}

.character-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.investigation-principles {
  margin: 0;
  padding-left: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
}

.investigation-principles li {
  margin-bottom: 0.5rem;
}

/* 家庭信息样式 */
.family-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.family-member {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.member-role {
  font-weight: 600;
  color: #94a3b8;
  min-width: 3rem;
}

.member-name {
  color: #e2e8f0;
  font-weight: 500;
}

/* 主要目标样式 */
.main-objectives {
  margin: 1rem 0;
}

.main-objectives .objective-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border-left: 3px solid #ef4444;
}

.objective-number {
  font-weight: 700;
  color: #ef4444;
  font-size: 1.1rem;
  min-width: 1.5rem;
}

.objective-text {
  color: #e2e8f0;
  font-weight: 500;
  line-height: 1.4;
}

/* 目标列表 */
.objectives-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.objective-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(71, 85, 105, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.objective-item.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
}

.objective-item.completed {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
}

.objective-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.objective-item.active .objective-indicator {
  background: var(--accent-color);
  box-shadow: 0 0 10px var(--accent-color);
}

.objective-item.completed .objective-indicator {
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e;
}

.objective-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
}

.objective-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.objective-status {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

.objective-value {
  font-size: 0.875rem;
  color: var(--player-color);
  font-weight: 600;
}

/* 目标卡片新样式 */
.objectives-overview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.primary-objective {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
}

.objective-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.objective-priority {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.objective-status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.objective-status-badge.monologue,
.objective-status-badge.qna {
  color: var(--accent-color);
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.objective-status-badge.completed {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.objective-description h5 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.objective-detail {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.objectives-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(71, 85, 105, 0.3);
  transition: all 0.3s ease;
}

.stat-item:hover {
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.secondary-objectives {
  margin-top: 1rem;
}

.section-subtitle {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.objective-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(71, 85, 105, 0.2);
  transition: all 0.3s ease;
}

.checklist-item.completed {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.check-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.check-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  flex-grow: 1;
}

.checklist-item.completed .check-text {
  color: var(--text-primary);
}

/* 进度部分样式 - 优化版本 */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-progress {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.progress-current {
  color: var(--player-color);
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
}

.progress-separator {
  color: var(--text-secondary);
  opacity: 0.6;
}

.progress-total {
  color: var(--text-secondary);
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
  text-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}

.progress-bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-bar {
  width: 100%;
  height: 14px;
  background: rgba(71, 85, 105, 0.3);
  border-radius: 7px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color) 0%, var(--player-color) 100%);
  border-radius: 7px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.5);
}

.progress-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-label {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  opacity: 0.8;
}

.detailed-progress {
  margin-top: 1rem;
}

.progress-milestones {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(71, 85, 105, 0.2);
}

.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(71, 85, 105, 0.3);
  transition: all 0.3s ease;
}

.milestone-item.reached {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
}

.milestone-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.milestone-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  flex-grow: 1;
}

.milestone-item.reached .milestone-text {
  color: var(--text-primary);
  font-weight: 500;
}

.milestone-status {
  font-size: 1rem;
  flex-shrink: 0;
}



/* 剧本背景样式 */
.narrative-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-situation,
.detailed-background,
.key-mysteries {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.narrative-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0.5rem 0 0 0;
}

.background-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.75rem;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(34, 211, 238, 0.05);
  border-radius: 8px;
  border-left: 3px solid #22d3ee;
}

.timeline-marker {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.timeline-content {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.timeline-content strong {
  color: var(--text-primary);
  font-weight: 600;
}

.mystery-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.mystery-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(168, 85, 247, 0.05);
  border-radius: 8px;
  border-left: 3px solid #a855f7;
}

.mystery-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.mystery-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
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
/* 用于布局标题和跳过按钮 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header .section-title {
  margin-bottom: 0; /* 移除标题的下边距 */
}

/* 跳过按钮的样式 */
.skip-qna-button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #c0392b;
  color: #e74c3c;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.skip-qna-button:hover:not(:disabled) {
  background: #c0392b;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.skip-qna-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>