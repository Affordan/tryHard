import { ref } from "vue"
import type { CharacterData, ScriptScene } from './useGameData'

export interface GameState {
  scriptData: ScriptScene[]
  currentSceneIndex: { value: number }
  currentSceneId: { value: string }
  currentDialogue: { text: string; characterId: string }
  isAIProcessing: { value: boolean }
  processingProgress: { value: number }
  startTypingEffect: (text: string) => void
  completedSceneHistory: { value: any[] }
}

export function useSceneTransition() {
  const isSceneTransitioning = ref<boolean>(false)
  const nextCharacterData = ref<CharacterData | null>(null)
  const currentSceneId = ref<string>("detective_office")

  const transitionToScene = async (sceneIndex: number, gameState: GameState) => {
    const {
      scriptData,
      currentSceneIndex,
      currentSceneId: sceneId,
      currentDialogue,
      isAIProcessing,
      processingProgress,
      startTypingEffect,
      completedSceneHistory,
    } = gameState

    if (sceneIndex >= scriptData.length) return

    const targetScene = scriptData[sceneIndex]
    const currentCharacter = scriptData[currentSceneIndex.value]?.characterData

    // 角色转换（如果不同）
    if (currentCharacter?.characterId !== targetScene.characterData.characterId) {
      isSceneTransitioning.value = true
      nextCharacterData.value = targetScene.characterData

      await new Promise((resolve) => setTimeout(resolve, 1200))

      currentSceneIndex.value = sceneIndex
      sceneId.value = targetScene.sceneBackground

      await new Promise((resolve) => setTimeout(resolve, 600))

      isSceneTransitioning.value = false
      nextCharacterData.value = null
    } else {
      currentSceneIndex.value = sceneIndex
      sceneId.value = targetScene.sceneBackground
    }

    // 开始AI处理模拟
    isAIProcessing.value = true
    processingProgress.value = 0

    // 模拟AI处理时间
    const processingDuration = 2500 + Math.random() * 2000
    const progressUpdateInterval = setInterval(() => {
      if (processingProgress.value < 100) {
        processingProgress.value += Math.random() * 15
        if (processingProgress.value > 100) processingProgress.value = 100
      }
    }, 200)

    setTimeout(() => {
      clearInterval(progressUpdateInterval)
      isAIProcessing.value = false
      processingProgress.value = 0

      // 开始对话显示
      currentDialogue.text = targetScene.dialogueText
      currentDialogue.characterId = targetScene.characterData.characterId
      startTypingEffect(targetScene.dialogueText)

      // 添加到历史记录
      completedSceneHistory.value.push({
        character: targetScene.characterData,
        dialogueText: targetScene.dialogueText,
        timestamp: new Date(),
      })
    }, processingDuration)
  }

  return {
    isSceneTransitioning,
    nextCharacterData,
    currentSceneId,
    transitionToScene,
  }
}
