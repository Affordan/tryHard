import { ref, reactive } from "vue"

export interface DialogueState {
  text: string
  characterId: string
}

export function useDialogueSystem() {
  const currentSceneIndex = ref<number>(0)
  const currentDialogue = reactive<DialogueState>({ text: "", characterId: "" })
  const displayedDialogueText = ref<string>("")
  const isTypingActive = ref<boolean>(false)
  const isAIProcessing = ref<boolean>(false)
  const processingProgress = ref<number>(0)

  let typingEffectInterval: NodeJS.Timeout | null = null

  const startTypingEffect = (text: string) => {
    displayedDialogueText.value = ""
    isTypingActive.value = true
    let characterIndex = 0

    if (typingEffectInterval) clearInterval(typingEffectInterval)

    typingEffectInterval = setInterval(
      () => {
        if (characterIndex < text.length) {
          displayedDialogueText.value += text[characterIndex]
          characterIndex++
        } else {
          if (typingEffectInterval) clearInterval(typingEffectInterval)
          isTypingActive.value = false
        }
      },
      70 + Math.random() * 30,
    )
  }

  const skipTypingEffect = () => {
    if (typingEffectInterval) clearInterval(typingEffectInterval)
    displayedDialogueText.value = currentDialogue.text
    isTypingActive.value = false
  }

  return {
    currentSceneIndex,
    currentDialogue,
    displayedDialogueText,
    isTypingActive,
    isAIProcessing,
    processingProgress,
    startTypingEffect,
    skipTypingEffect,
  }
}
