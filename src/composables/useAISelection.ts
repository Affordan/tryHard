import { ref, computed } from 'vue'

export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  icon: string
  color: string
}

export function useAISelection() {
  // Available AI models
  const availableAIs: AIModel[] = [
    {
      id: 'deepseek',
      name: 'DeepSeek-V3',
      provider: 'DeepSeek',
      description: '擅长逻辑推理和深度分析的AI助手',
      icon: '🧠',
      color: '#00d4aa'
    },
    {
      id: 'gpt4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: '自然对话和创意写作的专家',
      icon: '🤖',
      color: '#00a67e'
    },
    {
      id: 'qwen',
      name: 'Qwen-Max',
      provider: 'Alibaba',
      description: '中文理解和文化洞察能力强',
      icon: '🔮',
      color: '#ff6a00'
    },
    {
      id: 'claude',
      name: 'Claude-3',
      provider: 'Anthropic',
      description: '注重安全和道德推理的AI助手',
      icon: '🎭',
      color: '#ff6b6b'
    }
  ]

  // Current selected AI
  const selectedAI = ref<AIModel>(availableAIs[0])
  
  // AI selector visibility
  const isAISelectorVisible = ref(false)

  // Select an AI model
  const selectAI = (ai: AIModel) => {
    selectedAI.value = ai
    isAISelectorVisible.value = false
  }

  // Toggle AI selector visibility
  const toggleAISelector = () => {
    isAISelectorVisible.value = !isAISelectorVisible.value
  }

  // Get AI by ID
  const getAIById = (id: string): AIModel | undefined => {
    return availableAIs.find(ai => ai.id === id)
  }

  // Map character to AI model
  const mapCharacterToAI = (characterData: any): AIModel => {
    const providerMap: Record<string, string> = {
      'DeepSeek': 'deepseek',
      'OpenAI': 'gpt4',
      'Alibaba': 'qwen',
      'Anthropic': 'claude'
    }
    
    const aiId = providerMap[characterData.llmProvider] || 'deepseek'
    return getAIById(aiId) || availableAIs[0]
  }

  // Current AI features
  const currentAIFeatures = computed(() => {
    const features: Record<string, string[]> = {
      deepseek: ['逻辑推理', '数据分析', '系统思维'],
      gpt4: ['自然对话', '创意写作', '知识问答'],
      qwen: ['中文理解', '创新思维', '文化洞察'],
      claude: ['批判思维', '道德推理', '安全分析']
    }
    return features[selectedAI.value.id] || ['智能对话']
  })

  return {
    availableAIs,
    selectedAI,
    isAISelectorVisible,
    selectAI,
    toggleAISelector,
    getAIById,
    mapCharacterToAI,
    currentAIFeatures
  }
}
