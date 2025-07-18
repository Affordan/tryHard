// src/composables/useGameLogic.ts

import { ref } from 'vue'
import axios from 'axios'

// 定义独白的数据结构
export interface Monologue {
  characterId: string;
  sentences: string[];
}

// API基础URL
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/langchain-game'

export function useGameLogic() {
  // 游戏会话ID
  const sessionId = ref<string | null>(null)
  // 可供玩家选择的角色列表
  const availableCharacters = ref<string[]>([])
  // 存储所有角色独白的队列
  const monologueQueue = ref<Monologue[]>([])
  // 当前进行到哪个角色的独白
  const currentMonologueIndex = ref(0)
  // 游戏是否正在加载（例如，获取所有独白时）
  const isLoading = ref(false)
  // 存储错误信息
  const error = ref<string | null>(null)

  /**
   * 开始一个新游戏
   * @param scriptId - 要开始的剧本ID
   */
  const startGame = async (scriptId: string) => {
    isLoading.value = true
    error.value = null
    console.log(`[Frontend] 准备开始新游戏，剧本ID: ${scriptId}`)

    try {
      // 1. 调用 "Start New Game" API
      const startResponse = await axios.post(`${API_BASE_URL}/start`, {
        script_id: scriptId,
        user_id: null // 根据您的示例，这里可以为null
      })

      if (startResponse.data.success) {
        // 保存 session_id 和可用的角色列表
        sessionId.value = startResponse.data.data.session_id
        availableCharacters.value = startResponse.data.data.available_human_characters
        console.log(`[Frontend] 游戏创建成功, Session ID: ${sessionId.value}`)
        console.log(`[Frontend] 可用角色:`, availableCharacters.value)

        // 2. 预加载所有角色的独白
        await fetchAllMonologues()
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
   * 获取所有角色的独白并暂存
   */
  const fetchAllMonologues = async () => {
    if (!sessionId.value || availableCharacters.value.length === 0) return

    console.log('[Frontend] 开始获取所有角色的独白...')
    const tempMonologueQueue: Monologue[] = []

    // 注意：这里的角色列表是后端返回的可选角色，实际独白可能需要所有角色
    // 为了演示，我们假设就是这些角色的独白
    for (const characterId of availableCharacters.value) {
      try {
        const monologueResponse = await axios.post(
          `${API_BASE_URL}/session/${sessionId.value}/action`,
          {
            action_type: 'monologue',
            character_id: characterId
          }
        )

        if (monologueResponse.data.success) {
          tempMonologueQueue.push({
            characterId: characterId,
            sentences: monologueResponse.data.data.monologue_sentences
          })
          console.log(`[Frontend] 成功获取角色 [${characterId}] 的独白`)
        }
      } catch (e) {
        console.error(`[Frontend] 获取角色 [${characterId}] 独白失败:`, e)
      }
    }
    monologueQueue.value = tempMonologueQueue
    console.log('[Frontend] 所有独白已暂存:', monologueQueue.value)
  }

  /**
   * 推进到下一个角色的独白
   * @returns 返回下一个要进行独白的角色信息，如果没有则返回null
   */
  const advanceToNextMonologue = (): Monologue | null => {
    if (currentMonologueIndex.value < monologueQueue.value.length) {
      const nextMonologue = monologueQueue.value[currentMonologueIndex.value]
      console.log(`[Frontend] 推进幕次, 当前独白角色: ${nextMonologue.characterId}`)
      currentMonologueIndex.value++
      return nextMonologue
    }
    console.log('[Frontend] 所有角色独白已完成。')
    return null
  }

  return {
    sessionId,
    availableCharacters,
    monologueQueue,
    currentMonologueIndex,
    isLoading,
    error,
    startGame,
    advanceToNextMonologue
  }
}
