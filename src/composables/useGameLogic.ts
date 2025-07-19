// src/composables/useGameLogic.ts

import { ref } from 'vue'
import axios from 'axios'

// 定义单个发言条目的数据结构
export interface MonologueEntry {
  characterId: string;
  sentence: string;
}

// API基础URL
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/langchain-game'

export function useGameLogic() {
  const sessionId = ref<string | null>(null)
  const availableCharacters = ref<string[]>([])

  // 新增：统一的独白总队列，包含所有角色的所有句子
  const unifiedMonologueQueue = ref<MonologueEntry[]>([])

  // 当前在总队列中的索引
  const currentSentenceIndex = ref(0)

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 开始一个新游戏，并获取、处理所有独白
   * @param scriptId - 剧本ID
   */
  const startGame = async (scriptId: string) => {
    isLoading.value = true
    error.value = null
    console.log(`[Frontend] 准备开始新游戏，剧本ID: ${scriptId}`)

    try {
      const startResponse = await axios.post(`${API_BASE_URL}/start`, {
        script_id: scriptId,
        user_id: null
      })

      if (startResponse.data.success) {
        sessionId.value = startResponse.data.data.session_id
        // 注意：这里的角色列表是后端返回的可选角色，实际独白可能需要所有角色
        // 我们假设后端返回的角色列表就是我们需要获取独白的角色顺序
        availableCharacters.value = startResponse.data.data.available_human_characters
        console.log(`[Frontend] 游戏创建成功, Session ID: ${sessionId.value}`)

        // 核心步骤：获取并重组所有独白
        await fetchAndProcessAllMonologues()
      } else {
        throw new Error(startResponse.data.message || '创建游戏失败')
      }
    } catch (e: any) {
      console.error('[Frontend] 开始游戏时出错:', e)
      error.value = e.message || '无法连接到服务器'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取所有角色的独白，切分句子，并按轮次重组成一个统一的队列
   */
  const fetchAndProcessAllMonologues = async () => {
    if (!sessionId.value || availableCharacters.value.length === 0) return

    console.log('[Frontend] 开始获取并处理所有角色的独白...')
    isLoading.value = true

    // 临时存放每个角色的句子数组
    const characterSentencesMap: Map<string, string[]> = new Map()

    // 1. 并行获取所有角色的独白
    const monologuePromises = availableCharacters.value.map(async (characterId) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/session/${sessionId.value}/action`,
          { action_type: 'monologue', character_id: characterId }
        )
        if (response.data.success && response.data.data.monologue_sentences) {
          // 将一大段话根据换行符切分成句子数组
          const sentences = response.data.data.monologue_sentences
            .flatMap((paragraph: string) => paragraph.split('\n').filter(s => s.trim() !== ''))

          characterSentencesMap.set(characterId, sentences)
          console.log(`[Frontend] 成功获取并切分角色 [${characterId}] 的 ${sentences.length} 句独白`)
        }
      } catch (e) {
        console.error(`[Frontend] 获取角色 [${characterId}] 独白失败:`, e)
      }
    })

    await Promise.all(monologuePromises)

    // 2. 按轮次重组独白到统一队列中
    const newQueue: MonologueEntry[] = []
    const characterOrder = availableCharacters.value
    const maxSentences = 5 // 每人5句话

    for (let sentenceIndex = 0; sentenceIndex < maxSentences; sentenceIndex++) {
      for (const characterId of characterOrder) {
        const sentences = characterSentencesMap.get(characterId)
        if (sentences && sentenceIndex < sentences.length) {
          newQueue.push({
            characterId: characterId,
            sentence: sentences[sentenceIndex]
          })
        }
      }
    }

    unifiedMonologueQueue.value = newQueue
    currentSentenceIndex.value = 0 // 重置索引
    isLoading.value = false
    console.log(`[Frontend] 独白重组完成，共 ${newQueue.length} 句话。`, newQueue)
  }

  /**
   * 推进到总队列中的下一句话
   * @returns 返回下一个发言条目，如果没有则返回null
   */
  const advanceToNextSentence = (): MonologueEntry | null => {
    if (currentSentenceIndex.value < unifiedMonologueQueue.value.length) {
      const nextEntry = unifiedMonologueQueue.value[currentSentenceIndex.value]
      console.log(`[Frontend] 推进幕次, 第 ${currentSentenceIndex.value + 1} 句, 发言角色: ${nextEntry.characterId}`)
      currentSentenceIndex.value++
      return nextEntry
    }
    console.log('[Frontend] 所有角色独白已完成。')
    return null
  }

  return {
    sessionId,
    availableCharacters,
    unifiedMonologueQueue,
    currentSentenceIndex,
    isLoading,
    error,
    startGame,
    advanceToNextSentence,
  }
}
