import { ref, computed } from 'vue'

export interface QuestionCategory {
  category: string
  icon: string
  questions: string[]
}

export function useQuestionTemplates() {
  // Question templates organized by category
  const questionTemplates: QuestionCategory[] = [
    {
      category: '案件调查',
      icon: '🔍',
      questions: [
        '你能详细描述一下当时的情况吗？',
        '有没有注意到什么异常的细节？',
        '你认为这个案件的关键线索是什么？',
        '还有其他人知道这件事吗？',
        '你觉得凶手可能是谁？'
      ]
    },
    {
      category: '时间线询问',
      icon: '⏰',
      questions: [
        '你在27号晚上几点到几点在哪里？',
        '那天晚上你都做了什么？',
        '你最后一次见到受害者是什么时候？',
        '案发当晚你有不在场证明吗？',
        '你能详细说说那晚的时间安排吗？',
        '有人能证实你当时的行踪吗？'
      ]
    },
    {
      category: '人际关系',
      icon: '👥',
      questions: [
        '你和受害者是什么关系？',
        '你们最近有过争执吗？',
        '你知道受害者有什么仇人吗？',
        '受害者最近的行为有什么异常吗？',
        '你觉得谁最有动机伤害受害者？',
        '受害者生前最后和谁接触过？'
      ]
    },
    {
      category: '动机分析',
      icon: '💭',
      questions: [
        '你有什么理由要伤害受害者吗？',
        '受害者的死对你有什么影响？',
        '你从这件事中能得到什么好处？',
        '你和受害者之间有经济纠纷吗？',
        '你是否因为某些原因怨恨受害者？',
        '这件事会改变你的处境吗？'
      ]
    },
    {
      category: '医学诊断',
      icon: '🏥',
      questions: [
        '患者的症状是什么时候开始的？',
        '有没有家族病史需要考虑？',
        '目前的治疗方案效果如何？',
        '需要进行哪些进一步的检查？',
        '你对这个病例有什么专业建议？'
      ]
    },
    {
      category: '心理分析',
      icon: '🧠',
      questions: [
        '你当时的心理状态是怎样的？',
        '这件事对你造成了什么影响？',
        '你是如何应对压力的？',
        '有什么让你感到困扰的吗？',
        '你希望得到什么样的帮助？'
      ]
    },
    {
      category: '逻辑推理',
      icon: '🤔',
      questions: [
        '基于现有信息，你的推论是什么？',
        '这个结论的依据是什么？',
        '有没有其他可能的解释？',
        '如何验证这个假设？',
        '下一步应该怎么做？'
      ]
    },
    {
      category: '物证询问',
      icon: '🔬',
      questions: [
        '你认识这个物品吗？',
        '你见过这把凶器吗？',
        '这个指纹是你的吗？',
        '你能解释一下这个证据吗？',
        '你的DNA为什么会出现在现场？',
        '这些血迹你怎么解释？'
      ]
    },
    {
      category: '行为分析',
      icon: '🎭',
      questions: [
        '你为什么表现得这么紧张？',
        '你的说法前后矛盾，能解释一下吗？',
        '你为什么要撒谎？',
        '你在隐瞒什么？',
        '你的反应很奇怪，为什么？',
        '你真的在说实话吗？'
      ]
    },
    {
      category: '情感交流',
      icon: '💭',
      questions: [
        '你现在感觉怎么样？',
        '有什么想要分享的吗？',
        '我能为你做些什么？',
        '你需要什么支持？',
        '让我们一起想想解决办法'
      ]
    }
  ]

  // Question selector visibility
  const isQuestionSelectorVisible = ref(false)
  
  // Recently used questions
  const recentQuestions = ref<string[]>([])

  // Toggle question selector visibility
  const toggleQuestionSelector = () => {
    isQuestionSelectorVisible.value = !isQuestionSelectorVisible.value
  }

  // Add question to recent list
  const addToRecentQuestions = (question: string) => {
    // Remove if already exists
    const index = recentQuestions.value.indexOf(question)
    if (index > -1) {
      recentQuestions.value.splice(index, 1)
    }
    
    // Add to beginning
    recentQuestions.value.unshift(question)
    
    // Keep only last 10
    if (recentQuestions.value.length > 10) {
      recentQuestions.value = recentQuestions.value.slice(0, 10)
    }
  }

  // Get questions by category
  const getQuestionsByCategory = (categoryName: string): string[] => {
    const category = questionTemplates.find(cat => cat.category === categoryName)
    return category?.questions || []
  }

  // Get contextual questions based on current scene/character
  const getContextualQuestions = (sceneContext: string, characterType: string): QuestionCategory[] => {
    const contextMap: Record<string, string[]> = {
      'detective_office': ['案件调查', '逻辑推理', '心理分析'],
      'medical_examination_room': ['医学诊断', '心理分析', '情感交流'],
      'default': ['情感交流', '逻辑推理']
    }
    
    const relevantCategories = contextMap[sceneContext] || contextMap['default']
    
    return questionTemplates.filter(template => 
      relevantCategories.includes(template.category)
    )
  }

  // Search questions
  const searchQuestions = (searchTerm: string): QuestionCategory[] => {
    if (!searchTerm.trim()) return questionTemplates
    
    const term = searchTerm.toLowerCase()
    
    return questionTemplates.map(category => ({
      ...category,
      questions: category.questions.filter(question => 
        question.toLowerCase().includes(term)
      )
    })).filter(category => category.questions.length > 0)
  }

  // Get all questions as flat array
  const allQuestions = computed(() => {
    return questionTemplates.flatMap(category => category.questions)
  })

  return {
    questionTemplates,
    isQuestionSelectorVisible,
    recentQuestions,
    toggleQuestionSelector,
    addToRecentQuestions,
    getQuestionsByCategory,
    getContextualQuestions,
    searchQuestions,
    allQuestions
  }
}
