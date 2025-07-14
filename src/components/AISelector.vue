<template>
  <div class="ai-selector-container">
    <!-- AI选择触发按钮 -->
    <button 
      @click="$emit('toggle')" 
      class="ai-selector-trigger"
      :class="{ 'active': isVisible }"
    >
      <div class="current-ai-display">
        <span class="ai-icon">{{ selectedAI.icon }}</span>
        <div class="ai-info">
          <div class="ai-name">{{ selectedAI.name }}</div>
          <div class="ai-provider">{{ selectedAI.provider }}</div>
        </div>
      </div>
      <span class="dropdown-arrow">{{ isVisible ? '▲' : '▼' }}</span>
    </button>

    <!-- AI选择面板 -->
    <transition name="ai-panel-slide">
      <div v-if="isVisible" class="ai-selection-panel">
        <div class="panel-header">
          <h3>选择AI助手</h3>
          <p>不同的AI有不同的专长和思维方式</p>
        </div>
        
        <div class="ai-options-grid">
          <div
            v-for="ai in availableAIs"
            :key="ai.id"
            @click="$emit('select', ai)"
            class="ai-option-card"
            :class="{ 
              'selected': selectedAI.id === ai.id,
              [`ai-${ai.id}`]: true 
            }"
            :style="{ '--ai-color': ai.color }"
          >
            <div class="ai-option-header">
              <span class="ai-option-icon">{{ ai.icon }}</span>
              <div class="ai-status-indicator" :class="{ 'online': true }">
                <div class="status-dot"></div>
              </div>
            </div>
            
            <div class="ai-option-info">
              <h4 class="ai-option-name">{{ ai.name }}</h4>
              <p class="ai-option-provider">{{ ai.provider }}</p>
              <p class="ai-option-description">{{ ai.description }}</p>
            </div>
            
            <div class="ai-option-features">
              <div class="feature-tags">
                <span 
                  v-for="feature in getAIFeatures(ai.id)" 
                  :key="feature"
                  class="feature-tag"
                >
                  {{ feature }}
                </span>
              </div>
            </div>
            
            <div v-if="selectedAI.id === ai.id" class="selected-indicator">
              <span class="checkmark">✓</span>
            </div>
          </div>
        </div>
        
        <div class="panel-footer">
          <div class="ai-comparison-tip">
            <span class="tip-icon">💡</span>
            <span>提示：每个AI都有独特的思维方式，可以随时切换体验不同的对话风格</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  icon: string
  color: string
}

interface Props {
  selectedAI: AIModel
  availableAIs: AIModel[]
  isVisible: boolean
}

defineProps<Props>()

defineEmits<{
  toggle: []
  select: [ai: AIModel]
}>()

const getAIFeatures = (aiId: string): string[] => {
  const features: Record<string, string[]> = {
    deepseek: ['逻辑推理', '数据分析', '系统思维'],
    gpt4: ['自然对话', '创意写作', '知识问答'],
    qwen: ['中文理解', '创新思维', '文化洞察'],
    claude: ['批判思维', '道德推理', '安全分析']
  }
  return features[aiId] || ['智能对话']
}
</script>

<style scoped>
.ai-selector-container {
  position: relative;
  z-index: 50;
}

.ai-selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.2rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.ai-selector-trigger:hover,
.ai-selector-trigger.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.current-ai-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ai-icon {
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.ai-info {
  text-align: left;
}

.ai-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.2rem;
}

.ai-provider {
  font-size: 0.9rem;
  opacity: 0.7;
}

.dropdown-arrow {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.ai-panel-slide-enter-active,
.ai-panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.ai-panel-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.ai-panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.ai-selection-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(0, 0, 0, 0.95));
  border-radius: 25px;
  padding: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(30px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.panel-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.panel-header h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #ffd93d;
}

.panel-header p {
  font-size: 1rem;
  opacity: 0.8;
}

.ai-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.ai-option-card {
  position: relative;
  padding: 1.8rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.4s ease;
  overflow: hidden;
}

.ai-option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--ai-color, #667eea);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ai-option-card:hover,
.ai-option-card.selected {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--ai-color, #667eea);
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.ai-option-card:hover::before,
.ai-option-card.selected::before {
  opacity: 1;
}

.ai-option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.ai-option-icon {
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border: 2px solid var(--ai-color, #667eea);
}

.ai-status-indicator {
  position: relative;
  width: 20px;
  height: 20px;
}

.status-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #666;
  transition: all 0.3s ease;
}

.ai-status-indicator.online .status-dot {
  background: #00ff88;
  box-shadow: 0 0 15px #00ff88;
  animation: onlinePulse 2s ease-in-out infinite;
}

@keyframes onlinePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.ai-option-info {
  color: white;
  margin-bottom: 1.5rem;
}

.ai-option-name {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.4rem;
  color: var(--ai-color, #667eea);
}

.ai-option-provider {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 0.6rem;
}

.ai-option-description {
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.4;
}

.ai-option-features {
  margin-bottom: 1rem;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  font-size: 0.8rem;
  color: white;
  opacity: 0.8;
}

.selected-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 30px;
  height: 30px;
  background: var(--ai-color, #667eea);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: selectedBounce 0.5s ease-out;
}

@keyframes selectedBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.checkmark {
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.panel-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
}

.ai-comparison-tip {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: white;
  opacity: 0.8;
  font-size: 0.9rem;
  line-height: 1.4;
}

.tip-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* AI特定样式 */
.ai-deepseek {
  --ai-color: #00d4aa;
}

.ai-gpt4 {
  --ai-color: #00a67e;
}

.ai-qwen {
  --ai-color: #ff6a00;
}

.ai-claude {
  --ai-color: #ff6b6b;
}
</style>
