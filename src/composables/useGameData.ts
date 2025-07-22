export interface CharacterData {
  characterId: string
  characterName: string
  characterRole: string
  characterImageURL: string
  portraitImageURL: string // 新增：人物立绘图片路径
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
  // (已更新) 角色数据库 - 使用中文名作为ID，增加立绘路径
  const characterDatabase: Record<string, CharacterData> = {
    "朱大强": {
      characterId: "朱大强",
      characterName: "朱大强",
      characterRole: "父亲", // 请根据剧本填写正确角色
      characterImageURL: "/portraits/朱大强.png", // 更新为正确的头像路径
      portraitImageURL: "/portraits/朱大强.png", // 指向 public/portraits/朱大强.png
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
      characterImageURL: "/portraits/朱丰翰.png", // 更新为正确的头像路径
      portraitImageURL: "/portraits/朱丰翰.png", // 指向 public/portraits/朱丰翰.png
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
      characterImageURL: "/portraits/朱丰震.png", // 更新为正确的头像路径
      portraitImageURL: "/portraits/朱丰震.png", // 指向 public/portraits/朱丰震.png
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
      characterImageURL: "/portraits/朱玲玲.png", // 更新为正确的头像路径
      portraitImageURL: "/portraits/朱玲玲.png", // 指向 public/portraits/朱玲玲.png
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
      characterImageURL: "/portraits/许苗苗.png", // 更新为正确的头像路径
      portraitImageURL: "/portraits/许苗苗.png", // 指向 public/portraits/许苗苗.png
      llmName: "Claude-3",
      llmProvider: "Anthropic",
      themeColor: "#38b2ac",
      characterMood: "gentle",
      sceneId: "hospital",
      // ...
    }
  }


  // (已更新) 场景背景数据 - 增加四个新背景
  const sceneBackgrounds: SceneBackground[] = [
    {
      id: "detective_office",
      backgroundImageURL: "/placeholder.svg?height=800&width=1200&text=Detective+Office+Scene",
      atmosphere: "mysterious",
      weatherEffect: "null",
    },
    {
      id: "medical_examination_room",
      backgroundImageURL: "/placeholder.svg?height=800&width=1200&text=Medical+Room+Scene",
      atmosphere: "clinical",
      weatherEffect: null,
    },
    {
      id: "act1_monologue_bg",
      backgroundImageURL: "/backgrounds/act1_monologue.jpg", // 指向 public/backgrounds/act1_monologue.jpg
      atmosphere: "mysterious",
      weatherEffect: "null",
    },
    {
      id: "act1_qna_bg",
      backgroundImageURL: "/backgrounds/act1_qna.jpg", // 指向 public/backgrounds/act1_qna.jpg
      atmosphere: "tense",
      weatherEffect: null,
    },
    {
      id: "act2_monologue_bg",
      backgroundImageURL: "/backgrounds/act2_monologue.jpg", // 指向 public/backgrounds/act2_monologue.jpg
      atmosphere: "dramatic",
      weatherEffect: null,
    },
    {
      id: "act2_qna_bg",
      backgroundImageURL: "/backgrounds/act2_qna.jpg", // 指向 public/backgrounds/act2_qna.jpg
      atmosphere: "confrontational",
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
