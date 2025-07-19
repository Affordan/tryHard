export interface CharacterData {
  characterId: string
  characterName: string
  characterRole: string
  characterImageURL: string
  llmName: string
  llmProvider: string
  themeColor: string
  characterMood: string
  sceneId: string
  // 新增审讯相关信息
  backstory?: string
  alibi?: string
  secrets?: string[]
  relationships?: Record<string, string>
  personality?: string[]
}

export interface SceneBackground {
  id: string
  backgroundImageURL: string
  atmosphere: string
  weatherEffect: string | null
}

export interface ScriptScene {
  sceneId: string
  characterData: CharacterData
  dialogueText: string
  sceneBackground: string
  sceneMood: string
}

export function useGameData() {
  // (已更新) 角色数据库 - 使用中文名作为ID
  const characterDatabase: Record<string, CharacterData> = {
    "朱大强": {
      characterId: "朱大强",
      characterName: "朱大强",
      characterRole: "父亲", // 请根据剧本填写正确角色
      characterImageURL: "/placeholder.svg?text=朱大强", // 建议替换为角色图片路径
      llmName: "Qwen-Max", // 示例
      llmProvider: "Alibaba",
      themeColor: "#ff6b6b",
      characterMood: "sad",
      sceneId: "home",
      // ... (请补充其他信息)
    },
    "朱丰翰": {
      characterId: "朱丰翰",
      characterName: "朱丰翰",
      characterRole: "国企员工",
      characterImageURL: "/placeholder.svg?text=朱丰翰",
      llmName: "DeepSeek-V3",
      llmProvider: "DeepSeek",
      themeColor: "#2c3e50",
      characterMood: "thoughtful",
      sceneId: "home",
      // ...
    },
    "朱丰震": {
      characterId: "朱丰震",
      characterName: "朱丰震",
      characterRole: "创业者",
      characterImageURL: "/placeholder.svg?text=朱丰震",
      llmName: "GPT-4",
      llmProvider: "OpenAI",
      themeColor: "#74b9ff",
      characterMood: "anxious",
      sceneId: "home",
      // ...
    },
    "朱玲玲": {
      characterId: "朱玲玲",
      characterName: "朱玲玲",
      characterRole: "女儿",
      characterImageURL: "/placeholder.svg?text=朱玲玲",
      llmName: "Kimi",
      llmProvider: "Moonshot",
      themeColor: "#a855f7",
      characterMood: "lively",
      sceneId: "home",
      // ...
    },
    "许苗苗": {
      characterId: "许苗苗",
      characterName: "许苗苗",
      characterRole: "医护人员",
      characterImageURL: "/placeholder.svg?text=许苗苗",
      llmName: "Claude-3",
      llmProvider: "Anthropic",
      themeColor: "#38b2ac",
      characterMood: "gentle",
      sceneId: "hospital",
      // ...
    }
  }


  // 场景背景数据
  const sceneBackgrounds: SceneBackground[] = [
    {
      id: "detective_office",
      backgroundImageURL: "/placeholder.svg?height=800&width=1200&text=Detective+Office+Scene",
      atmosphere: "mysterious",
      weatherEffect: "rain",
    },
    {
      id: "medical_examination_room",
      backgroundImageURL: "/placeholder.svg?height=800&width=1200&text=Medical+Room+Scene",
      atmosphere: "clinical",
      weatherEffect: null,
    },
  ]

  // 剧本数据
  const scriptData: ScriptScene[] = [
    {
      sceneId: "scene_1",
      characterData: characterDatabase.detective,
      dialogueText: "The rain lashed against the windows, mirroring the storm in my gut.",
      sceneBackground: "detective_office",
      sceneMood: "tense",
    },
    {
      sceneId: "scene_2",
      characterData: characterDatabase.doctor_gpt,
      dialogueText: "The victim's pulse was faint, a fragile echo in the silence.",
      sceneBackground: "medical_examination_room",
      sceneMood: "somber",
    },
    {
      sceneId: "scene_3",
      characterData: characterDatabase.detective,
      dialogueText: "I found a clue, a broken watch.",
      sceneBackground: "detective_office",
      sceneMood: "discovery",
    },
    {
      sceneId: "scene_4",
      characterData: characterDatabase.doctor_qwen,
      dialogueText: "The watch... it's a key to the truth.",
      sceneBackground: "medical_examination_room",
      sceneMood: "revelation",
    },
  ]

  return {
    characterDatabase,
    sceneBackgrounds,
    scriptData,
  }
}
