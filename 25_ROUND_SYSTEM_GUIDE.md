# 25轮游戏系统优化指南

## 概述

根据 `22.md` 文档的要求，我们已经完全重构了游戏逻辑，从原来的角色独白队列系统改为**25轮句子系统**。这个新系统实现了角色轮流发言的机制，确保游戏体验更加流畅和有序。

## 核心变化

### 1. 数据结构优化

**原系统 (11.md)**:
```typescript
interface Monologue {
  characterId: string;
  sentences: string[];
}
```

**新系统 (22.md)**:
```typescript
interface MonologueEntry {
  characterId: string;
  sentence: string;
}
```

### 2. 队列管理重构

- **原系统**: 按角色分组的独白队列，每次播放一个角色的完整独白
- **新系统**: 统一的句子队列，按轮次组织，角色轮流发言

## 实现详情

### `useGameLogic.ts` 优化

#### 核心状态管理
```typescript
// 统一的独白总队列，包含所有角色的所有句子
const unifiedMonologueQueue = ref<MonologueEntry[]>([])

// 当前在总队列中的索引
const currentSentenceIndex = ref(0)
```

#### 关键方法：`fetchAndProcessAllMonologues`

这是整个系统的核心，实现了以下功能：

1. **并行获取独白**: 同时请求所有角色的独白数据
2. **句子切分**: 将长文本按换行符切分成单独的句子
3. **轮次重组**: 按照"轮次优先"的原则重新排列句子

```typescript
// 按轮次重组独白到统一队列中
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
```

#### 轮次推进：`advanceToNextSentence`

简化的推进逻辑，每次返回队列中的下一个句子：

```typescript
const advanceToNextSentence = (): MonologueEntry | null => {
  if (currentSentenceIndex.value < unifiedMonologueQueue.value.length) {
    const nextEntry = unifiedMonologueQueue.value[currentSentenceIndex.value]
    currentSentenceIndex.value++
    return nextEntry
  }
  return null
}
```

### `GalgameInterface.vue` 优化

#### 更新的 `handleContinue` 方法

```typescript
const handleContinue = () => {
  if (isTypingActive.value) {
    skipTypingEffect()
    return
  }

  const nextEntry = advanceToNextSentence()

  if (nextEntry) {
    // 更新角色信息
    const characterData = characterDatabase[nextEntry.characterId]
    activeCharacter.value = characterData || defaultCharacterData
    
    // 更新对话内容为当前句子
    currentDialogue.text = nextEntry.sentence
    currentDialogue.characterId = nextEntry.characterId
    startTypingEffect(nextEntry.sentence)
    
    canContinue.value = true
  } else {
    // 25轮结束，进入Q&A阶段
    console.log("所有角色独白已完成，进入提问环节。")
    currentDialogue.text = "第一幕：所有角色介绍完毕。现在，你们可以开始自由讨论和提问了。"
    startTypingEffect(currentDialogue.text)
    canContinue.value = false
  }
}
```

#### UI 组件更新

DialogueSystem 组件现在使用新的数据结构：

```vue
<DialogueSystem
  :current-scene-index="currentSentenceIndex"
  :total-scenes="unifiedMonologueQueue.length"
  :processing-progress="0"
  @continue-scene="handleContinue"
  ...
/>
```

## 25轮系统工作流程

### 1. 游戏初始化
- 用户进入游戏界面
- 调用 `/start` API 获取会话ID和角色列表
- 自动开始独白处理流程

### 2. 独白数据处理
- 并行请求所有角色的独白数据
- 将每个角色的独白按换行符切分成句子数组
- 按轮次重组：第1轮所有角色说第1句，第2轮所有角色说第2句...

### 3. 轮次播放
- 用户点击"继续"按钮
- 从统一队列中取出下一句话
- 更新角色显示和对话内容
- 重复直到队列为空

### 4. Q&A 阶段转换
- 25轮完成后自动显示结束提示
- 禁用"继续"按钮
- 为Q&A界面做准备

## 技术优势

### 1. 性能优化
- **并行请求**: 所有角色独白同时获取，减少等待时间
- **一次处理**: 游戏开始时完成所有数据处理，后续播放无需额外API调用

### 2. 用户体验
- **流畅播放**: 每次点击只播放一句话，节奏更好控制
- **进度可视**: 准确显示当前轮次和总进度
- **角色轮换**: 自然的角色切换，避免长时间单一角色独白

### 3. 代码维护
- **逻辑清晰**: 句子级别的状态管理更简单
- **扩展性好**: 易于添加新功能如暂停、回放等
- **错误处理**: 更细粒度的错误处理和恢复

## 测试验证

### 测试页面
访问 `http://localhost:3001/25-round-test.html` 进行完整测试：

1. **开始游戏测试**: 验证API连接和会话创建
2. **独白处理测试**: 验证句子切分和队列重组
3. **轮次模拟测试**: 验证25轮播放逻辑
4. **完整流程测试**: 端到端验证整个系统

### 预期结果
- ✅ 成功创建游戏会话
- ✅ 正确获取和处理所有角色独白
- ✅ 生成25轮（或更多）句子队列
- ✅ 角色按轮次正确轮换
- ✅ 完成后正确转换到Q&A阶段

## 后续扩展

### 1. Q&A 阶段实现
- 添加问答界面组件
- 实现用户提问功能
- 集成角色回答逻辑

### 2. 游戏控制功能
- 添加暂停/继续功能
- 实现回放上一句功能
- 添加快进模式

### 3. 数据持久化
- 保存游戏进度
- 支持断点续玩
- 历史记录管理

## 兼容性说明

新系统完全兼容现有的后端API：
- 使用相同的 `/start` 和 `/action` 端点
- 保持相同的请求/响应格式
- 只在前端进行数据重组，不影响后端逻辑

这确保了升级的平滑性和系统的稳定性。
