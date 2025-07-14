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
  // 角色数据库
  const characterDatabase: Record<string, CharacterData> = {
    detective: {
      characterId: "detective",
      characterName: "夏洛克·福尔摩斯",
      characterRole: "名侦探",
      characterImageURL: "/placeholder.svg?height=600&width=400&text=Detective+Holmes",
      llmName: "DeepSeek-V3",
      llmProvider: "DeepSeek",
      themeColor: "#2c3e50",
      characterMood: "analytical",
      sceneId: "detective_office",
      backstory: "世界著名的咨询侦探，以其敏锐的观察力和逻辑推理能力闻名。目前正在调查一起复杂的谋杀案。",
      alibi: "案发当晚在办公室整理案件资料，有房东太太可以证明。",
      secrets: ["正在暗中调查一个犯罪集团", "发现了受害者与某个重要人物的关系"],
      relationships: {
        "doctor_gpt": "多年的搭档和朋友",
        "doctor_qwen": "专业上的合作伙伴"
      },
      personality: ["理性", "观察敏锐", "有时显得冷漠", "追求真相"]
    },
    doctor_gpt: {
      characterId: "doctor_gpt",
      characterName: "华生医生",
      characterRole: "医学专家",
      characterImageURL: "/placeholder.svg?height=600&width=400&text=Dr+Watson+GPT",
      llmName: "GPT-4",
      llmProvider: "OpenAI",
      themeColor: "#74b9ff",
      characterMood: "concerned",
      sceneId: "medical_examination_room",
      backstory: "经验丰富的医生，福尔摩斯的长期合作伙伴。最近在医院遇到了一些奇怪的病例。",
      alibi: "案发当晚在医院值夜班，有多名护士和病人可以证明。",
      secrets: ["发现受害者的病历有异常", "知道某些医学实验的内幕"],
      relationships: {
        "detective": "最信任的朋友和搭档",
        "doctor_qwen": "同行，但有些竞争关系"
      },
      personality: ["善良", "忠诚", "有医者仁心", "有时过于谨慎"]
    },
    doctor_qwen: {
      characterId: "doctor_qwen",
      characterName: "李医生",
      characterRole: "中医专家",
      characterImageURL: "/placeholder.svg?height=600&width=400&text=Dr+Li+Qwen",
      llmName: "Qwen-Max",
      llmProvider: "Alibaba",
      themeColor: "#ff6b6b",
      characterMood: "thoughtful",
      sceneId: "medical_examination_room",
      backstory: "资深中医师，结合传统中医和现代医学。最近在研究一些古老的医学文献。",
      alibi: "案发当晚在家研读医书，妻子可以证明，但中途外出过一小时。",
      secrets: ["掌握一些古老的毒药知识", "与受害者有过医疗纠纷"],
      relationships: {
        "detective": "专业合作关系",
        "doctor_gpt": "同行，但理念不同"
      },
      personality: ["深思熟虑", "传统", "有些神秘", "重视名誉"]
    },
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
