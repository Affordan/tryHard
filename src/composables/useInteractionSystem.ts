import { ref, computed } from 'vue'
import type { AIModel } from './useAISelection'

export interface InteractionMode {
  id: string
  name: string
  description: string
  icon: string
}

export interface UserInteraction {
  id: string
  type: 'question' | 'custom' | 'choice'
  content: string
  timestamp: Date
  aiModel: AIModel
  response?: string
}

export function useInteractionSystem() {
  // Available interaction modes
  const interactionModes: InteractionMode[] = [
    {
      id: 'question',
      name: '快速询问',
      description: '从预设问题中选择或自定义问题',
      icon: '💬'
    },
    {
      id: 'ai_switch',
      name: 'AI切换',
      description: '切换不同的AI助手获得不同视角',
      icon: '🤖'
    },
    {
      id: 'analysis',
      name: '深度分析',
      description: '请AI对当前情况进行深度分析',
      icon: '🔍'
    }
  ]

  // Current interaction mode
  const currentInteractionMode = ref<InteractionMode>(interactionModes[0])
  
  // Interaction history
  const interactionHistory = ref<UserInteraction[]>([])
  
  // Current interaction state
  const isInteracting = ref(false)
  const interactionPanelVisible = ref(false)

  // Add interaction to history
  const addInteraction = (interaction: Omit<UserInteraction, 'id' | 'timestamp'>) => {
    const newInteraction: UserInteraction = {
      ...interaction,
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }
    
    interactionHistory.value.push(newInteraction)
    
    // Keep only last 50 interactions
    if (interactionHistory.value.length > 50) {
      interactionHistory.value = interactionHistory.value.slice(-50)
    }
  }

  // Process user question
  const processUserQuestion = async (
    question: string, 
    aiModel: AIModel, 
    context: any
  ): Promise<string> => {
    isInteracting.value = true
    
    try {
      // Add to interaction history
      addInteraction({
        type: 'question',
        content: question,
        aiModel
      })

      // Simulate AI processing (in real app, this would call actual AI API)
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))
      
      // Generate contextual response based on AI model and current scene
      const response = generateContextualResponse(question, aiModel, context)
      
      // Update the interaction with response
      const lastInteraction = interactionHistory.value[interactionHistory.value.length - 1]
      if (lastInteraction) {
        lastInteraction.response = response
      }
      
      return response
    } finally {
      isInteracting.value = false
    }
  }

  // Generate contextual response (mock implementation)
  const generateContextualResponse = (
    question: string,
    aiModel: AIModel,
    context: any
  ): string => {
    // Determine question category
    const questionCategory = getQuestionCategory(question)

    // Get character data from context
    const characterData = context?.character

    // Generate response based on character data and question category
    if (characterData) {
      return generateCharacterSpecificResponse(question, questionCategory, characterData, aiModel)
    }

    // Fallback to AI model responses
    const aiModelResponses = aiResponses[aiModel.id] || aiResponses.gpt4
    const randomAIResponse = aiModelResponses[Math.floor(Math.random() * aiModelResponses.length)]

    return `${randomAIResponse}关于"${question}"，让我详细回答...`
  }

  // Generate character-specific responses based on their backstory and personality
  const generateCharacterSpecificResponse = (
    question: string,
    category: string,
    character: any,
    aiModel: AIModel
  ): string => {
    const characterId = character.characterId

    // Character-specific response patterns
    const characterResponses: Record<string, Record<string, string[]>> = {
      detective: {
        timeline: [
          `根据我的记录，27号晚上我在办公室整理案件资料到深夜。${character.alibi || '房东太太可以证明我的行踪。'}`,
          '那晚我一直在追查线索，发现了一些重要信息，大约11点左右才离开办公室。',
          '我记得很清楚，因为那天有重要发现，我在笔记本上详细记录了时间。'
        ],
        relationship: [
          '受害者是我正在调查的案件中的关键证人，我们之间是纯粹的工作关系。',
          '我一直在保护他，因为我知道他掌握着重要信息，没想到还是出了事。',
          '他最近很紧张，似乎知道自己处于危险之中，但拒绝透露更多细节。'
        ],
        motive: [
          '我没有任何理由伤害他，他是我破案的关键人物。',
          '相反，他的死对我的调查造成了巨大损失，现在线索断了。',
          '我正在努力找出真正的凶手，这是我的职责所在。'
        ],
        evidence: [
          '这个证据很有意思，让我用我的专业知识来分析一下...',
          '从犯罪现场的痕迹来看，凶手显然是有预谋的。',
          '这个物证可能是凶手故意留下的，想要误导我们的调查方向。'
        ],
        general: [
          '作为一名侦探，我必须基于事实和逻辑来回答这个问题。',
          '让我用我的推理能力来分析这个情况...',
          '这个问题很重要，我需要仔细考虑所有可能性。'
        ]
      },
      doctor_gpt: {
        timeline: [
          `27号晚上我在医院值夜班，${character.alibi || '有多名护士和病人可以证明我的行踪。'}`,
          '那晚急诊科特别忙，我一直在抢救一个车祸伤者，直到凌晨2点。',
          '我的工作记录和监控录像都可以证实我当时在医院。'
        ],
        relationship: [
          '受害者曾经是我的病人，我为他治疗过一些慢性疾病。',
          '我们的医患关系很好，他很信任我的医术，经常来咨询健康问题。',
          '我对他的死感到非常震惊和悲伤，他是个好人。'
        ],
        motive: [
          '作为医生，我的职责是救死扶伤，希波克拉底誓言约束着我。',
          '他的死对我没有任何好处，反而让我失去了一个信任我的病人。',
          '我发誓要用我的医学知识帮助找出真相。'
        ],
        evidence: [
          '从医学角度来看，这个伤口的特征表明凶手具有一定的解剖学知识。',
          '死因分析显示，致命伤很精准，可能是医学专业人士所为。',
          '但这不意味着凶手就是医生，也可能是故意伪装的。'
        ],
        general: [
          '作为医生，我必须客观地分析这个问题。',
          '让我用我的医学专业知识来回答...',
          '这个问题涉及到医学伦理，我需要谨慎回答。'
        ]
      },
      doctor_qwen: {
        timeline: [
          `那晚我在家研读古代医学文献，${character.alibi || '我妻子可以证明，但我中途外出过一小时。'}`,
          '我在准备一个关于传统中医的学术报告，需要查阅大量资料。',
          '大约10点左右，我确实接到了医院的咨询电话，讨论一个疑难病例。'
        ],
        relationship: [
          '受害者曾经找我咨询过一些传统中医治疗方法。',
          '我们之间有过一些医疗理念上的分歧，但这很正常。',
          '他最近似乎很焦虑，询问过一些关于毒物的问题，这让我有些担心。'
        ],
        motive: [
          '我没有任何理由要伤害他，虽然我们有过分歧。',
          '作为医者，无论中医西医，都以救人为天职。',
          '他的死让我深感痛心，也让我反思医患关系的重要性。'
        ],
        evidence: [
          '这个证据需要从中西医结合的角度来分析。',
          '从传统中医的角度来看，这可能涉及到某些草药或毒物。',
          '现代医学和传统医学的分析都指向同一个可能性。'
        ],
        general: [
          '从中医的智慧来看这个问题...',
          '让我结合传统医学和现代科学来分析...',
          '这个问题让我想到古代医书中的记载...'
        ]
      }
    }

    // AI model response patterns
    const aiResponses: Record<string, string[]> = {
      deepseek: [
        '让我用逻辑分析来回答这个问题...',
        '基于现有数据，我的推理是...',
        '从系统性思维的角度来看...'
      ],
      gpt4: [
        '这是一个复杂的问题，让我仔细考虑...',
        '从多个角度来分析...',
        '我认为我们需要更全面的视角...'
      ],
      qwen: [
        '结合中国文化背景来理解...',
        '从东方智慧的角度来看...',
        '这让我想到古人的智慧...'
      ],
      claude: [
        '我需要谨慎地回答这个敏感问题...',
        '从伦理角度考虑...',
        '让我确保我的回答是负责任的...'
      ]
    }

    const characterData = characterResponses[characterId]

    if (characterData && characterData[category]) {
      const responses = characterData[category]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      // Add personality-based modifications
      if (character.personality) {
        const personalityTrait = character.personality[Math.floor(Math.random() * character.personality.length)]
        return `${randomResponse} (表现出${personalityTrait}的特质)`
      }

      return randomResponse
    }

    // Fallback to general responses
    if (characterData && characterData.general) {
      const generalResponses = characterData.general
      const randomResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)]
      return `${randomResponse}关于"${question}"的问题...`
    }

    // Final fallback
    return `作为${character.characterRole}，我需要仔细考虑这个问题："${question}"...`
  }

  // Helper function to categorize questions
  const getQuestionCategory = (question: string): string => {
    if (question.includes('27号') || question.includes('时间') || question.includes('什么时候') || question.includes('几点')) {
      return 'timeline'
    }
    if (question.includes('关系') || question.includes('认识') || question.includes('仇人') || question.includes('接触')) {
      return 'relationship'
    }
    if (question.includes('动机') || question.includes('理由') || question.includes('好处') || question.includes('怨恨')) {
      return 'motive'
    }
    if (question.includes('证据') || question.includes('物品') || question.includes('指纹') || question.includes('血迹')) {
      return 'evidence'
    }
    return 'general'
  }

  // Toggle interaction panel
  const toggleInteractionPanel = () => {
    interactionPanelVisible.value = !interactionPanelVisible.value
  }

  // Set interaction mode
  const setInteractionMode = (mode: InteractionMode) => {
    currentInteractionMode.value = mode
  }

  // Get recent interactions
  const recentInteractions = computed(() => {
    return interactionHistory.value.slice(-10).reverse()
  })

  // Get interactions by type
  const getInteractionsByType = (type: UserInteraction['type']) => {
    return interactionHistory.value.filter(interaction => interaction.type === type)
  }

  // Clear interaction history
  const clearInteractionHistory = () => {
    interactionHistory.value = []
  }

  // Export interaction history
  const exportInteractionHistory = () => {
    const data = {
      timestamp: new Date().toISOString(),
      interactions: interactionHistory.value
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `interaction_history_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  }

  return {
    interactionModes,
    currentInteractionMode,
    interactionHistory,
    isInteracting,
    interactionPanelVisible,
    addInteraction,
    processUserQuestion,
    toggleInteractionPanel,
    setInteractionMode,
    recentInteractions,
    getInteractionsByType,
    clearInteractionHistory,
    exportInteractionHistory
  }
}
