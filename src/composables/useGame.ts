// src/composables/useGame.ts

import { ref, readonly, computed } from 'vue'
import axios from 'axios'

// --- 数据结构定义 ---
export interface Character {
  id: string;
  displayName: string;
  isPlayer: boolean;
  model?: string;
}

export type HistoryEntry = 
  | { type: 'monologue'; characterId: string; content: string }
  | { type: 'question'; questionerId: string; targetCharacterId: string; content: string }
  | { type: 'answer'; characterId: string; content: string }
  | { type: 'system'; content: string };

export type GamePhase = 'initializing' | 'monologue' | 'qna' | 'final_choice' | 'completed';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/langchain-game'

// getDisplayName 函数现在需要传入 characters Map
export const getDisplayName = (id: string, characters: ReadonlyMap<string, Character> | Map<string, Character>) => {
  if (id === 'system') return '系统提示';
  return characters.get(id)?.displayName || id;
};

export function useGame() {
  // 基础状态
  const sessionId = ref<string | null>(null)
  const characters = ref<Map<string, Character>>(new Map())
  const playerCharacterId = ref<string | null>(null)
  const gamePhase = ref<GamePhase>('initializing')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentAct = ref(1) // 新增：当前幕次
  const questionCount = ref(0) // 新增：当前幕次的提问计数
  
  // 独白相关状态
  const monologueProgress = ref({ current: 0, total: 0 })
  const interactionHistory = ref<HistoryEntry[]>([])

  // 最终结局状态
  const finalEnding = ref<string[]>([])

  // 这是从API响应中提取的结局数据，我们直接放在前端
  const MOCK_ENDING_DATA = [
    "（听完 \"孩子们\" 的话，点了点头，咳嗽两声）",
    "\"丰翰啊，明儿跟你弟说说，别总瞎折腾，踏踏实实找个活儿干……\"",
    "（转向 \"玲玲\"，声音软下来）",
    "\"丫头别总往外跑，家里有热饭吃……\"",
    "（又看向 \"苗苗\"，拍了拍床沿）",
    "\"你跟丰震好好的，比啥都强……\"",
    "（说着说着打了个哈欠，往被窝里缩了缩）",
    "\"我睡会儿，醒了你们还在不？\""
  ];

  // 独白队列系统
  interface MonologueEntry {
    characterId: string;
    sentence: string;
  }
  const unifiedMonologueQueue = ref<MonologueEntry[]>([])
  const currentSentenceIndex = ref(0)

  /**
   * 根据后端数据构建角色映射表, 自动分配角色
   */
  const setupCharacters = (allCharacters: string[], assignedPlayerRole: string) => {
    const newCharacters = new Map<string, Character>()
    playerCharacterId.value = assignedPlayerRole
  
    // AI模型分配
    const aiModels = ['qwen', 'openai', 'deepseek', 'kimi']
    let aiModelIndex = 0

    allCharacters.forEach(charId => {
      const isPlayer = charId === assignedPlayerRole
      let model = undefined;
      let displayName = charId;

      if (!isPlayer) {
          model = aiModels[aiModelIndex % aiModels.length];
          displayName = `${charId} (${model})`
          aiModelIndex++;
      } else {
          displayName = `${charId} (我)`
      }

      newCharacters.set(charId, { id: charId, displayName, isPlayer, model })
    })
    characters.value = newCharacters
    console.log('[Game] 角色信息初始化完成:', characters.value)
  }

  const startGame = async (scriptId: string, _humanPlayerId: string) => {
    isLoading.value = true
    error.value = null
    gamePhase.value = 'initializing'
    
    try {
      // 创建游戏会话
      const startResponse = await axios.post(`${API_BASE_URL}/start`, {
        script_id: scriptId,
        user_id: null
      })

      if (!startResponse.data.success) {
        throw new Error(startResponse.data.message || '创建游戏失败')
      }

      const sessionData = startResponse.data.data
      sessionId.value = sessionData.session_id
      
      // 从返回的角色列表中自动选择第一个作为玩家角色
      const availableRoles = sessionData.available_human_characters;
      // 假设后端返回的列表就是完整的角色列表，我们自动选择第一个作为玩家
      const chosenCharacterId = availableRoles.includes("许苗苗") ? "许苗苗" : availableRoles[0]; 

      // 使用这个自动选择的角色来加入游戏和设置角色
      setupCharacters(availableRoles, chosenCharacterId);

      // 添加系统消息到历史记录
      interactionHistory.value.push({
        type: 'system',
        content: `第一幕开始！你被分配为角色：${chosenCharacterId}`
      })

      gamePhase.value = 'monologue'

      // 核心步骤：获取并重组所有独白
      await fetchAndProcessAllMonologues(availableRoles)

      console.log('[Game] 游戏初始化完成')
      
    } catch (e: any) {
      console.error('[Game] 开始游戏时出错:', e)
      error.value = e.message || '无法连接到服务器'
    } finally {
      isLoading.value = false
    }
  };

  /**
   * 获取所有角色的独白，切分句子，并按轮次重组成一个统一的队列
   */
  const fetchAndProcessAllMonologues = async (availableRoles: string[]) => {
    if (!sessionId.value || availableRoles.length === 0) return

    console.log('[Game] 开始获取并处理所有角色的独白...')
    isLoading.value = true

    // 临时存放每个角色的句子数组
    const characterSentencesMap: Map<string, string[]> = new Map()

    // 1. 并行获取所有角色的独白
    const monologuePromises = availableRoles.map(async (characterId) => {
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
          console.log(`[Game] 成功获取并切分角色 [${characterId}] 的 ${sentences.length} 句独白`)
        }
      } catch (e) {
        console.error(`[Game] 获取角色 [${characterId}] 独白失败:`, e)
      }
    })

    await Promise.all(monologuePromises)

    // 2. 按轮次重组独白到统一队列中
    const newQueue: MonologueEntry[] = []
    const characterOrder = availableRoles
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
    monologueProgress.value = { current: 0, total: newQueue.length }
    isLoading.value = false
    console.log(`[Game] 独白重组完成，共 ${newQueue.length} 句话。`, newQueue)
  }

  /**
   * 推进独白阶段 - 返回下一个要显示的独白条目
   */
  const advanceMonologue = (): MonologueEntry | null => {
    if (currentSentenceIndex.value < unifiedMonologueQueue.value.length) {
      const nextEntry = unifiedMonologueQueue.value[currentSentenceIndex.value]
      console.log(`[Game] 推进幕次, 第 ${currentSentenceIndex.value + 1} 句, 发言角色: ${nextEntry.characterId}`)
      currentSentenceIndex.value++
      monologueProgress.value.current = currentSentenceIndex.value
      return nextEntry
    }
    // 当独白结束时，切换游戏阶段到QNA
    console.log('[Game] 所有独白已完成，切换到QNA阶段。')
    gamePhase.value = 'qna'
    questionCount.value = 0 // 进入QNA时重置提问计数
    return null
  }

  /**
   * 添加历史记录条目 - 用于交互式历史记录更新
   */
  const addHistoryEntry = (entry: HistoryEntry) => {
    interactionHistory.value.push(entry)
    console.log('[Game] 添加历史记录:', entry)
  }

  /**
   * (已更新) 向指定角色提问
   * 新版本不再自动记录历史，而是仅返回AI的回答文本
   */
  const askQuestion = async (targetCharacterId: string, question: string): Promise<string | null> => {
    if (!sessionId.value || !playerCharacterId.value) {
      error.value = "游戏会话不存在";
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/session/${sessionId.value}/action`,
        {
          action_type: 'qna',
          character_id: targetCharacterId,
          question: question,
          questioner_id: playerCharacterId.value
        }
      );

      if (response.data.success) {
        // 成功时，只返回回答的字符串
        return response.data.data.answer;
      } else {
        throw new Error(response.data.error || '提问失败');
      }
    } catch (e: any) {
      console.error('[Game] 提问时出错:', e);
      error.value = e.message || '提问请求失败';
      return null; // 失败时返回 null
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * (新增) 手动增加提问计数
   * 因为记录被延迟了，所以计数也要延迟
   */
  const incrementQuestionCount = () => {
    questionCount.value++;
  }

  /**
   * (已更新) 不再调用API，而是直接设置结局
   */
  const triggerFinalChoice = () => {
    console.log('[Game] 正在触发前端定义的最终结局...');

    // 将预设的结局数据赋值给状态
    finalEnding.value = MOCK_ENDING_DATA;

    // 更新游戏阶段为 'completed'，这将触发UI显示结局
    gamePhase.value = 'completed';

    interactionHistory.value.push({ type: 'system', content: '--- 游戏结束 ---' });
    isLoading.value = false;
  };

  // 注释掉的原始API调用版本，保留以备后续恢复
  /*
  const triggerFinalChoice = async () => {
    if (!sessionId.value) return;

    console.log('[Debug] triggerFinalChoice 函数开始执行...'); // 日志1：确认函数被调用

    try {
      const response = await axios.post(`${API_BASE_URL}/session/${sessionId.value}/action`, {
        action_type: 'final_choice',
        tell_truth: true
      });

      console.log('[Debug] 收到后端响应:', response.data); // 日志2：查看完整的后端返回数据

      if (response.data.success) {
        console.log('[Debug] 响应成功，准备更新状态...'); // 日志3：确认进入了 success 分支

        finalEnding.value = response.data.data.ending;
        console.log('[Debug] finalEnding 状态已更新为:', finalEnding.value); // 日志4：检查结局数据是否被赋值

        gamePhase.value = 'completed';
        console.log('[Debug] gamePhase 状态已更新为: completed'); // 日志5：检查游戏阶段是否被更新

      } else {
        console.error('[Debug] 后端返回 success: false', response.data.error);
        throw new Error(response.data.error || '获取结局内容失败');
      }
    } catch (e: any) {
      error.value = e.message;
      console.error('[Debug] 在 triggerFinalChoice 中捕获到错误:', e); // 日志6：捕获任何可能的异常
    } finally {
      isLoading.value = false;
      console.log('[Debug] triggerFinalChoice 函数执行完毕。'); // 日志7：确认函数执行完毕
    }
  };
  */
  /**
   * (已更新) 推进幕次，最终幕直接触发前端结局
   */
  const advanceAct = async () => {
    if (!sessionId.value) return;

    // 如果当前是第二幕，即将进入第三幕（最终幕）
    if (currentAct.value >= 2) {
      triggerFinalChoice(); // 直接触发前端结局，不再调用API
      return;
    }

    // 否则，正常推进到下一幕（例如从第一幕到第二幕）
    isLoading.value = true;
    try {
      const response = await axios.post(`${API_BASE_URL}/session/${sessionId.value}/action`, {
        action_type: 'advance_act'
      });

      if (!response.data.success) {
        throw new Error('推进幕次失败');
      }

      const { new_act, current_phase } = response.data.data;
      currentAct.value = new_act;
      gamePhase.value = current_phase;

      interactionHistory.value.push({
        type: 'system',
        content: `--- 第 ${new_act} 幕开始 ---`
      });

      if (current_phase === 'monologue' && characters.value.size > 0) {
        const characterIds = Array.from(characters.value.keys());
        await fetchAndProcessAllMonologues(characterIds);
      }
    } catch (e: any) {
      error.value = e.message;
    } finally {
      isLoading.value = false;
    }
  };

  // 临时测试函数 - 用于测试结局显示
  const testEndingDisplay = () => {
    console.log('[Test] 触发结局显示测试...');
    triggerFinalChoice();
  };


  return {
    // 状态
    sessionId: readonly(sessionId),
    characters: readonly(characters),
    playerCharacterId: readonly(playerCharacterId),
    gamePhase: readonly(gamePhase),
    isLoading: readonly(isLoading),
    error: readonly(error),
    monologueProgress: readonly(monologueProgress),
    interactionHistory: readonly(interactionHistory),
    unifiedMonologueQueue: readonly(unifiedMonologueQueue),
    currentSentenceIndex: readonly(currentSentenceIndex),
    finalEnding: readonly(finalEnding), // 新增最终结局状态

    // 计算属性：导出可审讯的角色列表 (已过滤掉玩家自己)
    interrogationTargets: computed(() =>
        Array.from(characters.value.values()).filter(c => !c.isPlayer)
    ),

    // 新增返回
    currentAct: readonly(currentAct),
    questionCount: readonly(questionCount),

    // 方法
    startGame,
    advanceMonologue,
    askQuestion, // 返回更新后的函数
    advanceAct, // 新增方法
    addHistoryEntry,
    incrementQuestionCount, // 导出新函数
    triggerFinalChoice, // 新增最终选择函数
    testEndingDisplay // 临时测试函数
  }
}
